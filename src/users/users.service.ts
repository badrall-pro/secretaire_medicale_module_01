import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Vérifie que le rôle existe
    const roleExists = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!roleExists) {
      throw new BadRequestException('Le rôle spécifié n\'existe pas');
    }

    // Vérifie que l'email n'existe pas déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hash le mot de passe
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Crée l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: dto.roleId,
      },
    });

    return this.mapToResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto> {
    // Cherche d'abord en cache (TTL 5 minutes)
    const cached = await this.cache.get(`user:${id}`);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const response = this.mapToResponse(user);

    // Stocke en cache
    await this.cache.set(`user:${id}`, response, 300);

    return response;
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return this.mapToResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapToResponse(user));
  }

  async findByRole(roleId: string): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { roleId },
    });

    return users.map((user) => this.mapToResponse(user));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    // Vérifie que l'utilisateur existe
    await this.findById(id);

    // Vérifie que le nouvel email (s'il y en a un) n'existe pas
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Met à jour l'utilisateur
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
      },
    });

    await this.cache.del(`user:${id}`);

    return this.mapToResponse(user);
  }

  async delete(id: string): Promise<{ message: string }> {
    // Vérifie que l'utilisateur existe
    await this.findById(id);

    // Supprime toutes les sessions de cet utilisateur d'abord
    await this.prisma.session.deleteMany({ where: { userId: id } });

    // Puis supprime l'utilisateur
    await this.prisma.user.delete({ where: { id } });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  private mapToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}