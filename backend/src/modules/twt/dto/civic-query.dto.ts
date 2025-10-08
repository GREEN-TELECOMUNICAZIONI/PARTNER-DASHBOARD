import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO per la ricerca dei civici per indirizzo
 * Endpoint: GET /Toponomastica/GetStreetNumberByAddress (documentazione) o GetCivics
 */
export class CivicQueryDto {
  @ApiPropertyOptional({
    description:
      'Numero civico da cercare (opzionale, se omesso restituisce tutti i civici)',
    example: '12',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Codice Egon della Via',
    example: 38000053701,
  })
  @IsInt()
  @Type(() => Number)
  addressId: number;
}
