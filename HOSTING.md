# Guide d'Hébergement - Quiz Live

Ce document explique comment héberger votre application de quiz en ligne.

## 1. Préparation des Fichiers

L'application est composée d'un frontend (React/Vite) et d'un serveur backend (Node.js/Socket.io).

### Construction du Frontend
Avant de déployer, vous devez compiler le frontend :
```bash
npm run build
```
Cela génère un dossier `dist/` que le serveur Express servira.

## 2. Options d'Hébergement

### Option A : Hébergement Tout-en-un (Recommandé)
Services comme **Render**, **Railway**, ou **Heroku**.

1. Connectez votre dépôt GitHub.
2. Configurez la commande de démarrage : `npm start`
3. Configurez la variable d'environnement `PORT` (le service la fournira généralement automatiquement).
4. **Important** : Comme l'application utilise `quiz.json` pour stocker les données, utilisez un service qui supporte les "Persistent Volumes" (Volumes persistants) si vous voulez garder vos quiz après un redémarrage du serveur.
   - Sur Render, montez un disque sur `/opt/render/project/src/data` et réglez `QUIZ_DB_PATH=/opt/render/project/src/data/quiz.json`.

### Option B : Séparation Frontend/Backend
- Frontend sur **Vercel** ou **Netlify**.
- Backend sur **Render** ou **Railway**.

Si vous séparez les deux, vous devez configurer la variable d'environnement suivante sur le frontend (Vercel/Netlify) :
- `VITE_SOCKET_URL`: L'URL complète de votre serveur backend (ex: `https://mon-backend-quiz.onrender.com`).

## 3. Variables d'Environnement

| Variable | Description | Par défaut |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute du serveur | `3000` |
| `QUIZ_DB_PATH` | Chemin vers le fichier JSON de la base de données | `./quiz.json` |
| `VITE_SOCKET_URL` | (Frontend) URL du backend si différent de l'origine | `window.location.origin` |

## 4. Points d'attention
- **Stockage Persistant** : Sans volume persistant, vos modifications de quiz ou nouvelles sessions seront perdues à chaque déploiement ou redémarrage du serveur.
- **Websockets** : Assurez-vous que votre hébergeur supporte les WebSockets (Socket.io).
