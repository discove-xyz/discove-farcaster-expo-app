#!/bin/bash

npx supabase gen types typescript --project-id "lrxatsjkmnaqkaawdlas" --schema public > packages/util/supabase-types.ts
