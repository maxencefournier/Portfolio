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
  const H = window.innerHeight;

  hero.style.transform = "translateY(-" + (p * 100) + "%)";
  hero.style.pointerEvents = p >= 1 ? "none" : "auto";

  // H = hauteur du hero (toujours 100% de l'écran) ; S = distance de scroll
  // réservée à la porte de garage. Verrouiller la grille sur le bloc sombre
  // AVANT un certain point précis la forcerait à d'abord descendre : ce point
  // minimum est syncPoint0 = hauteur de la 1ère rangée (bande tampon incluse)
  // / hauteur d'écran. On ajoute une marge au-delà de ce minimum pour avoir
  // un vrai mouvement progressif (pas juste immobile-puis-brusque), et la
  // bande tampon cachée au-dessus des vignettes absorbe l'écart résiduel
  // pendant toute cette marge — jamais de vide visible.
  const S = spacerHeight;
  const rowHeight = mosaicFirstRow.offsetHeight;
  const syncPoint0 = rowHeight / H;
  const syncPoint = Math.min(Math.max(syncPoint0 + 0.15, 0.1), 0.95);
  const heroBottom = H * (1 - p);
  const natural = S * (1 - p);
  let actual;

  if (p >= syncPoint) {
    actual = heroBottom;
  } else {
    const t = p / syncPoint;
    const P0 = S;
    const P1 = H * (1 - syncPoint);
    const eased = t * t * t;
    actual = P0 + (P1 - P0) * eased;
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
