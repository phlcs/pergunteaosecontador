function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function ChatFab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const href = isLoggedIn ? '/app/chat' : '/login?next=/app/chat'

  return (
    <a href={href} className="landing-fab" aria-label="Abrir assistente de IA">
      <span className="landing-fab-pulse" aria-hidden="true" />
      <span className="landing-fab-icon">
        <ChatBubbleIcon />
      </span>
      <span className="landing-fab-label">Pergunte ao seu Contador</span>
    </a>
  )
}
