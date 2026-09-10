import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export class SwaggerConfig {
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Secrétaire Médicale IA - Backend API')
      .setDescription(
        'API REST pour la gestion automatisée des rendez-vous médicaux',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Authentication', 'Endpoints pour la gestion des sessions')
      .addTag('Users', 'Endpoints pour gérer les utilisateurs')
      .addTag('Roles', 'Endpoints pour gérer les rôles et permissions')
      .addTag('Health', 'Endpoints de monitoring et santé du service')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}