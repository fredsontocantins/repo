import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Cadastro público — cria usuário como VOLUNTEER.
 * A associação a uma organização é feita apenas por um ADMIN via /users,
 * para evitar que usuários se auto-associem a qualquer organização.
 */
export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string

  @ApiProperty()
  @IsEmail()
  @MaxLength(255)
  email!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}
