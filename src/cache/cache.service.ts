import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// @Injectable() indique à NestJS que cette classe peut être injectée (utilisée)
// dans d'autres parties de l'application (comme les contrôleurs ou d'autres services).
@Injectable()
export class CacheService {
  // Déclaration de l'instance du client Redis qui sera utilisée pour communiquer avec la base Redis en mémoire.
  private redis: Redis;

  // Le constructeur est appelé lors de la création du service.
  // On y injecte ConfigService pour récupérer les variables d'environnement (comme les identifiants Redis).
  constructor(private config: ConfigService) {
    // Initialisation de la connexion à Redis en utilisant la bibliothèque 'ioredis'.
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST'), // L'adresse du serveur Redis (ex: localhost ou une IP)
      port: this.config.get('REDIS_PORT'), // Le port sur lequel Redis écoute (souvent 6379)
      db: this.config.get('REDIS_DB'),     // Le numéro de la base de données Redis à utiliser (par défaut 0)
      
      // La stratégie de reconnexion au cas où la connexion au serveur Redis est perdue.
      retryStrategy: (times) => {
        // Le délai d'attente augmente à chaque tentative (50ms, 100ms...), 
        // avec un maximum de 2000ms (2 secondes) entre chaque essai de reconnexion.
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Écouteur d'événement : Si une erreur survient avec la connexion Redis, on l'affiche dans la console.
    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    // Écouteur d'événement : Quand on est bien connecté à Redis, on l'indique dans la console.
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  // Permet de sauvegarder une donnée dans le cache.
  // key: le nom (la clé) sous lequel on sauvegarde la donnée (ex: 'user:1').
  // value: la donnée à sauvegarder (peut être un objet, un tableau, un nombre, etc.)
  // ttl: Time To Live (Temps de vie) en secondes. 300 par défaut (5 minutes).
  async set(key: string, value: any, ttl: number = 300) {
    if (ttl > 0) {
      // Si on a un temps de vie, on utilise setex (Set with Expiration).
      // On convertit la 'value' en chaîne de caractères (JSON.stringify) car Redis ne stocke que du texte.
      return this.redis.setex(key, ttl, JSON.stringify(value));
    }
    // Si ttl est 0 ou moins, on sauvegarde sans limite de temps (déconseillé pour un cache).
    return this.redis.set(key, JSON.stringify(value));
  }

  // Permet de récupérer une donnée depuis le cache grâce à sa clé.
  async get(key: string) {
    // On va chercher la valeur textuelle dans Redis
    const value = await this.redis.get(key);
    // Si la donnée existe, on la reconvertit de texte en objet/tableau (JSON.parse), sinon on renvoie null.
    return value ? JSON.parse(value) : null;
  }

  // Supprime une donnée spécifique du cache grâce à sa clé.
  async del(key: string) {
    return this.redis.del(key);
  }

  // Supprime plusieurs données du cache qui correspondent à un "motif" (pattern).
  // Exemple: delByPattern('user:*') supprimera toutes les clés commençant par "user:".
  async delByPattern(pattern: string) {
    const keys = await this.redis.keys(pattern); // Récupère la liste des clés qui matchent
    if (keys.length > 0) {
      // Le "..." (spread operator) permet de passer toutes les clés du tableau comme arguments distincts à la fonction del().
      return this.redis.del(...keys);
    }
  }

  // Vide COMPLETEMENT la base de données Redis actuelle. À utiliser avec grande précaution !
  async flushAll() {
    return this.redis.flushall();
  }

  // Vérifie si une clé existe dans le cache (renvoie 1 si oui, 0 si non).
  async exists(key: string) {
    return this.redis.exists(key);
  }

  // Méthode appelée automatiquement par NestJS quand l'application s'arrête.
  // On ferme proprement la connexion avec Redis pour libérer les ressources.
  async onModuleDestroy() {
    await this.redis.quit();
  }
}