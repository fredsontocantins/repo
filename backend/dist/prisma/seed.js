"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
function genCodigo() {
    const y = new Date().getFullYear();
    const r = Math.random().toString(36).toUpperCase().substring(2, 8);
    return `VOL-${y}-${r}`;
}
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function monthsAgo(n) { const d = new Date(); d.setMonth(d.getMonth() - n); return d; }
async function main() {
    console.log('🌱 Iniciando seed v4 completo...');
    const org = await prisma.organization.upsert({
        where: { slug: 'voluntarios-unidos' },
        update: {
            portalAtivo: true,
            portalCorPrimaria: '#22c55e',
        },
        create: {
            name: 'Voluntários Unidos',
            slug: 'voluntarios-unidos',
            description: 'Organização sem fins lucrativos dedicada a conectar voluntários com causas sociais transformadoras.',
            portalDescricao: 'Acreditamos que cada hora doada transforma vidas. Desde 2018 conectamos voluntários apaixonados com comunidades que precisam de apoio. Junte-se a nós e faça parte desta corrente do bem!',
            email: 'contato@voluntariosunidos.org.br',
            phone: '(11) 99999-0000',
            address: 'Rua das Flores, 123 — Sala 45',
            city: 'São Paulo',
            state: 'SP',
            cnpj: '12.345.678/0001-90',
            website: 'https://voluntariosunidos.org.br',
            portalAtivo: true,
            portalCorPrimaria: '#22c55e',
        },
    });
    console.log('✅ Organização:', org.name);
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@voluntariosunidos.org.br' },
        update: {},
        create: {
            email: 'admin@voluntariosunidos.org.br',
            name: 'Admin Sistema',
            passwordHash: adminHash,
            role: client_1.UserRole.ADMIN,
            organizationId: org.id,
        },
    });
    const coordHash = await bcrypt.hash('coord123', 10);
    await prisma.user.upsert({
        where: { email: 'coord@voluntariosunidos.org.br' },
        update: {},
        create: {
            email: 'coord@voluntariosunidos.org.br',
            name: 'Maria Coordenadora',
            passwordHash: coordHash,
            role: client_1.UserRole.COORDINATOR,
            organizationId: org.id,
        },
    });
    console.log('✅ Usuários criados');
    const membersData = [
        { nome: 'Patrícia Drummond', email: 'patricia@vu.org.br', cargo: 'Diretora Executiva', role: client_1.MemberRole.DIRECTOR, departamento: 'Gestão', telefone: '(11) 98001-0001', bio: 'Fundadora da organização, 15 anos de experiência em gestão de ONGs.' },
        { nome: 'Rafael Monteiro', email: 'rafael@vu.org.br', cargo: 'Gerente de Operações', role: client_1.MemberRole.MANAGER, departamento: 'Operações', telefone: '(11) 98001-0002', bio: 'Responsável por toda a logística dos projetos e eventos.' },
        { nome: 'Camila Ferreira', email: 'camila@vu.org.br', cargo: 'Coordenadora de Voluntariado', role: client_1.MemberRole.COORDINATOR, departamento: 'Voluntariado', telefone: '(11) 98001-0003', bio: 'Conecta voluntários às campanhas certas desde 2020.' },
        { nome: 'Diego Nascimento', email: 'diego@vu.org.br', cargo: 'Analista de Captação', role: client_1.MemberRole.ANALYST, departamento: 'Captação', telefone: '(11) 98001-0004' },
        { nome: 'Juliana Castro', email: 'juliana@vu.org.br', cargo: 'Analista de Comunicação', role: client_1.MemberRole.ANALYST, departamento: 'Comunicação', telefone: '(11) 98001-0005' },
        { nome: 'Marcos Pinheiro', email: 'marcos@vu.org.br', cargo: 'Analista Financeiro', role: client_1.MemberRole.ANALYST, departamento: 'Financeiro', telefone: '(11) 98001-0006' },
        { nome: 'Thiago Cardoso', email: 'thiago@vu.org.br', cargo: 'Estagiário de TI', role: client_1.MemberRole.INTERN, departamento: 'TI' },
        { nome: 'Letícia Rocha', email: 'leticia@vu.org.br', cargo: 'Estagiária de Comunicação', role: client_1.MemberRole.INTERN, departamento: 'Comunicação' },
    ];
    for (const m of membersData) {
        await prisma.member.create({ data: { ...m, organizationId: org.id } }).catch(() => { });
    }
    console.log('✅ Membros:', membersData.length);
    const badgeData = [
        { nome: 'Primeiro Passo', descricao: 'Completou sua primeira atividade voluntária', icone: '🌱', cor: '#22c55e', pontosReq: 10, horasReq: 0 },
        { nome: 'Voluntário Dedicado', descricao: 'Acumulou 50 pontos de contribuição', icone: '⭐', cor: '#f59e0b', pontosReq: 50, horasReq: 0 },
        { nome: 'Herói da Comunidade', descricao: 'Atingiu 100 pontos e 20 horas voluntariadas', icone: '🏆', cor: '#6366f1', pontosReq: 100, horasReq: 20 },
        { nome: 'Doador Generoso', descricao: 'Contribuiu com doação para uma campanha', icone: '❤️', cor: '#ef4444', pontosReq: 20, horasReq: 0 },
        { nome: 'Mestre Voluntário', descricao: 'Atingiu 500 pontos — elite dos voluntários', icone: '👑', cor: '#8b5cf6', pontosReq: 500, horasReq: 100 },
        { nome: 'Guardião da Saúde', descricao: 'Participou de 3 ou mais eventos de saúde', icone: '🩺', cor: '#06b6d4', pontosReq: 80, horasReq: 0 },
        { nome: 'Embaixador Verde', descricao: 'Contribuiu com iniciativas ambientais', icone: '🌳', cor: '#16a34a', pontosReq: 60, horasReq: 0 },
        { nome: 'Educador do Futuro', descricao: 'Apoiou projetos de educação e reforço escolar', icone: '📚', cor: '#d97706', pontosReq: 70, horasReq: 0 },
    ];
    const badges = [];
    for (const b of badgeData) {
        const badge = await prisma.badge.create({ data: b }).catch(async () => prisma.badge.findFirst({ where: { nome: b.nome } }));
        badges.push(badge);
    }
    console.log('✅ Badges:', badges.length);
    const vData = [
        { nome: 'João Silva', email: 'joao.silva@email.com', profissao: 'Médico Clínico Geral', habilidades: ['saúde', 'primeiros socorros', 'triagem'], pontos: 520, horasContribuidas: 96, bio: 'Médico com 12 anos de experiência, apaixonado por saúde pública.' },
        { nome: 'Ana Santos', email: 'ana.santos@email.com', profissao: 'Professora de Matemática', habilidades: ['educação', 'matemática', 'pedagogia'], pontos: 380, horasContribuidas: 68, bio: 'Professora da rede pública há 8 anos, especialista em reforço escolar.' },
        { nome: 'Carlos Oliveira', email: 'carlos.oliveira@email.com', profissao: 'Engenheiro Civil', habilidades: ['construção', 'elétrica', 'hidráulica'], pontos: 210, horasContribuidas: 44, bio: 'Engenheiro especializado em reforma de habitações de interesse social.' },
        { nome: 'Fernanda Lima', email: 'fernanda.lima@email.com', profissao: 'Psicóloga Clínica', habilidades: ['saúde mental', 'apoio emocional', 'terapia'], pontos: 640, horasContribuidas: 120, bio: 'Especialista em trauma e resiliência comunitária.' },
        { nome: 'Roberto Costa', email: 'roberto.costa@email.com', profissao: 'Chef de Cozinha', habilidades: ['culinária', 'nutrição', 'gestão de cozinha'], pontos: 290, horasContribuidas: 52, bio: 'Chef com experiência em cozinhas solidárias e bancos de alimentos.' },
        { nome: 'Beatriz Alves', email: 'beatriz.alves@email.com', profissao: 'Advogada', habilidades: ['direito', 'assessoria jurídica', 'contratos'], pontos: 175, horasContribuidas: 36, bio: 'Advogada especializada em direito social e habitação.' },
        { nome: 'Pedro Mendes', email: 'pedro.mendes@email.com', profissao: 'Desenvolvedor Full Stack', habilidades: ['tecnologia', 'programação', 'sistemas'], pontos: 130, horasContribuidas: 24, bio: 'Dev apaixonado por usar tecnologia para o bem social.' },
        { nome: 'Larissa Torres', email: 'larissa.torres@email.com', profissao: 'Nutricionista', habilidades: ['nutrição', 'saúde', 'alimentação saudável'], pontos: 310, horasContribuidas: 58, bio: 'Especializada em segurança alimentar e nutrição comunitária.' },
        { nome: 'Marcelo Gomes', email: 'marcelo.gomes@email.com', profissao: 'Enfermeiro', habilidades: ['enfermagem', 'saúde', 'urgência'], pontos: 450, horasContribuidas: 84, bio: 'Enfermeiro de UPA há 6 anos, voluntário nas feiras de saúde.' },
        { nome: 'Tatiane Pereira', email: 'tatiane.pereira@email.com', profissao: 'Assistente Social', habilidades: ['serviço social', 'família', 'vulnerabilidade'], pontos: 395, horasContribuidas: 72, bio: 'Especialista em atendimento a famílias em situação de vulnerabilidade.' },
        { nome: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', profissao: 'Fotógrafo', habilidades: ['fotografia', 'comunicação', 'redes sociais'], pontos: 85, horasContribuidas: 18, bio: 'Registra os momentos especiais dos eventos voluntários.' },
        { nome: 'Vanessa Rodrigues', email: 'vanessa.rod@email.com', profissao: 'Contadora', habilidades: ['contabilidade', 'finanças', 'fiscal'], pontos: 155, horasContribuidas: 30, bio: 'Auxilia na gestão financeira de projetos sociais.' },
    ];
    const volunteers = [];
    for (const v of vData) {
        const vol = await prisma.volunteer.create({
            data: { ...v, status: client_1.VolunteerStatus.ACTIVE, publicProfile: true, organizationId: org.id },
        }).catch(async () => prisma.volunteer.findFirst({ where: { email: v.email } }));
        volunteers.push(vol);
    }
    await prisma.volunteer.create({
        data: { nome: 'Sandra Melo', email: 'sandra.melo@email.com', profissao: 'Fisioterapeuta', habilidades: ['fisioterapia', 'reabilitação'], pontos: 0, horasContribuidas: 0, status: client_1.VolunteerStatus.PENDING, publicProfile: false, organizationId: org.id },
    }).catch(() => { });
    await prisma.volunteer.create({
        data: { nome: 'Felipe Nunes', email: 'felipe.nunes@email.com', profissao: 'Designer Gráfico', habilidades: ['design', 'criação visual'], pontos: 0, horasContribuidas: 0, status: client_1.VolunteerStatus.PENDING, publicProfile: false, organizationId: org.id },
    }).catch(() => { });
    console.log('✅ Voluntários:', volunteers.length + 2);
    const badgeAssignments = [
        { vi: 0, bis: [0, 1, 2, 4] },
        { vi: 3, bis: [0, 1, 2, 4, 5] },
        { vi: 8, bis: [0, 1, 2, 5] },
        { vi: 1, bis: [0, 1, 7] },
        { vi: 7, bis: [0, 1, 3] },
        { vi: 9, bis: [0, 1, 2] },
        { vi: 4, bis: [0, 3] },
        { vi: 2, bis: [0, 6] },
    ];
    for (const a of badgeAssignments) {
        if (!volunteers[a.vi])
            continue;
        for (const bi of a.bis) {
            if (!badges[bi])
                continue;
            await prisma.volunteerBadge.create({
                data: { volunteerId: volunteers[a.vi].id, badgeId: badges[bi].id },
            }).catch(() => { });
        }
    }
    console.log('✅ Badges atribuídos');
    const campaignsData = [
        {
            nome: 'Alimentação Solidária 2025',
            descricao: 'Programa de distribuição de cestas básicas e refeições quentes para famílias em situação de insegurança alimentar na periferia de São Paulo.',
            objetivo: 'Garantir acesso à alimentação adequada para 500 famílias mensalmente, combatendo a fome e promovendo dignidade.',
            metaArrecadacao: 80000,
            arrecadado: 54320,
            metaVoluntarios: 40,
            voluntariosAtivos: 28,
            status: client_1.CampaignStatus.ACTIVE,
            publicavel: true,
            destaque: true,
            dataInicio: monthsAgo(3),
            dataFim: daysFromNow(90),
        },
        {
            nome: 'Escola do Futuro',
            descricao: 'Reforço escolar gratuito em português, matemática e ciências para crianças e adolescentes de 8 a 16 anos em situação de vulnerabilidade social.',
            objetivo: 'Melhorar o desempenho escolar e reduzir a evasão escolar em 30% nas comunidades atendidas.',
            metaArrecadacao: 25000,
            arrecadado: 25000,
            metaVoluntarios: 20,
            voluntariosAtivos: 20,
            status: client_1.CampaignStatus.COMPLETED,
            publicavel: true,
            destaque: false,
            dataInicio: monthsAgo(8),
            dataFim: monthsAgo(1),
        },
        {
            nome: 'Saúde para Todos',
            descricao: 'Mutirões de atendimento médico, odontológico, oftalmológico e psicológico gratuitos em comunidades sem acesso adequado a serviços de saúde.',
            objetivo: 'Realizar 2.000 atendimentos gratuitos por ano, levando saúde a quem mais precisa.',
            metaArrecadacao: 120000,
            arrecadado: 73500,
            metaVoluntarios: 60,
            voluntariosAtivos: 42,
            status: client_1.CampaignStatus.ACTIVE,
            publicavel: true,
            destaque: true,
            dataInicio: monthsAgo(5),
            dataFim: daysFromNow(180),
        },
        {
            nome: 'Moradia Digna',
            descricao: 'Reforma e recuperação de habitações de famílias em situação precária, com foco em acessibilidade, segurança estrutural e saneamento básico.',
            objetivo: 'Reformar 50 residências por ano, garantindo condições dignas de moradia para famílias de baixa renda.',
            metaArrecadacao: 150000,
            arrecadado: 31000,
            metaVoluntarios: 50,
            voluntariosAtivos: 14,
            status: client_1.CampaignStatus.ACTIVE,
            publicavel: true,
            destaque: false,
            dataInicio: monthsAgo(2),
            dataFim: daysFromNow(270),
        },
        {
            nome: 'Verde Cidade',
            descricao: 'Plantio de árvores nativas, revitalização de praças e espaços públicos, e educação ambiental para crianças e adultos nas comunidades atendidas.',
            objetivo: 'Plantar 5.000 mudas de árvores nativas e revitalizar 10 praças públicas até o final do ano.',
            metaArrecadacao: 18000,
            arrecadado: 18000,
            metaVoluntarios: 30,
            voluntariosAtivos: 30,
            status: client_1.CampaignStatus.COMPLETED,
            publicavel: true,
            destaque: false,
            dataInicio: monthsAgo(12),
            dataFim: monthsAgo(3),
        },
        {
            nome: 'Inclusão Digital',
            descricao: 'Cursos gratuitos de informática básica, redes sociais para negócios e programação introdutória para jovens e adultos em situação de vulnerabilidade.',
            objetivo: 'Capacitar 300 pessoas por ano em habilidades digitais essenciais para o mercado de trabalho.',
            metaArrecadacao: 35000,
            arrecadado: 12000,
            metaVoluntarios: 25,
            voluntariosAtivos: 9,
            status: client_1.CampaignStatus.ACTIVE,
            publicavel: true,
            destaque: false,
            dataInicio: monthsAgo(1),
            dataFim: daysFromNow(150),
        },
        {
            nome: 'Roupas do Bem',
            descricao: 'Arrecadação, triagem, higienização e distribuição de roupas e calçados em bom estado para famílias em situação de vulnerabilidade.',
            objetivo: 'Distribuir 10.000 peças de roupa por semestre para famílias cadastradas.',
            metaArrecadacao: 8000,
            arrecadado: 8000,
            metaVoluntarios: 15,
            voluntariosAtivos: 15,
            status: client_1.CampaignStatus.COMPLETED,
            publicavel: true,
            destaque: false,
            dataInicio: monthsAgo(6),
            dataFim: monthsAgo(2),
        },
    ];
    const campaigns = [];
    for (const c of campaignsData) {
        const camp = await prisma.campaign.create({
            data: { ...c, organizationId: org.id },
        });
        campaigns.push(camp);
    }
    console.log('✅ Campanhas:', campaigns.length);
    const campVolAssoc = [
        { ci: 0, vis: [0, 7, 8, 4, 9] },
        { ci: 1, vis: [1, 6, 11] },
        { ci: 2, vis: [0, 8, 3, 5, 9] },
        { ci: 3, vis: [2, 5] },
        { ci: 4, vis: [2, 6, 7] },
        { ci: 5, vis: [6, 10, 11] },
        { ci: 6, vis: [4, 7, 9] },
    ];
    for (const a of campVolAssoc) {
        if (!campaigns[a.ci])
            continue;
        for (const vi of a.vis) {
            if (!volunteers[vi])
                continue;
            await prisma.campaignVolunteer.create({
                data: {
                    campaignId: campaigns[a.ci].id,
                    volunteerId: volunteers[vi].id,
                    horasTrabalhadas: Math.floor(Math.random() * 40) + 8,
                },
            }).catch(() => { });
        }
    }
    const donationsData = [
        { tipo: client_1.DonationType.MONETARY, valor: 5000, doadorNome: 'Grupo Empresarial Horizonte', doadorEmail: 'financeiro@horizonte.com.br', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[0].id, mensagem: 'Com muito carinho para a causa da alimentação.' },
        { tipo: client_1.DonationType.MONETARY, valor: 2500, doadorNome: 'Adriana Meirelles', doadorEmail: 'adriana@email.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[0].id },
        { tipo: client_1.DonationType.MONETARY, valor: 1000, doadorNome: 'João Carlos Pereira', doadorEmail: 'jcp@email.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[0].id },
        { tipo: client_1.DonationType.FOOD, descricao: '300 kg de arroz, feijão, macarrão e óleo', doadorNome: 'Supermercado Bem-Estar', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[0].id },
        { tipo: client_1.DonationType.FOOD, descricao: '150 cestas básicas completas', doadorNome: 'Associação Comercial do Bairro', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[0].id },
        { tipo: client_1.DonationType.MONETARY, valor: 8000, doadorNome: 'Fundação Educar Brasil', doadorEmail: 'doacoes@fundacaoeducar.org', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[1].id, mensagem: 'Investindo no futuro das crianças.' },
        { tipo: client_1.DonationType.MONETARY, valor: 3000, doadorNome: 'Empresa TechSul Ltda', doadorEmail: 'rh@techsul.com.br', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[1].id },
        { tipo: client_1.DonationType.MONETARY, valor: 12000, doadorNome: 'Instituto Saúde e Vida', doadorEmail: 'contato@saudeevida.org', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[2].id, mensagem: 'Saúde é direito de todos.' },
        { tipo: client_1.DonationType.MONETARY, valor: 5000, doadorNome: 'Dr. Renato Augusto', doadorEmail: 'drrenato@clinicaaugusta.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[2].id },
        { tipo: client_1.DonationType.MEDICINE, descricao: 'Kit de medicamentos básicos — 200 unidades (validade 2026)', doadorNome: 'Farmácia Popular do Bairro', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[2].id },
        { tipo: client_1.DonationType.EQUIPMENT, descricao: '2 aparelhos de pressão, 3 glicosímetros, 1 oxímetro', doadorNome: 'Clínica Saúde Total', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[2].id },
        { tipo: client_1.DonationType.MONETARY, valor: 10000, doadorNome: 'Construtora Porto Seguro', doadorEmail: 'obras@portoseguro.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[3].id },
        { tipo: client_1.DonationType.MONETARY, valor: 3500, doadorNome: 'Loja de Materiais Construção Já', doadorEmail: 'vendas@construcaoja.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[3].id },
        { tipo: client_1.DonationType.CLOTHING, descricao: '500 peças de roupas e calçados em bom estado', doadorNome: 'Bazar Solidário das Damas', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[6].id },
        { tipo: client_1.DonationType.CLOTHING, descricao: '200 peças infantis (0-12 anos)', doadorNome: 'Escola de Moda Criativa', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[6].id },
        { tipo: client_1.DonationType.MONETARY, valor: 500, doadorNome: 'Pedro Henrique Silva', doadorEmail: 'ph.silva@email.com', status: client_1.DonationStatus.CONFIRMED },
        { tipo: client_1.DonationType.MONETARY, valor: 1500, doadorNome: 'Empresa Logística Express', doadorEmail: 'social@logexpress.com', status: client_1.DonationStatus.PENDING, campaignId: campaigns[4].id },
        { tipo: client_1.DonationType.MONETARY, valor: 800, doadorNome: 'Maria das Graças Santos', doadorEmail: 'mgsantos@email.com', status: client_1.DonationStatus.CONFIRMED, campaignId: campaigns[5].id },
    ];
    for (const d of donationsData) {
        await prisma.donation.create({ data: { ...d, organizationId: org.id } });
    }
    console.log('✅ Doações:', donationsData.length);
    const eventsData = [
        {
            nome: 'Mutirão de Limpeza — Parque do Bairro',
            descricao: 'Grande mutirão de revitalização do Parque Municipal com plantio de mudas, limpeza e pintura dos equipamentos.',
            local: 'Parque Municipal Dom Pedro II, São Paulo',
            dataInicio: daysFromNow(8),
            dataFim: daysFromNow(8),
            capacidade: 80,
            status: client_1.EventStatus.SCHEDULED,
            publicavel: true,
            campaignId: campaigns[4].id,
        },
        {
            nome: 'Feira de Saúde Comunitária',
            descricao: 'Atendimento médico, odontológico, oftalmológico e psicológico gratuitos. Vacinação, aferição de pressão e glicemia.',
            local: 'Ginásio Poliesportivo Vila São José, São Paulo',
            dataInicio: daysFromNow(15),
            dataFim: daysFromNow(15),
            capacidade: 150,
            status: client_1.EventStatus.SCHEDULED,
            publicavel: true,
            campaignId: campaigns[2].id,
        },
        {
            nome: 'Aulas de Reforço — Semana Intensiva',
            descricao: 'Semana de reforço escolar intensivo em matemática, português e ciências para alunos do 6º ao 9º ano.',
            local: 'Escola Municipal Prof. João Saad, São Paulo',
            dataInicio: daysFromNow(5),
            dataFim: daysFromNow(9),
            capacidade: 60,
            status: client_1.EventStatus.SCHEDULED,
            publicavel: true,
            campaignId: campaigns[1].id,
        },
        {
            nome: 'Workshop de Informática Básica',
            descricao: 'Curso intensivo de 8 horas: uso do computador, internet segura, e-mail e criação de currículos digitais.',
            local: 'Centro Comunitário Vila Nova, São Paulo',
            dataInicio: daysFromNow(22),
            dataFim: daysFromNow(22),
            capacidade: 30,
            status: client_1.EventStatus.SCHEDULED,
            publicavel: true,
            campaignId: campaigns[5].id,
        },
        {
            nome: 'Arrecadação de Alimentos — Shopping Norte',
            descricao: 'Posto de arrecadação de alimentos não perecíveis no Shopping. Traga 1 kg de alimento e apoie a campanha.',
            local: 'Shopping Center Norte — Corredor Principal',
            dataInicio: daysAgo(10),
            dataFim: daysAgo(10),
            capacidade: 0,
            status: client_1.EventStatus.COMPLETED,
            publicavel: true,
            campaignId: campaigns[0].id,
        },
        {
            nome: 'Mutirão de Reforma — Casa da Família Souza',
            descricao: 'Reforma completa de residência de família em situação de vulnerabilidade: telhado, pintura e banheiro.',
            local: 'Rua das Palmeiras, 89 — Jardim Esperança',
            dataInicio: daysAgo(5),
            dataFim: daysAgo(4),
            capacidade: 20,
            status: client_1.EventStatus.COMPLETED,
            publicavel: false,
            campaignId: campaigns[3].id,
        },
        {
            nome: 'Bazaar Solidário de Roupas',
            descricao: 'Distribuição de roupas, calçados e agasalhos arrecadados. Atendimento prioritário a famílias cadastradas.',
            local: 'Sede da Organização — Rua das Flores, 123',
            dataInicio: daysFromNow(30),
            dataFim: daysFromNow(30),
            capacidade: 200,
            status: client_1.EventStatus.SCHEDULED,
            publicavel: true,
            campaignId: campaigns[6].id,
        },
    ];
    const events = [];
    for (const e of eventsData) {
        const ev = await prisma.event.create({ data: { ...e, organizationId: org.id } });
        events.push(ev);
    }
    console.log('✅ Eventos:', events.length);
    const regData = [
        { ei: 0, vis: [2, 4, 6, 9, 10] },
        { ei: 1, vis: [0, 8, 3, 5, 7, 9] },
        { ei: 2, vis: [1, 6, 10, 11] },
        { ei: 3, vis: [6, 10, 11] },
        { ei: 4, vis: [0, 4, 7, 9], checkedIn: true },
        { ei: 5, vis: [2, 5], checkedIn: true },
    ];
    for (const r of regData) {
        if (!events[r.ei])
            continue;
        for (const vi of r.vis) {
            if (!volunteers[vi])
                continue;
            await prisma.eventRegistration.create({
                data: {
                    eventId: events[r.ei].id,
                    volunteerId: volunteers[vi].id,
                    checkedIn: r.checkedIn || false,
                    checkinAt: r.checkedIn ? daysAgo(Math.floor(Math.random() * 10) + 1) : null,
                },
            }).catch(() => { });
        }
    }
    const certData = [
        { vi: 0, tipo: client_1.CertificateType.HOURS, titulo: 'Certificado de Horas Voluntariadas — 2024', descricao: 'Contribuiu com 96 horas de atendimento médico voluntário ao longo do ano de 2024.', horasCertificadas: 96, campaignId: campaigns[2].id },
        { vi: 3, tipo: client_1.CertificateType.ACHIEVEMENT, titulo: 'Voluntária Destaque do Ano — 2024', descricao: 'Reconhecimento especial pelo impacto excepcional em saúde mental comunitária.', horasCertificadas: 120, campaignId: campaigns[2].id },
        { vi: 1, tipo: client_1.CertificateType.PARTICIPATION, titulo: 'Certificado de Participação — Escola do Futuro', descricao: 'Participou como educadora voluntária no projeto Escola do Futuro, ministrando aulas de reforço escolar.', horasCertificadas: 68, campaignId: campaigns[1].id },
        { vi: 8, tipo: client_1.CertificateType.HOURS, titulo: 'Certificado de Horas Voluntariadas — Saúde', descricao: 'Dedicou 84 horas de enfermagem voluntária nas feiras de saúde comunitárias.', horasCertificadas: 84, campaignId: campaigns[2].id },
        { vi: 9, tipo: client_1.CertificateType.PARTICIPATION, titulo: 'Certificado — Apoio Social Comunitário', descricao: 'Atuou como assistente social voluntária, realizando mais de 200 atendimentos familiares.', horasCertificadas: 72 },
        { vi: 4, tipo: client_1.CertificateType.RECOGNITION, titulo: 'Certificado de Reconhecimento — Cozinha Solidária', descricao: 'Coordenou a cozinha solidária, preparando refeições para mais de 300 famílias.', horasCertificadas: 52, campaignId: campaigns[0].id },
        { vi: 2, tipo: client_1.CertificateType.PARTICIPATION, titulo: 'Certificado — Mutirão Moradia Digna', descricao: 'Participou como engenheiro voluntário na reforma de 5 residências em situação precária.', horasCertificadas: 44, campaignId: campaigns[3].id },
    ];
    for (const c of certData) {
        if (!volunteers[c.vi])
            continue;
        await prisma.certificate.create({
            data: {
                codigo: genCodigo(),
                tipo: c.tipo,
                titulo: c.titulo,
                descricao: c.descricao,
                horasCertificadas: c.horasCertificadas,
                campaignId: c.campaignId,
                volunteerId: volunteers[c.vi].id,
                organizationId: org.id,
                emitidoPor: 'admin@voluntariosunidos.org.br',
                assinante: 'Patrícia Drummond',
                cargoAssinante: 'Diretora Executiva',
                dataAtividade: monthsAgo(1),
                dataEmissao: daysAgo(7),
            },
        }).catch(() => { });
    }
    console.log('✅ Certificados:', certData.length);
    const payables = [
        { descricao: 'Aluguel da sede — ' + new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), categoria: 'ALUGUEL', valor: 3200, vencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 10), fornecedor: 'Imóveis Paulista Ltda', notaFiscal: 'NF-001234' },
        { descricao: 'Internet e telefonia', categoria: 'TECNOLOGIA', valor: 420, vencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 15), fornecedor: 'Vivo Empresas', notaFiscal: 'NF-009821' },
        { descricao: 'Energia elétrica da sede', categoria: 'SERVICO', valor: 380, vencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 20), fornecedor: 'Enel São Paulo' },
        { descricao: 'Materiais gráficos — panfletos campanhas', categoria: 'MARKETING', valor: 1800, vencimento: daysFromNow(18), fornecedor: 'Gráfica TopPrint Ltda', notaFiscal: 'NF-004512' },
        { descricao: 'Honorários contabilidade mensal', categoria: 'CONTABILIDADE', valor: 1200, vencimento: daysFromNow(5), fornecedor: 'Escritório Contábil Silva & Cia' },
        { descricao: 'Aluguel van para eventos', categoria: 'TRANSPORTE', valor: 850, vencimento: daysAgo(3), fornecedor: 'Locadora Rápida SP', status: 'VENCIDO' },
        { descricao: 'Seguro anual da sede', categoria: 'SERVICO', valor: 2400, vencimento: daysFromNow(45), fornecedor: 'Porto Seguro', notaFiscal: 'AP-2025-045' },
        { descricao: 'Assessoria jurídica — contratos Q1', categoria: 'JURIDICO', valor: 1500, vencimento: daysAgo(15), fornecedor: 'Advocacia Torres & Araújo', status: 'PAGO', dataPagamento: daysAgo(14), valorPago: 1500, formaPagamento: 'TED', comprovante: 'TED-20250308' },
        { descricao: 'Transporte voluntários — Feira Saúde', categoria: 'TRANSPORTE', valor: 650, vencimento: daysAgo(30), fornecedor: 'Locadora Rápida SP', status: 'PAGO', dataPagamento: daysAgo(29), valorPago: 650, formaPagamento: 'PIX', comprovante: 'PIX-20250223' },
        { descricao: 'Software de gestão anual', categoria: 'TECNOLOGIA', valor: 3600, vencimento: daysFromNow(60), fornecedor: 'SaaS Solutions Inc.' },
        { descricao: 'Alimentação — Evento mutirão', categoria: 'ALIMENTACAO', valor: 480, vencimento: daysAgo(1), fornecedor: 'Restaurante Bom Sabor', status: 'VENCIDO' },
        { descricao: 'Impressão relatório anual 2024', categoria: 'MARKETING', valor: 920, vencimento: daysAgo(20), fornecedor: 'Gráfica TopPrint Ltda', status: 'PAGO', dataPagamento: daysAgo(19), valorPago: 920, formaPagamento: 'Boleto' },
    ];
    for (const p of payables) {
        await prisma.payable.create({ data: { ...p, organizationId: org.id } }).catch(() => { });
    }
    console.log('✅ Contas a pagar:', payables.length);
    const receivables = [
        { descricao: 'Patrocínio master — Grupo Horizonte 2025', categoria: 'PATROCINIO', valor: 30000, vencimento: daysFromNow(20), pagador: 'Grupo Empresarial Horizonte', emailPagador: 'financeiro@horizonte.com.br', observacao: 'Patrocínio anual acordado em contrato nº 2025/001' },
        { descricao: 'Subvenção Municipal — Projeto Saúde', categoria: 'SUBVENCAO', valor: 15000, vencimento: daysFromNow(10), pagador: 'Prefeitura Municipal de SP', emailPagador: 'fundo@prefeitura.sp.gov.br' },
        { descricao: 'Subvenção Estadual — Fundo Social', categoria: 'SUBVENCAO', valor: 25000, vencimento: daysFromNow(45), pagador: 'Governo do Estado de SP', emailPagador: 'fundosocial@sp.gov.br' },
        { descricao: 'Renda Evento Beneficente Fev/2025', categoria: 'EVENTO', valor: 8500, vencimento: daysAgo(15), pagador: 'Evento Interno', status: 'RECEBIDO', dataRecebimento: daysAgo(13), valorRecebido: 8500, formaRecebimento: 'PIX', comprovante: 'PIX-EVT-20250210' },
        { descricao: 'Patrocínio cota ouro — TechSul Ltda', categoria: 'PATROCINIO', valor: 12000, vencimento: daysAgo(5), pagador: 'TechSul Ltda', emailPagador: 'rh@techsul.com.br', status: 'RECEBIDO', dataRecebimento: daysAgo(4), valorRecebido: 12000, formaRecebimento: 'TED' },
        { descricao: 'Doação institucional — Instituto Bem Viver', categoria: 'DOACAO', valor: 5000, vencimento: daysFromNow(30), pagador: 'Instituto Bem Viver' },
        { descricao: 'Projeto aprovado — Edital Cultura Viva', categoria: 'PROJETO', valor: 18000, vencimento: daysAgo(2), pagador: 'MinC — Ministério da Cultura', status: 'VENCIDO' },
        { descricao: 'Reembolso despesas evento jan/2025', categoria: 'REEMBOLSO', valor: 1200, vencimento: daysAgo(25), pagador: 'Empresa Parceira ABC', status: 'RECEBIDO', dataRecebimento: daysAgo(22), valorRecebido: 1200, formaRecebimento: 'PIX' },
        { descricao: 'Patrocínio cota prata — Construtora Porto', categoria: 'PATROCINIO', valor: 8000, vencimento: daysFromNow(35), pagador: 'Construtora Porto Seguro', emailPagador: 'obras@portoseguro.com' },
        { descricao: 'Serviço prestado — Consultoria social Q1', categoria: 'SERVICO_PRESTADO', valor: 4500, vencimento: daysFromNow(8), pagador: 'ONG Parceira Horizonte Sul' },
    ];
    for (const r of receivables) {
        await prisma.receivable.create({ data: { ...r, organizationId: org.id } }).catch(() => { });
    }
    console.log('✅ Contas a receber:', receivables.length);
    console.log('\n🎉 Seed v4 completo!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Credenciais de acesso:');
    console.log('   Admin: admin@voluntariosunidos.org.br / admin123');
    console.log('   Coord: coord@voluntariosunidos.org.br / coord123');
    console.log('');
    console.log('🌐 URLs:');
    console.log('   App:    http://localhost:3000');
    console.log('   Portal: http://localhost:3000/portal/voluntarios-unidos');
    console.log('   API:    http://localhost:3001/api/v1');
    console.log('   Docs:   http://localhost:3001/api/docs');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
main()
    .catch(e => { console.error('❌ Seed falhou:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map