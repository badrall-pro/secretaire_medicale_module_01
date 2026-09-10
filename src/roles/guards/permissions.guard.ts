import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupère la permission requise depuis le décorateur
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    // Si pas de décorateur @HasPermission, laisse passer
    if (!requiredPermission) {
      return true;
    }

    // Récupère l'utilisateur depuis le request (mis là par JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Récupère le rôle de l'utilisateur depuis la BDD
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!userWithRole) {
      throw new ForbiddenException('Utilisateur introuvable');
    }

    // Récupère toutes les permissions du rôle
    const userPermissions = userWithRole.role.permissions.map(
      (rp) => rp.permission.name,
    );

    // Vérifie si l'utilisateur a la permission requise
    if (!userPermissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Vous n'avez pas la permission: ${requiredPermission}`,
      );
    }

    return true;
  }
}