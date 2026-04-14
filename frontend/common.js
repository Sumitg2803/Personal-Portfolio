/* =========================================================================
   COMMON JS (Preloader Logic, Custom Cursor, Scroll Animation Init)
   ========================================================================= */

// Deployment Config: Switch this to your live backend URL (e.g. https://portfolio-backend.vercel.app) once deployed!
window.API_BASE_URL = 'https://personal-portfolio-kappa-lilac.vercel.app/';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Preloader Logic
    const loader = document.getElementById('intro-loader');
    if (loader) {
        // Check if intro has played this session
        const introPlayed = sessionStorage.getItem('introPlayed');
        
        if (!introPlayed) {
            // First time loading - play animation
            loader.style.display = 'block';
            document.body.style.overflow = 'hidden'; // prevent scrolling during intro

            const skipBtn = document.getElementById('skipBtn');
            const fadeOutLoader = () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 1,
                    onComplete: () => {
                        loader.style.display = 'none';
                        document.body.style.overflow = 'auto'; // restore scroll
                        sessionStorage.setItem('introPlayed', 'true');
                        initPageEntryAnimations();
                    }
                });
            };

            // It takes approx 4.5 seconds for animation to finish completely
            const loaderTimeout = setTimeout(fadeOutLoader, 5000);

            if(skipBtn) {
                skipBtn.addEventListener('click', () => {
                    clearTimeout(loaderTimeout);
                    fadeOutLoader();
                });
            }
        } else {
            // Already played, hide loader and init animations immediately
            loader.style.display = 'none';
            document.body.style.overflow = 'auto';
            initPageEntryAnimations();
        }
    } else {
        // No loader on this page, just animate entry
        initPageEntryAnimations();
    }

    // 2. Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add hover effect to links and buttons
        const interactables = document.querySelectorAll('a, button, .interest-card, .skill-card, .project-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // 3. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    // 4. Dynamic Copyright Year
    const yearElements = document.querySelectorAll('.copyright-year');
    if (yearElements.length > 0) {
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => el.textContent = currentYear);
    }
});

// GSAP Page Entry Animation Staggering
function initPageEntryAnimations() {
    // Reveal main content sequentially
    const fadeElements = document.querySelectorAll('.gsap-fade-in');
    if(fadeElements.length > 0 && typeof gsap !== 'undefined') {
        gsap.fromTo(fadeElements, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power2.out" }
        );
    }
}
