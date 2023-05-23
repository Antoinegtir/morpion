#!/bin/bash
echo "Lancement de l'interface"
open http://localhost:3000

echo "Lancement du serveur Express..."
cd server
npm install
nodemon

exit 0
