import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TwtService } from './twt.service';

/**
 * Modulo TWT per l'integrazione con le API xDSL
 * Fornisce servizi per la gestione della toponomastica e verifica copertura
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 secondi timeout
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [TwtService],
  exports: [TwtService], // Esporta il service per essere usato in altri moduli
})
export class TwtModule {}
