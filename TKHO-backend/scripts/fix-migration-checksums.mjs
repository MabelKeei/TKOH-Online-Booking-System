/**
 * Prisma 迁移 checksum 诊断 / 修复（本地开发用，不删除业务数据）
 *
 * 适用场景：
 * - prisma migrate 提示 "migration was modified after it was applied"
 * - _prisma_migrations 存在 finished_at 为 null 的失败记录
 *
 * 用法（在 TKHO-backend 目录）：
 *   node scripts/fix-migration-checksums.mjs --check
 *   node scripts/fix-migration-checksums.mjs --fix
 *
 * 修复后若某迁移 SQL 已手动执行，可补登记：
 *   npx prisma migrate resolve --applied <migration_name> --schema prisma/schema.prisma
 *
 * 注意：仅用于本地开发。生产环境勿随意修改 _prisma_migrations。
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import crypto from 'crypto'
import path from 'path'

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
const mode = process.argv.includes('--fix') ? 'fix' : 'check'

function listMigrationNames () {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`)
  }
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function fileChecksum (migrationName) {
  const file = path.join(migrationsDir, migrationName, 'migration.sql')
  if (!fs.existsSync(file)) {
    throw new Error(`Missing migration.sql for ${migrationName}`)
  }
  const content = fs.readFileSync(file)
  return crypto.createHash('sha256').update(content).digest('hex')
}

const prisma = new PrismaClient()

try {
  const migrationNames = listMigrationNames()
  const rows = await prisma.$queryRawUnsafe(`
    SELECT id, migration_name, checksum, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    ORDER BY finished_at NULLS LAST, migration_name
  `)

  const rowsByName = new Map()
  for (const row of rows) {
    const list = rowsByName.get(row.migration_name) ?? []
    list.push(row)
    rowsByName.set(row.migration_name, list)
  }

  const checksumUpdates = []
  const failedRowsToDelete = []

  console.log(`Mode: ${mode}`)
  console.log('')

  for (const migrationName of migrationNames) {
    const expected = fileChecksum(migrationName)
    const dbRows = rowsByName.get(migrationName) ?? []

    if (!dbRows.length) {
      console.log(`PENDING  ${migrationName}`)
      console.log('         not applied yet')
      continue
    }

    for (const row of dbRows) {
      if (row.finished_at == null) {
        console.log(`FAILED   ${migrationName}`)
        console.log(`         id=${row.id} finished_at=null`)
        failedRowsToDelete.push(row.id)
        continue
      }

      if (row.checksum === expected) {
        console.log(`OK       ${migrationName}`)
      } else {
        console.log(`MISMATCH ${migrationName}`)
        console.log(`         db:   ${row.checksum}`)
        console.log(`         file: ${expected}`)
        checksumUpdates.push({ id: row.id, migrationName, checksum: expected })
      }
    }
  }

  const orphanRows = rows.filter((row) => !migrationNames.includes(row.migration_name))
  if (orphanRows.length) {
    console.log('')
    console.log('Orphan records (no matching folder on disk):')
    for (const row of orphanRows) {
      console.log(`- ${row.migration_name} (id=${row.id}, finished_at=${row.finished_at ?? 'null'})`)
    }
  }

  console.log('')
  console.log(
    `Summary: ${checksumUpdates.length} checksum update(s), ${failedRowsToDelete.length} failed row(s) to delete`
  )

  if (mode === 'check') {
    if (checksumUpdates.length || failedRowsToDelete.length) {
      console.log('')
      console.log('Run with --fix to repair local migration history without resetting data.')
    }
    process.exit(0)
  }

  if (!checksumUpdates.length && !failedRowsToDelete.length) {
    console.log('Nothing to fix.')
    process.exit(0)
  }

  for (const item of checksumUpdates) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "_prisma_migrations" SET checksum = $1 WHERE id = $2`,
      item.checksum,
      item.id
    )
    console.log(`fixed checksum: ${item.migrationName} (${updated} row)`)
  }

  for (const id of failedRowsToDelete) {
    const deleted = await prisma.$executeRawUnsafe(
      `DELETE FROM "_prisma_migrations" WHERE id = $1 AND finished_at IS NULL`,
      id
    )
    console.log(`deleted failed row: id=${id} (${deleted} row)`)
  }

  console.log('')
  console.log('Done. Next: npx prisma migrate status --schema prisma/schema.prisma')
} finally {
  await prisma.$disconnect()
}
