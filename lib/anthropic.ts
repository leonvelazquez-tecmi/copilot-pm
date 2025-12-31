import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callClaude(messages: ChatMessage[]): Promise<string> {
  const systemPrompt =
    "Eres un experto en gestión de proyectos a nivel estratégico para una institución de educación superior. Tu rol es guiar conversacionalmente a líderes a pensar con rigor sobre sus proyectos, ayudándoles a identificar objetivos claros, recursos necesarios, riesgos potenciales y estrategias de implementación efectivas.";

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
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
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}
