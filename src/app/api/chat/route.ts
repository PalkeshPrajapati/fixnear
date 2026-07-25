import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import prisma from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY!;
const google = createGoogleGenerativeAI({ apiKey });
const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function embedQuery(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: TaskType.RETRIEVAL_QUERY,
    outputDimensionality: 768,
  } as any);

  const embedding = result.embedding?.values;
  if (!embedding) {
    throw new Error("No embedding returned from Gemini API");
  }
  return embedding;
}

function extractTextFromMsg(msg: any): string {
  if (!msg) return "";
  if (typeof msg.content === "string" && msg.content.trim()) {
    return msg.content;
  }
  if (Array.isArray(msg.parts)) {
    const textParts = msg.parts
      .filter((p: any) => p.type === "text" && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("\n");
    if (textParts.trim()) return textParts;
  }
  if (Array.isArray(msg.content)) {
    const textParts = msg.content
      .filter((p: any) => p.type === "text" && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("\n");
    if (textParts.trim()) return textParts;
  }
  return "";
}

function convertToStreamMessages(messages: any[]): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(messages)) return [];
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: extractTextFromMsg(msg),
  }));
}

type DocRow = { content: string };

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const formattedMessages = convertToStreamMessages(messages);
    const lastUserMsg = formattedMessages.filter((m) => m.role === "user").pop();

    if (!lastUserMsg || !lastUserMsg.content.trim()) {
      return new Response("No user message provided", { status: 400 });
    }

    let context = "";

    // 1. Vector similarity retrieval with fallback
    try {
      const queryEmbedding = await embedQuery(lastUserMsg.content);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;

      const relevantDocs = await prisma.$queryRaw<DocRow[]>`
        SELECT content
        FROM documents
        ORDER BY embedding <=> ${vectorLiteral}::vector
        LIMIT 5
      `;

      if (relevantDocs && relevantDocs.length > 0) {
        context = relevantDocs.map((doc) => doc.content).join("\n\n---\n\n");
      }
    } catch (retrievalError) {
      console.warn("Vector retrieval warning (falling back to general prompt):", retrievalError);
    }

    // 2. Build system prompt
    const systemPrompt = `You are FixNear's helpful assistant. FixNear is a local service provider directory where users can browse categories, view provider profiles, and contact providers directly by phone.

Answer the user's question using the context below if helpful. Be concise and friendly. If the answer isn't contained in the context, help the user with general information about FixNear.

Context:
${context || "No specific document context found."}`;

    // 3. Stream response
    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      system: systemPrompt,
      messages: formattedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}