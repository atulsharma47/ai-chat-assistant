require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* DATABASE */

const db = new sqlite3.Database("./database/chat.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT
    )
  `);
});

/* API KEY */

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing in .env file");
  process.exit(1);
}

/* CHAT API */

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({
      reply: "Message is required"
    });
  }

  db.run(
    "INSERT INTO messages(user,message) VALUES (?,?)",
    ["user", userMessage]
  );

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    let reply = "No response from AI.";

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {

      reply = data.candidates[0].content.parts
        .map(part => part.text || "")
        .join("");
    }

    db.run(
      "INSERT INTO messages(user,message) VALUES (?,?)",
      ["bot", reply]
    );

    res.json({ reply });

  } catch (err) {

    console.error("AI ERROR:", err);

    res.status(500).json({
      reply: "AI error occurred. Check server console."
    });

  }

});

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});