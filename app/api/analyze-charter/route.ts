import { NextRequest, NextResponse } from "next/server";
import { analyzeCharterWithClaude } from "@/lib/api/claudeCharterAnalyzer";
import { ValidationResult } from "@/lib/validators/charterValidator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, structuralValidation } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Se requiere texto del charter" },
        { status: 400 }
      );
    }

    if (!structuralValidation) {
      return NextResponse.json(
        { error: "Se requiere validación estructural" },
        { status: 400 }
      );
    }

    // Validar estructura de ValidationResult
    const validation = structuralValidation as ValidationResult;
    if (typeof validation.completeness !== 'number' || !Array.isArray(validation.sections)) {
      return NextResponse.json(
        { error: "Validación estructural inválida" },
        { status: 400 }
      );
    }

    // Analizar charter con Claude
    const analysis = await analyzeCharterWithClaude(text, validation);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error en /api/analyze-charter:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al analizar charter";
    
    // Determinar código de estado apropiado
    let status = 500;
    if (errorMessage.includes("ANTHROPIC_API_KEY")) {
      status = 500;
    } else if (errorMessage.includes("Límite de tasa") || errorMessage.includes("rate limit")) {
      status = 429;
    } else if (errorMessage.includes("Timeout") || errorMessage.includes("timeout")) {
      status = 408;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

