import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID unique de l\'utilisateur' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'Adresse email' })
  email: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom' })
  lastName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID du rôle assigné' })
  roleId: string;

  @ApiProperty({ example: true, description: 'Statut du compte' })
  isActive: boolean;

  @ApiProperty({ example: '2023-10-01T12:00:00Z', description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-01T12:00:00Z', description: 'Date de dernière mise à jour' })
  updatedAt: Date;
}