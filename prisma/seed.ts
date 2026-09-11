import 'dotenv/config';

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});



async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. RÔLES ──────────────────────────────────────────────────────────────
  // On crée les 4 rôles de l'application avec upsert :
  // upsert = "crée si n'existe pas, met à jour si existe déjà"
  // Cela permet de relancer le seed sans erreur de doublon

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'System administrator with full access' },
  });

  const roleDoctor = await prisma.role.upsert({
    where: { name: 'doctor' },
    update: {},
    create: { name: 'doctor', description: 'Medical doctor managing appointments' },
  });

  const roleSecretary = await prisma.role.upsert({
    where: { name: 'secretary' },
    update: {},
    create: { name: 'secretary', description: 'Medical secretary supervising conversations' },
  });

  const rolePatient = await prisma.role.upsert({
    where: { name: 'patient' },
    update: {},
    create: { name: 'patient', description: 'Patient booking appointments' },
  });

  console.log('✅ Roles created');

  // ── 2. PERMISSIONS ────────────────────────────────────────────────────────
  // Les permissions suivent le format "resource:action"
  // Elles définissent ce que chaque rôle a le droit de faire

  const permissions = [
    { name: 'users:read',         resource: 'users' },
    { name: 'users:write',        resource: 'users' },
    { name: 'users:delete',       resource: 'users' },
    { name: 'appointments:read',  resource: 'appointments' },
    { name: 'appointments:write', resource: 'appointments' },
    { name: 'roles:read',         resource: 'roles' },
    { name: 'roles:write',        resource: 'roles' },
  ];

  const createdPermissions: Record<string, { id: string; name: string; resource: string }> = {};

  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    createdPermissions[perm.name] = created;
  }

  console.log('✅ Permissions created');

  // ── 3. ASSIGNATION DES PERMISSIONS AUX RÔLES ─────────────────────────────
  // On définit quelles permissions appartiennent à quel rôle

  const rolePermissionsMap: Record<string, string[]> = {
    admin: [
      'users:read', 'users:write', 'users:delete',
      'appointments:read', 'appointments:write',
      'roles:read', 'roles:write',
    ],
    doctor: ['appointments:read', 'appointments:write', 'users:read'],
    secretary: ['appointments:read', 'appointments:write', 'users:read'],
    patient: ['appointments:read', 'appointments:write'],
  };

  const roleMap: Record<string, { id: string }> = {
    admin:     roleAdmin,
    doctor:    roleDoctor,
    secretary: roleSecretary,
    patient:   rolePatient,
  };

  for (const [roleName, permNames] of Object.entries(rolePermissionsMap)) {
    const role = roleMap[roleName];
    for (const permName of permNames) {
      const permission = createdPermissions[permName];
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId:       role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId:       role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Role permissions assigned');

  // ── 4. UTILISATEURS DE TEST ───────────────────────────────────────────────
  // bcrypt.hash(password, 10) : le "10" est le nombre de rounds de hachage
  // Plus c'est élevé, plus c'est sécurisé mais lent. 10 est le standard.

  const SALT_ROUNDS = 10;

  const users = [
    // 1 admin
    {
      email:      'admin@test.com',
      password:   'Admin1234!',
      firstName:  'Admin',
      lastName:   'System',
      roleId:     roleAdmin.id,
    },
    // 3 médecins
    {
      email:      'docteur.martin@test.com',
      password:   'Doctor1234!',
      firstName:  'Sophie',
      lastName:   'Martin',
      roleId:     roleDoctor.id,
    },
    {
      email:      'docteur.bernard@test.com',
      password:   'Doctor1234!',
      firstName:  'Lucas',
      lastName:   'Bernard',
      roleId:     roleDoctor.id,
    },
    {
      email:      'docteur.leroy@test.com',
      password:   'Doctor1234!',
      firstName:  'Emma',
      lastName:   'Leroy',
      roleId:     roleDoctor.id,
    },
    // 2 secrétaires
    {
      email:      'secretaire.dupont@test.com',
      password:   'Secretary1234!',
      firstName:  'Julie',
      lastName:   'Dupont',
      roleId:     roleSecretary.id,
    },
    {
      email:      'secretaire.moreau@test.com',
      password:   'Secretary1234!',
      firstName:  'Claire',
      lastName:   'Moreau',
      roleId:     roleSecretary.id,
    },
    // 5 patients
    {
      email:      'patient1@test.com',
      password:   'Patient1234!',
      firstName:  'Jean',
      lastName:   'Durand',
      roleId:     rolePatient.id,
    },
    {
      email:      'patient2@test.com',
      password:   'Patient1234!',
      firstName:  'Marie',
      lastName:   'Petit',
      roleId:     rolePatient.id,
    },
    {
      email:      'patient3@test.com',
      password:   'Patient1234!',
      firstName:  'Pierre',
      lastName:   'Simon',
      roleId:     rolePatient.id,
    },
    {
      email:      'patient4@test.com',
      password:   'Patient1234!',
      firstName:  'Lucie',
      lastName:   'Laurent',
      roleId:     rolePatient.id,
    },
    {
      email:      'patient5@test.com',
      password:   'Patient1234!',
      firstName:  'Thomas',
      lastName:   'Michel',
      roleId:     rolePatient.id,
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where:  { email: user.email },
      update: {},
      create: {
        email:        user.email,
        passwordHash: passwordHash,
        firstName:    user.firstName,
        lastName:     user.lastName,
        roleId:       user.roleId,
      },
    });
  }

  console.log('✅ Users created');
  console.log('🎉 Seeding complete!');
}

// On exécute la fonction main et on gère les erreurs proprement
main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    // On ferme la connexion Prisma proprement à la fin du script
    await prisma.$disconnect();
  });