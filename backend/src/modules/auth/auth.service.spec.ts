import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

describe('AuthService (unit, mocks)', () => {
  let prisma: any
  let jwt: any
  let service: AuthService

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    }
    jwt = { sign: jest.fn().mockReturnValue('fake-token') }
    service = new AuthService(prisma, jwt)
  })

  it('login lança 401 quando usuário não existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    await expect(service.login('x@y.com', '123')).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('register rejeita email duplicado', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'x@y.com' })
    await expect(
      service.register({ name: 'X', email: 'x@y.com', password: 'secret1234' }),
    ).rejects.toThrow(/já cadastrado/i)
  })
})
