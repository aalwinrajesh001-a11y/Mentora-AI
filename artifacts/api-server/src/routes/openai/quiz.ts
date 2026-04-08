import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

// POST /openai/generate-quiz
router.post("/generate-quiz", async (req, res) => {
  try {
    const { topic, subject, difficulty, count = 5 } = req.body as {
      topic: string;
      subject: string;
      difficulty: string;
      count?: number;
    };

    if (!topic || !subject || !difficulty) {
      res.status(400).json({ error: "topic, subject, and difficulty are required" });
      return;
    }

    const prompt = `Generate ${count} multiple choice quiz questions about "${topic}" in ${subject} for a ${difficulty} level student.

Return ONLY a valid JSON object in this exact format, with no other text:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure:
- Questions are appropriate for ${difficulty} level
- Each question has exactly 4 options
- correctIndex is 0-3 (index of the correct option in the options array)
- Explanations are clear and educational`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: "You are an educational quiz generator. Always respond with valid JSON only, no markdown or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content ?? "{}";
    
    let quiz;
    try {
      quiz = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from the response
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        quiz = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON response from AI");
      }
    }

    res.json(quiz);
  } catch (err) {
    req.log.error({ err }, "Failed to generate quiz");
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

export default router;
