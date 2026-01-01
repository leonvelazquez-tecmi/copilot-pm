# PROGRESS.md

## Estado actual del MVP

### Release 1 (Completado)
- ✅ Chat UI funcional en Next.js
- ✅ API endpoint /api/chat conectado a Claude (Anthropic)
- ✅ Autenticación con ANTHROPIC_API_KEY
- ✅ Desplegado en Vercel: https://copilot-pm.vercel.app

### Release 2 - En progreso
- ✅ **Feature 1**: PDF Upload Component + Tab Navigation (Completado)
  - Componente PDFUploadCard con validación de archivos
  - Navegación por tabs (Chat Libre / Crear Proyecto / Mejorar)
  - Integración con Shadcn/UI
  
- ✅ **Feature 2**: PDF Text Extraction (Completado)
  - Endpoint `/api/pdf/extract` para extraer texto de PDFs
  - Implementación con pdfjs-dist (legacy build)
  - Extracción automática después de subir archivo
  - Preview del texto extraído en UI
  
- ⚠️ **Feature 3**: [Por definir - Ver nota para arquitecto]
  
- ⏳ **Feature 4**: Integración con Claude para validar PDF (Pendiente)
  - Enviar texto extraído a Claude para validación
  - Generar feedback y sugerencias de mejoras

## Stack técnico

- **Frontend**: Next.js 16.1.1 (Turbopack) con TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: API Routes en Next.js
- **LLM**: Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-5`)
- **PDF Processing**: pdfjs-dist 5.4.530 (legacy build)
- **Hosting**: Vercel (frontend)

## Estructura del Proyecto

### Componentes principales

- **Componente de Chat**: `app/page.tsx`
  - Componente: `Home` (default export)
  - Tipo: Client Component (`"use client"`)
  - Funcionalidades: UI de chat, gestión de mensajes, envío a API, tab navigation

- **Componente PDF Upload**: `components/PDFUploadCard.tsx`
  - Tipo: Client Component (`"use client"`)
  - Funcionalidades: Upload de PDF, validación (tipo, tamaño), extracción automática de texto, preview del texto extraído

- **Componente Intake Flow Placeholder**: `components/intake/IntakeFlowPlaceholder.tsx`
  - Tipo: Component (default export)
  - Funcionalidades: Placeholder para el flujo de creación de proyectos (Release 2 - pendiente de implementación)

### Archivos clave

#### Release 1
- `app/page.tsx` - Componente principal de chat UI
- `app/api/chat/route.ts` - Endpoint POST `/api/chat` que conecta con Claude
- `lib/anthropic.ts` - Helper para llamadas a Anthropic API
  - Función: `callClaude(messages: ChatMessage[])`
  - Modelo: `claude-sonnet-4-5` (constante `CLAUDE_MODEL`)
- `app/layout.tsx` - Layout raíz de la aplicación

#### Release 2
- `app/api/pdf/extract/route.ts` - Endpoint POST `/api/pdf/extract` para extraer texto de PDFs
  - Usa pdfjs-dist/legacy/build/pdf.mjs
  - Requiere Uint8Array (no Buffer)
  - Configura GlobalWorkerOptions con ruta file://
  - Polyfills para DOMMatrix (Node.js)
- `components/PDFUploadCard.tsx` - Componente para upload y validación de PDFs
- `components/intake/IntakeFlowPlaceholder.tsx` - Placeholder para el flujo de intake/creación de proyectos
- `scripts/clean-dev.js` - Script para limpiar procesos antes de iniciar servidor
- `components/ui/` - Componentes Shadcn/UI (tabs, card, button)

### Flujo de datos

#### Release 1: Chat
1. Usuario escribe mensaje → `app/page.tsx` (componente `Home`)
2. `handleSend()` → POST a `/api/chat`
3. `app/api/chat/route.ts` → `callClaude()` desde `lib/anthropic.ts`
4. `lib/anthropic.ts` → API de Anthropic
5. Respuesta → UI actualizada con mensaje del asistente

#### Release 2: PDF Processing
1. Usuario selecciona PDF → `components/PDFUploadCard.tsx`
2. Validación (tipo, tamaño) → Extracción automática
3. `handleExtractText()` → POST a `/api/pdf/extract`
4. `app/api/pdf/extract/route.ts` → pdfjs-dist extrae texto
5. Texto extraído → UI muestra preview
6. (Feature 4): Botón "Validate & Get Feedback" → Enviar a Claude

## Nota para el Arquitecto

**Feature 3 no está definido en el plan actual.**

Hemos completado:
- Feature 1: PDF Upload Component + Tab Navigation ✅
- Feature 2: PDF Text Extraction ✅

El siguiente paso lógico sería Feature 4 (Integración con Claude para validar PDF), pero no hay un Feature 3 definido. 

**Pregunta**: ¿Hay algún Feature 3 que deba implementarse antes de Feature 4? Por ejemplo:
- Procesamiento adicional del texto extraído
- Almacenamiento temporal del PDF/texto
- Validaciones adicionales
- O podemos proceder directamente a Feature 4?

## Próximos pasos (Release 2 - Pendientes)

- [ ] **Feature 3**: [Por definir]
- [ ] **Feature 4**: Integración con Claude para validar PDF
  - Endpoint para enviar texto extraído a Claude
  - System prompt específico para validación de charters
  - UI para mostrar feedback y sugerencias

## Release 3 (Futuro)

- [ ] Persistencia de conversación (base de datos)
- [ ] Autenticación de usuarios
- [ ] Historial de chats
- [ ] Mejoras en prompt PM

## URLs importantes

- **GitHub**: https://github.com/leonvelazquez-tecmi/copilot-pm
- **Vercel**: https://copilot-pm.vercel.app
- **Anthropic**: https://console.anthropic.com

## Comandos útiles

- `npm run dev` (desarrollo local - ahora limpia procesos automáticamente)
- `npm run build` (build de producción)
- `git push origin main` (desplegar a Vercel)

## Notas técnicas

- **pdfjs-dist**: Usamos el build legacy (`pdfjs-dist/legacy/build/pdf.mjs`) para compatibilidad con Node.js
- **GlobalWorkerOptions**: Configurado con ruta `file://` completa al worker file
- **DOMMatrix Polyfills**: Necesarios para pdfjs-dist en entorno Node.js
- **Script de limpieza**: `scripts/clean-dev.js` elimina procesos bloqueantes antes de iniciar servidor
