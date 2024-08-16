import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import path from "node:path";

class PdfQA {

  constructor({ model, pdfDocument, chunkSize, chunkOverlap, searchType, kDocuments }) {

    this.model        = model;
    this.pdfDocument  = pdfDocument;
    this.chunkSize    = chunkSize;
    this.chunkOverlap = chunkOverlap;

    // This configures the type of vector search. By default, Vector stores will use a 'similarity' search. Alternatively, you can pass in the "mms" value to searchType and perform a more advanced and precise search based on the 'Maximal Marginal Relevance' search algorithm.
    // For more: https://js.langchain.com/v0.2/docs/integrations/vectorstores/memory/#maximal-marginal-relevance
    this.searchType   = searchType;
    // The number of relevant document to return based on the search query:
    this.kDocuments   = kDocuments;

  }

  async init(){
    this.initChatModel();
    await this.loadDocuments();
    await this.splitDocuments();
    this.selectEmbedding = new OllamaEmbeddings({ model: "all-minilm:latest" });
    await this.createVectorStore();
    this.createRetriever();
    return this;
  }

  initChatModel(){
    console.log("Loading model...");
    this.llm = new Ollama({ model: this.model });
  }

  async loadDocuments(){
    console.log("Loading PDFs...");
    const pdfLoader = new PDFLoader(path.join(import.meta.dirname,this.pdfDocument));
    this.documents = await pdfLoader.load();
  }

  async splitDocuments(){
    console.log("Splitting documents...");
    const textSplitter = new CharacterTextSplitter({ 
      separator: " ",
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap 
    });
    this.texts = await textSplitter.splitDocuments(this.documents);

  }

  async createVectorStore(){
    console.log("Creating document embeddings...");
    this.db = await MemoryVectorStore.fromDocuments(this.texts, this.selectEmbedding);
  }

  // Method to perform a similarity search in the memory vector store. It calculates the similarity between the query vector and each vector in the store, sorts the results by similarity, and returns the top k results along with their scores.
  createRetriever(){

  }

}

const pdfDocument = "../materials/pycharm-documentation-mini.pdf";

const pdfQa = await new PdfQA({ 
  model: "llama3", 
  pdfDocument,
  chunkSize: 1000,
  chunkOverlap: 0 
}).init();

