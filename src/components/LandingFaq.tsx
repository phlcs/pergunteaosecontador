'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Eu não entendo nada de IR. Mesmo assim funciona?',
    a: 'Funciona principalmente pra você. A sessão é justamente pra quem não entende e quer alguém que explique em português claro, sem termos técnicos. Você não precisa estudar nada antes.',
  },
  {
    q: 'E se minha situação for muito bagunçada?',
    a: 'Sem problema. A maioria das pessoas que nos procuram está exatamente assim. O Rafael já viu de tudo — conta misturada, anos sem declarar, DARF esquecido. Ele organiza junto com você.',
  },
  {
    q: 'Vocês fazem e enviam a declaração por mim?',
    a: 'Não. O Rafael orienta passo a passo e você envia. Assim você entende o que está fazendo e não precisa depender de ninguém nos próximos anos. Mas se você quiser, ele pode indicar esse serviço à parte.',
  },
  {
    q: 'Preciso levar algum documento?',
    a: 'Idealmente, tenha em mãos: informe de rendimentos do trabalho, informes do banco/corretora, e recibos de despesas médicas ou educação. Mas se não tiver tudo, o Rafael te ajuda a entender o que buscar.',
  },
  {
    q: 'Por que R$ 197 e não uma mensalidade?',
    a: 'Porque a maioria das pessoas não precisa de contador o ano inteiro. Você precisa de alguém agora, pra resolver o IR. Paga uma vez, resolve, e segue sua vida. Sem compromisso mensal.',
  },
  {
    q: 'A sessão é por vídeo?',
    a: 'Sim, por Google Meet. Você recebe o link assim que agenda. Pode fazer de qualquer lugar — só precisa de internet.',
  },
]

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="faq" id="duvidas">
      <div className="container">
        <div className="faq-head">
          <div className="section-label">Dúvidas frequentes</div>
          <h2 className="section-title center">Provavelmente você está pensando...</h2>
        </div>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {item.q}
                <span className="icon">
                  <ChevronIcon />
                </span>
              </button>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
