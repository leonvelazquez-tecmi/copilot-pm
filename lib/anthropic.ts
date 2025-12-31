import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callReplicate(messages: ChatMessage[]): Promise<string> {
  const systemPrompt =
    "Eres un experto en gestión de proyectos a nivel estratégico para una institución de educación superior. Tu rol es guiar conversacionalmente a líderes a pensar con rigor sobre sus proyectos, ayudándoles a identificar objetivos claros, recursos necesarios, riesgos potenciales y estrategias de implementación efectivas.";

  try {
    // Construir el prompt con system prompt y historial de conversación
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`)
      .join("\n\n");
    
    const prompt = `${systemPrompt}\n\n${conversationHistory}\n\nAsistente:`;

    const output = await replicate.run("meta/llama-2-7b-chat", {
      input: {
        prompt: prompt,
        max_length: 1024,
      },
    });

    // Replicate puede devolver un array o string, necesitamos extraer el texto
    if (Array.isArray(output)) {
      return output.join("");
    }
    return String(output);
  } catch (error) {
    console.error("Error calling Replicate API:", error);
    throw error;
  }
}

// Exportar como callClaude para mantener compatibilidad con route.ts
export const callClaude = callReplicate;
