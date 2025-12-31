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

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:13',message:'callClaude entry',data:{messagesCount:messages.length,hasApiKey:!!process.env.ANTHROPIC_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:19',message:'Model name before API call',data:{modelName:CLAUDE_MODEL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const requestPayload = {
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:28',message:'Request payload before API call',data:{model:requestPayload.model,maxTokens:requestPayload.max_tokens,messagesCount:requestPayload.messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const response = await client.messages.create(requestPayload);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:35',message:'API response received',data:{contentLength:response.content?.length,firstContentType:response.content?.[0]?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Claude API returns content as an array, we need to extract the text
    const content = response.content[0];
    if (content.type === "text") {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:41',message:'Successfully extracted text',data:{textLength:content.text?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return content.text;
    }

    throw new Error("Respuesta inesperada de Claude API");
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c0fd9e8e-2928-484b-a63e-33c0c1b6c9a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/anthropic.ts:48',message:'Error caught',data:{errorStatus:error?.status,errorMessage:error?.message,errorType:error?.error?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Error calling Claude API:", error);
    throw error;
  }
}
