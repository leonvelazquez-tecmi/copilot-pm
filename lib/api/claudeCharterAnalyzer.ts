import Anthropic from "@anthropic-ai/sdk";
import type { ProjectType, ProjectStage } from "@/components/charter/ProjectContextSelector";

const CLAUDE_MODEL = "claude-sonnet-4-5";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  section: string;
  issue: string;
  suggestion: string;
}

export interface SectionAnalysis {
  name: string;
  found: boolean;
  confidence: 'high' | 'medium' | 'low';
  completeness?: number; // 0-100% para esta sección
}

export interface ClaudeAnalysis {
  overallScore: number; // 0-100
  overallCompleteness: number; // 0-100%
  sections: SectionAnalysis[];
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  redFlags: string[];
  projectType: ProjectType;
  projectStage: ProjectStage;
}

function getProjectTypeDescription(type: ProjectType): string {
  if (type === 'strategic') {
    return `STRATEGIC (Innovation/Exploration):
- Purpose: Innovate, explore, transform organizational culture
- Uncertainty: High (hypothesis to validate)
- Success Criteria: Qualitative + quantified by phase (Deseabilidad/Factibilidad/Viabilidad)
- Business Case: Primarily intangible (future value)
- Timeline: Flexible by stages
- Key Validations: Hypothesis clarity, Innovation Phase, Strategic Alignment, Transition to Operation`;
  } else {
    return `OPERATIONAL (Improvement/Optimization):
- Purpose: Optimize processes, improve efficiency, reduce costs
- Uncertainty: Low (problem is known)
- Success Criteria: 100% quantified from the start (SMART)
- Business Case: Quantified (ROI, savings, payback period)
- Timeline: Fixed, committed
- Key Validations: Quantified Problem, Business Case with ROI, Concrete Milestones, Operational Owner`;
  }
}

function getProjectStageDescription(stage: ProjectStage): string {
  if (stage === 'shaping') {
    return `SHAPING (0-30% complete):
- Status: Exploring the idea, defining the problem
- What's Expected: Hypothesis (Strategic) or Problem Statement (Operational), basic scope boundaries
- What's NOT Expected: Detailed budget, all roles assigned, firm dates, transition plan
- Feedback Tone: Constructive coaching, focus on clarifying assumptions`;
  } else if (stage === 'draft') {
    return `DRAFT (30-60% complete):
- Status: Designing the solution, estimating resources, forming team
- What's Expected: Most sections defined, preliminary estimates, core team identified
- What's NOT Expected: Final approval-ready details, complete transition plan
- Feedback Tone: Refinement-focused, identify gaps that need closure before approval`;
  } else {
    return `READY (60-90% complete):
- Status: Ready for committee approval
- What's Expected: ALL sections complete, budget defined, team assigned, dates confirmed
- What's NOT Expected: Any TBD or "to be determined" items
- Feedback Tone: Rigorous audit, flag any blockers to approval`;
  }
}

function getStrategicValidationGuidelines(stage: ProjectStage): string {
  const baseGuidelines = `
STRATEGIC PROJECT VALIDATION GUIDELINES:

1. **Core Hypothesis (CRITICAL for all stages):**
   - Must be explicit, specific, and verifiable
   - Format: "Creemos que [X] resultará en [Y]"
   - NOT generic statements like "This will improve things"

2. **Innovation Phase (CRITICAL for all stages):**
   - Must explicitly state: Deseabilidad / Factibilidad / Viabilidad
   - Success criteria must align with current phase
   
3. **Strategic Alignment (HIGH for all stages):**
   - Must reference specific OKR 2030 or annual strategic priority
   - NOT just "aligns with strategy" (too vague)

4. **Explicit Scope (HIGH for all stages):**
   - Must have min 3 items "Dentro del Alcance"
   - Must have min 2 items "Fuera del Alcance"
   - Boundaries must be crystal clear`;

  if (stage === 'shaping') {
    return baseGuidelines + `

SHAPING STAGE ADJUSTMENTS:
- Budget can be "rough order of magnitude" (±30% accuracy OK)
- Roles can have some TBD (but min 2 roles must be named)
- Transition to operation can be preliminary (not detailed)
- Dates can be estimates (not firm commitments)

DO NOT flag as critical: Missing detailed budget, incomplete team, vague timeline
DO flag as critical: Missing hypothesis, missing innovation phase, no scope boundaries`;
  } else if (stage === 'draft') {
    return baseGuidelines + `

DRAFT STAGE ADJUSTMENTS:
- Budget should be ±15% accuracy
- Most roles should be assigned (max 1-2 TBD acceptable)
- Transition to operation should have clear ownership
- Key dates should be realistic estimates

DO NOT flag as critical: Minor gaps in team, preliminary transition plan
DO flag as critical: Weak hypothesis, missing innovation phase, unclear who owns post-project`;
  } else {
    return baseGuidelines + `

READY STAGE - APPROVAL READY:
- Budget must be precise (±5% accuracy)
- ALL roles must be assigned (zero TBD)
- Transition to operation must be complete with named operational owner
- Dates must be firm commitments
- Success criteria must be 100% quantified and verifiable

Flag as CRITICAL: Any TBD items, vague success criteria, missing operational transition`;
  }
}

function getOperationalValidationGuidelines(stage: ProjectStage): string {
  const baseGuidelines = `
OPERATIONAL PROJECT VALIDATION GUIDELINES:

1. **Quantified Problem (CRITICAL for all stages):**
   - Current State → Desired State with metrics
   - Example: "Admissions takes 21 days → Target 5 days = 16 days improvement"
   - NOT vague: "Improve admissions process"

2. **Business Case with ROI (CRITICAL for all stages):**
   - Investment cost + Expected benefit/savings
   - ROI % or Payback period
   - Example: "$85K investment → $330K annual benefit = 288% ROI, 3-month payback"

3. **Concrete Milestones (HIGH for Draft/Ready):**
   - Dates must be DD/MM/YYYY format
   - Minimum 3 milestones with sequential logic

4. **Operational Owner (CRITICAL for Draft/Ready):**
   - Specific person/area who sustains this after project closes
   - NOT "TBD" or "To be determined"`;

  if (stage === 'shaping') {
    return baseGuidelines + `

SHAPING STAGE ADJUSTMENTS:
- Budget can be rough estimate (±20% OK)
- Milestones can be preliminary (month/quarter OK)
- Operational owner can be area (not specific person yet)

DO NOT flag as critical: Rough budget estimates, preliminary timeline
DO flag as critical: Missing quantified problem, no business case, vague success criteria`;
  } else if (stage === 'draft') {
    return baseGuidelines + `

DRAFT STAGE ADJUSTMENTS:
- Budget should be ±10% accuracy
- Milestones should have month/week estimates
- Operational owner should be identified (specific person preferred)

DO NOT flag as critical: Minor timeline adjustments
DO flag as critical: Incomplete business case, missing operational owner, weak problem statement`;
  } else {
    return baseGuidelines + `

READY STAGE - APPROVAL READY:
- Budget must be precise
- Milestones must have DD/MM/YYYY dates
- Operational owner must be named specifically
- ALL roles assigned (zero TBD)
- Success criteria must be verifiable

Flag as CRITICAL: Any missing quantification, any TBD items, vague closure criteria`;
  }
}

function generateSystemPrompt(projectType: ProjectType, projectStage: ProjectStage): string {
  return `You are an expert Project Management consultant specializing in PMI standards and Tecmilenio's institutional context.

PROJECT CONTEXT:
- Type: ${projectType.toUpperCase()}
${getProjectTypeDescription(projectType)}

- Stage: ${projectStage.toUpperCase()}
${getProjectStageDescription(projectStage)}

PMI STANDARD SECTIONS (detect and evaluate these 8 sections):
1. Información Básica del Proyecto
2. Propósito y Justificación
3. Objetivos y Criterios de Éxito
4. Requisitos de Alto Nivel
5. Supuestos y Riesgos
6. Presupuesto y Recursos
7. Interesados
8. Autorización

VALIDATION FRAMEWORK:
${projectType === 'strategic' 
  ? getStrategicValidationGuidelines(projectStage)
  : getOperationalValidationGuidelines(projectStage)}

ANALYSIS INSTRUCTIONS:
1. DETECT SECTIONS: For each of the 8 PMI sections above, determine:
   - Is the section present in the charter? (found: true/false)
   - Confidence level: "high" (clearly present with good content), "medium" (present but incomplete), "low" (minimal or missing)
   - Completeness percentage (0-100%) for each section found
   
2. CALCULATE OVERALL COMPLETENESS:
   - Consider which sections are required for the current project stage
   - Calculate percentage: (sections found and complete) / (sections required for stage) * 100
   - For ${projectStage}: ${projectStage === 'shaping' ? 'basic sections (1-4) are critical' : projectStage === 'draft' ? 'most sections (1-7) are expected' : 'ALL sections (1-8) are required'}
   
3. QUALITATIVE ANALYSIS:
   - Analyze the charter against the validation guidelines above
   - Adjust feedback severity based on project stage
   - Identify 3-5 strengths (what's done well)
   - Identify 3-5 weaknesses (what needs improvement)
   - Provide 5-8 specific, actionable recommendations (one per problematic section)
   - Flag critical red flags (blockers to approval)

RESPONSE FORMAT (JSON only, no markdown):
{
  "overallScore": <number 0-100>,
  "overallCompleteness": <number 0-100>,
  "sections": [
    {
      "name": "<exact PMI section name from list above>",
      "found": <boolean>,
      "confidence": "high" | "medium" | "low",
      "completeness": <number 0-100, optional, only if found=true>
    }
  ],
  "strengths": [<array of 3-5 strings>],
  "weaknesses": [<array of 3-5 strings>],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "section": "<exact PMI section name>",
      "issue": "<specific problem>",
      "suggestion": "<actionable fix>"
    }
  ],
  "redFlags": [<array of critical blockers>]
}

CRITICAL: 
- Return ONLY valid JSON. No preamble, no markdown backticks, no explanations.
- Include ALL 8 sections in the "sections" array, even if not found (set found: false, confidence: "low").
- Use exact PMI section names as listed above.`;
}

/**
 * Analiza un charter de proyecto usando Claude API
 * @param extractedText Texto extraído del PDF del charter
 * @param projectType Tipo de proyecto (strategic | operational)
 * @param projectStage Etapa del proyecto (shaping | draft | ready)
 * @returns Análisis completo del charter incluyendo detección de secciones
 */
export async function analyzeCharterWithClaude(
  extractedText: string,
  projectType: ProjectType,
  projectStage: ProjectStage
): Promise<ClaudeAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no está configurada");
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error("El texto del charter está vacío");
  }

  if (!projectType || !projectStage) {
    throw new Error("Project context (type and stage) is required for analysis");
  }

  try {
    // Generar system prompt dinámico basado en contexto
    const systemPrompt = generateSystemPrompt(projectType, projectStage);

    // Construir el prompt del usuario con el texto del charter
    const userPrompt = `Analyze this project charter and provide a complete analysis:

${extractedText}

Provide your analysis in JSON format following the specified structure, including section detection, completeness calculation, qualitative analysis, and recommendations.`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000, // Aumentado para evitar truncamiento de JSON
      system: systemPrompt,
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

    if (typeof analysis.overallCompleteness !== 'number' || analysis.overallCompleteness < 0 || analysis.overallCompleteness > 100) {
      throw new Error("OverallCompleteness inválido en respuesta de Claude");
    }

    if (!Array.isArray(analysis.sections)) {
      throw new Error("Sections debe ser un array en respuesta de Claude");
    }

    // Validar secciones (debe tener las 8 secciones PMI)
    const requiredSections = [
      'Información Básica del Proyecto',
      'Propósito y Justificación',
      'Objetivos y Criterios de Éxito',
      'Requisitos de Alto Nivel',
      'Supuestos y Riesgos',
      'Presupuesto y Recursos',
      'Interesados',
      'Autorización'
    ];

    // Asegurar que todas las secciones estén presentes (llenar faltantes si es necesario)
    const sectionsMap = new Map(analysis.sections.map((s: any) => [s.name, s]));
    const completeSections = requiredSections.map(sectionName => {
      const section = sectionsMap.get(sectionName);
      if (section) {
        return {
          name: sectionName,
          found: section.found === true,
          confidence: section.confidence || 'low',
          completeness: section.completeness
        };
      }
      return {
        name: sectionName,
        found: false,
        confidence: 'low' as const
      };
    });

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

    // Construir respuesta completa con campos requeridos
    const completeAnalysis: ClaudeAnalysis = {
      overallScore: analysis.overallScore,
      overallCompleteness: analysis.overallCompleteness,
      sections: completeSections,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      redFlags: analysis.redFlags,
      projectType,
      projectStage
    };

    return completeAnalysis;
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
      if (error.message.includes("Project context")) {
        throw error;
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
