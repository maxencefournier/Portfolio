/* ============================
   CURSEUR EN CROIX
============================ */
const crosshairV = document.getElementById("crosshairV");
const crosshairH = document.getElementById("crosshairH");

if (crosshairV && crosshairH) {
  document.addEventListener("mousemove", (e) => {
    const overHero = e.target.closest(".hero");
    if (overHero) {
      crosshairV.style.left = e.clientX + "px";
      crosshairH.style.top = e.clientY + "px";
      crosshairV.classList.add("is-active");
      crosshairH.classList.add("is-active");
    } else {
      crosshairV.classList.remove("is-active");
      crosshairH.classList.remove("is-active");
    }
  });
}

/* ============================
   NOM DU HERO — remplit toujours exactement la largeur de l'écran
============================ */
const heroName = document.getElementById("heroName");

function fitHeroName() {
  if (!heroName) return;
  heroName.style.fontSize = "100px";
  heroName.style.width = "max-content";
  const textWidth = heroName.getBoundingClientRect().width;
  heroName.style.width = "100%";
  const targetWidth = heroName.parentElement.clientWidth;
  const newSize = (100 * targetWidth) / textWidth;
  heroName.style.fontSize = newSize + "px";
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(fitHeroName);
} else {
  window.addEventListener("load", fitHeroName);
}
fitHeroName();
window.addEventListener("resize", fitHeroName);

/* ============================
   HORLOGE
============================ */
const clockEl = document.getElementById("heroClockTime");

function updateClock() {
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 10000);

/* ============================
   HERO — porte de garage
   La position de repos native de la grille (avant tout scroll) est
   calculée pour que le bas de la première rangée touche exactement le
   bas de l'écran — aucune animation ne l'y amène, c'est sa position de
   départ réelle dans la page. Une fois le scroll commencé, la grille
   se déplace plus lentement que le bloc sombre au début, puis accélère
   progressivement pour se resynchroniser en position ET en vitesse
   pile au moment où le bloc sombre finit de remonter.
============================ */
const hero = document.getElementById("hero");
const mosaicEl = document.getElementById("projets");
const mosaicFirstRow = document.getElementById("mosaicFirstRow");
const heroSpacer = document.getElementById("heroSpacer");

let spacerHeight = heroSpacer.offsetHeight;

function updateSpacerHeight() {
  const rowHeight = mosaicFirstRow.offsetHeight;
  const target = window.innerHeight - rowHeight;
  spacerHeight = Math.max(target, 0);
  heroSpacer.style.height = spacerHeight + "px";
}

function updateHero() {
  const p = Math.min(Math.max(window.scrollY / spacerHeight, 0), 1);

  hero.style.transform = "translateY(-" + (p * 100) + "%)";
  hero.style.pointerEvents = p >= 1 ? "none" : "auto";

  // Retard par rapport au scroll naturel : nul à p=0 et p=1, positif entre les
  // deux, avec une pente également nulle à p=1 — la grille démarre à sa
  // position native, prend du retard, puis rejoint position ET vitesse du
  // bloc sombre exactement à la fin.
  // Point de synchronisation : au lieu de rejoindre le bloc sombre pile à la
  // fin (p=1), la grille le rejoint bien plus tôt (à syncPoint), puis les
  // deux avancent à l'identique jusqu'à la fin. Réversible automatiquement
  // au scroll inverse puisque tout dépend uniquement de la position p.
  const amplitude = 1;
  const syncPoint = 0.6;
  const q = Math.min(p / syncPoint, 1);
  const lag = spacerHeight * amplitude * q * (1 - q) * (1 - q);
  mosaicEl.style.transform = "translateY(" + lag + "px)";
}

updateSpacerHeight();
window.addEventListener("scroll", updateHero, { passive: true });
window.addEventListener("resize", () => {
  updateSpacerHeight();
  updateHero();
});
updateHero();

/* ============================
   ŒIL — suit le curseur, x2 au survol, coins nets
============================ */
const eye = document.getElementById("eye");
const pupil = document.getElementById("eyePupil");

if (eye && pupil) {
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let targetScale = 1, currentScale = 1;
  const maxOffset = 26;

  document.addEventListener("mousemove", (e) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxOffset);
    const angle = Math.atan2(dy, dx);
    targetX = Math.cos(angle) * clampedDist;
    targetY = Math.sin(angle) * clampedDist;
  });

  eye.addEventListener("mouseenter", () => { targetScale = 2; });
  eye.addEventListener("mouseleave", () => { targetScale = 1; });

  function animateEye() {
    const ease = 0.12;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    currentScale += (targetScale - currentScale) * ease;
    pupil.style.transform =
      "translate(" + currentX.toFixed(2) + "px, " + currentY.toFixed(2) + "px) scale(" + currentScale.toFixed(3) + ")";
    requestAnimationFrame(animateEye);
  }
  animateEye();
}

/* ============================
   REVEAL AU SCROLL — citation
============================ */
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

document.querySelectorAll(".quote").forEach((el) => observer.observe(el));
