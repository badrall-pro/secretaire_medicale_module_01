import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService,private cache: CacheService) {}

  async create(dto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Ce rôle existe déjà');
    }

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  async findById(id: string) {
    const cached = await this.cache.get(`role:${id}`);
    if(cached){
      return cached;
    }

    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    await this.cache.set(`role:${id}`, role, 600);

    return role;
  }

  async getRolePermissions(roleId: string) {
    await this.findById(roleId);

    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async assignPermissionToRole(
    roleId: string,
    dto: AssignPermissionDto,
  ) {
    // Vérifie que le rôle existe
    await this.findById(roleId);

    // Vérifie que la permission existe
    const permissionExists = await this.prisma.permission.findUnique({
      where: { id: dto.permissionId },
    });

    if (!permissionExists) {
      throw new BadRequestException('La permission n\'existe pas');
    }

    // Vérifie qu'elle n'est pas déjà assignée
    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: dto.permissionId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Cette permission est déjà assignée à ce rôle',
      );
    }

    //invalide le cache apres modif
    await this.cache.del(`role:${roleId}`);
    await this.cache.delByPattern(`role:${roleId}:permessions.*`);


    // Assigne la permission
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId: dto.permissionId,
      },
      include: { permission: true },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    await this.findById(roleId);

    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Cette permission n\'est pas assignée à ce rôle',
      );
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return { message: 'Permission supprimée du rôle avec succès' };
  }

  async delete(id: string) {
    await this.findById(id);

    // Supprime les relations RolePermission
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });

    // Supprime le rôle
    await this.prisma.role.delete({ where: { id } });

    return { message: 'Rôle supprimé avec succès' };
  }
}