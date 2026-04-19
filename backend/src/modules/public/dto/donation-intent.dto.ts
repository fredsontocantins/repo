import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { DonationType } from '@prisma/client'

export class PublicDonationIntentDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nome!: string

  @IsEmail() @MaxLength(255)
  email!: string

  @IsOptional() @IsString() @MaxLength(30)
  telefone?: string

  @IsOptional() @IsEnum(DonationType)
  tipo?: DonationType

  @IsOptional() @IsNumber() @Min(1) @Max(10_000_000)
  valor?: number

  @IsOptional() @IsString() @MaxLength(1000)
  mensagem?: string

  @IsOptional() @IsInt() @Min(1)
  campaignId?: number
}

export class PublicVolunteerIntentDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  nome!: string

  @IsEmail() @MaxLength(255)
  email!: string

  @IsOptional() @IsString() @MaxLength(30)
  telefone?: string

  @IsOptional() @IsString() @MaxLength(120)
  profissao?: string

  @IsOptional() @IsString() @MaxLength(1000)
  mensagem?: string

  @IsOptional() @IsInt() @Min(1)
  campaignId?: number
}
