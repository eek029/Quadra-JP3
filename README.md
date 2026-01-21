# Quadra-JP3

Sistema completo de reserva de quadras esportivas desenvolvido com Next.js 14, TypeScript, Tailwind CSS e Supabase.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização utilitária
- **shadcn/ui** - Componentes UI acessíveis
- **Supabase** - Backend (Auth + Database)
- **Vercel** - Deployment

## 🎨 Design System

O projeto utiliza um tema consistente com gradiente roxo (#667eea → #764ba2) aplicado em todas as páginas, desde autenticação até dashboard.

### Cores Principais

- Roxo Claro: `#667eea`
- Roxo Escuro: `#764ba2`
- Gradiente: `linear-gradient(135deg, #667eea, #764ba2)`

## 📁 Estrutura de Rotas

### Autenticação
- `/login` - Login com email/senha + OAuth (Google/Apple)
- `/signup` - Cadastro de novos usuários

### Aplicação (Protegida)
- `/dashboard` - Visão geral e estatísticas
- `/reservas/nova` - Criar nova reserva
- `/reservas/minhas` - Minhas reservas (próximas/passadas/canceladas)
- `/calendario` - Calendário semanal com disponibilidade
- `/regras` - Regras e políticas de uso
- `/perfil` - Perfil do usuário
- `/admin` - Painel administrativo (em construção)

## 🛠️ Setup do Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas credenciais do Supabase
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Lint do código
npm run lint
```

O app estará disponível em [http://localhost:3000](http://localhost:3000)

## 🗄️ Supabase

### Configuração

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais (URL e Anon Key)
3. Configure no arquivo `.env.local`

### Schema do Banco (Futuro)

Utilize o MCP da Supabase para gerar:
- Tabelas (users, courts, reservations, etc.)
- RLS (Row Level Security)
- Migrations

## 🚀 Deploy na Vercel

1. Faça push do código para GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente (Supabase)
4. Deploy automático!

### Variáveis de Ambiente Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📋 Funcionalidades Implementadas

✅ Estrutura de rotas completa
✅ Design system com gradiente roxo
✅ Componentes base (AppShell, Logo, Cards, etc.)
✅ Páginas de autenticação (login/signup)
✅ Dashboard com estatísticas
✅ Formulário de nova reserva
✅ Listagem de reservas
✅ Calendário semanal
✅ Página de regras
✅ Página de perfil
✅ Página admin (placeholder)
✅ Middleware para proteção de rotas
✅ Supabase client/server helpers
✅ Responsive design
✅ Glassmorphism effects
✅ Animações e transições

## 🔜 Próximos Passos

- [ ] Integração completa com Supabase Auth
- [ ] Schema do banco de dados com MCP
- [ ] Row Level Security (RLS)
- [ ] Funcionalidade real de reservas
- [ ] Notificações
- [ ] Painel administrativo funcional
- [ ] Testes automatizados

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🎨 Componentes

### shadcn/ui Instalados
- Button
- Input
- Card
- Avatar
- Dropdown Menu
- Separator
- Dialog

### Componentes Customizados
- AppShell (Header + Navigation)
- Logo
- Modal (com glassmorphism)

## 📞 Contato

- Telegram: [https://t.me/eek029](https://t.me/eek029)
- X (Twitter): [https://x.com/eek029](https://x.com/eek029)

---

© 2026 Quadra-JP3. Todos os direitos reservados.
