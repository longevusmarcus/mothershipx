#!/bin/bash

# Delete test user from Supabase Auth
# Usage: ./scripts/delete-test-user.sh [email]

EMAIL="${1:-tornikeonoprishvili@gmail.com}"

# Load password from .env
source .env 2>/dev/null || true
DB_PASSWORD="${SECRET_SUPABASE_DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: SECRET_SUPABASE_DB_PASSWORD not found in .env"
  exit 1
fi

echo "Deleting user: $EMAIL"

PGPASSWORD="$DB_PASSWORD" psql "postgresql://postgres@db.bbkhiwrgqilaokowhtxg.supabase.co:5432/postgres" \
  -c "DELETE FROM auth.users WHERE email = '$EMAIL';"

echo "Done."
