# ─── ÉTAPE 1 : BUILD ───────────────────────────────────────────────────────────
# On part d'une image Node.js légère (alpine = version minimaliste de Linux)
# Cette étape compile le code TypeScript en JavaScript
FROM node:18-alpine AS builder

# On définit le dossier de travail à l'intérieur du conteneur
WORKDIR /app

# On copie d'abord les fichiers de dépendances (package.json, package-lock.json)
# Cela permet à Docker de mettre en cache les dépendances si elles n'ont pas changé
COPY package*.json ./
COPY prisma ./prisma/

# On installe toutes les dépendances (y compris celles de dev, pour compiler)
RUN npm ci

# On copie tout le reste du code source
COPY . .

# On génère le client Prisma (obligatoire avant le build)
RUN npx prisma generate

# On compile TypeScript → JavaScript dans le dossier /app/dist
RUN npm run build

# ─── ÉTAPE 2 : PRODUCTION ──────────────────────────────────────────────────────
# On repart d'une image propre (sans les outils de dev)
# L'image finale sera beaucoup plus légère
FROM node:18-alpine AS production

WORKDIR /app

# On copie uniquement ce dont on a besoin pour faire tourner l'app
COPY package*.json ./
COPY prisma ./prisma/

# On installe uniquement les dépendances de production (pas les outils de dev)
RUN npm ci --only=production

# On génère à nouveau le client Prisma dans cette image propre
RUN npx prisma generate

# On copie le code compilé depuis l'étape de build
COPY --from=builder /app/dist ./dist

# On expose le port 3000 (port sur lequel NestJS écoute)
EXPOSE 3000

# Commande lancée au démarrage du conteneur
CMD ["node", "dist/main"]