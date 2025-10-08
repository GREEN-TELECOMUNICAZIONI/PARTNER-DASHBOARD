import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO per la ricerca delle città tramite query
 * Endpoint: GET /Toponomastica/GetCities
 */
export class CityQueryDto {
  @ApiProperty({
    description: 'Nome del Comune o parte del nome (minimo 2 caratteri)',
    example: 'Mil',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'La query deve contenere almeno 2 caratteri' })
  query: string;
}
