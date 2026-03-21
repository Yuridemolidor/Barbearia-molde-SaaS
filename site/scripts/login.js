import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CONFIG } from '../config/config.js';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const message = document.getElementById('loginMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        message.textContent = 'Entrando...';
        message.style.color = 'var(--gold)';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password
            });

            if (error) throw error;

            localStorage.setItem('barberSession', JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
                expires: Date.now() + 24*60*60*1000
            }));
            window.location.href = 'admin.html#barbeiro';

        } catch (error) {
            console.error(error);
            message.textContent = error.message || 'Erro no login';
            message.style.color = '#ff4444';
        }
    });
});

window.forgotPassword = () => {
    const email = document.getElementById('email').value;
    if (email) {
        alert('Link enviado para ' + email);
    }
};

if (localStorage.getItem('barberSession')) {
    window.location.href = 'login.html#barbeiro';
}
