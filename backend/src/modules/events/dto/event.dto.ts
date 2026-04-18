import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'
import { EventStatus } from '@prisma/client'

export class CreateEventDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nome!: string

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string

  @IsOptional() @IsString() @MaxLength(300)
  local?: string

  @IsDateString()
  dataInicio!: string

  @IsOptional() @IsDateString()
  dataFim?: string

  @IsOptional() @IsInt() @Min(0)
  capacidade?: number

  @IsOptional() @IsString() @MaxLength(500)
  imagemUrl?: string

  @IsOptional() @IsEnum(EventStatus)
  status?: EventStatus

  @IsOptional() @IsBoolean()
  publicavel?: boolean

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number
}

export class UpdateEventDto {
  @IsOptional() @IsString() @MaxLength(200)
  nome?: string

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string

  @IsOptional() @IsString() @MaxLength(300)
  local?: string

  @IsOptional() @IsDateString()
  dataInicio?: string

  @IsOptional() @IsDateString()
  dataFim?: string

  @IsOptional() @IsInt() @Min(0)
  capacidade?: number

  @IsOptional() @IsString() @MaxLength(500)
  imagemUrl?: string

  @IsOptional() @IsEnum(EventStatus)
  status?: EventStatus

  @IsOptional() @IsBoolean()
  publicavel?: boolean

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number
}

export class RegisterEventDto {
  @IsInt() @IsPositive()
  volunteerId!: number
}
