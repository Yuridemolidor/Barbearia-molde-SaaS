import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CONFIG } from "../config/config.js"

let db = null;

async function initDb() {
  try {
    db = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    );

    console.log("✅ SUPABASE INICIALIZADO COM SUCESSO");
    return db;
  } catch (error) {
    console.error("❌ ERRO AO INICIALIZAR SUPABASE:", error);
    throw error;
  }
}

export { initDb }
export const getDb = () => db
