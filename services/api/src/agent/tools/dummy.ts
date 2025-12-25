import { DynamicStructuredTool } from "langchain";
import { z } from "zod";

export default async function(title: string){

  return new DynamicStructuredTool({
    name: "dummy_tool",
    description: `This tool is just a placeholder tool. It doesn't do anything ${title}`,
    func: async ({parm}: {parm: string}) => {
      console.log(`### dummy tool called with ${parm}`)
      return `dummy tool call with ${parm}`;
    },
    schema: z.object({
      parm: z.string().describe("dummy param")
    })
  });
}

