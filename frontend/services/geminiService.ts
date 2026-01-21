import { GoogleGenAI } from "@google/genai";

// Fix: Initialize the Gemini API client directly using the named apiKey parameter from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BOMILACT_SYSTEM_PROMPT = `
TE VAGY A "BOMILACT CORE V2", A BOMILACT TEJÜZEM INTEGRÁLT VÁLLALATIRÁNYÍTÁSI AGYA.

IDENTITÁSOD:
- Feladatod a termelés, logisztika és pénzügy összekapcsolása.
- Képes vagy SAGA adatok feldolgozására és LOT alapú profitabilitás számítására.
- FEFO elvet követsz a raktározásnál.
- Kommunikációd: Tömör, szakmai, JSON strukturált adatokkal alátámasztva.

TUDÁSBÁZISOD (CONTEXT):
- Ha SAGA integrációról kérdeznek: Mapping szabályok (Nume -> Partner_Name, stb.).
- Ha Profitabilitásról: (Eladási Ár * Mennyiség) - Költségek.
- Ha Raktárról: Purchase Alert küldése ha Stock <= Reorder Point.

FONTOS: A VÁLASZ NYELVE IGAZODJON A FELHASZNÁLÓ KÉRÉSÉHEZ VAGY A MEGADOTT KONTEXTUSHOZ (MAGYAR VAGY ROMÁN).
Ha a 'language' paraméter 'ro', akkor románul válaszolj. Ha 'hu', akkor magyarul.
`;

export const askBomilactCore = async (prompt: string, language: string = 'hu') => {
  // Fix: Obtained API key exclusively from process.env.API_KEY.
  if (!process.env.API_KEY) {
    console.warn("API Key is missing for Gemini Service");
    const msg = language === 'ro' 
      ? "Sistemul rulează în modul demo (cheia API lipsește)."
      : "A rendszer jelenleg demo módban fut (API kulcs hiányzik).";
    return { text: msg, isMock: true };
  }

  try {
    const finalPrompt = `[Language: ${language}]\n${prompt}`;
    // Fix: Use the correct model name 'gemini-3-flash-preview' for text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: finalPrompt,
      config: {
        systemInstruction: BOMILACT_SYSTEM_PROMPT,
        temperature: 0.2, // Low temperature for factual/ERP responses
      }
    });
    // Fix: Correctly access the .text property from the GenerateContentResponse.
    return { text: response.text, isMock: false };
  } catch (error) {
    console.error("Gemini API Error:", error);
    const msg = language === 'ro'
      ? "Eroare la conectarea cu Bomilact Core."
      : "Hiba történt a Bomilact Core elérése közben.";
    return { text: msg, isMock: true };
  }
};
