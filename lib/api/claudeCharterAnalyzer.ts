import Anthropic from "@anthropic-ai/sdk";
import { ValidationResult } from "@/lib/validators/charterValidator";

const CLAUDE_MODEL = "claude-sonnet-4-5";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  section: string;
  issue: string;
  suggestion: string;
}

export interface ClaudeAnalysis {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  redFlags: string[];
}

const SYSTEM_PROMPT = `You are an expert Project Management consultant specializing in PMI standards.

Analyze the following project charter and provide:
1. Overall quality score (0-100)
2. 3-5 key strengths
3. 3-5 key weaknesses
4. 5-8 specific, actionable recommendations (prioritized as high/medium/low)
5. Any critical red flags that could derail the project

Focus on:
- SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound)
- Business case strength and evidence-based justification
- Quality of risk identification and mitigation strategies
- Scope clarity and boundaries
- Stakeholder analysis completeness
- Realistic timeline and budget alignment

Respond ONLY with valid JSON matching this exact structure:
{
  "overallScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "section": "section name",
      "issue": "what's wrong",
      "suggestion": "how to fix it"
    }
  ],
  "redFlags": string[]
}

Do not include any text before or after the JSON. Only return the JSON object.`;

/**
 * Analiza un charter de proyecto usando Claude API
 * @param extractedText Texto extraído del PDF del charter
 * @param structuralValidation Resultado de la validación estructural previa
 * @returns Análisis cualitativo del charter
 */
export async function analyzeCharterWithClaude(
  extractedText: string,
  structuralValidation: ValidationResult
): Promise<ClaudeAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no está configurada");
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error("El texto del charter está vacío");
  }

  try {
    // Construir el prompt del usuario con el texto del charter y validación estructural
    const structuralSummary = `
Validación Estructural:
- Completitud: ${structuralValidation.completeness}%
- Secciones encontradas: ${structuralValidation.sections.filter(s => s.found).length}/${structuralValidation.sections.length}
- Secciones faltantes: ${structuralValidation.missingSections.length > 0 ? structuralValidation.missingSections.join(', ') : 'Ninguna'}
`;

    const userPrompt = `Analiza el siguiente charter de proyecto:

${structuralSummary}

Texto del Charter:
${extractedText}

Proporciona un análisis cualitativo completo en formato JSON.`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000, // Aumentado para evitar truncamiento de JSON
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extraer el texto de la respuesta
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada de Claude API");
    }

    const responseText = content.text.trim();

    // Intentar extraer JSON si está envuelto en markdown code blocks
    // Mejorado: manejar casos donde no hay cierre de markdown (respuesta truncada)
    let jsonText = responseText;
    
    // Remover ```json o ``` del inicio si existe
    if (jsonText.startsWith('```json') || jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '');
    }
    
    // Remover ``` del final si existe
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.replace(/\n?```\s*$/, '');
    }
    
    jsonText = jsonText.trim();

    // Parsear JSON
    let analysis: ClaudeAnalysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      // Verificar si el JSON está truncado (no termina con } o ])
      const trimmedEnd = jsonText.trimEnd();
      const isTruncated = !trimmedEnd.endsWith('}') && !trimmedEnd.endsWith(']');
      
      if (isTruncated) {
        throw new Error("La respuesta de Claude está truncada (límite de tokens alcanzado). Intenta reducir el tamaño del charter o contacta al soporte.");
      }
      
      // Si no está truncado, intentar extraer JSON del texto
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        try {
          analysis = JSON.parse(jsonText);
        } catch (fallbackError) {
          const fallbackErr = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          throw new Error("No se pudo parsear la respuesta JSON de Claude: " + fallbackErr);
        }
      } else {
        throw new Error("No se pudo encontrar JSON válido en la respuesta de Claude");
      }
    }

    // Validar estructura del análisis
    if (typeof analysis.overallScore !== 'number' || analysis.overallScore < 0 || analysis.overallScore > 100) {
      throw new Error("Score inválido en respuesta de Claude");
    }

    if (!Array.isArray(analysis.strengths) || !Array.isArray(analysis.weaknesses) || 
        !Array.isArray(analysis.recommendations) || !Array.isArray(analysis.redFlags)) {
      throw new Error("Estructura inválida en respuesta de Claude");
    }

    // Validar recomendaciones
    for (const rec of analysis.recommendations) {
      if (!['high', 'medium', 'low'].includes(rec.priority)) {
        throw new Error("Prioridad inválida en recomendaciones");
      }
      if (!rec.section || !rec.issue || !rec.suggestion) {
        throw new Error("Recomendación incompleta");
      }
    }

    return analysis;
  } catch (error: unknown) {
    console.error("Error analizando charter con Claude:", error);
    
    if (error instanceof Error) {
      // Re-lanzar errores conocidos
      if (error.message.includes("ANTHROPIC_API_KEY")) {
        throw error;
      }
      if (error.message.includes("parsear") || error.message.includes("JSON")) {
        throw new Error("Error al parsear respuesta de Claude: " + error.message);
      }
    }

    // Errores de API
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      if (status === 429) {
        throw new Error("Límite de tasa excedido. Por favor intenta de nuevo en unos momentos.");
      }
      if (status === 408 || status === 504) {
        throw new Error("Timeout al analizar charter. Por favor intenta de nuevo.");
      }
    }

    throw new Error("Error al analizar charter con Claude. Por favor intenta de nuevo.");
  }
}

