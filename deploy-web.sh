#!/bin/bash
# Deploy PolyDreamer web app
# Builds the Expo web app and reloads nginx
set -e

cd "."

echo "Building web app..."
npx expo export --platform web

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Done! PolyDreamer web app deployed at https://polydreamer.amitinfotech.net"
