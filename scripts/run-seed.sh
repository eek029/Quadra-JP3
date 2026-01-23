#!/bin/bash
set -a
source .env.local
set +a
export ENABLE_TEST_USER=true
npx tsx scripts/seed-test-user.ts
