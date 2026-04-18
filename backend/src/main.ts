import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  })

  app.setGlobalPrefix('api/v1')

  // Helmet: adiciona headers defensivos (CSP, HSTS, XSS etc.).
  // contentSecurityPolicy desabilitado aqui para não quebrar o Swagger UI.
  app.use(helmet({ contentSecurityPolicy: false }))

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Voluntários SaaS API')
    .setDescription('API completa para gestão de voluntariado')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`\n🚀 API rodando em: http://localhost:${port}/api/v1`)
  console.log(`📚 Documentação: http://localhost:${port}/api/docs`)
}

bootstrap()
