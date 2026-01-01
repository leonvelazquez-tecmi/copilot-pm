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
  
- ✅ **Feature 3**: Charter Structure Validator (Completado)
  - Validador basado en keywords para 8 secciones PMI estándar
  - Cálculo de completitud global (0-100%)
  - Cálculo de confianza por sección (high/medium/low)
  - Componente ValidationResultsCard con UI completa
  
- ✅ **Feature 4**: Integración Claude para Análisis Cualitativo (Completado)
  - Análisis cualitativo profundo con Claude API
  - Evaluación de: objetivos SMART, business case, riesgos, scope, stakeholders, timeline/budget
  - Score general (0-100), fortalezas, debilidades, recomendaciones priorizadas, red flags
  - Componente ClaudeAnalysisCard con UI completa
  - Integración automática después de validación estructural

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

- **Componente Validation Results**: `components/charter/ValidationResultsCard.tsx`
  - Tipo: Client Component
  - Funcionalidades: Muestra resultados de validación estructural (completitud, secciones encontradas/faltantes, sugerencias)

- **Componente Claude Analysis**: `components/charter/ClaudeAnalysisCard.tsx`
  - Tipo: Client Component
  - Funcionalidades: Muestra análisis cualitativo de Claude (score, fortalezas, debilidades, recomendaciones priorizadas, red flags)

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
- `components/PDFUploadCard.tsx` - Componente para upload y validación de PDFs (integra Features 2, 3 y 4)
- `components/intake/IntakeFlowPlaceholder.tsx` - Placeholder para el flujo de intake/creación de proyectos
- `components/charter/ValidationResultsCard.tsx` - Componente para mostrar validación estructural (Feature 3)
- `components/charter/ClaudeAnalysisCard.tsx` - Componente para mostrar análisis cualitativo de Claude (Feature 4)
- `lib/validators/charterValidator.ts` - Validador de estructura basado en keywords (Feature 3)
- `lib/api/claudeCharterAnalyzer.ts` - Analizador de charters usando Claude API (Feature 4)
- `app/api/analyze-charter/route.ts` - Endpoint POST `/api/analyze-charter` para análisis cualitativo (Feature 4)
- `scripts/clean-dev.js` - Script para limpiar procesos antes de iniciar servidor
- `components/ui/` - Componentes Shadcn/UI (tabs, card, button, progress, badge)

### Flujo de datos

#### Release 1: Chat
1. Usuario escribe mensaje → `app/page.tsx` (componente `Home`)
2. `handleSend()` → POST a `/api/chat`
3. `app/api/chat/route.ts` → `callClaude()` desde `lib/anthropic.ts`
4. `lib/anthropic.ts` → API de Anthropic
5. Respuesta → UI actualizada con mensaje del asistente

#### Release 2: PDF Processing y Análisis
1. Usuario selecciona PDF → `components/PDFUploadCard.tsx`
2. Validación (tipo, tamaño) → Extracción automática
3. `handleExtractText()` → POST a `/api/pdf/extract`
4. `app/api/pdf/extract/route.ts` → pdfjs-dist extrae texto
5. Validación estructural → `validateCharterStructure()` (Feature 3)
6. `ValidationResultsCard` muestra completitud y secciones
7. Análisis Claude → POST a `/api/analyze-charter` (Feature 4)
8. `app/api/analyze-charter/route.ts` → `analyzeCharterWithClaude()` 
9. `ClaudeAnalysisCard` muestra score, fortalezas, debilidades, recomendaciones y red flags
10. Texto extraído disponible (colapsable)

## Estado de Release 2

**Todas las Features planificadas están completadas:**

- ✅ Feature 1: PDF Upload Component + Tab Navigation
- ✅ Feature 2: PDF Text Extraction
- ✅ Feature 3: Charter Structure Validator (validación basada en keywords)
- ✅ Feature 4: Integración Claude para Análisis Cualitativo

**Flujo completo funcional:**
1. Usuario sube PDF en tab "Mejorar"
2. Extracción automática de texto
3. Validación estructural instantánea (Feature 3) - muestra completitud y secciones encontradas/faltantes
4. Análisis cualitativo automático con Claude (Feature 4) - muestra score, fortalezas, debilidades, recomendaciones priorizadas y red flags
5. Ambos análisis se muestran simultáneamente en la UI

## Release 2 - Completado ✅

Todas las Features planificadas están implementadas y funcionales:
- Feature 1: PDF Upload Component + Tab Navigation ✅
- Feature 2: PDF Text Extraction ✅
- Feature 3: Charter Structure Validator ✅
- Feature 4: Integración Claude para Análisis Cualitativo ✅

## Próximos pasos (Release 3)

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

### PDF Processing
- **pdfjs-dist**: Usamos el build legacy (`pdfjs-dist/legacy/build/pdf.mjs`) para compatibilidad con Node.js
- **GlobalWorkerOptions**: Configurado con ruta `file://` completa al worker file
- **DOMMatrix Polyfills**: Necesarios para pdfjs-dist en entorno Node.js

### Claude API Integration
- **Modelo**: `claude-sonnet-4-5` (mismo que Release 1)
- **Max tokens análisis**: 4000 (aumentado de 2000 para evitar truncamiento de JSON)
- **System prompt**: Especializado en estándares PMI y análisis de charters
- **Parsing JSON**: Manejo robusto de markdown code blocks y detección de truncamiento
- **Manejo de errores**: Rate limits (429), timeouts (408, 504), JSON malformado

### Validación Estructural (Feature 3)
- **Enfoque**: Keyword-based (sin NLP externo)
- **Secciones PMI**: 8 secciones estándar detectadas por keywords en español e inglés
- **Confianza**: High (3+ keywords), Medium (1-2 keywords), Low (0 keywords)
- **Completitud**: Cálculo basado en secciones encontradas vs total

### Análisis Cualitativo (Feature 4)
- **Enfoque**: Análisis profundo con Claude API
- **Evalúa**: Objetivos SMART, business case, riesgos, scope, stakeholders, timeline/budget
- **Output**: Score (0-100), fortalezas, debilidades, recomendaciones priorizadas, red flags
- **Integración**: Automática después de validación estructural

### Otros
- **Script de limpieza**: `scripts/clean-dev.js` elimina procesos bloqueantes antes de iniciar servidor
