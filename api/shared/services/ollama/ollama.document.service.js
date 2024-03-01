import fs from "fs";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

import { PROMPTS } from "./ollama.config.js";

export const analyzeURL = async (prompt, url, ollama, streamingFunction) => {
  const loader = new CheerioWebBaseLoader(url);

  const vectorstore = await searchOnVectorstore(
    await createVectorestore(loader),
    prompt
  );

  const template = PROMPTS.URL_GEN_PROMPT;

  const response = await analyzeLoaderContents(
    vectorstore,
    ollama,
    streamingFunction,
    prompt,
    template
  );

  return response;
};

export const createFileLoader = (filePath) => {
  let loader;

  switch (filePath.split(".").pop().toLowerCase()) {
    case "pdf":
      loader = new PDFLoader(filePath);
      break;
    case "txt":
      loader = new TextLoader(filePath);
      break;
    case "csv":
      loader = new CSVLoader(filePath);
      break;
    default:
      throw new Error("Unsupported file type");
  }

  return loader;
};

export const analyzeFile = async (
  prompt,
  filePaths,
  ollama,
  streamingFunction
) => {
  // loop through each file to see if the vector store exists
  // if not, create the vectorstore for the file
  const vectorStorePaths = [];
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const vectorstorePath = `${filePath}.bin`;
    vectorStorePaths.push(vectorstorePath);
    if (!fs.existsSync(vectorstorePath)) {
      const fileLoader = createFileLoader(filePath);
      await createVectorestore(fileLoader, vectorstorePath);
    }
  }

  // at this point, all files have been saved in vectorstores
  // now feed in the file paths into a function that merges the vector stores
  const vectorstore = await loadMultipleVectorstores(vectorStorePaths);
  const relevantVectorstore = await searchOnVectorstore(vectorstore, prompt);

  const response = await analyzeLoaderContents(
    relevantVectorstore,
    ollama,
    streamingFunction,
    prompt,
    PROMPTS.DOCUMENT_GEN_PROMPT
  );

  return response;
};

export const searchOnVectorstore = async (vectorstore, query) => {
  const relevantDocs = await vectorstore.similaritySearch(query, 2);
  const embeddings = new HuggingFaceTransformersEmbeddings();

  const relevantVectorstore = await HNSWLib.fromDocuments(
    relevantDocs,
    embeddings
  );

  return relevantVectorstore;
};

export const loadMultipleVectorstores = async (filePaths) => {
  if (filePaths.length === 1) {
    return await loadVectorstore(filePaths[0]);
  }

  const vectorstores = [];
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const embeddings = new HuggingFaceTransformersEmbeddings();
    const vectorstore = await HNSWLib.load(filePath, embeddings);
    vectorstores.push(vectorstore);
  }

  let finalVectorstore;

  for (let i = 0; i < vectorstores.length; i++) {
    const vectorstore = vectorstores[i];
    if (!finalVectorstore) {
      finalVectorstore = vectorstore;
    } else {
      const docEntries = vectorstore.docstore._docs.entries();
      for (let doc in docEntries) {
        finalVectorstore.addDocuments(docEntries[doc]);
      }
    }
  }

  return finalVectorstore;
};

export const loadVectorstore = async (vectorstorePath) => {
  const embeddings = new HuggingFaceTransformersEmbeddings();
  const vectorstore = await HNSWLib.load(vectorstorePath, embeddings);
  return vectorstore;
};

export const createVectorestore = async (loader, vectorstorePath = "") => {
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 0,
    chunkSize: 500,
  });

  const splitDocuments = await splitter.splitDocuments(docs);

  const vectorstore = await HNSWLib.fromDocuments(
    splitDocuments,
    new HuggingFaceTransformersEmbeddings()
  );

  if (vectorstorePath) {
    await vectorstore.save(vectorstorePath);
  }

  return vectorstore;
};

export const analyzeLoaderContents = async (
  vectorstore,
  ollama,
  streamingFunction,
  prompt,
  template
) => {
  const retriever = vectorstore.asRetriever();

  const QA_CHAIN_PROMPT = new PromptTemplate({
    inputVariables: ["context", "question"],
    template,
  });

  // Create a retrieval QA chain that uses a Llama 2-powered QA stuff chain with a custom prompt.
  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(ollama, {
      prompt: QA_CHAIN_PROMPT,
    }),
    retriever,
    returnSourceDocuments: true,
    inputKey: "question",
  });

  class CustomHandler extends BaseCallbackHandler {
    name = "custom_handler";

    handleLLMNewToken(token) {
      if (streamingFunction) {
        streamingFunction(token);
      }
    }

    handleLLMStart(llm, _prompts) {
      console.log("handleLLMStart", { llm });
    }

    handleChainStart(chain) {
      console.log("handleChainStart", { chain });
    }

    handleAgentAction(action) {
      console.log("handleAgentAction", action);
    }

    handleToolStart(tool) {
      console.log("handleToolStart", { tool });
    }
  }

  const handler = new CustomHandler();

  const response = await chain.invoke(
    {
      question: prompt,
    },
    { callbacks: [handler] }
  );

  console.log(response);

  return response;
};
