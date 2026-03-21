import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CONFIG } from '../config/config.js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const message = document.getElementById('registerMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const barbeariaNome = document.getElementById('barbeariaNome').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;

        if (password.length < 6) {
            message.textContent = 'Senha deve ter pelo menos 6 caracteres';
            message.style.color = '#ff4444';
            return;
        }

        message.textContent = 'Criando conta...';
        message.style.color = 'var(--gold)';

        try {
            // 1. Criar usuário
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.toLowerCase().trim(),
                password,
                options: {
                    data: {
                        role: 'barber',
                        barbearia_nome: barbeariaNome
                    }
                }
            });

            if (authError) throw authError;

            const user = authData.user;

            if (!user) throw new Error('Falha ao criar usuário');

            // 2. Criar barbearia
            const barbershopData = {
                id: `barb-${user.id.slice(0,8)}-${Date.now()}`,
                nome: barbeariaNome,
                email: email,
                telefone: telefone || null,
                endereco: endereco || null,
                owner_id: user.id,
                created_at: new Date().toISOString()
            };

            const { error: shopError } = await supabase
                .from('barbershops')
                .insert(barbershopData);

            if (shopError) {
                console.warn('Barbearia não criada:', shopError);
            }

            message.innerHTML = `✅ Barbearia "${barbeariaNome}" cadastrada!<br>Confirme email e faça login.`;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            form.reset();

        } catch (error) {
            console.error('Erro cadastro:', error);
            message.textContent = error.message || 'Erro ao criar conta. Tente novamente.';
            message.style.color = '#ff4444';
        }
    });
});

window.openWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá, quero cadastrar minha barbearia!');
};

