document.addEventListener('DOMContentLoaded', () => {
    const navbarLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...document.querySelectorAll('main section[id]')];
    const revealElements = document.querySelectorAll('.section-heading, .landing-feature-card, .step, .cta-content');
    const stats = document.querySelectorAll('[data-target]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach((element) => {
        element.classList.add('reveal');
        revealObserver.observe(element);
    });

    const setActiveLink = () => {
        let currentSection = sections[0]?.id;

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 140 && rect.bottom >= 140) {
                currentSection = section.id;
            }
        });

        navbarLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${currentSection}`;
            link.classList.toggle('active', isActive);
        });
    };

    const animateStat = (stat) => {
        const target = Number(stat.dataset.target || 0);
        const suffix = stat.dataset.suffix || '';

        let currentValue = 0;
        const duration = 1200;
        const startTime = performance.now();

        const update = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextValue = Math.round(target * eased);

            stat.textContent = `${nextValue}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                stat.textContent = `${target}${suffix}`;
            }
        };

        requestAnimationFrame(update);
    };

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateStat(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    stats.forEach((stat) => {
        statObserver.observe(stat);
    });

    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();
});
