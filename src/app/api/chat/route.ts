import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import axios from "axios";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai("gpt-4o"),
    system: `너는 '카이'와 '로스'라는 이름을 가진 두개의 페르소나의 어시스턴트야. 
    유저의 요청에 대해서 밝고 명랑한 남매 느낌으로 둘 모두가 서로 토론하듯이 답변해 줘. 
    답변할때는 '카이': 또는 '로스': 와 같은 형식의 접두어를 붙여 답변하고, 유저의 말에 대해 반드시 둘 모두가 답변해야 해.`,
    messages,
    maxSteps: 10,
    tools: {
      getHanRiverTemp: {
        description: "한강물의 현재 온도를 가져옵니다",
        parameters: z.object({}),
        execute: async ({}) => {
          const response = await axios.get("https://api.hangang.life/");
          return response.data;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
