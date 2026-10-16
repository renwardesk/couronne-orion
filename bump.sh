#!/bin/sh
# Passe à la version suivante : à lancer avant chaque mise à jour publiée.
cd "$(dirname "$0")"
V=$(($(sed 's/[^0-9]//g' version.json)+1))
echo "{\"v\":\"$V\"}" > version.json
sed -i "s/const APP_VERSION='[0-9]*';/const APP_VERSION='$V';/" index.html
sed -i "s/const CACHE='orion-v[0-9]*';/const CACHE='orion-v$V';/" sw.js
echo "version $V"
