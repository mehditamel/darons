#!/bin/bash
# ============================================================================
# Darons.app — Configuration des variables Vercel
# ============================================================================
# Usage :
#   1. Remplir les variables ci-dessous avec tes vraies cles
#   2. Executer : bash scripts/setup-vercel-env.sh
# ============================================================================

set -e

# ── REMPLIS TES CLES ICI ──────────────────────────────────────────────────

VERCEL_TOKEN="COLLE_TON_VERCEL_TOKEN_ICI"

# Anthropic (IA Claude) — https://console.anthropic.com/settings/keys
ANTHROPIC_KEY="COLLE_TA_CLE_ANTHROPIC_ICI"

# Resend (emails) — https://resend.com/api-keys
RESEND_KEY="COLLE_TA_CLE_RESEND_ICI"

# Bridge API (Open Banking) — https://bridgeapi.io
BRIDGE_ID="COLLE_TON_BRIDGE_CLIENT_ID_ICI"
BRIDGE_SECRET="COLLE_TON_BRIDGE_CLIENT_SECRET_ICI"

# ── NE PAS MODIFIER CI-DESSOUS ────────────────────────────────────────────

VERCEL_PROJECT="darons"
VERCEL_TEAM=""  # Laisser vide si pas de team, sinon mettre le team slug

# Supabase (deja connu)
SUPABASE_URL="https://wbjksfqxpnnopfunmcxi.supabase.co"
SUPABASE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiamtzZnF4cG5ub3BmdW5tY3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjcyMzUsImV4cCI6MjA4OTUwMzIzNX0.ePSGTMp-l5OJl-G_emuR9JoWWrpsI7Cuya-v-zIVUe4"
SUPABASE_SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiamtzZnF4cG5ub3BmdW5tY3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyNzIzNSwiZXhwIjoyMDg5NTAzMjM1fQ.WnbYk3KQqav7hjfs68HReNqqvXtwWcK3f1FW5JqT9M4"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check token
if [[ "$VERCEL_TOKEN" == "COLLE_TON_VERCEL_TOKEN_ICI" ]]; then
  echo -e "${RED}Erreur : Remplis VERCEL_TOKEN dans le script avant de l'executer${NC}"
  exit 1
fi

# Build team param
TEAM_PARAM=""
if [[ -n "$VERCEL_TEAM" ]]; then
  TEAM_PARAM="&teamId=$VERCEL_TEAM"
fi

# Get project ID
echo -e "${YELLOW}Recherche du projet Vercel...${NC}"
PROJECT_ID=$(curl -s "https://api.vercel.com/v9/projects/$VERCEL_PROJECT?$TEAM_PARAM" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")

if [[ -z "$PROJECT_ID" ]]; then
  echo -e "${RED}Projet '$VERCEL_PROJECT' introuvable. Verifie le nom du projet et ton token.${NC}"
  exit 1
fi
echo -e "${GREEN}  Projet trouve : $PROJECT_ID${NC}"

# Function to add env var
add_env() {
  local key=$1
  local value=$2
  local target=$3  # "production" or "production,preview"

  if [[ "$value" == COLLE_* ]] || [[ -z "$value" ]]; then
    echo -e "${YELLOW}  ⚠ $key — SKIPPED (pas de valeur)${NC}"
    return
  fi

  IFS=',' read -ra targets <<< "$target"
  target_json=$(printf '%s\n' "${targets[@]}" | python3 -c "import json,sys; print(json.dumps([l.strip() for l in sys.stdin.read().splitlines()]))")

  response=$(curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?$TEAM_PARAM" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json; print(json.dumps({'key':'$key','value':'''$value''','type':'encrypted','target':$target_json}))")" 2>&1)

  if echo "$response" | grep -q '"created"'; then
    echo -e "${GREEN}  ✓ $key → $target${NC}"
  elif echo "$response" | grep -q 'already exist'; then
    echo -e "${YELLOW}  ○ $key — deja configure${NC}"
  else
    echo -e "${RED}  ✗ $key — erreur: $(echo $response | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('error',{}).get('message','unknown'))" 2>/dev/null || echo "$response")${NC}"
  fi
}

echo ""
echo -e "${YELLOW}Configuration des variables d'environnement...${NC}"
echo ""

# TIER 1 — Supabase + App
echo -e "${YELLOW}── TIER 1 : Supabase + App ──${NC}"
add_env "NEXT_PUBLIC_SUPABASE_URL"      "$SUPABASE_URL"      "production,preview"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"  "$SUPABASE_ANON"     "production,preview"
add_env "SUPABASE_SERVICE_ROLE_KEY"      "$SUPABASE_SERVICE"  "production"
add_env "NEXT_PUBLIC_APP_URL"            "https://darons.app" "production"
add_env "NEXT_PUBLIC_APP_NAME"           "Darons"             "production,preview"

# TIER 2 — IA + Email
echo ""
echo -e "${YELLOW}── TIER 2 : Anthropic + Resend ──${NC}"
add_env "ANTHROPIC_API_KEY"  "$ANTHROPIC_KEY"  "production"
add_env "RESEND_API_KEY"     "$RESEND_KEY"     "production,preview"

# TIER 3 — Bridge API
echo ""
echo -e "${YELLOW}── TIER 3 : Bridge API (Open Banking) ──${NC}"
add_env "BRIDGE_CLIENT_ID"     "$BRIDGE_ID"                   "production"
add_env "BRIDGE_CLIENT_SECRET" "$BRIDGE_SECRET"               "production"
add_env "BRIDGE_API_URL"       "https://api.bridgeapi.io"     "production,preview"

echo ""
echo -e "${GREEN}Done ! Redeploy le projet pour appliquer les variables :${NC}"
echo -e "${GREEN}  vercel --prod${NC}"
echo -e "${GREEN}  ou : git push (si auto-deploy est actif)${NC}"
