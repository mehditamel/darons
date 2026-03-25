#!/bin/bash
# ============================================================================
# Darons.app — Script de mise en production
# ============================================================================
# Usage : bash scripts/setup-production.sh
# ============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Darons.app — Setup Production              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Verifier les prerequis ──

echo -e "${YELLOW}[1/6] Verification des prerequis...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}  ✗ Node.js non installe${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node -v)${NC}"

if ! command -v npm &>/dev/null; then
  echo -e "${RED}  ✗ npm non installe${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ npm $(npm -v)${NC}"

if [ ! -f "package.json" ]; then
  echo -e "${RED}  ✗ package.json introuvable. Executez ce script depuis la racine du projet.${NC}"
  exit 1
fi

# ── 2. Verifier .env.local ──

echo ""
echo -e "${YELLOW}[2/6] Verification des variables d'environnement...${NC}"

if [ ! -f ".env.local" ]; then
  echo -e "${RED}  ✗ .env.local introuvable !${NC}"
  echo -e "  → Copier le template : ${BLUE}cp .env.local.template .env.local${NC}"
  echo -e "  → Remplir les credentials puis relancer ce script"
  exit 1
fi

# Variables critiques (TIER 1)
CRITICAL_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

# Variables importantes (TIER 2)
IMPORTANT_VARS=(
  "ANTHROPIC_API_KEY"
  "RESEND_API_KEY"
)

# Variables optionnelles (TIER 3+)
OPTIONAL_VARS=(
  "STRIPE_SECRET_KEY"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "BRIDGE_CLIENT_ID"
  "BRIDGE_CLIENT_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "TWILIO_ACCOUNT_SID"
  "TWILIO_AUTH_TOKEN"
  "TWILIO_PHONE_NUMBER"
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
  "VAPID_PRIVATE_KEY"
)

MISSING_CRITICAL=0
MISSING_IMPORTANT=0
MISSING_OPTIONAL=0

for var in "${CRITICAL_VARS[@]}"; do
  value=$(grep "^${var}=" .env.local 2>/dev/null | cut -d'=' -f2-)
  if [ -z "$value" ] || [[ "$value" == *"..."* ]] || [[ "$value" == *"[votre"* ]]; then
    echo -e "${RED}  ✗ ${var} — MANQUANT (critique)${NC}"
    MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
  else
    echo -e "${GREEN}  ✓ ${var}${NC}"
  fi
done

for var in "${IMPORTANT_VARS[@]}"; do
  value=$(grep "^${var}=" .env.local 2>/dev/null | cut -d'=' -f2-)
  if [ -z "$value" ] || [[ "$value" == *"..."* ]]; then
    echo -e "${YELLOW}  ⚠ ${var} — MANQUANT (important)${NC}"
    MISSING_IMPORTANT=$((MISSING_IMPORTANT + 1))
  else
    echo -e "${GREEN}  ✓ ${var}${NC}"
  fi
done

for var in "${OPTIONAL_VARS[@]}"; do
  value=$(grep "^${var}=" .env.local 2>/dev/null | cut -d'=' -f2-)
  if [ -z "$value" ] || [[ "$value" == *"..."* ]]; then
    echo -e "  ○ ${var} — non configure (optionnel)"
    MISSING_OPTIONAL=$((MISSING_OPTIONAL + 1))
  else
    echo -e "${GREEN}  ✓ ${var}${NC}"
  fi
done

if [ $MISSING_CRITICAL -gt 0 ]; then
  echo ""
  echo -e "${RED}✗ ${MISSING_CRITICAL} variable(s) critique(s) manquante(s). Impossible de continuer.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}  Variables critiques : OK${NC}"
[ $MISSING_IMPORTANT -gt 0 ] && echo -e "${YELLOW}  Variables importantes manquantes : ${MISSING_IMPORTANT} (le site fonctionnera en mode degrade)${NC}"
[ $MISSING_OPTIONAL -gt 0 ] && echo -e "  Variables optionnelles manquantes : ${MISSING_OPTIONAL}"

# ── 3. Installer les dependances ──

echo ""
echo -e "${YELLOW}[3/6] Installation des dependances...${NC}"
npm ci --silent 2>&1 | tail -1
echo -e "${GREEN}  ✓ Dependances installees${NC}"

# ── 4. Type-check ──

echo ""
echo -e "${YELLOW}[4/6] Verification TypeScript...${NC}"
if npx tsc --noEmit 2>&1; then
  echo -e "${GREEN}  ✓ TypeScript OK${NC}"
else
  echo -e "${RED}  ✗ Erreurs TypeScript detectees${NC}"
  exit 1
fi

# ── 5. Build ──

echo ""
echo -e "${YELLOW}[5/6] Build de production...${NC}"
if npm run build 2>&1 | tail -5; then
  echo -e "${GREEN}  ✓ Build OK${NC}"
else
  echo -e "${RED}  ✗ Build echoue${NC}"
  exit 1
fi

# ── 6. Resume ──

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Resume de configuration              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  ✓ Build de production reussi${NC}"
echo ""
echo -e "  Prochaines etapes :"
echo -e "  ${BLUE}1.${NC} Appliquer les migrations Supabase :"
echo -e "     ${BLUE}npx supabase link --project-ref [votre-ref]${NC}"
echo -e "     ${BLUE}npx supabase db push${NC}"
echo ""
echo -e "  ${BLUE}2.${NC} (Optionnel) Injecter les donnees de test :"
echo -e "     Copier le contenu de supabase/seed.sql dans le SQL Editor Supabase"
echo ""
echo -e "  ${BLUE}3.${NC} Configurer Supabase Auth :"
echo -e "     → Authentication > URL Configuration"
echo -e "     → Site URL : https://darons.app"
echo -e "     → Redirect URLs : https://darons.app/auth/callback"
echo ""
echo -e "  ${BLUE}4.${NC} Deployer sur Vercel :"
echo -e "     ${BLUE}vercel --prod${NC}"
echo -e "     Ou : push sur la branche main (auto-deploy)"
echo ""
echo -e "  ${BLUE}5.${NC} Verifier le health check :"
echo -e "     ${BLUE}curl https://darons.app/api/health/status${NC}"
echo ""
echo -e "${GREEN}Done ! 🎉${NC}"
