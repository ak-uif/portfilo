const root = document.documentElement;
const body = document.body;
const header = document.querySelector('#header');
const halo = document.querySelector('.cursor-halo');
const dot = document.querySelector('.cursor-dot');
const blobs = [...document.querySelectorAll('.blob')];
const finePointer = matchMedia('(pointer:fine)').matches;
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let haloX = mouseX;
let haloY = mouseY;
const pointer = { x: mouseX, y: mouseY, active: false };

function moveScene(x, y) {
  const nx = x / innerWidth - .5;
  const ny = y / innerHeight - .5;
  root.style.setProperty('--mx', `${x}px`);
  root.style.setProperty('--my', `${y}px`);
  root.style.setProperty('--grid-x', `${nx * -18}px`);
  root.style.setProperty('--grid-y', `${ny * -18}px`);
  blobs[0].style.transform = `translate3d(${nx * 48}px, ${ny * 36}px, 0)`;
  blobs[1].style.transform = `translate3d(${nx * -40}px, ${ny * -31}px, 0)`;
  blobs[2].style.transform = `translate3d(${nx * 28}px, ${ny * -24}px, 0)`;
}

if (finePointer) {
  addEventListener('pointermove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    pointer.x = mouseX;
    pointer.y = mouseY;
    pointer.active = true;
    dot.style.transform = `translate3d(${mouseX - 2}px, ${mouseY - 2}px, 0)`;
    moveScene(mouseX, mouseY);
    body.classList.add('pointer-ready');
  }, { passive: true });

  document.addEventListener('pointerleave', () => { pointer.active = false; });

  const cursorFrame = () => {
    haloX += (mouseX - haloX) * .16;
    haloY += (mouseY - haloY) * .16;
    halo.style.transform = `translate3d(${haloX - halo.offsetWidth / 2}px, ${haloY - halo.offsetHeight / 2}px, 0)`;
    requestAnimationFrame(cursorFrame);
  };
  cursorFrame();

  document.querySelectorAll('a, button, .project-card').forEach(element => {
    element.addEventListener('pointerenter', () => body.classList.add('pointer-link'));
    element.addEventListener('pointerleave', () => body.classList.remove('pointer-link'));
  });
}

addEventListener('pointerdown', event => {
  const ripple = document.createElement('span');
  ripple.className = 'tap-ripple';
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}, { passive: true });

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (!finePointer) return;
    const rect = card.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - .5;
    const ny = (event.clientY - rect.top) / rect.height - .5;
    card.style.setProperty('--rx', `${ny * -8}deg`);
    card.style.setProperty('--ry', `${nx * 10}deg`);
    card.style.setProperty('--ix', `${nx * -9}px`);
    card.style.setProperty('--iy', `${ny * -7}px`);
    card.style.setProperty('--shine-x', `${(nx + .5) * 100}%`);
    card.style.setProperty('--shine-y', `${(ny + .5) * 100}%`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--ix', '0px');
    card.style.setProperty('--iy', '0px');
    card.style.setProperty('--shine-x', '50%');
    card.style.setProperty('--shine-y', '50%');
  });
});

document.querySelectorAll('.magnetic').forEach(item => {
  item.addEventListener('pointermove', event => {
    if (!finePointer) return;
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .08;
    const y = (event.clientY - rect.top - rect.height / 2) * .1;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });
  item.addEventListener('pointerleave', () => item.style.transform = '');
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 28), { passive: true });
moveScene(mouseX, mouseY);

const canvas = document.querySelector('#network');
const context = canvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let dpr = 1;

function createParticle() {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - .5) * .32,
    vy: (Math.random() - .5) * .32,
    radius: Math.random() * 1.1 + .55
  };
}

function resizeNetwork() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvasWidth = innerWidth;
  canvasHeight = innerHeight;
  canvas.width = Math.round(canvasWidth * dpr);
  canvas.height = Math.round(canvasHeight * dpr);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(145, Math.max(62, Math.floor(canvasWidth * canvasHeight / 11500)));
  particles = Array.from({ length: count }, createParticle);
}

function drawNetwork() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach(particle => {
    if (!reduceMotion) {
      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < 145) {
          const force = (145 - distance) / 145;
          particle.vx += (dx / distance) * force * .16;
          particle.vy += (dy / distance) * force * .16;
        }
      }

      particle.vx *= .986;
      particle.vy *= .986;
      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > 1.45) {
        particle.vx = particle.vx / speed * 1.45;
        particle.vy = particle.vy / speed * 1.45;
      }
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -8) particle.x = canvasWidth + 8;
      if (particle.x > canvasWidth + 8) particle.x = -8;
      if (particle.y < -8) particle.y = canvasHeight + 8;
      if (particle.y > canvasHeight + 8) particle.y = -8;
    }

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(222, 228, 214, .46)';
    context.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.hypot(dx, dy);
      if (distance < 118) {
        context.beginPath();
        context.moveTo(particles[i].x, particles[i].y);
        context.lineTo(particles[j].x, particles[j].y);
        context.strokeStyle = `rgba(202, 213, 194, ${(1 - distance / 118) * .15})`;
        context.lineWidth = .65;
        context.stroke();
      }
    }
  }

  if (!reduceMotion) requestAnimationFrame(drawNetwork);
}

addEventListener('resize', resizeNetwork, { passive: true });
resizeNetwork();
drawNetwork();
