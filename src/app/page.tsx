import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pergunteaoseucontador.com.br'

const PAGE_TITLE = 'Pergunte ao seu Contador — Imposto deu nó? Pergunta de graça.'
const PAGE_DESCRIPTION =
  'A IA do Rafael clareia sua dúvida de imposto de graça. Se tiver dinheiro, risco ou Receita no meio, o Rafael de verdade olha com você. Sem mensalidade.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: BASE_URL,
    siteName: 'Pergunte ao seu Contador',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  alternates: { canonical: BASE_URL },
}

const KIWIFY_URL = 'https://pay.kiwify.com.br/7CyqdEm'

const NOVA_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#F6EEDD;
  --cream-card:#FBF6EB;
  --ink:#142F2B;
  --ink-soft:#2C4A45;
  --green:#1B9E58;
  --green-dark:#157A45;
  --green-soft:#DEEFE2;
  --butter:#F2C745;
  --butter-soft:#FBEEBE;
  --gray:#566058;
  --line:rgba(20,47,43,.14);
  --shadow:0 26px 60px -24px rgba(20,47,43,.45);
  --shadow-sm:0 10px 30px -14px rgba(20,47,43,.35);
  --f-head:var(--font-fraunces),Georgia,serif;
  --f-body:var(--font-hanken),system-ui,sans-serif;
}
html{scroll-behavior:smooth}
body{
  font-family:var(--f-body);
  color:var(--ink);
  background:var(--cream);
  background-image:radial-gradient(rgba(20,47,43,.06) 1.1px,transparent 1.1px);
  background-size:24px 24px;
  line-height:1.55;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
.wrap{width:min(1180px,calc(100% - 40px));margin:0 auto}

/* type helpers */
.mark{background:linear-gradient(transparent 56%,var(--butter) 56%,var(--butter) 94%,transparent 94%);padding:0 .04em}
.mark-green{background:linear-gradient(transparent 56%,var(--green-soft) 56%,var(--green-soft) 94%,transparent 94%);padding:0 .04em}
.ital{font-style:italic;font-weight:600}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:var(--f-body);font-weight:800;font-size:16px;padding:15px 26px;border-radius:14px;border:2px solid transparent;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
.btn-primary{background:var(--green);color:#fff;box-shadow:0 12px 26px -10px rgba(27,158,88,.7)}
.btn-primary:hover{background:var(--green-dark);transform:translateY(-2px)}
.btn-ghost{background:transparent;color:var(--ink);border-color:var(--ink)}
.btn-ghost:hover{background:var(--ink);color:var(--cream);transform:translateY(-2px)}
.btn-sm{padding:11px 18px;font-size:14px;border-radius:11px}

/* stamps */
.stamp{display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;padding:7px 13px;border:2px solid var(--ink);border-radius:9px;color:var(--ink);background:transparent;transform:rotate(-4deg)}
.stamp-green{border-color:var(--green);color:var(--green-dark)}
.stamp-butter{border-color:var(--butter);background:var(--butter-soft);color:var(--ink)}

/* hand arrows (decorative) */
.arrow{position:absolute;pointer-events:none;z-index:3}
.arrow path{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round}

/* animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{opacity:0;transform:scale(.9) rotate(-4deg)}100%{opacity:1;transform:scale(1) rotate(-4deg)}}
@keyframes floaty{0%,100%{transform:translateY(0) rotate(var(--rot,0deg))}50%{transform:translateY(-7px) rotate(var(--rot,0deg))}}
@keyframes blink{0%,60%,100%{opacity:.25}30%{opacity:1}}
@keyframes collapse{0%{opacity:0;max-height:0;transform:translateY(8px)}14%{opacity:1;max-height:46px;transform:none}74%{opacity:1;max-height:46px}100%{opacity:0;max-height:0;margin:0;padding-top:0;padding-bottom:0}}
.r{animation:fadeUp .7s ease both}
.r1{animation-delay:.05s}.r2{animation-delay:.15s}.r3{animation-delay:.25s}.r4{animation-delay:.35s}.r5{animation-delay:.45s}

/* NAV */
nav{position:sticky;top:0;z-index:50;background:rgba(246,238,221,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;justify-content:space-between;padding:16px 0}
.logo{display:flex;align-items:center;gap:11px}
.logo-mark{width:38px;height:38px;border-radius:11px;background:var(--ink);color:var(--butter);display:flex;align-items:center;justify-content:center;font-family:var(--f-head);font-weight:900;font-size:22px;transform:rotate(-3deg)}
.logo-txt{font-family:var(--f-head);font-weight:700;font-size:18px;line-height:1;letter-spacing:-.01em}
.logo-txt small{display:block;font-family:var(--f-body);font-weight:700;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--green-dark);margin-bottom:2px}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a.lnk{font-weight:600;font-size:15px;color:var(--ink-soft)}
.nav-links a.lnk:hover{color:var(--ink)}

/* HERO */
.hero{position:relative;padding:64px 0 80px}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:54px;align-items:center}
.hero-l{position:relative;z-index:2}
.hero-stamps{display:flex;gap:10px;margin-bottom:24px}
.hero h1{font-family:var(--f-head);font-weight:900;font-size:clamp(40px,6vw,68px);line-height:.98;letter-spacing:-.02em;margin-bottom:22px}
.hero h1 .line2{font-weight:700}
.hero-sub{font-size:19px;color:var(--ink-soft);max-width:460px;margin-bottom:30px}
.hero-sub b{color:var(--ink);font-weight:700}
.hero-cta{display:flex;gap:13px;flex-wrap:wrap;margin-bottom:20px}
.micro{display:flex;gap:16px;flex-wrap:wrap;font-size:13.5px;font-weight:600;color:var(--gray)}
.micro span{display:inline-flex;align-items:center;gap:6px}
.micro svg{width:15px;height:15px;stroke:var(--green);stroke-width:2.6;fill:none}

/* CHAT */
.hero-r{position:relative;z-index:1}
.chat-panel{position:absolute;inset:18px -16px -22px 22px;background:var(--green-soft);border-radius:26px;transform:rotate(2.5deg);z-index:0}
.chat{position:relative;z-index:1;background:var(--cream-card);border:1.5px solid var(--line);border-radius:24px;box-shadow:var(--shadow);overflow:hidden}
.chat-head{display:flex;align-items:center;gap:11px;padding:16px 20px;border-bottom:1px solid var(--line);background:var(--ink);color:var(--cream)}
.chat-av{width:34px;height:34px;border-radius:9px;background:var(--butter);color:var(--ink);display:flex;align-items:center;justify-content:center;font-family:var(--f-head);font-weight:900;font-size:17px}
.chat-head strong{font-size:15px;font-weight:700}
.chat-head .on{display:flex;align-items:center;gap:6px;font-size:12px;opacity:.8;font-weight:600}
.chat-head .on::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}
.chat-body{padding:22px 20px;display:flex;flex-direction:column;gap:12px;min-height:300px}
.bub{max-width:84%;padding:12px 15px;font-size:14.5px;line-height:1.5;border-radius:16px}
.bub-u{align-self:flex-end;background:var(--ink);color:var(--cream);border-bottom-right-radius:5px}
.bub-ai{align-self:flex-start;background:#fff;border:1px solid var(--line);border-bottom-left-radius:5px;box-shadow:var(--shadow-sm)}
.bub-ai b{color:var(--green-dark)}
.bub-ai ol{margin:7px 0 2px;padding-left:18px}
.bub-ai li{margin-bottom:3px}
.typing{align-self:flex-start;background:#fff;border:1px solid var(--line);border-radius:16px;border-bottom-left-radius:5px;padding:14px 16px;display:flex;gap:5px;overflow:hidden;animation:collapse 2.6s ease .8s forwards}
.typing i{width:7px;height:7px;border-radius:50%;background:var(--gray);animation:blink 1.2s infinite}
.typing i:nth-child(2){animation-delay:.2s}.typing i:nth-child(3){animation-delay:.4s}
.bub-u{opacity:0;animation:fadeUp .5s ease .55s both}
.bub-ai{opacity:0;animation:fadeUp .5s ease 2s both}
.handoff{margin:2px 18px 18px;padding:13px 15px;background:var(--butter-soft);border:1.5px dashed var(--butter);border-radius:14px;font-size:13.5px;font-weight:600;color:var(--ink);display:flex;gap:10px;align-items:center;opacity:0;animation:fadeUp .5s ease 2.5s both}
.handoff .hi{width:30px;height:30px;border-radius:8px;background:var(--ink);color:var(--butter);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900}
.float-stamp{position:absolute;z-index:4;opacity:0}
.fs1{top:-18px;right:6px;animation:pop .5s ease .7s both,floaty 5s ease 1.2s infinite;--rot:6deg;transform:rotate(6deg)}
.fs2{bottom:64px;left:-30px;animation:pop .5s ease 1s both,floaty 5.5s ease 1.5s infinite;--rot:-7deg;transform:rotate(-7deg)}

/* COMPARE (dark petrol) */
.compare{background:var(--ink);color:var(--cream);padding:78px 0;position:relative}
.compare::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.04) 1.1px,transparent 1.1px);background-size:24px 24px;pointer-events:none}
.compare .wrap{position:relative;z-index:1}
.sec-kick{display:inline-block;font-weight:800;font-size:12.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--butter);margin-bottom:14px}
.compare h2{font-family:var(--f-head);font-weight:700;font-size:clamp(28px,4vw,42px);line-height:1.08;letter-spacing:-.015em;max-width:760px;margin-bottom:40px}
.cmp-list{display:flex;flex-direction:column;gap:0;border-top:1px solid rgba(255,255,255,.14)}
.cmp-row{display:grid;grid-template-columns:240px 1fr;gap:24px;align-items:center;padding:20px 4px;border-bottom:1px solid rgba(255,255,255,.14)}
.cmp-alt{font-family:var(--f-head);font-size:21px;font-weight:600;color:rgba(246,238,221,.55);text-decoration:line-through;text-decoration-color:rgba(242,199,69,.6);text-decoration-thickness:2px}
.cmp-prob{font-size:16px;color:rgba(246,238,221,.8)}
.cmp-win{margin-top:26px;display:flex;gap:18px;align-items:center;background:var(--green);border-radius:18px;padding:24px 28px}
.cmp-win .ck{width:42px;height:42px;border-radius:11px;background:#fff;color:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cmp-win .ck svg{width:24px;height:24px;stroke:var(--green);stroke-width:3;fill:none}
.cmp-win b{font-family:var(--f-head);font-weight:700;font-size:21px;display:block;margin-bottom:2px}
.cmp-win span{font-size:15.5px;color:rgba(255,255,255,.9)}

/* QUESTIONS */
.q{padding:84px 0}
.q-head{text-align:center;max-width:680px;margin:0 auto 16px}
.q-head h2{font-family:var(--f-head);font-weight:900;font-size:clamp(30px,4.4vw,46px);line-height:1.02;letter-spacing:-.02em;margin-bottom:14px}
.q-head p{font-size:18px;color:var(--ink-soft)}
.q-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:44px 0 36px}
.q-card{background:var(--cream-card);border:1.5px solid var(--line);border-radius:18px;padding:24px 22px;position:relative;font-family:var(--f-head);font-size:20px;font-weight:600;line-height:1.2;box-shadow:var(--shadow-sm);transition:transform .25s ease,box-shadow .25s ease}
.q-card::before{content:"";position:absolute;top:18px;left:22px;width:9px;height:9px;border-radius:50%;background:var(--green);box-shadow:18px 0 0 var(--butter)}
.q-card{padding-top:46px}
.q-card:nth-child(odd){transform:rotate(-1.2deg)}
.q-card:nth-child(even){transform:rotate(1deg)}
.q-card:hover{transform:rotate(0deg) translateY(-4px);box-shadow:var(--shadow)}
.q-cta{text-align:center}

/* HOW */
.how{padding:30px 0 88px}
.how .wrap{position:relative}
.how-head{max-width:720px;margin-bottom:48px}
.how-head .sec-kick{color:var(--green-dark)}
.how-head h2{font-family:var(--f-head);font-weight:700;font-size:clamp(27px,3.8vw,40px);line-height:1.08;letter-spacing:-.015em}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:30px;position:relative}
.step{position:relative}
.step-n{width:52px;height:52px;border-radius:14px;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--f-head);font-weight:900;font-size:24px;margin-bottom:18px;box-shadow:0 10px 22px -10px rgba(27,158,88,.8)}
.step:nth-child(3) .step-n{background:var(--ink);color:var(--butter)}
.step h3{font-family:var(--f-head);font-size:19px;font-weight:600;margin-bottom:8px;line-height:1.15}
.step p{font-size:15px;color:var(--gray)}
.step-arrow{position:absolute;top:14px;right:-26px;width:34px;height:24px}
.step-arrow path{stroke:var(--ink);opacity:.4;stroke-width:2;fill:none;stroke-linecap:round}

/* RAFAEL */
.rafael{padding:0 0 90px}
.rafael .wrap{background:var(--cream-card);border:1.5px solid var(--line);border-radius:28px;padding:54px;display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center;box-shadow:var(--shadow-sm)}
.rafael .sec-kick{color:var(--green-dark)}
.rafael h2{font-family:var(--f-head);font-weight:700;font-size:clamp(26px,3.6vw,38px);line-height:1.08;letter-spacing:-.015em;margin-bottom:16px}
.rafael p.lead{font-size:17px;color:var(--ink-soft);margin-bottom:24px;max-width:440px}
.checks{display:flex;flex-direction:column;gap:11px}
.checks li{list-style:none;display:flex;align-items:center;gap:11px;font-size:16px;font-weight:600}
.checks .ck{width:24px;height:24px;border-radius:7px;background:var(--green-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.checks .ck svg{width:14px;height:14px;stroke:var(--green-dark);stroke-width:3;fill:none}
.rafael-photo{position:relative}
.photo-frame{aspect-ratio:4/5;border-radius:20px;background:linear-gradient(160deg,var(--ink),var(--ink-soft));display:flex;align-items:center;justify-content:center;color:rgba(246,238,221,.5);font-weight:600;font-size:14px;text-align:center;padding:20px;border:6px solid #fff;box-shadow:var(--shadow);transform:rotate(-2deg)}
.photo-stamp{position:absolute;bottom:-14px;right:-10px;z-index:2;transform:rotate(7deg);animation:floaty 5s ease infinite;--rot:7deg}

/* CTA */
.cta{padding:0 0 90px}
.cta .wrap{background:var(--green);border-radius:28px;padding:64px 40px;text-align:center;position:relative;overflow:hidden}
.cta .wrap::before{content:"?";position:absolute;font-family:var(--f-head);font-weight:900;font-size:340px;color:rgba(255,255,255,.08);right:-30px;top:-90px;line-height:1}
.cta h2{font-family:var(--f-head);font-weight:900;font-size:clamp(32px,5vw,54px);line-height:1;letter-spacing:-.02em;color:#fff;margin-bottom:16px;position:relative}
.cta p{color:rgba(255,255,255,.92);font-size:18px;max-width:480px;margin:0 auto 32px;position:relative}
.cta .btns{display:flex;gap:13px;justify-content:center;flex-wrap:wrap;position:relative}
.cta .btn-primary{background:#fff;color:var(--green-dark);box-shadow:0 14px 30px -12px rgba(0,0,0,.4)}
.cta .btn-primary:hover{background:var(--cream)}
.cta .btn-ghost{border-color:rgba(255,255,255,.7);color:#fff}
.cta .btn-ghost:hover{background:#fff;color:var(--green-dark)}

/* FOOTER */
footer{border-top:1px solid var(--line);padding:40px 0 50px}
footer .wrap{display:flex;justify-content:space-between;gap:30px;flex-wrap:wrap;align-items:flex-start}
.foot-note{max-width:520px;font-size:13px;color:var(--gray);line-height:1.6}
.foot-links{display:flex;flex-direction:column;gap:8px;font-size:14px;font-weight:600;color:var(--ink-soft)}
.foot-copy{width:100%;font-size:12.5px;color:var(--gray);margin-top:24px;border-top:1px solid var(--line);padding-top:18px}

/* RESPONSIVE */
@media(max-width:960px){
  .hero .wrap{grid-template-columns:1fr;gap:44px}
  .hero-r{max-width:440px}
  .arrow,.step-arrow{display:none}
  .steps{grid-template-columns:1fr 1fr;gap:28px}
  .q-grid{grid-template-columns:1fr 1fr}
  .rafael .wrap{grid-template-columns:1fr;padding:38px}
  .rafael-photo{max-width:300px}
  .nav-links a.lnk{display:none}
}
@media(max-width:560px){
  .cmp-row{grid-template-columns:1fr;gap:4px;padding:16px 2px}
  .q-grid{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr}
  .cta .wrap{padding:48px 24px}
  .micro{gap:12px}
}
`

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const QUESTION_CARDS = [
  'Caí na malha. E agora?',
  'Vendi um imóvel. Vou pagar imposto?',
  'Tenho MEI e CLT. Como declaro?',
  'Investi em ações. Preciso declarar tudo?',
  'Vale a pena virar PJ?',
  'Recebi uma intimação da Receita. É grave?',
]

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NOVA_CSS }} />

      {/* NAV */}
      <nav>
        <div className="wrap">
          <a href="#" className="logo">
            <div className="logo-mark">?</div>
            <div className="logo-txt">
              <small>Pergunte ao seu</small>Contador
            </div>
          </a>
          <div className="nav-links">
            <a className="lnk" href="#como-funciona">
              Como funciona
            </a>
            <a className="lnk" href="#duvidas">
              Dúvidas comuns
            </a>
            <a className="lnk" href="#rafael">
              Quem é o Rafael
            </a>
            <Link href="/app/chat" className="btn btn-primary btn-sm">
              Perguntar de graça
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-l">
            <div className="hero-stamps">
              <span className="stamp stamp-green r r1">Pergunte grátis</span>
              <span className="stamp stamp-butter r r2">Sem mensalidade</span>
            </div>
            <h1 className="r r2">
              Imposto deu nó?
              <br />
              <span className="line2">
                <span className="mark">Pergunte ao seu Contador.</span>
              </span>
            </h1>
            <p className="hero-sub r r3">
              A IA do Rafael te ajuda a entender o caminho <b>de graça</b>. Se tiver dinheiro, risco
              ou Receita no meio, o <b>Rafael de verdade</b> olha com você.
            </p>
            <div className="hero-cta r r4">
              <Link href="/app/chat" className="btn btn-primary">
                Perguntar de graça
              </Link>
              <a href={KIWIFY_URL} className="btn btn-ghost">
                Ver agenda do Rafael
              </a>
            </div>
            <div className="micro r r5">
              <span>
                <svg viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sem mensalidade
              </span>
              <span>
                <svg viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sem juridiquês
              </span>
              <span>
                <svg viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sem compromisso
              </span>
            </div>
            <svg
              className="arrow"
              style={{ bottom: '-46px', left: '210px', width: '120px', height: '70px' }}
              viewBox="0 0 120 70"
            >
              <path d="M4 6 C 30 2, 64 10, 78 40 C 82 50, 84 58, 86 64" />
              <path d="M72 52 L 86 66 L 96 50" />
            </svg>
          </div>

          <div className="hero-r">
            <div className="chat-panel" />
            <span className="stamp stamp-butter float-stamp fs1">Humano quando importa</span>
            <span className="stamp stamp-green float-stamp fs2">100% grátis</span>
            <div className="chat">
              <div className="chat-head">
                <div className="chat-av">R</div>
                <div style={{ flex: 1 }}>
                  <strong>IA do Rafael</strong>
                  <div className="on">online agora</div>
                </div>
              </div>
              <div className="chat-body">
                <div className="bub bub-u">Vendi um imóvel esse ano. Preciso pagar imposto?</div>
                <div className="typing">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="bub bub-ai">
                  Pode ser que sim, mas depende de <b>três pontos</b>:
                  <ol>
                    <li>por quanto você comprou</li>
                    <li>por quanto vendeu</li>
                    <li>se usou o dinheiro pra comprar outro imóvel</li>
                  </ol>
                  Me conta esses dados que eu te mostro o caminho.
                </div>
              </div>
              <div className="handoff">
                <div className="hi">R</div>
                <div>
                  Quando mexe no bolso, o <b>Rafael de verdade</b> assume. Sessão sob demanda, sem
                  mensalidade.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="compare">
        <div className="wrap">
          <span className="sec-kick">Contra o quê a gente compete</span>
          <h2>
            Melhor que se perder sozinho. <span className="ital">Mais leve</span> que contratar
            contador todo mês.
          </h2>
          <div className="cmp-list">
            <div className="cmp-row">
              <div className="cmp-alt">Google e YouTube</div>
              <div className="cmp-prob">
                Você sai com 12 respostas e mais medo do que tinha antes.
              </div>
            </div>
            <div className="cmp-row">
              <div className="cmp-alt">Receita Federal</div>
              <div className="cmp-prob">Tem a informação, mas ninguém traduz pro seu caso.</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-alt">Contador mensal</div>
              <div className="cmp-prob">
                Caro e demais pra uma dúvida pontual. Você nem precisa de um o ano todo.
              </div>
            </div>
            <div className="cmp-row">
              <div className="cmp-alt">Adiar o problema</div>
              <div className="cmp-prob">Não some. Só fica mais caro lá na frente.</div>
            </div>
          </div>
          <div className="cmp-win">
            <div className="ck">
              <CheckIcon />
            </div>
            <div>
              <b>Pergunte ao seu Contador</b>
              <span>Clareza agora, de graça. Especialista quando realmente importa.</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUESTIONS */}
      <section className="q" id="duvidas">
        <div className="wrap">
          <div className="q-head">
            <h2>
              Pode perguntar coisa simples.{' '}
              <span className="mark-green">Pode perguntar coisa cabeluda.</span>
            </h2>
            <p>O tipo de dúvida que você ia jogar no Google e sair mais perdido.</p>
          </div>
          <div className="q-grid">
            {QUESTION_CARDS.map((text) => (
              <div key={text} className="q-card">
                {text}
              </div>
            ))}
          </div>
          <div className="q-cta">
            <Link href="/app/chat" className="btn btn-primary">
              Perguntar de graça
            </Link>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="how" id="como-funciona">
        <div className="wrap">
          <div className="how-head">
            <span className="sec-kick">Como funciona</span>
            <h2>
              Você pergunta, a IA clareia, o Rafael assume <span className="ital">se precisar.</span>
            </h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-n">1</div>
              <h3>Você conta a dúvida</h3>
              <p>Sem formulário gigante. Só explica o que aconteceu, com suas palavras.</p>
              <svg className="step-arrow" viewBox="0 0 34 24">
                <path d="M2 12 C 12 6, 22 6, 30 12" />
                <path d="M24 7 L 31 12 L 25 17" />
              </svg>
            </div>
            <div className="step">
              <div className="step-n">2</div>
              <h3>A IA traduz o caminho</h3>
              <p>Ela pergunta o que falta e te mostra as possibilidades, em português.</p>
              <svg className="step-arrow" viewBox="0 0 34 24">
                <path d="M2 12 C 12 6, 22 6, 30 12" />
                <path d="M24 7 L 31 12 L 25 17" />
              </svg>
            </div>
            <div className="step">
              <div className="step-n">3</div>
              <h3>Se tiver risco, Rafael entra</h3>
              <p>Quando mexe no bolso, na Receita ou em decisão importante, você agenda.</p>
              <svg className="step-arrow" viewBox="0 0 34 24">
                <path d="M2 12 C 12 6, 22 6, 30 12" />
                <path d="M24 7 L 31 12 L 25 17" />
              </svg>
            </div>
            <div className="step">
              <div className="step-n">4</div>
              <h3>Você sai com o passo</h3>
              <p>Nada de conversa solta. Você sabe exatamente o que fazer agora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RAFAEL */}
      <section className="rafael" id="rafael">
        <div className="wrap">
          <div>
            <span className="sec-kick">Quem é o Rafael</span>
            <h2>
              IA ajuda. Mas imposto importante <span className="mark">precisa de gente.</span>
            </h2>
            <p className="lead">
              A IA do Rafael existe pra te orientar rápido. Quando a dúvida envolve valor alto,
              prazo, Receita ou decisão difícil, o Rafael de verdade revisa com você.
            </p>
            <ul className="checks">
              <li>
                <span className="ck">
                  <CheckIcon />
                </span>
                Contador com CRC ativo
              </li>
              <li>
                <span className="ck">
                  <CheckIcon />
                </span>
                Visão de PF e PJ no mesmo lugar
              </li>
              <li>
                <span className="ck">
                  <CheckIcon />
                </span>
                Atendimento sob demanda
              </li>
              <li>
                <span className="ck">
                  <CheckIcon />
                </span>
                Plano por escrito no fim
              </li>
              <li>
                <span className="ck">
                  <CheckIcon />
                </span>
                Sem empurrar mensalidade
              </li>
            </ul>
          </div>
          <div className="rafael-photo">
            {/* TODO: trocar pelo retrato real do Rafael, natural, sem cara corporate */}
            <div className="photo-frame">
              foto do Rafael
              <br />
              (natural, sem cara de escritório)
            </div>
            <span className="stamp stamp-green photo-stamp">Humano quando importa</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="perguntar">
        <div className="wrap">
          <h2>Antes de decidir no escuro, pergunta.</h2>
          <p>
            A IA do Rafael clareia a sua dúvida de graça, agora. E o Rafael de verdade fica a poucos
            cliques.
          </p>
          <div className="btns">
            <Link href="/app/chat" className="btn btn-primary">
              Perguntar de graça
            </Link>
            <a href={KIWIFY_URL} className="btn btn-ghost">
              Ver agenda do Rafael
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-note">
            <strong
              style={{
                fontFamily: 'var(--f-head)',
                fontSize: '16px',
                display: 'block',
                marginBottom: '8px',
                color: 'var(--ink)',
              }}
            >
              Pergunte ao seu Contador
            </strong>
            A IA do Rafael orienta com base no que você conta e pode interpretar errado. Ela não
            substitui uma análise humana do seu caso. Pra qualquer coisa que mexe no seu bolso,
            fale com o Rafael de verdade.
          </div>
          <div className="foot-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#duvidas">Dúvidas comuns</a>
            <a href="#rafael">Quem é o Rafael</a>
            <a href="mailto:contato@pergunteaoseucontador.com.br">Falar com a gente</a>
          </div>
          <div className="foot-copy">
            © 2025 Pergunte ao seu Contador. Sem mensalidade, sem juridiquês.
          </div>
        </div>
      </footer>
    </>
  )
}
