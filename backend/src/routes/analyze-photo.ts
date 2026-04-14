import { Elysia, t } from "elysia";
import { db } from "../db";
import { analyses } from "../db/schema";
import { authPlugin } from "../middleware/auth";

const SYSTEM_PROMPT = `You are an expert aesthetic analyst. You will receive a photo of a person and must provide an objective aesthetic analysis.

Evaluate the following categories on a scale of 0-100:
1. GROOMING (hair neatness, skin clarity, facial hair grooming, overall cleanliness)
2. STYLE (color coordination, outfit fit, accessory choices, overall presentation)
3. POSTURE (head tilt, shoulder alignment, body language, confidence projection)

Also provide:
- An OVERALL SCORE (weighted average: grooming 35%, style 35%, posture 30%)
- A brief 1-sentence summary of the overall impression
- 2-3 specific CONFIDENCE BOOSTERS (genuine positive observations)
- 3 specific, actionable IMPROVEMENT TIPS
- 3-4 STYLE RECOMMENDATIONS with category (outfit/grooming/accessories/color), title, and description

You MUST respond using the suggest_analysis tool call.`;

export const analyzePhotoRoutes = new Elysia({ prefix: "/api/analyze-photo" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body: { image }, userId, set }) => {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        set.status = 500;
        return { error: "GEMINI_API_KEY is not configured" };
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-flash-latest",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: image } },
                  {
                    type: "text",
                    text: "Analyze this person's aesthetic presentation. Use the suggest_analysis tool.",
                  },
                ],
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_analysis",
                  description: "Return the aesthetic analysis results",
                  parameters: {
                    type: "object",
                    properties: {
                      overallScore: {
                        type: "number",
                        description: "Overall score 0-100",
                      },
                      grooming: {
                        type: "number",
                        description: "Grooming score 0-100",
                      },
                      style: {
                        type: "number",
                        description: "Style score 0-100",
                      },
                      posture: {
                        type: "number",
                        description: "Posture score 0-100",
                      },
                      summary: {
                        type: "string",
                        description: "One sentence summary",
                      },
                      confidenceBoosters: {
                        type: "array",
                        items: { type: "string" },
                        description: "2-3 positive observations",
                      },
                      improvements: {
                        type: "array",
                        items: { type: "string" },
                        description: "3 actionable improvement tips",
                      },
                      styleRecommendations: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            category: {
                              type: "string",
                              enum: [
                                "outfit",
                                "grooming",
                                "accessories",
                                "color",
                              ],
                            },
                            title: {
                              type: "string",
                              description: "Short recommendation title",
                            },
                            description: {
                              type: "string",
                              description: "Detailed recommendation",
                            },
                          },
                          required: ["category", "title", "description"],
                        },
                        description: "3-4 style recommendations",
                      },
                    },
                    required: [
                      "overallScore",
                      "grooming",
                      "style",
                      "posture",
                      "summary",
                      "confidenceBoosters",
                      "improvements",
                      "styleRecommendations",
                    ],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: {
              type: "function",
              function: { name: "suggest_analysis" },
            },
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 429) {
          set.status = 429;
          return {
            error: "Rate limit exceeded. Please try again in a moment.",
          };
        }
        if (response.status === 402) {
          set.status = 402;
          return { error: "AI credits depleted. Please add credits." };
        }
        const errText = await response.text();
        console.error("AI Gateway error:", response.status, errText);
        set.status = 500;
        return { error: `AI Gateway error: ${response.status}` };
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        set.status = 500;
        return { error: "No tool call in AI response" };
      }

      const analysis = JSON.parse(toolCall.function.arguments);

      // Save to database if authenticated
      if (userId) {
        const [savedAnalysis] = await db
          .insert(analyses)
          .values({
            userId,
            overallScore: analysis.overallScore,
            grooming: analysis.grooming,
            style: analysis.style,
            posture: analysis.posture,
            summary: analysis.summary,
            confidenceBoosters: analysis.confidenceBoosters,
            improvements: analysis.improvements,
            styleRecommendations: analysis.styleRecommendations || [],
            // Note: photo_url is not saved currently since it might be a large base64 string
            // We would typically upload to S3/R2 and save the URL.
          })
          .returning();

        return { ...analysis, id: savedAnalysis.id };
      }

      return analysis;
    },
    {
      body: t.Object({
        image: t.String(),
      }),
    },
  );
