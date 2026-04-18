import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { UserRole } from '@prisma/client'

export class ModuleAccessDto {
  @IsString() @IsNotEmpty() @MaxLength(60)
  module!: string

  @IsBoolean()
  canRead!: boolean

  @IsOptional() @IsBoolean() canCreate?: boolean
  @IsOptional() @IsBoolean() canUpdate?: boolean
  @IsOptional() @IsBoolean() canDelete?: boolean
}

export class CreateUserDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name!: string

  @IsEmail() @MaxLength(255)
  email!: string

  @IsString() @MinLength(8) @MaxLength(128)
  password!: string

  @IsOptional() @IsEnum(UserRole)
  role?: UserRole

  @IsOptional() @IsInt() @IsPositive()
  organizationId?: number

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleAccessDto)
  modules?: ModuleAccessDto[]
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(120)
  name?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @IsOptional() @IsString() @MinLength(8) @MaxLength(128)
  password?: string

  @IsOptional() @IsEnum(UserRole)
  role?: UserRole

  @IsOptional() @IsBoolean()
  isActive?: boolean

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleAccessDto)
  modules?: ModuleAccessDto[]
}

export class UpdateUserModulesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleAccessDto)
  modules!: ModuleAccessDto[]
}
