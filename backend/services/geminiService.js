const axios = require("axios");

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL;

const client = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

function stripCodeFences(text) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

async function classifyTicket(ticketText) {
  const prompt = `
You are a support ticket triage assistant.

Classify the ticket.

Return ONLY valid JSON:

{
  "category":"",
  "priority":"",
  "reasoning":""
}

Ticket:
${ticketText}
`;

 let response;

try {
  response = await client.post("/chat/completions", {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  console.log("OpenRouter Response:");
  console.log(JSON.stringify(response.data, null, 2));

} catch (err) {
  console.log("OpenRouter Error:");
  console.log(err.response?.data || err.message);
  throw err;
}

const raw = response.data.choices[0].message.content;

  try {
    return JSON.parse(stripCodeFences(raw));
  } catch {
    return {
      category: "Other",
      priority: "Medium",
      reasoning: raw,
    };
  }
}

async function summarizeDocument(documentText, length = "medium") {
  const prompt = `
Summarize this document in ${length} length.

Return ONLY valid JSON:

{
  "summary":"",
  "keyPoints":[]
}

Document:
${documentText}
`;

  const response = await client.post("/chat/completions", {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = response.data.choices[0].message.content;

  try {
    return JSON.parse(stripCodeFences(raw));
  } catch {
    return {
      summary: raw,
      keyPoints: [],
    };
  }
}

module.exports = {
  classifyTicket,
  summarizeDocument,
};