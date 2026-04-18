import {
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
import {
  PayableCategory,
  PayableStatus,
  ReceivableCategory,
  ReceivableStatus,
} from '@prisma/client'

export class CreatePayableDto {
  @IsString() @IsNotEmpty() @MaxLength(300)
  descricao!: string

  @IsNumber() @Min(0)
  valor!: number

  @IsDateString()
  vencimento!: string

  @IsEnum(PayableCategory)
  categoria!: PayableCategory

  @IsOptional() @IsString() @MaxLength(200)
  fornecedor?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacoes?: string

  @IsOptional() @IsEnum(PayableStatus)
  status?: PayableStatus
}

export class UpdatePayableDto {
  @IsOptional() @IsString() @MaxLength(300)
  descricao?: string

  @IsOptional() @IsNumber() @Min(0)
  valor?: number

  @IsOptional() @IsDateString()
  vencimento?: string

  @IsOptional() @IsEnum(PayableCategory)
  categoria?: PayableCategory

  @IsOptional() @IsString() @MaxLength(200)
  fornecedor?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacoes?: string

  @IsOptional() @IsEnum(PayableStatus)
  status?: PayableStatus
}

export class LiquidarPayableDto {
  @IsNumber() @Min(0)
  valorPago!: number

  @IsString() @IsNotEmpty() @MaxLength(60)
  formaPagamento!: string

  @IsOptional() @IsDateString()
  dataPagamento?: string

  @IsOptional() @IsString() @MaxLength(500)
  comprovante?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacao?: string
}

export class CreateReceivableDto {
  @IsString() @IsNotEmpty() @MaxLength(300)
  descricao!: string

  @IsNumber() @Min(0)
  valor!: number

  @IsDateString()
  vencimento!: string

  @IsEnum(ReceivableCategory)
  categoria!: ReceivableCategory

  @IsOptional() @IsString() @MaxLength(200)
  pagador?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacoes?: string

  @IsOptional() @IsEnum(ReceivableStatus)
  status?: ReceivableStatus

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number
}

export class UpdateReceivableDto {
  @IsOptional() @IsString() @MaxLength(300)
  descricao?: string

  @IsOptional() @IsNumber() @Min(0)
  valor?: number

  @IsOptional() @IsDateString()
  vencimento?: string

  @IsOptional() @IsEnum(ReceivableCategory)
  categoria?: ReceivableCategory

  @IsOptional() @IsString() @MaxLength(200)
  pagador?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacoes?: string

  @IsOptional() @IsEnum(ReceivableStatus)
  status?: ReceivableStatus

  @IsOptional() @IsInt() @IsPositive()
  campaignId?: number
}

export class LiquidarReceivableDto {
  @IsNumber() @Min(0)
  valorRecebido!: number

  @IsString() @IsNotEmpty() @MaxLength(60)
  formaRecebimento!: string

  @IsOptional() @IsDateString()
  dataRecebimento?: string

  @IsOptional() @IsString() @MaxLength(500)
  comprovante?: string

  @IsOptional() @IsString() @MaxLength(2000)
  observacao?: string
}

export class MotivoDto {
  @IsString() @IsNotEmpty() @MaxLength(500)
  motivo!: string
}
