import {
  ArrayNotEmpty,
  IsArray,
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
import { CertificateType } from '@prisma/client'

export class CreateCertificateDto {
  @IsInt() @IsPositive()
  volunteerId!: number

  @IsString() @IsNotEmpty() @MaxLength(300)
  titulo!: string

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string

  @IsOptional() @IsEnum(CertificateType)
  tipo?: CertificateType

  @IsOptional() @IsNumber() @Min(0)
  horasCertificadas?: number

  @IsOptional() @IsDateString()
  dataAtividade?: string

  @IsOptional() @IsDateString()
  dataValidade?: string

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number

  @IsOptional() @IsString() @MaxLength(200)
  assinante?: string

  @IsOptional() @IsString() @MaxLength(200)
  cargoAssinante?: string
}

export class IssueBulkCertificatesDto {
  @IsArray() @ArrayNotEmpty() @IsInt({ each: true })
  volunteerIds!: number[]

  @IsString() @IsNotEmpty() @MaxLength(300)
  titulo!: string

  @IsOptional() @IsEnum(CertificateType)
  tipo?: CertificateType

  @IsOptional() @IsString() @MaxLength(2000)
  descricao?: string

  @IsOptional() @IsNumber() @Min(0)
  horasCertificadas?: number

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number

  @IsOptional() @IsString() @MaxLength(200)
  assinante?: string

  @IsOptional() @IsString() @MaxLength(200)
  cargoAssinante?: string
}

export class RevokeCertificateDto {
  @IsString() @IsNotEmpty() @MaxLength(500)
  motivoRevogacao!: string
}
