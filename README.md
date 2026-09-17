# Whichly

**Whichly 1.0.0** est un jeu mobile de comparaison édité sous le nom **Nibylo Games**.

## Boucle de jeu
- Deux éléments apparaissent avec un critère de comparaison variable.
- Le joueur choisit la bonne réponse.
- Bonne réponse : la série augmente.
- Mauvaise réponse : fin de partie.
- Le record et les statistiques sont sauvegardés localement.
- Chaque question peut être signalée avec un motif précis.

Les critères ne se limitent pas à « plus grand » : une question peut demander ce qui est plus récent, plus éloigné, plus rapide, plus ancien, plus profond, etc.

## Identité de publication
- Éditeur public : **Nibylo Games**
- Nom de l'application : **Whichly**
- Version : **1.0.0**
- Android/iOS app ID : `com.nibylogames.whichly`
- Adresse de contact actuelle : `nibylogames@gmail.com`

## Contenu
La banque de questions est générée depuis `src/data/questions.js` et répartie entre de nombreuses catégories. Le moteur évite les répétitions trop rapprochées de catégories et d'entités et équilibre les réponses gauche/droite.

Les données susceptibles d'évoluer ou d'être discutées doivent être revérifiées avant publication Store.

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

## Publicité
Whichly est préparé pour utiliser des publicités interstitielles AdMob via `@capacitor-community/admob`.

Cadence prévue :
- aucune pub sur les deux premières défaites d'une session ;
- ensuite une tentative d'interstitielle toutes les 3 défaites ;
- minimum 3 minutes entre deux pubs ;
- aucune pub pendant une question ;
- aucune pub lors d'un abandon manuel.

Les IDs AdMob réels ne sont pas stockés dans le dépôt. Voir `.env.example`.

## Signalement
Le joueur peut choisir un motif : réponse incorrecte, formulation, orthographe, contenu inapproprié/offensant/déplacé ou autre, avec un commentaire facultatif.

## Scope 1.0.0
Pas de compte, pas de backend, pas de boutique, pas de leaderboard. L'objectif reste un premier jeu simple, propre et publiable.
