# Portfolio — Xite

Site statique (HTML/CSS/JS), aucune dépendance à installer.

## 1. Ajouter tes fichiers
Suis `assets/README-assets.md` pour savoir où placer ta vidéo et tes images.

## 2. Tester en local
Ouvre simplement `index.html` dans ton navigateur (double-clic).

## 3. Mettre en ligne (gratuit)

### Étape A — Créer le dépôt GitHub
1. Sur GitHub, clique sur "New repository".
2. Nomme-le par exemple `portfolio`.
3. Laisse-le public, ne coche aucune option d'initialisation.
4. Depuis ton terminal, dans le dossier du projet :
   ```
   git init
   git add .
   git commit -m "Premier commit du portfolio"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/portfolio.git
   git push -u origin main
   ```

### Étape B — Déployer avec Vercel
1. Va sur vercel.com, connecte-toi avec ton compte GitHub.
2. Clique "Add New Project", sélectionne ton dépôt `portfolio`.
3. Laisse les réglages par défaut (site statique détecté automatiquement).
4. Clique "Deploy". Ton site est en ligne en ~1 minute, avec une URL du type `portfolio-xite.vercel.app`.

À chaque fois que tu pousses un changement sur GitHub (`git push`), le site se met à jour automatiquement.

### Étape C — Nom de domaine personnalisé (optionnel)
Si tu veux un domaine du style `xite.com` :
1. Achète-le chez un registrar (Gandi, Namecheap, ~10-15€/an).
2. Dans Vercel : Project Settings → Domains → ajoute ton domaine.
3. Suis les instructions pour configurer les DNS chez ton registrar.

## Structure du projet
```
index.html       → structure de la page
style.css        → tous les styles
script.js        → interactions (menu mobile, reveal au scroll)
assets/video/    → ta vidéo d'intro
assets/images/   → tes visuels de projets
```

## Ajouter un nouveau projet
Dans `index.html`, duplique un bloc `<article class="project">...</article>`
et adapte le titre, la description, l'image et le `data-tag`.
Alterne les classes `project` et `project project--reverse` pour garder
l'effet zig-zag gauche/droite.
