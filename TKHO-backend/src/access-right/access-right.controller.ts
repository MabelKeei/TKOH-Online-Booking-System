import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessRightService } from './access-right.service';
import { CreateAccessRoleDto } from './dto/create-access-role.dto';
import { UpdateAccessRoleDto } from './dto/update-access-role.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('access-right')
@ApiBearerAuth()
@Controller('api/access-right')
export class AccessRightController {
  constructor(private readonly accessRightService: AccessRightService) {}

  @Get('roles')
  listRoles() {
    return this.accessRightService.listRoles();
  }

  @Post('roles')
  createRole(@Body() dto: CreateAccessRoleDto) {
    return this.accessRightService.createRole(dto);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateAccessRoleDto) {
    return this.accessRightService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.accessRightService.deleteRole(id);
  }

  @Get('departments')
  listDepartments() {
    return this.accessRightService.listDepartments();
  }

  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.accessRightService.createDepartment(dto);
  }

  @Patch('departments/:id')
  updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.accessRightService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  deleteDepartment(@Param('id') id: string) {
    return this.accessRightService.deleteDepartment(id);
  }
}
