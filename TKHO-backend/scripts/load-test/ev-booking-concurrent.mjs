/**
 * EV 抢订并发压测（Node 18+，无需额外依赖）
 *
 * 环境变量：
 *   BASE_URL          默认 http://127.0.0.1:4001
 *   CONCURRENCY       并发请求数，默认 50
 *   BOOKING_DATE      预订日期 YYYY-MM-DD，默认明天
 *   PERIOD_ID         时段 id，默认 1
 *   USER_COUNT        参与用户数（循环 seed 账号），默认与 CONCURRENCY 相同
 *   USER_START        起始用户序号（对应 E001 的 1），默认 2（跳过 Admin-test）
 *   PASSWORD          默认 123456（seed 密码）
 *   DRY_RUN           1 时只登录不订位
 */

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4001').replace(/\/$/, '');
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 50));
const USER_COUNT = Math.max(1, Number(process.env.USER_COUNT || CONCURRENCY));
const USER_START = Math.max(1, Number(process.env.USER_START || 2));
const PERIOD_ID = String(process.env.PERIOD_ID || '1');
const PASSWORD = process.env.PASSWORD || '123456';
const DRY_RUN = process.env.DRY_RUN === '1';

function tomorrowYmd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const BOOKING_DATE = process.env.BOOKING_DATE || tomorrowYmd();

function corpIdForUserIndex(i) {
  return i === 1 ? 'Admin-test' : `E${String(i).padStart(3, '0')}`;
}

async function requestJson(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const started = performance.now();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const elapsed = performance.now() - started;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  return { status: res.status, data, elapsed };
}

async function login(corpId) {
  const { status, data } = await requestJson('POST', '/api/auth/login', {
    body: {
      account: corpId,
      password: PASSWORD,
      system: 'parking',
    },
  });
  if (status !== 201 && status !== 200) {
    throw new Error(`Login ${corpId} failed: HTTP ${status} ${JSON.stringify(data)}`);
  }
  const token = data?.token;
  if (!token) {
    throw new Error(`Login ${corpId}: no token in response`);
  }
  return { token };
}

async function resolveLicensePlateId(token, userIndex) {
  const { status, data } = await requestJson('GET', '/api/account/vehicles', { token });
  if (status !== 200) {
    throw new Error(`List vehicles failed: HTTP ${status}`);
  }
  const vehicles = Array.isArray(data?.vehicles) ? data.vehicles : [];
  const active = vehicles.filter((v) => String(v.status || 'active').toLowerCase() === 'active');
  if (active.length) {
    const picked = active.find((v) => v.isDefault) || active[0];
    return String(picked.id);
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const plateNumber = `LT${String(userIndex).padStart(3, '0')}${String(Date.now() % 100000)}${attempt}`;
    const created = await requestJson('POST', '/api/account/vehicles', {
      token,
      body: { plateNumber, isDefault: true },
    });
    if (created.status === 200 || created.status === 201) {
      const id = created.data?.vehicle?.id;
      if (!id) throw new Error('Create vehicle: missing id');
      return String(id);
    }
    if (created.status === 400 && /already exists/i.test(JSON.stringify(created.data))) {
      const retryList = await requestJson('GET', '/api/account/vehicles', { token });
      const vehicles = Array.isArray(retryList.data?.vehicles) ? retryList.data.vehicles : [];
      const active = vehicles.filter((v) => String(v.status || 'active').toLowerCase() === 'active');
      if (active.length) return String((active.find((v) => v.isDefault) || active[0]).id);
    }
  }
  throw new Error(`Create vehicle failed for user index ${userIndex}`);
}

async function fetchTotalSpaces(token) {
  const { status, data } = await requestJson(
    'GET',
    `/api/parking/calendar-availability?startDate=${BOOKING_DATE}&endDate=${BOOKING_DATE}`,
    { token },
  );
  if (status !== 200) return null;
  return Number(data?.totalSpaces) || 0;
}

async function createBooking(session) {
  const { status, data, elapsed } = await requestJson('POST', '/api/parking/bookings', {
    token: session.token,
    body: {
      licensePlateId: String(session.licensePlateId),
      periodId: PERIOD_ID,
      bookingDate: BOOKING_DATE,
    },
  });
  return { status, data, elapsed, corpId: session.corpId };
}

function classifyResult({ status, data }) {
  const msg = Array.isArray(data?.message)
    ? data.message.join(' ')
    : String(data?.message || '');

  if (status >= 200 && status < 300) return 'success';
  if (status === 409 || /fully booked|unavailable|in progress/i.test(msg)) {
    return 'conflict';
  }
  return 'error';
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  async function runner() {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runner());
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log('=== EV Booking Load Test ===');
  console.log({
    BASE_URL,
    CONCURRENCY,
    USER_COUNT,
    USER_START,
    BOOKING_DATE,
    PERIOD_ID,
    DRY_RUN,
  });
  console.log('');

  const userIndexes = Array.from({ length: USER_COUNT }, (_, i) => {
    const maxSeedUser = 25;
    const idx = USER_START + (i % (maxSeedUser - USER_START + 1));
    return idx;
  });

  console.log(`Logging in ${userIndexes.length} users...`);
  const sessionByUserIndex = new Map();
  const loginFailures = [];

  await mapPool(userIndexes, 5, async (userIndex) => {
    const corpId = corpIdForUserIndex(userIndex);
    try {
      const { token } = await login(corpId);
      const licensePlateId = await resolveLicensePlateId(token, userIndex);
      sessionByUserIndex.set(userIndex, {
        corpId,
        userIndex,
        token,
        licensePlateId,
      });
    } catch (e) {
      loginFailures.push({ corpId, error: e.message });
    }
  });

  console.log(`Logged in: ${sessionByUserIndex.size}, failed: ${loginFailures.length}`);
  if (loginFailures.length) {
    console.log('Login failures (first 5):', loginFailures.slice(0, 5));
  }
  if (!sessionByUserIndex.size) {
    process.exit(1);
  }

  const totalSpaces = await fetchTotalSpaces(sessionByUserIndex.values().next().value.token);
  if (totalSpaces != null) {
    console.log(`Active EV slots (totalSpaces): ${totalSpaces}`);
    if (CONCURRENCY > totalSpaces) {
      console.log(
        `Hint: CONCURRENCY (${CONCURRENCY}) > slots (${totalSpaces}) → at most ${totalSpaces} success; rest should be conflict.`,
      );
    }
    console.log(
      `If success=0, clear bookings: DELETE FROM ev_bookings WHERE booking_date = DATE '${BOOKING_DATE}' AND period_id = ${PERIOD_ID};`,
    );
    console.log('');
  }

  if (DRY_RUN) {
    console.log('DRY_RUN=1, skip bookings.');
    return;
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => {
    const userIndex = userIndexes[i];
    const session = sessionByUserIndex.get(userIndex);
    if (!session) {
      throw new Error(`No session for user index ${userIndex} (login failed)`);
    }
    return session;
  });

  console.log(`\nFiring ${CONCURRENCY} concurrent booking requests...`);
  const startedAt = Date.now();
  const results = await Promise.all(
    workers.map((session) =>
      createBooking(session).catch((e) => ({
        status: 0,
        data: { message: e.message },
        elapsed: 0,
        corpId: session.corpId,
      })),
    ),
  );
  const totalMs = Date.now() - startedAt;

  const buckets = { success: 0, conflict: 0, error: 0 };
  const latencies = [];
  const successSlots = new Set();
  const errorsSample = [];

  for (const r of results) {
    const kind = classifyResult(r);
    buckets[kind]++;
    if (r.elapsed > 0) latencies.push(r.elapsed);
    if (kind === 'success') {
      const slotId = r.data?.booking?.slotId;
      if (slotId != null) {
        if (successSlots.has(String(slotId))) {
          buckets.duplicateSlot = (buckets.duplicateSlot || 0) + 1;
        }
        successSlots.add(String(slotId));
      }
    } else if (kind === 'error' && errorsSample.length < 8) {
      errorsSample.push({
        corpId: r.corpId,
        status: r.status,
        message: r.data?.message ?? r.data,
      });
    }
  }

  latencies.sort((a, b) => a - b);

  console.log('\n=== Results ===');
  console.log('Duration (wall):', `${totalMs} ms`);
  console.log('Outcomes:', buckets);
  console.log('Unique slots booked (from response):', successSlots.size);
  if (buckets.duplicateSlot) {
    console.log('WARNING duplicate slotId in responses:', buckets.duplicateSlot);
  }
  if (latencies.length) {
    console.log('Latency ms:', {
      min: Math.round(latencies[0]),
      p50: Math.round(percentile(latencies, 50)),
      p95: Math.round(percentile(latencies, 95)),
      max: Math.round(latencies[latencies.length - 1]),
    });
  }
  if (errorsSample.length) {
    console.log('\nSample errors:', errorsSample);
  }

  console.log('\nNext: run SQL in README to verify no duplicate active bookings per slot.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
