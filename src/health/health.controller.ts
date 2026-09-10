import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto, ConfigResponseDto } from './dto/health-response.dto';

// @ApiTags('Health') regroupe toutes les routes de ce contrôleur sous la section "Health" dans la documentation Swagger
@ApiTags('Health')
// @Controller('api/v1') indique que l'URL de base pour toutes les routes de ce fichier commencera par "api/v1"
@Controller('api/v1')
export class HealthController {
  // On injecte le "HealthService" (où se trouve la vraie logique) pour pouvoir utiliser ses méthodes dans le contrôleur
  constructor(private healthService: HealthService) {}

  // @Get('health') crée une route accessible via une requête GET sur l'URL complète "api/v1/health"
  @Get('health')
  // @ApiOperation ajoute un résumé de l'action dans Swagger
  @ApiOperation({ summary: 'Check service health status' })
  // @ApiResponse décrit ce que la route va renvoyer si tout se passe bien (Statut HTTP 200)
  // Préciser "type: HealthResponseDto" permet à Swagger de générer automatiquement un exemple visuel de la réponse !
  @ApiResponse({
    status: 200,
    description: 'Health status with database and Redis info',
    type: HealthResponseDto,
  })
  // Cette fonction s'exécute automatiquement quand quelqu'un appelle la route
  checkHealth(): Promise<HealthResponseDto> {
    // Le contrôleur est comme un réceptionniste : il ne fait pas le vrai travail.
    // Il demande au "HealthService" de vérifier la santé de l'API et il renvoie directement le résultat au client.
    return this.healthService.checkHealth();
  }

  // @Get('config') crée une route accessible via l'URL complète "api/v1/config"
  @Get('config')
  // Documentation Swagger de la route
  @ApiOperation({ summary: 'Get API configuration metadata' })
  @ApiResponse({
    status: 200,
    description: 'API version and environment info',
    type: ConfigResponseDto,
  })
  // Cette fonction s'exécute pour la route config
  getConfig(): ConfigResponseDto {
    // On appelle simplement la méthode "getConfig" de notre service
    return this.healthService.getConfig();
  }
}