import { Controller, Get, Param, Query, ParseIntPipe, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PublicService } from './public.service'
import { Public } from '../../common/decorators/index'
import { PublicDonationIntentDto, PublicVolunteerIntentDto } from './dto/donation-intent.dto'

@ApiTags('Portal Público')
@Controller('public')
export class PublicController {
  constructor(private service: PublicService) {}

  @Get('org/:slug')
  @Public()
  @ApiOperation({ summary: 'Info pública da organização' })
  getOrg(@Param('slug') slug: string) {
    return this.service.getOrgBySlug(slug)
  }

  @Get('org/:slug/stats')
  @Public()
  @ApiOperation({ summary: 'Estatísticas públicas' })
  async getStats(@Param('slug') slug: string) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.getPublicStats(org.id)
  }

  @Get('org/:slug/campaigns')
  @Public()
  @ApiOperation({ summary: 'Campanhas públicas' })
  async getCampaigns(
    @Param('slug') slug: string,
    @Query('destaque') destaque?: string,
    @Query('page') page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.getCampaigns(org.id, { destaque: destaque === 'true', page, limit })
  }

  @Get('org/:slug/events')
  @Public()
  @ApiOperation({ summary: 'Próximos eventos públicos' })
  async getEvents(
    @Param('slug') slug: string,
    @Query('page') page?: number | string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.getEvents(org.id, { page, limit })
  }

  @Get('org/:slug/leaderboard')
  @Public()
  @ApiOperation({ summary: 'Ranking público de voluntários' })
  async getLeaderboard(@Param('slug') slug: string, @Query('limit', ParseIntPipe) limit?: number) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.getLeaderboard(org.id, limit)
  }

  @Post('org/:slug/campaigns/:id/interest')
  @Public()
  @ApiOperation({ summary: 'Registrar intenção de voluntariado' })
  async expressInterest(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome: string; email: string; telefone?: string; profissao?: string; mensagem?: string },
  ) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.expressInterest(org.id, id, body)
  }

  @Get('org/:slug/campaigns/:id')
  @Public()
  @ApiOperation({ summary: 'Detalhes de uma campanha pública' })
  async getCampaignDetail(@Param('slug') slug: string, @Param('id', ParseIntPipe) id: number) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.getCampaignById(org.id, id)
  }

  @Post('org/:slug/volunteer-intent')
  @Public()
  @ApiOperation({ summary: 'Registrar intenção genérica de voluntariado (portal público)' })
  async registerVolunteerIntent(
    @Param('slug') slug: string,
    @Body() body: PublicVolunteerIntentDto,
  ) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.registerVolunteerIntent(org.id, body)
  }

  @Post('org/:slug/donation-intent')
  @Public()
  @ApiOperation({ summary: 'Registrar intenção de doação (portal público). Cria Donation com status=PENDING' })
  async registerDonationIntent(
    @Param('slug') slug: string,
    @Body() body: PublicDonationIntentDto,
  ) {
    const org = await this.service.getOrgBySlug(slug)
    return this.service.registerDonationIntent(org.id, body)
  }
}
