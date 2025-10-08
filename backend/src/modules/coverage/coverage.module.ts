import { Module } from '@nestjs/common';
import { CoverageController } from './coverage.controller';
import { TwtModule } from '../twt/twt.module';

/**
 * Modulo Coverage per la verifica della copertura dei servizi
 * Utilizza TwtModule per le chiamate API
 */
@Module({
  imports: [TwtModule],
  controllers: [CoverageController],
})
export class CoverageModule {}
