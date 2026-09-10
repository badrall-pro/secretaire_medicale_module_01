import { ApiProperty } from "@nestjs/swagger";

// Ce fichier définit la forme des données (DTO = Data Transfer Object) 
// qui seront renvoyées par notre API quand on interroge sa "santé" (health check).
export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: "L'état global de l'API", enum: ['ok', 'degraded', 'down'] })
  status: 'ok' | 'degraded' | 'down';
  
  @ApiProperty({ example: '2023-10-01T12:00:00Z', description: "L'heure exacte à laquelle la vérification a été faite (au format ISO)" })
  timestamp: string;
  
  @ApiProperty({
    example: { status: 'ok', message: 'Connection successful' },
    description: "Détails sur l'état de la connexion à la base de données"
  })
  database: {
    status: 'ok' | 'down';
    message: string;
  };
  
  @ApiProperty({
    example: { status: 'ok', message: 'Connection successful' },
    description: "Détails sur l'état de la connexion au système de cache Redis"
  })
  redis: {
    status: 'ok' | 'down';
    message: string;
  };
  
  @ApiProperty({ example: 3600, description: "Le temps (en secondes) écoulé depuis que le serveur a démarré sans s'arrêter" })
  uptime: number;
}

// Ce fichier définit la forme des données pour la route qui renvoie la configuration
export class ConfigResponseDto {
  @ApiProperty({ example: '1.0.0', description: "La version actuelle de l'API (ex: '1.0.0')" })
  apiVersion: string;
  
  @ApiProperty({ example: 'development', description: "L'environnement actuel (ex: 'development', 'production' ou 'test')" })
  nodeEnv: string;
  
  @ApiProperty({ example: '2023-10-01T12:00:00Z', description: "La date et l'heure à laquelle l'application a été préparée (build)" })
  buildDate: string;
  
  @ApiProperty({ example: 3000, description: "Le port réseau sur lequel le serveur tourne (souvent 3000 en développement)" })
  port: number;
}