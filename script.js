// Bütün bölmələri və menyu linklərini seçirik
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

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