@echo off

echo Lancement de npm start...
start cmd /k "npm start"

echo Lancement de npm run dev...
start cmd /k "npm run dev -- --host 0.0.0.0 --port 5000"

echo Attente du demarrage du serveur...
timeout /t 5 /nobreak >nul

echo Ouverture du navigateur sur http://localhost:5000
start http://localhost:5000/

exit
