const initScrollReveal = () => {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
};

const initNavToggle = () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const body = document.body;
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    body.classList.toggle('nav-open');
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-open');
    });
  });
};

initScrollReveal();
initNavToggle();
