#!/bin/bash

# Delete test users from Supabase Auth
# Usage: ./scripts/delete-test-user.sh [email1] [email2] ...
# If no emails provided, uses default test emails

# Load password from .env
source .env 2>/dev/null || true
DB_PASSWORD="${SECRET_SUPABASE_DB_PASSWORD}"
DB_HOST="db.bbkhiwrgqilaokowhtxg.supabase.co"

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: SECRET_SUPABASE_DB_PASSWORD not found in .env"
  exit 1
fi

# Use provided emails or defaults
if [ $# -gt 0 ]; then
  EMAILS=("$@")
else
  EMAILS=(
    "tornikeonoprishvili@gmail.com"
  )
fi

echo "Deleting test users..."

for EMAIL in "${EMAILS[@]}"; do
  echo "Deleting user: $EMAIL"
  PGPASSWORD="$DB_PASSWORD" psql "postgresql://postgres@${DB_HOST}:5432/postgres" \
    -c "DELETE FROM auth.users WHERE email = '$EMAIL';" 2>&1
done

echo "Done."
