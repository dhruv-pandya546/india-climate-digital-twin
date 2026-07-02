import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Shared Gemini client setup with lazy initialization
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.warn("GEMINI_API_KEY environment variable is not defined or using placeholder. Running in simulated fallback mode.");
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API: Climate Twin AI Analyst Consultation
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, scenario, history } = req.body;
      const client = getGeminiClient();

      let scenarioContext = "";
      if (scenario) {
        scenarioContext = `
[CURRENT SIMULATION WHAT-IF SCENARIO STATE]:
- Global Temperature Anomaly: ${scenario.tempAnomaly >= 0 ? '+' : ''}${scenario.tempAnomaly}°C
- Rainfall Delta: ${scenario.rainChange >= 0 ? '+' : ''}${scenario.rainChange}%
- Monsoon Onset Shift: ${scenario.monsoonShift === 0 ? 'Normal onset' : scenario.monsoonShift > 0 ? `${scenario.monsoonShift} days delayed` : `${Math.abs(scenario.monsoonShift)} days early`}
- Indian Ocean Sea Surface Temperature (SST) Anomaly: ${scenario.sstChange >= 0 ? '+' : ''}${scenario.sstChange}°C
- Aerosol Optical Depth Index: ${scenario.aerosols}x (where 1.0x is baseline)
        `;
      }

      const systemPrompt = `
You are the "भारत Climate Twin AI Analyst" — a state-of-the-art climate intelligence model designed for the Indian Space Research Organisation (ISRO) and India Meteorological Department (IMD) Climate Digital Twin system.
Your mission is to interpret gridded observations, downscaled simulations, and "what-if" scenario parameters to provide professional, localized, and actionable climate adaptation guidance.

CRITICAL DIRECTIVES:
1. Address the user respectfully, using professional and encouraging climate-science terminology. Keep your answers concise, structured (using bold headings or short bullet points), and highly tailored to India's geography (mention specific zones like Western Ghats, Indo-Gangetic Plains, Northeast, Deccan Plateau, or Northwest Rajasthan/Punjab).
2. Translate raw what-if scenario variables into concrete impacts on:
   - **Agricultural Security**: e.g., crop water stress for Kharif (rice) and Rabi (wheat) crops, potential yield drops.
   - **Water Resource Vulnerability**: e.g., reservoir levels, river basin flooding (Ganges, Brahmaputra), groundwater depletion.
   - **Extreme Weather Events**: e.g., heatwave duration, urban flooding risk, coastal cyclonic surge hazards.
   - **Adaptation Measures**: Suggest specific, indigenous solutions matching "Atmanirbhar Bharat" goals (such as climate-resilient farming, rainwater harvesting, afforestation under NICES/Bhuvan tracking, and EnKF-based warning systems).
3. If the Gemini API key is missing, a simulation sandbox mode is running. Maintain high-quality expert responses in either case.
4. Keep the output extremely neat and easily readable in Markdown format. Avoid long narrative paragraphs; use scannable bullet points.
      `;

      if (!client) {
        // High-quality fallback simulation response for sandbox environments
        const fallbackResponse = `### 🛰️ Climate Twin Simulation Diagnostic (Sandbox Offline Mode)

Based on the active **What-If** parameters, here is the simulated diagnostic analysis:

*   **Agricultural Impact (Indo-Gangetic Plain)**: A temperature anomaly of **${scenario?.tempAnomaly || 0}°C** combined with a **${scenario?.rainChange || 0}%** rainfall change increases evapotranspiration rates. Kharif rice crops in Uttar Pradesh and Bihar will require supplementary irrigation within 14 days to prevent moisture stress.
*   **Monsoon Dynamics**: A shift of **${scenario?.monsoonShift || 0} days** in the onset dates directly disrupts sowing cycles. Delay allows early weeds to compete with crops, demanding advanced pesticide scheduling.
*   **Basin Vulnerability**: The Indian Ocean SST anomaly of **${scenario?.sstChange || 0}°C** enhances convective activity in the Bay of Bengal, potentially increasing the frequency of pre-monsoon depressions and storm surges along the Odisha and Andhra Pradesh coasts.
*   **Recommended Adaptation**: 
    1.  Deploy **Micro-irrigation networks** across dryland zones in Madhya Pradesh and Rajasthan.
    2.  Utilize **ISRO Bhuvan satellite monitoring** for daily soil moisture indexing to schedule precise irrigation.
    3.  Shift to drought-tolerant crop cultivars (e.g., Sahbhagi Dhan rice).

*Note: In the live preview, configure your Gemini API Key in **Settings > Secrets** to enable real-time generative reasoning.*`;
        return res.json({ text: fallbackResponse });
      }

      // Build conversational memory contents
      const contentsList: any[] = [];
      
      // Inject scenario context as part of system instruction or first message
      contentsList.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nHere is the active climate scenario context:\n${scenarioContext}\n\nUser Question: ${message}` }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList
      });

      res.json({ text: response.text });

    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API: Grid Data Service
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Vite middleware setup for Development vs Production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
