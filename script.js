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
   La mosaïque réelle est directement épinglée (position fixed, recadrée)
   pendant que le hero se rétracte, puis relâchée en flux normal.
   Un seul élément mosaïque : aucun doublon, donc aucun saut à la bascule.
============================ */
/* ============================
   HERO — porte de garage à rattrapage progressif
   Le bloc sombre se rétracte de façon linéaire. La mosaïque part en
   retard (mouvement très lent au début), puis accélère progressivement
   pour rattraper exactement le mouvement du bloc sombre au moment où
   celui-ci finit de remonter — recalé mathématiquement pour que les deux
   se rejoignent pile à zéro écart à la fin, sans à-coup ni bosse.
============================ */
const hero = document.getElementById("hero");
const mosaicEl = document.getElementById("projets");
const heroSpacer = document.getElementById("heroSpacer");

let spacerHeight = heroSpacer.offsetHeight;

function updateHero() {
  const p = Math.min(Math.max(window.scrollY / spacerHeight, 0), 1);

  hero.style.transform = "translateY(-" + (p * 100) + "%)";
  hero.style.pointerEvents = p >= 1 ? "none" : "auto";

  // Décalage supplémentaire par rapport au scroll naturel : nul à p=0 et p=1,
  // positif entre les deux (la grille prend du retard puis le rattrape).
  const lag = spacerHeight * p * (1 - p * p);
  mosaicEl.style.transform = "translateY(" + lag + "px)";
}

window.addEventListener("scroll", updateHero, { passive: true });
window.addEventListener("resize", () => {
  spacerHeight = heroSpacer.offsetHeight;
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
