import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type AiResponse = {
  paragraphs: string[]
  checklist: string[] | null
  steps: { title: string; description: string }[] | null
  suggestBook: boolean
  bookReason: string | null
}

/* ----------------------------------------------------------------
   Mock responses — 5 variants exercising every UI structure
   ---------------------------------------------------------------- */

const MOCK_INVESTIMENTO: AiResponse = {
  paragraphs: [
    '**CDB, Tesouro Direto e FIIs** precisam aparecer na sua declaração mesmo quando o rendimento é isento na fonte. O ativo em si vai em Bens e Direitos; o rendimento vai na ficha correta dependendo do tipo.',
    'A boa notícia: os informes de rendimentos das corretoras já trazem os valores separados — você não precisa calcular nada manualmente. Basta copiar os números para os campos certos.',
    'Para FIIs, fique atento à diferença entre **dividendos isentos** (código 26 em Rendimentos Isentos) e **ganho de capital na venda** de cotas, que exige `DARF` recolhido mensalmente.',
  ],
  checklist: [
    'Solicite o **informe de rendimentos** de cada banco e corretora (disponível no internet banking até março)',
    'Declare os saldos em 31/12 em **Bens e Direitos** — código 45 para CDB/Tesouro, código 73 para FIIs',
    'Rendimentos de `CDB` e Tesouro vão em **Rendimentos Sujeitos à Tributação Exclusiva** (código 06)',
    'Dividendos de FIIs vão em **Rendimentos Isentos** (código 26) — não paga imposto',
    'Amortizações de FIIs também entram como rendimento isento (código 26)',
    'Se vendeu cotas com lucro: recolha o `DARF` com código 6015 até o último dia útil do mês seguinte',
  ],
  steps: null,
  suggestBook: false,
  bookReason: null,
}

const MOCK_MEI: AiResponse = {
  paragraphs: [
    'Ter `MEI` e receber como PF ao mesmo tempo é muito comum — e tem jeito certo de declarar. A legislação prevê uma **parcela isenta** do faturamento MEI que reduz bastante o imposto.',
    'O ponto de atenção é separar as rendas com clareza: o que entrou pelo CNPJ e o que você recebeu como pessoa física (freelas, CLT, Pix de clientes). Misturar os dois pode gerar inconsistência.',
  ],
  checklist: null,
  steps: [
    {
      title: 'Reúna os documentos',
      description:
        'Separe os DAS pagos no ano, as notas fiscais emitidas pelo MEI, os informes de rendimentos de empregadores (se CLT) e os recibos de freelas recebidos como PF.',
    },
    {
      title: 'Calcule a parcela isenta do MEI',
      description:
        'Serviços: 32% da receita bruta é isenta. Comércio/indústria: 8%. Atividade mista: use a proporção de cada. O restante é o **pró-labore** tributável que entra na declaração.',
    },
    {
      title: 'Declare o pró-labore como rendimento tributável',
      description:
        'O valor tributável do MEI entra na ficha **Rendimentos Tributáveis Recebidos de PJ** — você mesmo como fonte pagadora, usando o próprio CNPJ do MEI.',
    },
    {
      title: 'Some todas as fontes e confira a obrigatoriedade',
      description:
        'CLT, freelas PF e o pró-labore do MEI somam para a base do IRPF. Se o total ultrapassar R$ 33.888 (2024), você é obrigado a declarar — independente de quanto pagou de imposto no ano.',
    },
  ],
  suggestBook: false,
  bookReason: null,
}

const MOCK_MALHA_FINA: AiResponse = {
  paragraphs: [
    'Cair na `malha fina` não é o fim do mundo — significa que a Receita encontrou uma divergência entre o que você declarou e o que os empregadores ou bancos informaram. Quanto antes você regularizar, menor a multa.',
    'O primeiro passo é entrar no **e-CAC** (portal da Receita Federal) e abrir a aba "Meu Imposto de Renda". Lá você vê exatamente qual é a pendência. Pode ser algo simples como um informe que ficou fora, ou algo que precisa de retificação.',
  ],
  checklist: null,
  steps: null,
  suggestBook: true,
  bookReason:
    'Malha fina tem prazo para regularizar e uma retificadora feita errado pode piorar a situação. O Rafael analisa sua pendência no e-CAC e te diz o caminho certo antes que vire autuação ou multa.',
}

const MOCK_HOLDING: AiResponse = {
  paragraphs: [
    '**Holdings familiares, bens no exterior e planejamento sucessório** são territórios onde a legislação brasileira tem especificidades que mudam bastante dependendo de como a estrutura está montada.',
    'A declaração de `Capitais Brasileiros no Exterior` (CBE no Banco Central), doações em vida com reserva de usufruto, e heranças envolvem normas da Receita Federal, do Bacen e às vezes do `ITCMD` estadual ao mesmo tempo — e os prazos são independentes entre si.',
  ],
  checklist: null,
  steps: null,
  suggestBook: true,
  bookReason:
    'Esse tipo de situação precisa de análise individual. Um erro de interpretação aqui pode gerar multa do Banco Central (CBE atrasado) ou autuação federal. Uma hora com o Rafael vale muito mais do que tentar resolver no escuro.',
}

const MOCK_DEFAULT: AiResponse = {
  paragraphs: [
    'O **Imposto de Renda Pessoa Física** (IRPF) é a declaração anual obrigatória para quem recebeu rendimentos acima do limite mínimo no ano anterior. O prazo costuma ir de março a maio — e atraso gera multa mínima de R$ 165,74.',
    'A declaração reúne todos os seus rendimentos (salário, freelas, aluguéis, investimentos), bens e direitos, dívidas e despesas dedutíveis em um único formulário enviado à Receita Federal.',
  ],
  checklist: null,
  steps: [
    {
      title: 'Verifique se você é obrigado a declarar',
      description:
        'Em 2025 (ano-base 2024): rendimentos tributáveis acima de R$ 33.888, bens acima de R$ 800 mil, ganho de capital ou operações em bolsa. Se tiver dúvida, declare — não há multa por declarar sem ser obrigado.',
    },
    {
      title: 'Reúna os documentos antes de abrir o programa',
      description:
        'Informe de rendimentos do empregador, extratos bancários, comprovantes de bens (escritura, DUT), recibos médicos e odontológicos, notas de dependentes (escola, plano de saúde) e comprovante de CPF dos dependentes.',
    },
    {
      title: 'Escolha entre modelo Simplificado e Completo',
      description:
        '**Simplificado**: desconto padrão de 20% das rendas tributáveis (limite R$ 16.754,34). **Completo**: soma todas as deduções legais (saúde, educação, dependentes, previdência). O próprio programa calcula os dois e indica qual é melhor para você.',
    },
  ],
  suggestBook: false,
  bookReason: null,
}

function pickMock(message: string): AiResponse {
  const m = message.toLowerCase()
  if (/(investimento|cdb|tesouro|fii|ações|acoes|bolsa|renda fixa|dividendo)/.test(m))
    return MOCK_INVESTIMENTO
  if (/(mei|freelancer|freela|pj|autônomo|autonomo|cnpj|nota fiscal|nf|das )/.test(m))
    return MOCK_MEI
  if (/(malha fina|caí na malha|cai na malha|retido|retida|pendência|pendencia|irregularidade)/.test(m))
    return MOCK_MALHA_FINA
  if (/(holding|sucessão|sucessao|exterior|herança|heranca|doação|doacao|itcmd|offshore)/.test(m))
    return MOCK_HOLDING
  return MOCK_DEFAULT
}

function mockDelay(): Promise<void> {
  const ms = 800 + Math.floor(Math.random() * 700) // 800–1500 ms
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ----------------------------------------------------------------
   Route handler
   ---------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, conversationId } = body as { message: string; conversationId: string | null }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Create conversation if needed
  let convoId = conversationId
  if (!convoId) {
    const title = message.trim().slice(0, 40) + (message.trim().length > 40 ? '…' : '')
    const convo = await prisma.conversation.create({
      data: { userId: payload.sub, title },
    })
    convoId = convo.id
  } else {
    // Verify ownership
    const convo = await prisma.conversation.findUnique({ where: { id: convoId } })
    if (!convo || convo.userId !== payload.sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    // Update title from first message if still default
    if (convo.title === 'Nova conversa') {
      const title = message.trim().slice(0, 40) + (message.trim().length > 40 ? '…' : '')
      await prisma.conversation.update({ where: { id: convoId }, data: { title } })
    }
  }

  // Persist user message
  const userMsg = await prisma.message.create({
    data: {
      conversationId: convoId,
      role: 'USER',
      content: { text: message.trim() },
    },
  })

  // Simulate AI latency
  await mockDelay()

  // Pick mock response
  const aiResponse = pickMock(message)

  // Persist assistant message
  const assistantMsg = await prisma.message.create({
    data: {
      conversationId: convoId,
      role: 'ASSISTANT',
      content: aiResponse as unknown as Parameters<typeof prisma.message.create>[0]['data']['content'],
    },
  })

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: convoId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({
    conversationId: convoId,
    userMessageId: userMsg.id,
    assistantMessageId: assistantMsg.id,
    response: aiResponse,
  })
}
