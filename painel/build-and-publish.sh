#!/usr/bin/env bash
#
# Builda o painel Angular (produção) e publica dentro de laravel/public/painel,
# que é servido em https://api.xpond.com.br/painel.
#
# Uso: cd painel && ./build-and-publish.sh
#
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Instalando dependências"
npm ci

echo "==> Build de produção (baseHref /painel/)"
npx ng build --configuration production

echo "==> Publicando em laravel/public/painel"
rm -rf ../laravel/public/painel
mkdir -p ../laravel/public/painel
cp -r dist/painel/browser/* ../laravel/public/painel/

echo "==> Pronto. Commite laravel/public/painel e dê git pull no servidor."
