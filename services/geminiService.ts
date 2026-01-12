
import { GoogleGenAI, Type } from "@google/genai";
import { SolarSystemInput, SolarSystemResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzeBill(fileData: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this electricity bill and extract:
    1. Total amount or average monthly cost.
    2. Current tariff rate (cost per kWh).
    Return as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileData,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bill_amount: { type: Type.NUMBER },
            tariff_rate: { type: Type.NUMBER },
          },
          required: ["bill_amount", "tariff_rate"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as { bill_amount: number; tariff_rate: number };
  } catch (error) {
    console.error("Bill OCR Error:", error);
    throw new Error("Failed to analyze bill document.");
  }
}

export async function generateSolarDesign(data: SolarSystemInput): Promise<SolarSystemResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not defined.");
  }

  const aiInstance = new GoogleGenAI({ apiKey });

  // HIGH-SPEED OPTIMIZATION:
  // 1. Removed Google Search (the main latency source).
  // 2. Shortened prompt for faster token processing.
  // 3. Maintained the comprehensive schema for UI compatibility.
  const prompt = `
    Role: Senior Solar Design Engineer.
    Location: ${data.city}, ${data.country}.
    Specs: Load ${data.daily_kwh}kWh/day, System: ${data.system_type}, Battery: ${data.battery_type}.
    Financials: Budget ${data.currency_symbol}${data.target_budget}.

    Task:
    1. Size PV, Inverter, and Storage using 0.8 derating factor.
    2. Provide 12-month production data for this location.
    3. Recommend hardware based on 2024-2025 industry benchmarks.
    4. Calculate expansion potential (additional panels and inverter headroom).
    
    Output JSON only.
  `;

  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: prompt }],
      config: {
        // Optimization: Rely on model's internal data for extreme speed
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            energy_summary: {
              type: Type.OBJECT,
              properties: {
                daily_consumption_kwh: { type: Type.NUMBER },
                peak_load_watts: { type: Type.NUMBER },
                backup_hours: { type: Type.NUMBER }
              },
              required: ["daily_consumption_kwh", "peak_load_watts", "backup_hours"]
            },
            monthly_production: {
              type: Type.OBJECT,
              properties: {
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING },
                      kwh: { type: Type.NUMBER }
                    },
                    required: ["month", "kwh"]
                  }
                },
                average_kwh: { type: Type.NUMBER },
                best_month: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    kwh: { type: Type.NUMBER }
                  },
                  required: ["name", "kwh"]
                },
                worst_month: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    kwh: { type: Type.NUMBER }
                  },
                  required: ["name", "kwh"]
                },
                annual_total_kwh: { type: Type.NUMBER }
              },
              required: ["data", "average_kwh", "best_month", "worst_month", "annual_total_kwh"]
            },
            solar_panels: {
              type: Type.OBJECT,
              properties: {
                recommended_panel_wattage: { type: Type.NUMBER },
                number_of_panels: { type: Type.NUMBER },
                total_solar_capacity_kw: { type: Type.NUMBER },
                estimated_daily_generation_kwh: { type: Type.NUMBER }
              },
              required: ["recommended_panel_wattage", "number_of_panels", "total_solar_capacity_kw", "estimated_daily_generation_kwh"]
            },
            inverter: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                recommended_size_kw: { type: Type.NUMBER },
                supported_peak_load_watts: { type: Type.NUMBER }
              },
              required: ["type", "recommended_size_kw", "supported_peak_load_watts"]
            },
            battery: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                total_storage_kwh: { type: Type.NUMBER },
                number_of_batteries: { type: Type.NUMBER },
                estimated_backup_hours: { type: Type.NUMBER },
                bms_intelligence: {
                  type: Type.OBJECT,
                  properties: {
                    charge_limit_amps: { type: Type.NUMBER },
                    discharge_limit_amps: { type: Type.NUMBER },
                    temp_range_celsius: { type: Type.STRING },
                    estimated_cycle_life: { type: Type.NUMBER },
                    protection_features: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              required: ["type", "total_storage_kwh", "number_of_batteries", "estimated_backup_hours"]
            },
            system_losses: {
              type: Type.OBJECT,
              properties: {
                loss_percentage: { type: Type.STRING },
                adjusted_energy_requirement_kwh: { type: Type.NUMBER },
                loss_breakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING },
                      percentage: { type: Type.NUMBER }
                    },
                    required: ["factor", "percentage"]
                  }
                }
              },
              required: ["loss_percentage", "adjusted_energy_requirement_kwh", "loss_breakdown"]
            },
            budget_guard: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                target_budget_display: { type: Type.STRING },
                estimated_total_cost_range: { type: Type.STRING },
                cost_utilization_percentage: { type: Type.NUMBER },
                savings_vs_utility_annually: { type: Type.STRING },
                optimization_strategy: { type: Type.STRING },
                market_average_price_regional: { type: Type.STRING }
              },
              required: ["status", "target_budget_display", "estimated_total_cost_range", "cost_utilization_percentage", "savings_vs_utility_annually", "optimization_strategy", "market_average_price_regional"]
            },
            market_intelligence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  estimated_price: { type: Type.STRING },
                  description: { type: Type.STRING },
                  source_url: { type: Type.STRING }
                }
              }
            },
            installation_notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING }
                }
              }
            },
            future_expansion: {
              type: Type.OBJECT,
              properties: {
                max_additional_panels: { type: Type.NUMBER },
                inverter_headroom: { type: Type.STRING }
              }
            }
          },
          required: [
            "energy_summary", "monthly_production", "solar_panels", "inverter", "battery", 
            "system_losses", "budget_guard", "market_intelligence", "installation_notes", "future_expansion"
          ]
        }
      },
    });

    return JSON.parse(response.text) as SolarSystemResult;
  } catch (error) {
    console.error("Gemini Design Generation Error:", error);
    throw error;
  }
}
