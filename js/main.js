// ===== Animation au scroll avec IntersectionObserver =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target); // déclenche une seule fois
    }
  });
}, observerOptions);

// Observer toutes les cards
document.querySelectorAll(".card").forEach(card => {
  observer.observe(card);
});


// ===== Compteur animé avec requestAnimationFrame =====
function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing : ease-out cubique
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(start + (target - start) * eased);
    el.textContent = value.toLocaleString("fr-FR");

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Déclencher quand les stats entrent en vue
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".stat__number").forEach(el => {
  statsObserver.observe(el);
});


// ===== Smooth scroll sur les liens d'ancre =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (targetId === "#") return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});