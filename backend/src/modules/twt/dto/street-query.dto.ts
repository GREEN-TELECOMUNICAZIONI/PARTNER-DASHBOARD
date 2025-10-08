import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO per la ricerca degli indirizzi per città
 * Endpoint: GET /Toponomastica/GetAddressesByCity (documentazione) o GetStreets
 */
export class StreetQueryDto {
  @ApiProperty({
    description: 'Indirizzo comprensivo della particella (minimo 2 caratteri)',
    example: 'VIA VESPRI',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'La query deve contenere almeno 2 caratteri' })
  query: string;

  @ApiProperty({
    description: 'Codice Egon del Comune',
    example: 38000002491,
  })
  @IsInt()
  @Type(() => Number)
  cityId: number;
}
