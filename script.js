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
const hero = document.getElementById("hero");
const mosaicEl = document.getElementById("projets");
const mosaicSpace = document.getElementById("mosaicSpace");
const heroSpacer = document.getElementById("heroSpacer");

let spacerHeight = heroSpacer.offsetHeight;

function measureMosaicHeight() {
  // Mesure la hauteur naturelle de la mosaïque (hors épinglage) pour que
  // le conteneur réserve toujours cet espace, même quand la mosaïque
  // passe en position fixed — ça évite tout saut au relâchement.
  const wasPinned = mosaicEl.classList.contains("mosaic--pinned");
  mosaicEl.classList.remove("mosaic--pinned");
  const naturalHeight = mosaicEl.offsetHeight;
  mosaicSpace.style.height = naturalHeight + "px";
  if (wasPinned) mosaicEl.classList.add("mosaic--pinned");
}

function updateHero() {
  const progress = Math.min(Math.max(window.scrollY / spacerHeight, 0), 1);
  hero.style.transform = "translateY(-" + (progress * 100) + "%)";

  if (progress >= 1) {
    mosaicEl.classList.remove("mosaic--pinned");
    hero.style.pointerEvents = "none";
  } else {
    mosaicEl.classList.add("mosaic--pinned");
    hero.style.pointerEvents = "auto";
  }
}

measureMosaicHeight();
window.addEventListener("scroll", updateHero, { passive: true });
window.addEventListener("resize", () => {
  spacerHeight = heroSpacer.offsetHeight;
  measureMosaicHeight();
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
