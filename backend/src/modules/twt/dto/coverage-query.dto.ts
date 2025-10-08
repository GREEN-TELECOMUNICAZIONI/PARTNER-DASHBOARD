import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO per ottenere i servizi di copertura disponibili
 * Endpoint: GET /Toponomastica/GetCoverageServices
 */
export class CoverageQueryDto {
  @ApiProperty({
    description: 'Array di Header IDs ottenuti da GetHeaders',
    example: [17209508],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  headersId: number[];

  @ApiProperty({
    description: 'Codice Egon del Comune',
    example: '38000002491',
  })
  @IsString()
  @IsNotEmpty()
  cityEgon: string;

  @ApiProperty({
    description: "Codice Egon dell'indirizzo",
    example: '38000053701',
  })
  @IsString()
  @IsNotEmpty()
  addressEgon: string;

  @ApiProperty({
    description: 'Codice Egon univoco (MainEgon)',
    example: '380100004477903',
  })
  @IsString()
  @IsNotEmpty()
  mainEgon: string;

  @ApiProperty({
    description: 'Numero civico',
    example: '33',
  })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;
}
