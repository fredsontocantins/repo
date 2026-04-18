import {
  IsEmail,
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
import { DonationStatus, DonationType } from '@prisma/client'

export class CreateDonationDto {
  @IsEnum(DonationType)
  tipo!: DonationType

  @IsOptional() @IsNumber() @Min(0)
  valor?: number

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string

  @IsOptional() @IsEnum(DonationStatus)
  status?: DonationStatus

  @IsOptional() @IsString() @MaxLength(200)
  doadorNome?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  doadorEmail?: string

  @IsOptional() @IsString() @MaxLength(40)
  doadorTelefone?: string

  @IsOptional() @IsString() @MaxLength(2000)
  mensagem?: string

  @IsOptional() @IsString() @MaxLength(500)
  recibo?: string

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number

  @IsOptional() @IsInt() @IsPositive()
  volunteerId?: number
}

export class UpdateDonationDto {
  @IsOptional() @IsEnum(DonationType)
  tipo?: DonationType

  @IsOptional() @IsNumber() @Min(0)
  valor?: number

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string

  @IsOptional() @IsEnum(DonationStatus)
  status?: DonationStatus

  @IsOptional() @IsString() @MaxLength(200)
  doadorNome?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  doadorEmail?: string

  @IsOptional() @IsString() @MaxLength(40)
  doadorTelefone?: string

  @IsOptional() @IsString() @MaxLength(2000)
  mensagem?: string

  @IsOptional() @IsString() @MaxLength(500)
  recibo?: string

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number

  @IsOptional() @IsInt() @IsPositive()
  volunteerId?: number
}
