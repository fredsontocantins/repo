import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { VolunteerStatus } from '@prisma/client'

export class CreateVolunteerDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nome!: string

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @IsOptional() @IsString() @MaxLength(40)
  telefone?: string

  @IsOptional() @IsString() @MaxLength(20)
  cpf?: string

  @IsOptional() @IsDateString()
  dataNascimento?: string

  @IsOptional() @IsString() @MaxLength(120)
  profissao?: string

  @IsOptional() @IsArray() @IsString({ each: true })
  habilidades?: string[]

  @IsOptional() @IsString() @MaxLength(2000)
  bio?: string

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string

  @IsOptional() @IsString() @MaxLength(300)
  endereco?: string

  @IsOptional() @IsString() @MaxLength(120)
  cidade?: string

  @IsOptional() @IsString() @MaxLength(60)
  estado?: string

  @IsOptional() @IsEnum(VolunteerStatus)
  status?: VolunteerStatus
}

export class UpdateVolunteerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  nome?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @IsOptional() @IsString() @MaxLength(40)
  telefone?: string

  @IsOptional() @IsString() @MaxLength(20)
  cpf?: string

  @IsOptional() @IsDateString()
  dataNascimento?: string

  @IsOptional() @IsString() @MaxLength(120)
  profissao?: string

  @IsOptional() @IsArray() @IsString({ each: true })
  habilidades?: string[]

  @IsOptional() @IsString() @MaxLength(2000)
  bio?: string

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string

  @IsOptional() @IsString() @MaxLength(300)
  endereco?: string

  @IsOptional() @IsString() @MaxLength(120)
  cidade?: string

  @IsOptional() @IsString() @MaxLength(60)
  estado?: string

  @IsOptional() @IsEnum(VolunteerStatus)
  status?: VolunteerStatus
}

export class AddPointsDto {
  @IsInt() @Min(-10_000) @Max(10_000)
  points!: number
}
