import { IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Le nom du rôle' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Administrateur système', description: 'Description optionnelle du rôle' })
  @IsString()
  description?: string;
}