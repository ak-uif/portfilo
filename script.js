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
    dot.style.transform = `translate3d(${mouseX - 2}px, ${mouseY - 2}px, 0)`;
    moveScene(mouseX, mouseY);
    body.classList.add('pointer-ready');
  }, { passive: true });

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
    const rx = ((event.clientY - rect.top) / rect.height - .5) * -3.2;
    const ry = ((event.clientX - rect.left) / rect.width - .5) * 4.2;
    card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
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
