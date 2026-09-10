import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'read', description: 'Le nom de la permission (ex: read, write)' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'users', description: 'La ressource concernée par la permission' })
  @IsString()
  resource: string;
}