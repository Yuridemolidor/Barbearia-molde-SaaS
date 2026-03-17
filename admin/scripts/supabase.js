import { CONFIG } from "../config/config.js"

let db = null;

// Esperar a biblioteca estar disponível globalmente
async function initDb() {
  try {
    // Aguardar até 3 segundos pela biblioteca Supabase estar disponível
    let tentativas = 0;
    while (!window.supabase && tentativas < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tentativas++;
    }

    if (!window.supabase) {
      throw new Error("Biblioteca Supabase não carregou");
    }

    const { createClient } = window.supabase;

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
