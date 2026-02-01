@echo off
setlocal enabledelayedexpansion

echo Lancement de npm start...
start cmd /k "npm start"

echo Lancement de npm run dev...
start cmd /k "npm run dev -- --host 0.0.0.0 --port 5000"

echo Attente du demarrage du serveur...
timeout /t 5 /nobreak >nul

REM Cherche une IP privee "reelle" et ignore 192.168.56.x (souvent VirtualBox)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set tmp=%%a
    set tmp=!tmp: =!

    REM ignorer la carte virtuelle (VirtualBox)
    echo !tmp! | findstr /r "^192\.168\.56\." >nul
    if !errorlevel! == 0 (
        REM ignore
    ) else (
        REM accepter 192.168.x.x
        echo !tmp! | findstr /r "^192\.168\." >nul
        if !errorlevel! == 0 (
            set ip=!tmp!
            goto :found
        )

        REM accepter 10.x.x.x
        echo !tmp! | findstr /r "^10\." >nul
        if !errorlevel! == 0 (
            set ip=!tmp!
            goto :found
        )

        REM accepter 172.16.x.x -> 172.31.x.x
        echo !tmp! | findstr /r "^172\.(1[6-9]|2[0-9]|3[0-1])\." >nul
        if !errorlevel! == 0 (
            set ip=!tmp!
            goto :found
        )
    )
)

:found
if not defined ip (
    echo ERREUR: Aucune IP reseau valide detectee !
    echo Verifie ta connexion Wi-Fi/Ethernet.
    pause
    exit /b 1
)

echo Ouverture du navigateur sur http://%ip%:5000
start http://%ip%:5000/

exit
