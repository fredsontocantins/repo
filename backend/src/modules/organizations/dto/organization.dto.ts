import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator'

export class UpdateOrganizationDto {
  @IsOptional() @IsString() @MaxLength(200)
  name?: string

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string

  @IsOptional() @IsString() @MaxLength(500)
  website?: string

  @IsOptional() @IsString() @MaxLength(500)
  logoUrl?: string

  @IsOptional() @IsEmail() @MaxLength(255)
  email?: string

  @IsOptional() @IsString() @MaxLength(40)
  phone?: string

  @IsOptional() @IsString() @MaxLength(300)
  address?: string

  @IsOptional() @IsString() @MaxLength(120)
  city?: string

  @IsOptional() @IsString() @MaxLength(60)
  state?: string

  @IsOptional() @IsString() @MaxLength(20)
  cnpj?: string

  @IsOptional() @IsBoolean()
  portalAtivo?: boolean

  @IsOptional() @IsString() @MaxLength(2000)
  portalDescricao?: string

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: 'portalCorPrimaria deve ser hex (#rgb ou #rrggbb)' })
  portalCorPrimaria?: string
}
