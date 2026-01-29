#!/bin/bash

# Local development script - runs all services needed for full local testing
# Usage: ./scripts/dev-local.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load Stripe key from env file
STRIPE_KEY=$(grep STRIPE_SECRET_KEY supabase/.env.local | cut -d'=' -f2)

if [ -z "$STRIPE_KEY" ]; then
    echo -e "${RED}Error: STRIPE_SECRET_KEY not found in supabase/.env.local${NC}"
    exit 1
fi

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $SUPABASE_PID $FUNCTIONS_PID $STRIPE_PID $FRONTEND_PID 2>/dev/null || true
    wait 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
}

trap cleanup EXIT INT TERM

# Create log directory
mkdir -p .dev-logs

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Local Development Stack${NC}"
echo -e "${BLUE}========================================${NC}"

# Step 1: Check if Supabase is running
echo -e "\n${YELLOW}[1/4] Checking Supabase...${NC}"
if ! supabase status >/dev/null 2>&1; then
    echo -e "${YELLOW}Starting Supabase (this may take a moment)...${NC}"
    supabase start
fi
echo -e "${GREEN}✓ Supabase is running${NC}"

# Step 2: Start Edge Functions
echo -e "\n${YELLOW}[2/4] Starting Edge Functions...${NC}"
supabase functions serve --env-file supabase/.env.local > .dev-logs/functions.log 2>&1 &
FUNCTIONS_PID=$!
sleep 2
if ps -p $FUNCTIONS_PID > /dev/null; then
    echo -e "${GREEN}✓ Edge Functions running (PID: $FUNCTIONS_PID)${NC}"
else
    echo -e "${RED}✗ Edge Functions failed to start. Check .dev-logs/functions.log${NC}"
    exit 1
fi

# Step 3: Start Stripe webhook forwarding
echo -e "\n${YELLOW}[3/4] Starting Stripe webhook forwarding...${NC}"
stripe listen \
    --api-key "$STRIPE_KEY" \
    --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook \
    > .dev-logs/stripe.log 2>&1 &
STRIPE_PID=$!
sleep 3
if ps -p $STRIPE_PID > /dev/null; then
    echo -e "${GREEN}✓ Stripe webhooks forwarding (PID: $STRIPE_PID)${NC}"
    # Extract webhook secret from log and auto-update env file
    WH_SECRET=$(grep -o 'whsec_[a-zA-Z0-9]*' .dev-logs/stripe.log | head -1)
    if [ -n "$WH_SECRET" ]; then
        echo -e "${YELLOW}  Webhook secret: $WH_SECRET${NC}"
        # Auto-update the env file
        if grep -q "STRIPE_WEBHOOK_SECRET=" supabase/.env.local; then
            sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WH_SECRET|" supabase/.env.local
            echo -e "${GREEN}  ✓ Auto-updated STRIPE_WEBHOOK_SECRET in supabase/.env.local${NC}"
        else
            echo "STRIPE_WEBHOOK_SECRET=$WH_SECRET" >> supabase/.env.local
            echo -e "${GREEN}  ✓ Added STRIPE_WEBHOOK_SECRET to supabase/.env.local${NC}"
        fi
        # Restart functions to pick up new webhook secret
        echo -e "${YELLOW}  Restarting Edge Functions to pick up webhook secret...${NC}"
        kill $FUNCTIONS_PID 2>/dev/null || true
        sleep 1
        supabase functions serve --env-file supabase/.env.local > .dev-logs/functions.log 2>&1 &
        FUNCTIONS_PID=$!
        sleep 2
        if ps -p $FUNCTIONS_PID > /dev/null; then
            echo -e "${GREEN}  ✓ Edge Functions restarted (PID: $FUNCTIONS_PID)${NC}"
        fi
    fi
else
    echo -e "${RED}✗ Stripe forwarding failed. Check .dev-logs/stripe.log${NC}"
    exit 1
fi

# Step 4: Start Frontend
echo -e "\n${YELLOW}[4/4] Starting Frontend...${NC}"
# Copy test env to .env.local for frontend
cp .env.test .env.local 2>/dev/null || true
npm run dev > .dev-logs/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}✗ Frontend failed to start. Check .dev-logs/frontend.log${NC}"
    exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "  ${GREEN}Frontend:${NC}        http://localhost:8080"
echo -e "  ${GREEN}Supabase Studio:${NC} http://127.0.0.1:54323"
echo -e "  ${GREEN}Edge Functions:${NC}  http://127.0.0.1:54321/functions/v1/"
echo -e ""
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "    tail -f .dev-logs/functions.log"
echo -e "    tail -f .dev-logs/stripe.log"
echo -e "    tail -f .dev-logs/frontend.log"
echo -e ""
echo -e "  ${YELLOW}Test card:${NC} 4242 4242 4242 4242"
echo -e ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo -e "${BLUE}========================================${NC}"

# Wait for any process to exit
wait
