import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { ApprovePendingDto } from './dto/approve-pending.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RejectPendingDto } from './dto/reject-pending.dto';
import { ReplacePasswordDto } from './dto/replace-password.dto';
import { SubmitPendingUserDto } from './dto/submit-pending-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserManagementService } from './user-management.service';

@ApiTags('user-management')
@Controller('api/user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Public()
  @Get('registration/options')
  getRegistrationOptions() {
    return this.userManagementService.getRegistrationOptions();
  }

  @Public()
  @Post('registration/submit')
  submitRegistration(@Body() dto: SubmitPendingUserDto) {
    return this.userManagementService.submitPendingUser(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Get('users')
  listUsers() {
    return this.userManagementService.listUsers();
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.userManagementService.createUser(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.userManagementService.getUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userManagementService.updateUser(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.userManagementService.deleteUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Patch('users/:id/password')
  replacePassword(@Param('id') id: string, @Body() dto: ReplacePasswordDto) {
    return this.userManagementService.replacePassword(id, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Patch('users/:id/quotas/reset')
  resetUsedQuotas(@Param('id') id: string) {
    return this.userManagementService.resetUsedQuotas(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Patch('users/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.userManagementService.updateStatus(id, dto.status);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Get('pending-users')
  listPendingUsers(@Query('status') status?: string) {
    return this.userManagementService.listPendingUsersByStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Post('pending-users/:id/approve')
  approvePending(@Param('id') id: string, @Body() dto: ApprovePendingDto, @Req() req: any) {
    return this.userManagementService.approvePending(id, dto, req?.user?.sub);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @Post('pending-users/:id/reject')
  rejectPending(@Param('id') id: string, @Body() dto: RejectPendingDto, @Req() req: any) {
    return this.userManagementService.rejectPending(id, req?.user?.sub, dto.rejectReason);
  }
}
