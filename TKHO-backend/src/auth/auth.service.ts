import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private canAccessAdminPortal(role: string | null): boolean {
    return String(role || '')
      .toLowerCase()
      .includes('admin');
  }

  private verifyPassword(plain: string, stored: string): boolean {
    if (!plain || !stored) {
      return false;
    }
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
      return bcrypt.compareSync(plain, stored);
    }
    return plain === stored;
  }

  private normalizeUser(user: any, system: string) {
    return {
      id: user.id.toString(),
      corpId: user.corpId,
      account: user.account,
      name: user.name,
      department: user.department,
      role: user.role,
      position: user.position,
      email: user.email,
      contact: user.contact,
      annualQuotaEv: user.annualQuotaEv,
      usedQuotaEv: user.usedQuotaEv,
      annualQuotaVenue: user.annualQuotaVenue,
      usedQuotaVenue: user.usedQuotaVenue,
      status: user.status,
      lastLoginTime: user.lastLoginTime,
      createdAt: user.createdAt,
      system,
    };
  }

  private parseAuthSub(auth: any): bigint {
    const sub = String(auth?.sub ?? '').trim();
    if (!/^\d+$/.test(sub)) {
      throw new UnauthorizedException('Invalid token');
    }
    return BigInt(sub);
  }

  async login(dto: LoginDto) {
    const account = dto.account.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ account }, { corpId: account }],
      },
    });

    if (!user || !this.verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Incorrect account or password');
    }
    if (user.status !== 'Active') {
      throw new ForbiddenException('Account is not active');
    }
    if (dto.system === 'admin' && !this.canAccessAdminPortal(user.role)) {
      throw new ForbiddenException('Not authorized for admin portal');
    }

    const token = this.jwtService.sign({
      sub: String(user.id),
      system: dto.system,
      corpId: user.corpId,
      name: user.name,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginTime: new Date() },
    });

    return {
      token,
      user: this.normalizeUser(user, dto.system),
    };
  }

  async getCurrentUser(auth: any) {
    const user = await this.prisma.user.findUnique({ where: { id: this.parseAuthSub(auth) } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: this.normalizeUser(user, auth.system || 'room'),
    };
  }

  async updateProfile(auth: any, dto: UpdateProfileDto) {
    const id = this.parseAuthSub(auth);
    const account = String(dto.employeeNo || '').trim();
    const updateData: any = {
      name: dto.fullName.trim(),
      contact: dto.phone.trim(),
      department: dto.department?.trim() || null,
    };

    if (account) {
      updateData.account = account;
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return {
        message: 'Profile updated',
        user: this.normalizeUser(user, auth.system || 'room'),
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Employee No already exists');
      }
      throw error;
    }
  }

  async changePassword(auth: any, dto: ChangePasswordDto) {
    const id = this.parseAuthSub(auth);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!this.verifyPassword(dto.currentPassword, user.password)) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }
    await this.prisma.user.update({
      where: { id },
      data: { password: bcrypt.hashSync(dto.newPassword, 10) },
    });
    return { message: 'Password updated' };
  }
}
