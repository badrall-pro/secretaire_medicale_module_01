import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { HealthResponseDto, ConfigResponseDto } from './dto/health-response.dto';

// @Injectable() indique à NestJS que cette classe est un "Service" (un fournisseur de logique métier)
// qui peut être injecté dans d'autres classes (comme des contrôleurs).
@Injectable()
export class HealthService {
  // Un outil pour afficher des messages de log (ex: erreurs) dans la console avec le nom du service
  private readonly logger = new Logger(HealthService.name);
  
  // On mémorise la date et l'heure exactes au moment où le service est instancié (au démarrage de l'API)
  private startTime: Date = new Date();

  // Le constructeur demande (injecte) les outils nécessaires pour que ce service fonctionne :
  // - prisma : pour interagir avec la base de données PostgreSQL
  // - cache : pour interagir avec Redis
  // - config : pour lire les variables d'environnement (ex: fichier .env)
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private config: ConfigService,
  ) {}

  // Méthode principale appelée par le contrôleur pour vérifier la santé globale du système
  async checkHealth(): Promise<HealthResponseDto> {
    // 1. On lance les vérifications pour la base de données et pour Redis
    const databaseStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    // 2. On détermine le statut global :
    // Si tout va bien (BDD et Redis sont 'ok'), le statut global est 'ok'.
    // Sinon, on considère que le service est 'degraded' (dégradé / instable).
    const overallStatus =
      databaseStatus.status === 'ok' && redisStatus.status === 'ok'
        ? 'ok'
        : 'degraded';

    // 3. On construit l'objet final (DTO) qui sera envoyé à l'utilisateur
    return {
      status: overallStatus, // 'ok' ou 'degraded'
      timestamp: new Date().toISOString(), // L'heure exacte de cette vérification
      database: databaseStatus, // Le résultat détaillé du test de la BDD
      redis: redisStatus, // Le résultat détaillé du test de Redis
      // Calcul du temps écoulé (uptime) en secondes depuis le démarrage
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
    };
  }

  // Méthode privée (utilisée uniquement à l'intérieur de cette classe) pour tester PostgreSQL
  private async checkDatabase(): Promise<{
    status: 'ok' | 'down';
    message: string;
  }> {
    try {
      // On exécute une requête SQL extrêmement simple (SELECT 1) juste pour s'assurer que la BDD répond
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        message: 'PostgreSQL connection successful',
      };
    } catch (error) {
      // Si la requête échoue (ex: BDD éteinte), on capture l'erreur, on la logue en console, et on renvoie 'down'
      this.logger.error('Database health check failed:', error);
      return {
        status: 'down',
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  // Méthode privée pour tester la connexion au cache Redis
  private async checkRedis(): Promise<{
    status: 'ok' | 'down';
    message: string;
  }> {
    try {
      // Étape 1: On essaie de lire une clé dans Redis
      const redisTest = await this.cache.get('health-check');
      // Étape 2: On essaie d'écrire une donnée dans Redis (elle s'effacera toute seule après 10 secondes)
      await this.cache.set('health-check', { timestamp: Date.now() }, 10);
      
      // Si aucune étape n'a planté, c'est que Redis fonctionne parfaitement
      return {
        status: 'ok',
        message: 'Redis connection successful',
      };
    } catch (error) {
      // En cas de problème (ex: serveur Redis arrêté ou injoignable), on signale l'erreur
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'down',
        message: `Redis connection failed: ${error.message}`,
      };
    }
  }

  // Méthode pour récupérer certaines informations de configuration de l'API
  getConfig(): ConfigResponseDto {
    return {
      // Version de notre API
      apiVersion: '1.0.0',
      // Récupère l'environnement ('development' par défaut si introuvable)
      nodeEnv: this.config.get<string>('NODE_ENV') || 'development',
      // Utilise la date de démarrage qu'on a sauvegardée tout en haut (ligne 11)
      buildDate: this.startTime.toISOString(), 
      // Récupère le port depuis le .env, le convertit en nombre entier (base 10), avec 3000 comme fallback
      port: parseInt(this.config.get<string>('PORT') as string, 10) || 3000,
    };
  }
}