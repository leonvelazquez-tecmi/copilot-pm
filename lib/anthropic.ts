export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callOllama(messages: ChatMessage[]): Promise<string> {
  const systemPrompt =
    "Eres un experto en gestión de proyectos a nivel estratégico para una institución de educación superior. Tu rol es guiar conversacionalmente a líderes a pensar con rigor sobre sus proyectos, ayudándoles a identificar objetivos claros, recursos necesarios, riesgos potenciales y estrategias de implementación efectivas.";

  try {
    // Construir el prompt con system prompt y historial de conversación
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`)
      .join("\n\n");
    
    const prompt = `${systemPrompt}\n\n${conversationHistory}\n\nAsistente:`;

    const response = await fetch("https://copilot-pm-production.up.railway.app/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en Ollama API: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    throw error;
  }
}

// Exportar como callClaude para mantener compatibilidad con route.ts
export const callClaude = callOllama;
