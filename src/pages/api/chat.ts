import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";

const systemPrompt = process.env.SYSTEM_PROMPT!.replace(/\\n/g, "\n");

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { input, messages } = req.body;

  await kv.rpush("inputs", input);

  // Messages are already in Gemini format
  const history = messages;

  try {
    const chat = client.chats.create({
      model: "models/gemini-flash-lite-latest",
      config: {
        systemInstruction: systemPrompt,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: input });
    const text = result.text;

    res.status(200).json({
      message: {
        role: "model",
        parts: [{ text: text }],
      },
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}
