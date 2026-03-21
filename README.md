# 🚀 Barbearia SaaS - Plataforma Completa R$297/mês

## ✨ **Demo ao vivo**
```
Local: http://localhost:8080
Deploy: vercel.com → R$97/mês x 100 clientes = R$9.700/mês
```

## 📱 **Funcionalidades**

### **👨‍💼 Painel Barbeiro**
```
✅ Login Supabase (email/senha)
✅ Cadastro multi-tenant (cada barbeiro = 1 tenant)
✅ Tabela agendamentos protegida
✅ WhatsApp fallback
✅ Logout auto-expire 24h
```

### **💼 Admin Completo** (senha: modelo123)
```
✅ CRUD serviços/preços
✅ Calendário + horários
✅ Bloqueio dias
✅ Galeria fotos (Supabase Storage)
✅ Dashboard stats
```

### **👥 Cliente** 
```
✅ Agendamento sem login
✅ Calendário real-time (horários livres)
✅ WhatsApp direto
✅ Galeria + serviços
```

## 🛠 **Tech Stack**
```
Frontend: Vanilla JS/ESM + CSS Glassmorphism
Backend: Supabase (Auth + DB + Storage)
Deploy: Vercel/Netlify (0 custo)
SaaS: Multi-tenant + RLS ready
```

## ⚡ **Setup 2min** (1 Supabase = INFINITOS barbeiros)

```
1. git clone [repo]
2. Supabase Dashboard:
   - Novo projeto 
   - Copie URL + anon key → site/config/config.js
   
3. SQL Editor (OBRIGATÓRIO):
   - RLS_FIX.sql (1º) → Add barbershop_id columns
   - RLS_SETUP.sql (2º) → Policies + trigger

4. Local: npx http-server . -p 8080
```

**SQL ordem**:
```
1. RLS_FIX.sql (colunas)
2. RLS_SETUP.sql (policies)
```


## 💰 **Monetização R$297**
```
Modelo: 1 barbearia = R$97/mês
Features pagas:
[ ] Stripe checkout
[ ] Email onboarding
[ ] Custom domain
[ ] WhatsApp Business API
```

## 🚀 **Deploy Vercel**
```
vercel --prod
→ https://barbearia-saas.vercel.app
→ +Stripe = FATURANDO
```

## 📊 **Escala**
```
100 clientes = R$9.700/mês
1.000 clientes = R$97k/mês (zero servidor)
```

## 🔧 **Roadmap V2**
```
[ ] Stripe + assinaturas
[ ] Mobile PWA
[ ] Analytics + relatórios
[ ] White-label
[ ] API parceiros
```

**⭐ Star + Deploy = FATURAMENTO**

