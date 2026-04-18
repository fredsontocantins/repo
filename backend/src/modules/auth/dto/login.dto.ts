import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@voluntariosunidos.org.br' })
  @IsEmail()
  @MaxLength(255)
  email!: string

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password!: string
}
