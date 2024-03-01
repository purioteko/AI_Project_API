import config from "config";
const ollamaURL = config.get("ollamaURL");

export const OLLAMA_MODEL = "dolphin-mixtral:latest";
export const OLLAMA_URL = ollamaURL;
export const PROMPTS = {
  DESCRIPTION_GEN_PROMPT: `Create a title for the below conversation. It should be 8 words or less. It will be used so the user can recognize this conversation in the future. Do not use quotes in your title or unecessary symbols.`,
  DOCUMENT_GEN_PROMPT: `Use the following pieces of context to accomplish the task at the end.
  If you are unable, just say that you can't, don't try to make up information.
  Be as verbose as possible.
  Always say "Document analyzed" at the start of the response.  
  {context}
  Task: {question}
  Helpful Analysis:`,
  URL_GEN_PROMPT: `Use the following pieces of context to accomplish the task at the end.
  If you are unable, just say that you can't, don't try to make up information.
  Be as verbose as possible.
  Always say "Website analyzed" at the start of the response.
  If you encounter a web URL, understand that the context is the contents of that URL webpage.
  {context}
  Task: {question}
  Helpful Analysis:`,
  PROMPT_ASSISTANT: `
  I want you to become my Prompt engineer. Your goal is to help me craft the best possible prompt for my needs.
  The prompt will be used by you, ChatGPT. You will follow the following process:
  1. Your first response will be to ask me what the prompt should be about. I will provide my answer, but we will
  need to improve it through continual iterations by going through the next steps.
  2. Based on my input, you will generate 2 sections, a) Revised prompt (provide your rewritten prompt, it should
  be clear, concise, and easily understood by you), b) Questions (ask any relevant questions pertaining to what
  additional information is needed from me to improve the prompt).
  3. We will continue this iterative process with me providing additional information to you and you updating
  the prompt in the Revised prompt section until I say we are done.
  `,
};
export const CONTEXT_BASE = 512;

export const MODEL_CONFIG = {
  baseUrl: OLLAMA_URL,
  model: OLLAMA_MODEL,
  numGpu: 64, // mixtral has 32 layers, load all to GPU
  mainGpu: 0, // use GPU #0
  numCtx: CONTEXT_BASE * 8, // 4096 context
  numKeep: -1,
  numBatch: CONTEXT_BASE * 8, // 4096 batch size
};
