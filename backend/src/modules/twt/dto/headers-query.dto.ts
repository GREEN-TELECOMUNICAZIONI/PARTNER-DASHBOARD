import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO per ottenere gli header ID di un indirizzo
 * Endpoint: GET /Toponomastica/GetHeaders
 */
export class HeadersQueryDto {
  @ApiProperty({
    description: 'Nome del Comune',
    example: 'MILANO',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Nome della Provincia',
    example: 'MILANO',
  })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiPropertyOptional({
    description: 'Particella toponomastica (es. VIA, VIALE, PIAZZA)',
    example: 'VIA',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({
    description: 'Indirizzo esclusi particella e numero civico',
    example: 'VESPRI SICILIANI',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Numero civico',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  number: string;
}
