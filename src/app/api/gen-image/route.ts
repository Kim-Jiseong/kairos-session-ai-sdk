import { experimental_generateImage as generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const data = await req.json();
  console.log(data);

  // return Response.json({ image:  });
}
