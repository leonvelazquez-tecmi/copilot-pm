import Anthropic from "@anthropic-ai/sdk";

// Configuración del modelo Claude (alias dinámico de Anthropic)
const CLAUDE_MODEL = "claude-sonnet-4-5";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callClaude(messages: ChatMessage[]): Promise<string> {
  const systemPrompt =
    "Eres un experto en gestión de proyectos a nivel estratégico para una institución de educación superior. Tu rol es guiar conversacionalmente a líderes a pensar con rigor sobre sus proyectos, ayudándoles a identificar objetivos claros, recursos necesarios, riesgos potenciales y estrategias de implementación efectivas.";

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no está configurada");
  }

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Claude API returns content as an array, we need to extract the text
    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Respuesta inesperada de Claude API");
  } catch (error: any) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}
