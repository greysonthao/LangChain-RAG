import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import path from "node:path";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

class PdfQA {

  constructor({ model, pdfDocument, chunkSize, chunkOverlap, searchType = "similarity", kDocuments, temperature = 0.8, searchKwargs }) {

    this.model        = model;
    this.pdfDocument  = pdfDocument;
    this.chunkSize    = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.searchType   = searchType;
    this.kDocuments   = kDocuments;
    this.temperature  = temperature;
    this.searchKwargs = searchKwargs; 

  }

  async init(){
    this.initChatModel();
    await this.loadDocuments();
    await this.splitDocuments();
    this.selectEmbedding = new OllamaEmbeddings({ model: "nomic-embed-text:latest" });
    await this.createVectorStore();
    this.createRetriever();
    this.chain = await this.createChain();
    return this;
  }

  initChatModel(){
    console.log("Loading model...");
    this.llm = new Ollama({ 
      model: this.model,
      temperature: this.temperature 
    });
  }

  async loadDocuments(){
    console.log("Loading PDFs...");
    const pdfLoader = new PDFLoader(path.join(import.meta.dirname,this.pdfDocument));
    this.documents = await pdfLoader.load();
  }

  async splitDocuments(){
    console.log("Splitting documents...");
    const textSplitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap 
    });
    this.texts = await textSplitter.splitDocuments(this.documents);

  }

  async createVectorStore(){
    console.log("Creating document embeddings...");
    this.db = await MemoryVectorStore.fromDocuments(this.texts, this.selectEmbedding);
  }

  createRetriever(){
    console.log("Initialize vector store retriever...");

    const retrieverOptions = {
      k: this.kDocuments,
      searchType: this.searchType,
    }
    if ( this.searchKwargs ){
      retrieverOptions.searchKwargs = this.searchKwargs;
    }
    this.retriever = this.db.asRetriever(retrieverOptions);
  }

  async createChain(){
    console.log("Creating Retrieval QA Chain...");

    const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question: {input} based on the following context {context}`);

    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });

    const chain = await createRetrievalChain({
      combineDocsChain,
      retriever: this.retriever,
    });

    return chain;
  }

  queryChain(){
    return this.chain;
  }

}

const pdfDocument = "../materials/Paul.Graham.What.I.Worked.On.pdf";

const pdfQa = await new PdfQA({ 
  model: "llama3", 
  pdfDocument,
  // WARNING: These settings will result in an 'Invalid Maximum context length' Error when using the `all-minilm`
  chunkSize: 1000,
  chunkOverlap: 0,
  // These settings will work just fine with the `all-minilm` model
  // chunkSize: 500,
  // chunkOverlap: 50,

  // We're switching from plain 'similarity' search to 'Max Marginal Relevance'
  // Read: https://js.langchain.com/v0.2/docs/integrations/vectorstores/memory/#maximal-marginal-relevance
  searchType: "mmr",
  searchKwargs: { fetchK: 200, lambda: 0.4 },
  kDocuments: 3,
  temperature: 0
}).init();

const pdfQaChain = pdfQa.queryChain();

const answer1 = await pdfQaChain.invoke({ input: "What did the author do growing up?" });
// const answer1 = await pdfQaChain.invoke({ input: "What did the author do during his time in Y Combinator?" });
console.log( "🤖", answer1.answer, "\n" );
console.log( "# of documents used as context: ", answer1.context.length, "\n" );

