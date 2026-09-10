import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Adresse email de l\'utilisateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe de l\'utilisateur (min 6 caractères)', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom de l\'utilisateur' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de l\'utilisateur' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Identifiant (UUID) du rôle à assigner' })
  @IsUUID()
  roleId: string;
}