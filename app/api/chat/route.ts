import { NextRequest, NextResponse } from "next/server";
import { callClaude, ChatMessage } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Se requiere un array de mensajes" },
        { status: 400 }
      );
    }

    // Validar que los mensajes tengan el formato correcto
    const validMessages: ChatMessage[] = messages.map((msg: any) => {
      if (msg.role !== "user" && msg.role !== "assistant") {
        throw new Error("Rol de mensaje inválido");
      }
      if (typeof msg.content !== "string") {
        throw new Error("Contenido de mensaje debe ser string");
      }
      return {
        role: msg.role as "user" | "assistant",
        content: msg.content,
      };
    });

    const content = await callClaude(validMessages);

    return NextResponse.json({
      content,
      role: "assistant",
    });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Error al procesar la solicitud";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

