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
const clockElLocked = document.getElementById("heroClockTimeLocked");

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (clockEl) clockEl.textContent = time;
  if (clockElLocked) clockElLocked.textContent = time;
}
updateClock();
setInterval(updateClock, 10000);

/* ============================
   HERO — trois paliers, chacun déclenché par un simple geste de scroll
   (pas de scroll continu proportionnel) : le scroll de la page reste
   bloqué pendant l'animation puis au palier atteint, comme un
   "checkpoint" forcé.
   0 : vidéo + nom.
   1 : vidéo/infos sortent vers le haut, citation entrante, nom immobile.
   2 : le bloc sombre entier se réduit à une bande fixe en haut de l'écran
       (horloge + liens en fondu), le nom remonte juste assez pour sortir
       de cette bande — puis reste "verrouillé" ainsi jusqu'en bas du
       site, pendant que la grille défile normalement dessous. Un retour
       en haut de la grille rejoue tout en sens inverse.
============================ */
const body = document.getElementById("body");
const hero = document.getElementById("hero");
const heroVideo = document.getElementById("heroVideo");
const heroTop = document.getElementById("heroTop");
const heroReveal = document.getElementById("heroReveal");
const heroSpacer = document.getElementById("heroSpacer");

let heroPhase = 0; // 0 = repos, 1 = citation, 2 = verrouillé (grille)
let isAnimating = false;
const TRANSITION_DURATION = 900; // doit correspondre à la durée des transitions CSS

function getLockedBarHeight() {
  return Math.max(56, window.innerWidth * 0.033);
}

function updateSpacerHeight() {
  // Une fois verrouillé, le bloc sombre reste fixed (hauteur nulle dans le
  // flux) : le spacer réserve donc en permanence 2x la hauteur de la bande
  // — une fois pour la bande elle-même, une fois pour l'espace visible
  // avant la grille (demandé égal à la hauteur de la bande).
  heroSpacer.style.height = getLockedBarHeight() * 2 + "px";
}

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

function lockHero() {
  hero.classList.add("hero--locked");
  // La citation doit disparaître comme un élément collé au fond sombre —
  // pas juste s'effacer sur place (son "top: 32%" recalculé sur la
  // hauteur qui rétrécit ne suffit pas : le nom, qui remonte lui aussi,
  // finit par la croiser visuellement). On la fait donc sortir par le
  // haut d'un plein écran, en même temps que le fond se réduit, pour
  // qu'elle reste toujours au-dessus du nom pendant toute la transition.
  heroReveal.style.transform = "translateY(-" + window.innerHeight + "px)";
  heroReveal.style.opacity = "0";
}

function unlockHero() {
  hero.classList.remove("hero--locked");
  showQuote();
}

function goToLocked() {
  isAnimating = true;
  lockHero();
  setTimeout(() => {
    heroPhase = 2;
    isAnimating = false;
    body.classList.remove("scroll-locked");
    window.removeEventListener("wheel", onHeroWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    // Depuis la grille, c'est un geste "vers le haut" au tout début du
    // scroll (pas un retour au flux natif) qui redéclenche l'animation
    // inverse — voir onGridWheel/onGridTouchMove.
    window.addEventListener("wheel", onGridWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onGridTouchMove, { passive: false });
  }, TRANSITION_DURATION);
}

function backToQuote() {
  isAnimating = true;
  window.removeEventListener("wheel", onGridWheel);
  window.removeEventListener("touchmove", onGridTouchMove);
  unlockHero();
  body.classList.add("scroll-locked");
  setTimeout(() => {
    heroPhase = 1;
    isAnimating = false;
    window.addEventListener("wheel", onHeroWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
  }, TRANSITION_DURATION);
}

function onHeroWheel(e) {
  e.preventDefault();
  if (isAnimating) return;

  if (e.deltaY > 0) {
    if (heroPhase === 0) {
      heroPhase = 1;
      isAnimating = true;
      showQuote();
      setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
    } else if (heroPhase === 1) {
      goToLocked();
    }
  } else if (e.deltaY < 0) {
    if (heroPhase === 1) {
      heroPhase = 0;
      isAnimating = true;
      showIntro();
      setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
    }
  }
}

let touchStartY = 0;

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchMove(e) {
  e.preventDefault();
  if (isAnimating) return;

  const deltaY = touchStartY - e.touches[0].clientY;
  if (Math.abs(deltaY) < 20) return; // seuil minimal pour éviter les micro-gestes

  if (deltaY > 0) {
    if (heroPhase === 0) {
      heroPhase = 1;
      isAnimating = true;
      showQuote();
      setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
    } else if (heroPhase === 1) {
      goToLocked();
    }
  } else if (deltaY < 0) {
    if (heroPhase === 1) {
      heroPhase = 0;
      isAnimating = true;
      showIntro();
      setTimeout(() => { isAnimating = false; }, TRANSITION_DURATION);
    }
  }
}

// Dans la grille (phase 2), tant qu'on est encore tout en haut de la page,
// un geste "vers le haut" (molette ou swipe) redéclenche directement
// l'animation inverse — sans avoir besoin de scroller vers le bas d'abord
// pour "débloquer" le retour.
function onGridWheel(e) {
  if (isAnimating || window.scrollY > 0 || e.deltaY >= 0) return;
  e.preventDefault();
  backToQuote();
}

function onGridTouchMove(e) {
  if (isAnimating || window.scrollY > 0) return;
  const deltaY = touchStartY - e.touches[0].clientY;
  if (deltaY >= -20) return; // seuil minimal, symétrique à onTouchMove
  e.preventDefault();
  backToQuote();
}

window.addEventListener("wheel", onHeroWheel, { passive: false });
window.addEventListener("touchstart", onTouchStart, { passive: true });
window.addEventListener("touchmove", onTouchMove, { passive: false });

updateSpacerHeight();
heroReveal.style.transition = "none";
showIntro();
requestAnimationFrame(() => { heroReveal.style.transition = ""; });

window.addEventListener("resize", updateSpacerHeight);

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

