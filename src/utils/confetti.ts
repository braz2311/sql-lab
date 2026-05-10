export function launchConfetti(): void {
  const colors = ['#38bdf8', '#4ade80', '#fbbf24', '#fb923c', '#a78bfa', '#f472b6'];
  const count = 80;
  const container = document.body;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 6;
    const x = Math.random() * window.innerWidth;
    const duration = Math.random() * 1500 + 1000;
    const delay = Math.random() * 500;

    el.style.cssText = `
      position:fixed;top:-20px;left:${x}px;
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events:none;z-index:9999;
      animation:confetti-fall ${duration}ms ${delay}ms linear forwards;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration + delay + 100);
  }

  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(${window.innerHeight + 40}px) rotate(${Math.random() > 0.5 ? '' : '-'}720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
