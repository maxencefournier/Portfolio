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

  // H = hauteur du hero (toujours 100% de l'écran) ; S = distance de scroll
  // réservée à la porte de garage (souvent < H depuis la position native).
  // Le bas du hero se déplace donc à la vitesse H/S par pixel de scroll —
  // plus vite que le défilement naturel de la grille (vitesse 1). Il ne
  // suffit pas d'annuler l'écart à un instant donné : il faut aussi égaliser
  // les deux vitesses à cet instant, sinon l'écart se recreuse aussitôt
  // après. On utilise une interpolation de Hermite (position ET pente
  // raccordées) entre la position native et le point de synchronisation.
  // H = hauteur du hero (toujours 100% de l'écran) ; S = distance de scroll
  // réservée à la porte de garage (souvent < H depuis la position native).
  // Le bas du hero se déplace à la vitesse H/S par pixel de scroll — plus
  // vite que le défilement naturel de la grille. Verrouiller la grille sur
  // le bloc sombre AVANT un certain point précis la forcerait à d'abord
  // descendre (mouvement inversé, incorrect) : ce point minimum est
  // syncPoint = hauteur de la 1ère rangée / hauteur d'écran. On l'utilise
  // directement, ce qui donne la synchronisation la plus précoce possible
  // sans jamais inverser le mouvement.
  const H = window.innerHeight;
  const S = spacerHeight;
  const rowHeight = mosaicFirstRow.offsetHeight;
  const syncPoint = Math.min(Math.max(rowHeight / H, 0.05), 0.95);
  const heroBottom = H * (1 - p);
  const natural = S * (1 - p);
  let actual;

  if (p >= syncPoint) {
    actual = heroBottom;
  } else {
    const t = p / syncPoint;
    const P0 = S;
    const P1 = H * (1 - syncPoint);
    const D1 = -H * syncPoint;
    const h00 = 2 * t * t * t - 3 * t * t + 1;
    const h01 = -2 * t * t * t + 3 * t * t;
    const h11 = t * t * t - t * t;
    actual = h00 * P0 + h01 * P1 + h11 * D1;
  }

  const offset = actual - natural;
  mosaicEl.style.transform = "translateY(" + offset + "px)";
}

updateSpacerHeight();

let rafId = null;
function loop() {
  updateHero();
  rafId = requestAnimationFrame(loop);
}
loop();

window.addEventListener("resize", () => {
  updateSpacerHeight();
  updateHero();
});

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
