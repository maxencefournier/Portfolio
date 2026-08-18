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
   HERO — phase A (échange intro/citation) puis phase B (porte de garage)
   Phase A : le fond et le nom restent totalement immobiles ; seuls
   l'intro/vidéo sortent (fondu + glissement) pendant que la citation
   entre (fondu + glissement depuis le bas). Phase B : une fois la
   phase A terminée, le scroll suivant déclenche la porte de garage
   habituelle (inchangée, juste décalée du budget de scroll de la phase A).
   La position de repos native de la grille (avant tout scroll) est
   calculée pour que le bas de la première rangée touche exactement le
   bas de l'écran — aucune animation ne l'y amène, c'est sa position de
   départ réelle dans la page. Une fois le scroll commencé, la grille
   se déplace plus lentement que le bloc sombre au début, puis accélère
   progressivement pour se resynchroniser en position ET en vitesse
   pile au moment où le bloc sombre finit de remonter.
============================ */
const hero = document.getElementById("hero");
const heroVideo = document.getElementById("heroVideo");
const heroTop = document.getElementById("heroTop");
const heroReveal = document.getElementById("heroReveal");
const heroSpacerA = document.getElementById("heroSpacerA");
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
  const spacerAHeight = heroSpacerA.offsetHeight;
  const scrollY = window.scrollY;
  const H = window.innerHeight;

  // Phase A — la vidéo ET l'horloge/texte/mots-clés glissent franchement
  // vers le haut et sortent de l'écran ensemble (pas de fondu). Le nom
  // reste fixe en permanence, comme le fond. La citation glisse depuis
  // le BAS DE L'ÉCRAN (pas juste quelques pixels) en apparaissant en
  // fondu, comme un vrai défilement classique qui prend sa place.
  const pA = Math.min(Math.max(scrollY / spacerAHeight, 0), 1);
  heroVideo.style.transform = "translateY(-" + (pA * H) + "px)";
  heroTop.style.transform = "translateY(-" + (pA * H) + "px)";
  heroReveal.style.transform = "translateY(" + (H * (1 - pA)) + "px)";
  heroReveal.style.opacity = String(pA);
  heroReveal.style.pointerEvents = pA >= 1 ? "auto" : "none";

  // Phase B — scroll restant une fois la phase A terminée
  const scrollYB = Math.max(scrollY - spacerAHeight, 0);
  const p = Math.min(Math.max(scrollYB / spacerHeight, 0), 1);

  // Le bloc sombre est ancré en haut par sa position (translateY), toujours
  // calculée sur sa hauteur normale H — jamais décalée. Le débordement sur
  // les vignettes agrandies est obtenu en rendant le bloc plus HAUT (donc son
  // bord bas descend plus bas), pas en le déplaçant : le haut de l'écran
  // reste donc toujours couvert, quel que soit le débordement en cours. Le
  // contenu (nom, vidéo, texte), lui, garde une hauteur fixe H — il ne bouge
  // donc jamais, peu importe le débordement du fond.
  const maxOverlap = 70;
  const overlap = maxOverlap * Math.min(1, (1 - p) / 0.05);
  hero.style.height = (H + overlap) + "px";
  hero.style.transform = "translateY(-" + (p * H) + "px)";
  hero.style.pointerEvents = p >= 1 ? "none" : "auto";

  // H = hauteur du hero (toujours 100% de l'écran) ; S = distance de scroll
  // réservée à la porte de garage. Verrouiller la grille sur le bloc sombre
  // AVANT un certain point précis la forcerait à d'abord descendre : ce point
  // minimum est syncPoint0 = hauteur de la 1ère rangée / hauteur d'écran. On
  // ajoute une marge au-delà de ce minimum pour avoir un vrai mouvement
  // progressif (pas juste immobile-puis-brusque).
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
