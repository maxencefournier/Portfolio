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
   HERO — phase A (palier intro/citation) puis phase B (porte de garage)
   Phase A n'est plus liée au scroll continu : un simple geste de scroll
   déclenche une animation automatique complète (fond + nom immobiles,
   vidéo/texte sortent, citation entre), et le scroll de la page reste
   bloqué pendant cette animation puis au palier atteint — comme un
   "checkpoint" forcé. Un second geste de scroll débloque la page et
   lance la phase B (porte de garage), qui reste scroll-continu comme
   avant. La position de repos native de la grille (avant tout scroll)
   est calculée pour que le bas de la première rangée touche exactement
   le bas de l'écran. Une fois le scroll commencé, la grille se déplace
   plus lentement que le bloc sombre au début, puis accélère
   progressivement pour se resynchroniser en position ET en vitesse
   pile au moment où le bloc sombre finit de remonter.
============================ */
const body = document.getElementById("body");
const hero = document.getElementById("hero");
const heroVideo = document.getElementById("heroVideo");
const heroTop = document.getElementById("heroTop");
const heroReveal = document.getElementById("heroReveal");
const mosaicEl = document.getElementById("projets");
const mosaicFirstRow = document.getElementById("mosaicFirstRow");
const heroSpacer = document.getElementById("heroSpacer");

let spacerHeight = heroSpacer.offsetHeight;
let heroPhase = 0; // 0 = repos (vidéo visible), 1 = palier (citation visible), 2 = scroll libre
let hasLeftTopSinceUnlock = false;
let isAnimatingPhaseA = false;
const PHASE_A_DURATION = 900; // doit correspondre à la durée des transitions CSS

function showQuote() {
  const H = window.innerHeight;
  heroVideo.style.transform = "translateY(-" + H + "px)";
  heroTop.style.transform = "translateY(-" + H + "px)";
  heroReveal.style.transform = "translateY(0px)";
  heroReveal.style.opacity = "1";
  heroReveal.style.pointerEvents = "auto";
}

function showIntro() {
  heroVideo.style.transform = "translateY(0px)";
  heroTop.style.transform = "translateY(0px)";
  heroReveal.style.transform = "translateY(" + window.innerHeight + "px)";
  heroReveal.style.opacity = "0";
  heroReveal.style.pointerEvents = "none";
}

function unlockScroll() {
  heroPhase = 2;
  hasLeftTopSinceUnlock = false;
  body.classList.remove("scroll-locked");
  window.removeEventListener("wheel", onHeroWheel);
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchmove", onTouchMove);
}

function onHeroWheel(e) {
  if (heroPhase === 2) return;
  e.preventDefault();
  if (isAnimatingPhaseA) return;

  if (e.deltaY > 0) {
    if (heroPhase === 0) {
      heroPhase = 1;
      isAnimatingPhaseA = true;
      showQuote();
      setTimeout(() => { isAnimatingPhaseA = false; }, PHASE_A_DURATION);
    } else if (heroPhase === 1) {
      unlockScroll();
    }
  } else if (e.deltaY < 0) {
    if (heroPhase === 1) {
      heroPhase = 0;
      isAnimatingPhaseA = true;
      showIntro();
      setTimeout(() => { isAnimatingPhaseA = false; }, PHASE_A_DURATION);
    }
  }
}

let touchStartY = 0;

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchMove(e) {
  if (heroPhase === 2) return;
  e.preventDefault();
  if (isAnimatingPhaseA) return;

  const deltaY = touchStartY - e.touches[0].clientY;
  if (Math.abs(deltaY) < 20) return; // seuil minimal pour éviter les micro-gestes

  if (deltaY > 0) {
    if (heroPhase === 0) {
      heroPhase = 1;
      isAnimatingPhaseA = true;
      showQuote();
      setTimeout(() => { isAnimatingPhaseA = false; }, PHASE_A_DURATION);
    } else if (heroPhase === 1) {
      unlockScroll();
    }
  } else if (deltaY < 0) {
    if (heroPhase === 1) {
      heroPhase = 0;
      isAnimatingPhaseA = true;
      showIntro();
      setTimeout(() => { isAnimatingPhaseA = false; }, PHASE_A_DURATION);
    }
  }
}

window.addEventListener("wheel", onHeroWheel, { passive: false });
window.addEventListener("touchstart", onTouchStart, { passive: true });
window.addEventListener("touchmove", onTouchMove, { passive: false });

function updateSpacerHeight() {
  const rowHeight = mosaicFirstRow.offsetHeight;
  const target = window.innerHeight - rowHeight;
  spacerHeight = Math.max(target, 0);
  heroSpacer.style.height = spacerHeight + "px";
}

function updateHero() {
  const scrollY = window.scrollY;
  const H = window.innerHeight;

  // Phase B — scroll continu, actif uniquement une fois le palier A débloqué
  // (scrollY reste à 0 tant que le scroll est bloqué, donc p reste à 0 sans
  // effet indésirable pendant les phases 0/1).
  const p = Math.min(Math.max(scrollY / spacerHeight, 0), 1);

  // Si on remonte tout en haut alors qu'on était en scroll libre (phase B),
  // on revient au palier "citation" et on reverrouille le scroll — sinon,
  // le bloc sombre redeviendrait plein écran en cachant la vidéo tout en
  // gardant la citation affichée par-dessus, donnant l'impression d'être
  // bloqué sur le texte sans pouvoir revenir à la vidéo. On ne fait ça que
  // si on a réellement quitté le haut de page depuis le déblocage (sinon
  // ça re-verrouillerait instantanément, juste après avoir débloqué,
  // empêchant tout scroll vers la grille).
  if (heroPhase === 2 && scrollY > 0) {
    hasLeftTopSinceUnlock = true;
  }
  if (heroPhase === 2 && hasLeftTopSinceUnlock && scrollY <= 0) {
    heroPhase = 1;
    hasLeftTopSinceUnlock = false;
    body.classList.add("scroll-locked");
    window.addEventListener("wheel", onHeroWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
  }

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
heroReveal.style.transition = "none";
showIntro();
requestAnimationFrame(() => { heroReveal.style.transition = ""; });

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


