import "dotenv/config";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import prisma from "../src/lib/prisma";
import { staticFaqs } from "../src/lib/knowledge/staticFaqs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    outputDimensionality: 768,
  } as any);

  const embedding = result.embedding?.values;
  if (!embedding) {
    throw new Error("No embedding returned from Gemini API");
  }
  return embedding;
}

async function main() {
  console.log(`Starting ingestion of ${staticFaqs.length} static chunks...`);

  await prisma.$executeRaw`DELETE FROM documents WHERE source = 'static'`;
  console.log("Cleared existing static documents.");

  for (let i = 0; i < staticFaqs.length; i++) {
    const chunk = staticFaqs[i];

    try {
      const embedding = await embedText(chunk.content);
      const vectorLiteral = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO documents (content, embedding, source, source_id, metadata)
        VALUES (
          ${chunk.content},
          ${vectorLiteral}::vector,
          'static',
          NULL,
          ${JSON.stringify({ category: chunk.source })}::jsonb
        )
      `;

      console.log(`[${i + 1}/${staticFaqs.length}] Inserted: "${chunk.content.slice(0, 50)}..."`);
    } catch (err) {
      console.error(`Failed on chunk ${i + 1}:`, err);
    }

    await sleep(200);
  }

  console.log("Ingestion complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Ingestion script failed:", err);
  process.exit(1);
});