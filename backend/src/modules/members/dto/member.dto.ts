import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { MemberRole } from '@prisma/client'

export class CreateMemberDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  nome!: string

  @IsEmail() @MaxLength(255)
  email!: string

  @IsOptional() @IsString() @MaxLength(200)
  cargo?: string

  @IsOptional() @IsEnum(MemberRole)
  role?: MemberRole

  @IsOptional() @IsString() @MaxLength(200)
  departamento?: string

  @IsOptional() @IsString() @MaxLength(40)
  telefone?: string

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string

  @IsOptional() @IsString() @MaxLength(2000)
  bio?: string

  @IsOptional() @IsBoolean()
  isActive?: boolean
}

export class UpdateMemberDto {
  @IsOptional() @IsString() @MaxLength(200)
  nome?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @IsOptional() @IsString() @MaxLength(200)
  cargo?: string

  @IsOptional() @IsEnum(MemberRole)
  role?: MemberRole

  @IsOptional() @IsString() @MaxLength(200)
  departamento?: string

  @IsOptional() @IsString() @MaxLength(40)
  telefone?: string

  @IsOptional() @IsString() @MaxLength(500)
  avatarUrl?: string

  @IsOptional() @IsString() @MaxLength(2000)
  bio?: string

  @IsOptional() @IsBoolean()
  isActive?: boolean
}
