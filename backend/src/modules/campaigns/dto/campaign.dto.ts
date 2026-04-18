import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'
import { CampaignStatus } from '@prisma/client'

export class CreateCampaignDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nome!: string

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string

  @IsOptional() @IsString() @MaxLength(500)
  objetivo?: string

  @IsOptional() @IsNumber() @Min(0)
  metaArrecadacao?: number

  @IsOptional() @IsInt() @Min(0)
  metaVoluntarios?: number

  @IsOptional() @IsEnum(CampaignStatus)
  status?: CampaignStatus

  @IsOptional() @IsDateString()
  dataInicio?: string

  @IsOptional() @IsDateString()
  dataFim?: string

  @IsOptional() @IsString() @MaxLength(500)
  imagemUrl?: string

  @IsOptional() @IsBoolean()
  publicavel?: boolean

  @IsOptional() @IsBoolean()
  destaque?: boolean
}

export class UpdateCampaignDto {
  @IsOptional() @IsString() @MaxLength(200)
  nome?: string

  @IsOptional() @IsString() @MaxLength(5000)
  descricao?: string

  @IsOptional() @IsString() @MaxLength(500)
  objetivo?: string

  @IsOptional() @IsNumber() @Min(0)
  metaArrecadacao?: number

  @IsOptional() @IsInt() @Min(0)
  metaVoluntarios?: number

  @IsOptional() @IsEnum(CampaignStatus)
  status?: CampaignStatus

  @IsOptional() @IsDateString()
  dataInicio?: string

  @IsOptional() @IsDateString()
  dataFim?: string

  @IsOptional() @IsString() @MaxLength(500)
  imagemUrl?: string

  @IsOptional() @IsBoolean()
  publicavel?: boolean

  @IsOptional() @IsBoolean()
  destaque?: boolean
}

export class AddCampaignVolunteerDto {
  @IsInt() @IsPositive()
  volunteerId!: number
}
