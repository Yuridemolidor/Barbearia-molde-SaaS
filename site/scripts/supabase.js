import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CONFIG } from "../config/config.js"

export const db = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
)