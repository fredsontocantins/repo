import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class RejectInterestDto {
  @IsOptional() @IsString() @MaxLength(500)
  motivo?: string
}

export class RejectInterestBodyDto extends RejectInterestDto {
  @IsOptional() @IsString() @MaxLength(500)
  declare motivo?: string
}

export class RejectWithReasonDto {
  @IsString() @IsNotEmpty() @MaxLength(500)
  motivo!: string
}
