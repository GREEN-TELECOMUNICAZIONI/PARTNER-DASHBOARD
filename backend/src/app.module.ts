import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwtModule } from './modules/twt/twt.module';
import { CoverageModule } from './modules/coverage/coverage.module';
import { ContractsModule } from './modules/contracts/contracts.module';

/**
 * Modulo principale dell'applicazione
 * Configura tutti i moduli e le dipendenze globali
 */
@Module({
  imports: [
    // Configurazione globale delle variabili d'ambiente
    ConfigModule.forRoot({
      isGlobal: true, // Rende ConfigService disponibile in tutta l'app
      envFilePath: ['.env.local', '.env'], // Supporta file .env multipli
      cache: true, // Cache delle variabili d'ambiente per performance
    }),
    // Moduli dell'applicazione
    TwtModule,
    CoverageModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
