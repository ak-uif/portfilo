// Bütün bölmələri və menyu linklərini seçirik
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const canvas = document.getElementById('bg-canvas');
const context = canvas.getContext('2d');
const mouse = { x: null, y: null, radius: 140 };
const particles = [];
const particleCount = Math.min(75, Math.max(35, Math.floor(window.innerWidth / 18)));

function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createParticle() {
    return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        red: Math.random() > 0.68
    };
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10 || particle.x > window.innerWidth + 10) particle.speedX *= -1;
        if (particle.y < -10 || particle.y > window.innerHeight + 10) particle.speedY *= -1;

        if (mouse.x !== null) {
            const distanceX = mouse.x - particle.x;
            const distanceY = mouse.y - particle.y;
            const distance = Math.hypot(distanceX, distanceY);

            if (distance < mouse.radius && distance > 0) {
                const force = (mouse.radius - distance) / mouse.radius;
                particle.x -= (distanceX / distance) * force * 0.45;
                particle.y -= (distanceY / distance) * force * 0.45;
            }
        }
    });
}

function drawParticles() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
        const glowColor = particle.red ? '220, 45, 52' : '155, 155, 165';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${glowColor}, 0.7)`;
        context.shadowBlur = 12;
        context.shadowColor = `rgba(${glowColor}, 0.55)`;
        context.fill();
        context.shadowBlur = 0;

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
            const nextParticle = particles[nextIndex];
            const distance = Math.hypot(particle.x - nextParticle.x, particle.y - nextParticle.y);
            if (distance < 125) {
                context.beginPath();
                context.moveTo(particle.x, particle.y);
                context.lineTo(nextParticle.x, nextParticle.y);
                context.strokeStyle = `rgba(150, 45, 52, ${0.18 * (1 - distance / 125)})`;
                context.lineWidth = 0.6;
                context.stroke();
            }
        }
    });
}

function animateBackground() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animateBackground);
}

resizeCanvas();
for (let index = 0; index < particleCount; index += 1) particles.push(createParticle());
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});
animateBackground();

// Səhifə sürüşdürüldükcə işləyən funksiya
window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Ekranda hansı bölmənin göründüyünü yoxlayırıq
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    // Aktiv olan linkə 'active' class-ını əlavə edirik, digərlərindən silirik
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});