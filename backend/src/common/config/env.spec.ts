import { getJwtExpiresIn, getJwtSecret, requireEnv } from './env'

describe('env helpers', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('requireEnv lança quando variável está ausente', () => {
    delete process.env.FOO
    expect(() => requireEnv('FOO')).toThrow(/FOO/)
  })

  it('requireEnv retorna valor quando presente', () => {
    process.env.BAR = 'baz'
    expect(requireEnv('BAR')).toBe('baz')
  })

  it('getJwtSecret exige pelo menos 24 caracteres', () => {
    process.env.JWT_SECRET = 'curto'
    expect(() => getJwtSecret()).toThrow(/24/)
  })

  it('getJwtSecret aceita segredo forte', () => {
    process.env.JWT_SECRET = 'a'.repeat(48)
    expect(getJwtSecret()).toHaveLength(48)
  })

  it('getJwtExpiresIn tem default de 7d', () => {
    delete process.env.JWT_EXPIRES_IN
    expect(getJwtExpiresIn()).toBe('7d')
  })
})
