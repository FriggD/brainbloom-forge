import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "generate-flashcards" | "summarize-notes" | "suggest-keywords";
  text: string;
  count?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, count = 5 }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let tools: any[] = [];
    let toolChoice: any = undefined;

    if (action === "generate-flashcards") {
      systemPrompt = `Você é um assistente educacional especializado em criar flashcards de estudo. 
Analise o texto fornecido e crie flashcards com perguntas no "front" e respostas no "back".
As perguntas devem testar conceitos importantes do texto.
As respostas devem ser concisas mas completas.
Crie exatamente ${count} flashcards.`;
      
      tools = [{
        type: "function",
        function: {
          name: "create_flashcards",
          description: "Create flashcards from the provided text",
          parameters: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "The question or prompt" },
                    back: { type: "string", description: "The answer or explanation" }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "create_flashcards" } };
    } else if (action === "summarize-notes") {
      systemPrompt = `Você é um assistente educacional especializado em resumir anotações de estudo.
Crie um resumo claro e conciso do texto fornecido.
O resumo deve capturar os pontos principais e conceitos-chave.
Use bullet points quando apropriado.
Mantenha o resumo em português.`;
      
      tools = [{
        type: "function",
        function: {
          name: "create_summary",
          description: "Create a summary of the notes",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "The summarized content" }
            },
            required: ["summary"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "create_summary" } };
    } else if (action === "suggest-keywords") {
      systemPrompt = `Você é um assistente educacional especializado em identificar palavras-chave e conceitos importantes.
Analise o texto fornecido e extraia as palavras-chave mais importantes.
Para cada palavra-chave, forneça uma breve definição.
Retorne entre 5 e 10 palavras-chave.`;
      
      tools = [{
        type: "function",
        function: {
          name: "extract_keywords",
          description: "Extract keywords from the text",
          parameters: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string", description: "The keyword or key phrase" },
                    definition: { type: "string", description: "Brief definition or explanation" }
                  },
                  required: ["text", "definition"]
                }
              }
            },
            required: ["keywords"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "extract_keywords" } };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "Resposta inválida da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI study assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
