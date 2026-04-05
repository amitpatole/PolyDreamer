#!/bin/bash
# Deploy PolyDreamer web app
set -e

cd "$(dirname "$0")"

echo "Building web app..."
npx expo export --platform web

echo "Fixing permissions for nginx..."
chmod o+x /home/ubuntu
chmod -R o+rX /home/ubuntu/PolyDreamer/dist

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Done! PolyDreamer web app deployed at https://polydreamer.amitinfotech.net"
