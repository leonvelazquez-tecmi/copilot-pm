import { NextRequest, NextResponse } from "next/server";
import { analyzeCharterWithClaude } from "@/lib/api/claudeCharterAnalyzer";
import type { ProjectType, ProjectStage } from "@/components/charter/ProjectContextSelector";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, projectType, projectStage } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Se requiere texto del charter" },
        { status: 400 }
      );
    }

    // Validar que el contexto del proyecto esté presente
    if (!projectType || !projectStage) {
      return NextResponse.json(
        { error: "Missing project context (type or stage). Project context must be selected before analysis." },
        { status: 400 }
      );
    }

    // Validar valores válidos
    if (projectType !== 'strategic' && projectType !== 'operational') {
      return NextResponse.json(
        { error: "Invalid projectType. Must be 'strategic' or 'operational'." },
        { status: 400 }
      );
    }

    if (projectStage !== 'shaping' && projectStage !== 'draft' && projectStage !== 'ready') {
      return NextResponse.json(
        { error: "Invalid projectStage. Must be 'shaping', 'draft', or 'ready'." },
        { status: 400 }
      );
    }

    // Analizar charter con Claude
    const analysis = await analyzeCharterWithClaude(text, projectType as ProjectType, projectStage as ProjectStage);

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

