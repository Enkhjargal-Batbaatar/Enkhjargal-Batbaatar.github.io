document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('scroller');
  const dots = document.querySelectorAll('.dot');
  const panels = document.querySelectorAll('.panel');
  const reveals = document.querySelectorAll('.reveal');

  // --- scroll reveal ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.25 });
  reveals.forEach((el) => revealObserver.observe(el));

  // --- active dot tracking ---
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        dots.forEach((d) => d.classList.remove('active'));
        const match = document.querySelector(`.dot[data-target="${entry.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  panels.forEach((p) => dotObserver.observe(p));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- envelope open ---
  const waxSeal = document.getElementById('waxSeal');
  if (waxSeal) {
    waxSeal.addEventListener('click', () => {
      const hero = document.getElementById('hero');
      waxSeal.style.transform = 'scale(0.85) rotate(20deg)';
      waxSeal.style.opacity = '0';
      setTimeout(() => {
        hero.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    });
  }

  // --- RSVP form (client-side only) ---
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpThanks = document.getElementById('rsvpThanks');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      rsvpForm.style.display = 'none';
      rsvpThanks.classList.add('show');
    });
  }
});
