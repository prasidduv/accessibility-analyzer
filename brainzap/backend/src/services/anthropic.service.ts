import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateQuizByTopic(topic: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system:
      "Return only JSON array of 5 quiz questions. Each item: {question:string, options:string[4], answerIndex:number}. No markdown, no extra text.",
    messages: [{ role: "user", content: `Create 5 MCQ questions about ${topic}` }]
  });

  const text = message.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("")
    .trim();
  return JSON.parse(text);
}
