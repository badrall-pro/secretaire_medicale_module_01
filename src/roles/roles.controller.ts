import { Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { HasPermission } from './decorators/has-permission.decorator';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/roles')
export class RolesController {
  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  @Get()
  @HasPermission('roles:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @HasPermission('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @HasPermission('roles:write')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Delete(':id')
  @HasPermission('roles:write')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Get(':roleId/permissions')
  @HasPermission('roles:read')
  @ApiOperation({ summary: 'Get all permissions for a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.rolesService.getRolePermissions(roleId);
  }

  @Post(':roleId/permissions')
  @HasPermission('roles:write')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiParam({ name: 'roleId', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Permission assigned' })
  assignPermission(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.rolesService.assignPermissionToRole(roleId, dto);
  }

  @Delete(':roleId/permissions/:permissionId')
  @HasPermission('roles:write')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiParam({ name: 'roleId', description: 'Role ID (UUID)' })
  @ApiParam({ name: 'permissionId', description: 'Permission ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Permission removed' })
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removePermissionFromRole(roleId, permissionId);
  }
}