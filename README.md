# Higher / Lower Streak

MVP mobile-first d'un jeu de comparaison **Higher / Lower**.

## Boucle de jeu
- Une comparaison apparaît.
- Le joueur choisit l'élément ayant la valeur la plus élevée.
- Bonne réponse : la série augmente.
- Mauvaise réponse : fin de partie.
- Le record est sauvegardé localement.
- Chaque question peut être signalée depuis l'interface.

## Contenu
- **240 comparaisons** générées depuis `src/data/questions.js`.
- Banque équilibrée entre plusieurs catégories : géographie, sciences, animaux et technologie.
- Les données sont séparées du moteur de jeu pour pouvoir être corrigées facilement.
- Les valeurs susceptibles d'évoluer ou d'être discutées doivent être revérifiées avant publication Store.

## Lancer le jeu
```bash
npm install
npm run dev
```

## Build web
```bash
npm run build
```

## Android / Capacitor
```bash
npm install
npm run android:add
npm run android:sync
npm run android:open
```

Puis générer l'AAB signé depuis Android Studio.

## Signalement
Le bouton *Signaler cette question* utilise le partage natif du téléphone avec :
- ID de la question ;
- catégorie ;
- valeurs comparées ;
- réponse annoncée.

Sur navigateur sans partage natif, le signalement est copié dans le presse-papiers.

## Scope volontaire
Pas de compte, pas de backend, pas de publicité, pas de boutique, pas de leaderboard.
L'objectif de cette version est la **publication d'un premier jeu**.
