import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new.email@example.com', description: 'Nouvelle adresse email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Jean-Baptiste', description: 'Nouveau prénom' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont', description: 'Nouveau nom' })
  @IsString()
  @IsOptional()
  lastName?: string;
}