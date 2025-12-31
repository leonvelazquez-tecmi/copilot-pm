# PROGRESS.md

## Estado actual del MVP

- ✅ Chat UI funcional en Next.js
- ✅ API endpoint /api/chat conectado a Claude (Anthropic)
- ✅ Autenticación con ANTHROPIC_API_KEY
- ✅ Desplegado en Vercel: https://copilot-pm.vercel.app

## Stack técnico

- **Frontend**: Next.js 16+ con TypeScript, Tailwind, Shadcn/UI
- **Backend**: API Route en Next.js
- **LLM**: Anthropic Claude 3.5 Sonnet
- **Hosting**: Vercel (frontend)

## Estructura del Proyecto

### Componentes principales

- **Componente de Chat**: `app/page.tsx`
  - Componente: `Home` (default export)
  - Tipo: Client Component (`"use client"`)
  - Funcionalidades: UI de chat, gestión de mensajes, envío a API

### Archivos clave

- `app/page.tsx` - Componente principal de chat UI
- `app/api/chat/route.ts` - Endpoint POST `/api/chat` que conecta con Claude
- `lib/anthropic.ts` - Helper para llamadas a Anthropic API
  - Función: `callClaude(messages: ChatMessage[])`
  - Modelo: `claude-sonnet-4-5` (constante `CLAUDE_MODEL`)
- `app/layout.tsx` - Layout raíz de la aplicación

### Flujo de datos

1. Usuario escribe mensaje → `app/page.tsx` (componente `Home`)
2. `handleSend()` → POST a `/api/chat`
3. `app/api/chat/route.ts` → `callClaude()` desde `lib/anthropic.ts`
4. `lib/anthropic.ts` → API de Anthropic
5. Respuesta → UI actualizada con mensaje del asistente

## Próximos pasos (Release 2)

- [ ] Persistencia de conversación (base de datos)
- [ ] Autenticación de usuarios
- [ ] Historial de chats
- [ ] Mejoras en prompt PM

## URLs importantes

- **GitHub**: https://github.com/leonvelazquez-tecmi/copilot-pm
- **Vercel**: https://copilot-pm.vercel.app
- **Anthropic**: https://console.anthropic.com

## Comandos útiles

- `npm run dev` (desarrollo local)
- `git push origin main` (desplegar)

