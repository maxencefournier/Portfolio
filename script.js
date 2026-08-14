// Injecte le contenu de data-tag dans l'étiquette mono de chaque projet
document.querySelectorAll(".project").forEach((project) => {
  const tag = project.dataset.tag;
  const tagEl = project.querySelector(".project__tag");
  if (tag && tagEl) tagEl.textContent = tag;
});

// Reveal au scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".project").forEach((el) => observer.observe(el));

// Menu mobile
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav__links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav__links--open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Ferme le menu après un clic sur un lien (mobile)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav__links--open");
    });
  });
}
