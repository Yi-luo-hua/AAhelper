
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_CHAT, GEMINI_MODEL_VISION, INITIAL_SYSTEM_PROMPT } from "../constants";
import { CalculatorState, CommandResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJSON = (text: string) => {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON", cleanText);
    throw e;
  }
};

/**
 * Parses a receipt image to mostly just get the Total and maybe a list of items text.
 * For this AA app, we primarily care about the Total.
 */
export const parseReceiptImage = async (base64Image: string): Promise<{ total: number; itemsSummary: string }> => {
  try {
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : "image/png";
    const data = matches ? matches[2] : base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_VISION,
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: "请提取这张小票的【总金额】(Grand Total)。并提供一个简短的中文摘要，列出发现的较贵项目。" },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            total: { type: Type.NUMBER },
            itemsSummary: { type: Type.STRING },
          },
          required: ["total", "itemsSummary"],
        },
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw error;
  }
};

export const processChatCommand = async (
  message: string,
  currentState: CalculatorState
): Promise<CommandResult> => {
  try {
    const context = {
      currentTotal: currentState.totalBill,
      currentPeople: currentState.people,
      currentExpenses: currentState.individualExpenses,
    };

    const prompt = `
    ${INITIAL_SYSTEM_PROMPT}
    
    当前状态 (Current State): ${JSON.stringify(context)}
    用户输入 (User Input): "${message}"
    
    请返回一个 JSON 对象，包含：
    - reply: 简短、风格化、带有一点幽默感的中文确认回复。
    - data: 
      - setTotal: (数字, 可选) 如果用户设定了新总额。
      - addPeople: (字符串数组, 可选) 要添加的名字。
      - addExpense: (对象数组 {person, item, cost}) 单独消费项目。
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_CHAT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            data: {
              type: Type.OBJECT,
              properties: {
                setTotal: { type: Type.NUMBER, nullable: true },
                addPeople: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                addExpense: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: {
                      person: { type: Type.STRING },
                      item: { type: Type.STRING },
                      cost: { type: Type.NUMBER }
                    }
                  },
                  nullable: true
                }
              }
            }
          },
          required: ["reply", "data"]
        }
      },
    });

    if (!response.text) throw new Error("Empty response");
    return cleanAndParseJSON(response.text);

  } catch (error) {
    console.error("Error processing command:", error);
    return {
      reply: "抱歉，我没听清数字，请再说一遍。",
      data: {}
    };
  }
};
