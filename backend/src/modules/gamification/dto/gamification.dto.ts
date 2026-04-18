import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateBadgeDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nome!: string

  @IsOptional() @IsString() @MaxLength(500)
  descricao?: string

  @IsString() @IsNotEmpty() @MaxLength(80)
  icone!: string

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'cor deve ser hex (#rgb ou #rrggbb)' })
  cor?: string

  @IsOptional() @IsString() @MaxLength(500)
  criterio?: string

  @IsOptional() @IsInt() @Min(0)
  pontosReq?: number

  @IsOptional() @IsNumber() @Min(0)
  horasReq?: number
}

export class AwardBadgeDto {
  @IsInt() @IsPositive()
  volunteerId!: number

  @IsInt() @IsPositive()
  badgeId!: number
}
