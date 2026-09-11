# Secrétaire Médicale IA — Backend Core API

Backend NestJS du projet Secrétaire Médicale IA.

## Prérequis

- Docker Desktop installé et démarré
- Node.js v18+

## Démarrage avec Docker Compose

```bash
# Lance les 3 services (api, postgres, redis) en arrière-plan
docker-compose up -d

# Vérifie que les 3 conteneurs sont bien démarrés
docker-compose ps

# Consulte les logs de l'API en temps réel
docker-compose logs -f api
```

## Vérification

Une fois démarré, teste l'endpoint de santé :

```bash
curl http://localhost:3000/api/v1/health
```

Réponse attendue :
```json
{ "status": "ok", "database": "ok", "redis": "ok" }
```

La documentation Swagger est disponible sur :  
`http://localhost:3000/api/docs`

## Arrêter les services

```bash
docker-compose down          # arrête et supprime les conteneurs
docker-compose down -v       # supprime aussi les volumes (données perdues)
```

## Démarrage en développement local (sans Docker Compose)

```powershell
docker start pg-secretaire
docker start redis-secretaire
npm run dev
```