import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';

/**
 * Bootstrap dell'applicazione NestJS
 * Configura CORS, Swagger, Validation, Logging e Error Handling
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Creazione applicazione NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Recupera configurazione
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Configurazione CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  logger.log('CORS enabled for frontend');

  // Global prefix (opzionale, ma utile per versionamento API)
  // app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Rimuove proprietà non definite nei DTO
      forbidNonWhitelisted: true, // Lancia errore se ci sono proprietà extra
      transform: true, // Trasforma automaticamente i tipi
      transformOptions: {
        enableImplicitConversion: true, // Conversione automatica dei tipi
      },
    }),
  );
  logger.log('Global validation pipe configured');

  // Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  logger.log('Global exception filters configured');

  // Global Interceptors
  if (nodeEnv === 'development') {
    app.useGlobalInterceptors(new LoggingInterceptor());
    logger.log('Logging interceptor enabled (development mode)');
  }

  // Configurazione Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('TWT Partner Dashboard API')
    .setDescription(
      'API per la verifica della copertura dei servizi TWT xDSL\n\n' +
        'Questa API fornisce endpoints per:\n' +
        '- Ricerca toponomastica (città, strade, civici)\n' +
        '- Verifica copertura servizi (filtrato per provider TIM)\n' +
        "- Health check dell'integrazione TWT",
    )
    .setVersion('1.0')
    .addTag('Coverage', 'Endpoints per la verifica della copertura')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'TWT Partner Dashboard API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });
  logger.log('Swagger documentation available at /api/docs');

  // Avvio del server
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
