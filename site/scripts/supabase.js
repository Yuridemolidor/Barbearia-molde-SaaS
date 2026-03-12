import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"
import { CONFIG } from "../config/config.js"

export const db = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
)