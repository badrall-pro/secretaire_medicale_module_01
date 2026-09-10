import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const existingPermission = await this.prisma.permission.findUnique({
      where: { name: dto.name },
    });

    if (existingPermission) {
      throw new ConflictException('Cette permission existe déjà');
    }

    return this.prisma.permission.create({
      data: {
        name: dto.name,
        resource: dto.resource,
      },
    });
  }

  async findAll() {
    return this.prisma.permission.findMany();
  }

  async findById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission introuvable');
    }

    return permission;
  }

  async delete(id: string) {
    await this.findById(id);

    // Supprime aussi les relations RolePermission
    await this.prisma.rolePermission.deleteMany({
      where: { permissionId: id },
    });

    await this.prisma.permission.delete({ where: { id } });

    return { message: 'Permission supprimée avec succès' };
  }
}