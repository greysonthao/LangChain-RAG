/**
 * Simple RAG pipeline allowing you to "talk" to your documentation:
 * 
 * This file contains a simple application for using retrieval augmented generation (RAG)
 * to "ask questions" from a PDF, using a powerful package called langchain. 
 * In this case, we're going to use a PDF of the PyCharm documentation, 
 * but langchain allows you to use a wide variety of input formats, 
 * giving you significant flexibility over your input data source.
 * 
 * In this pipeline, we'll need to do the following:
 * 
 * - Load in (for local models) or connect to the API of (for remote models) our LLM;
 * - Load in our PDF that we want to "chat" to;
 * - We can't pass the whole PDF into a model at the same time (it's almost 2000 pages!). As such, we need to split it into chunks;
 * - Rather than needing to pass every individual chunk through the LLM to find the information in the document relevant to a question, we can convert these chunks into document embeddings, which we then store in a vector database. At query time, the question is also converted into a document embedding, and the most similar document chunks to the question are retrieved.
 * 
 */

// Imports
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import path from "node:path";

// 💡 Count the number of pages in the PDF
// As you can see, we have a lot of documentation to sort through here!
const pdfDocument = "./materials/pycharm-documentation-mini.pdf";
// console.log(import.meta.dirname, import.meta.filename);
const docs = await new PDFLoader(path.join(import.meta.dirname, pdfDocument)).load();
console.log(`PDF Document has ${docs.length} number of pages.`);

/**
 * @description Initializes the PdfQA class with the specified parameters.
 * @param model: The name or path of the model to be loaded.
 * @param pdfDocument
 * @param chunkSize
 * @param chunkOverlap
 * @param searchType
 * @param kDocuments
 * @param chainType
 */
class PdfQA {

  constructor({ model, pdfDocument, chunkSize, chunkOverlap, searchType = "similarity", kDocuments }) {

    this.model        = model;
    this.pdfDocument  = pdfDocument;
    this.chunkSize    = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.searchType   = searchType;
    this.kDocuments   = kDocuments;

  }

  async init(){
    // Load env: https://nodejs.org/en/blog/release/v20.6.0
    // https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs
    this.initChatModel();
    await this.loadDocuments();
    await this.splitDocuments();
    this.selectEmbedding = new OllamaEmbeddings({ model: "all-minilm:latest" });
    await this.createVectorStore();
    this.createRetriever();
    this.chain = await this.createChain();
    return this;
  }

  /**
   * @description Initialize the chat model.
   * @returns void
   */
  initChatModel(){
    console.log("Loading model...");
    this.llm = new Ollama({ model: this.model });
  }

  /**
   * @description Load documents from a PDF file and convert to a format that can be ingested by the langchain document splitter.
   */
  async loadDocuments(){
    console.log("Loading PDFs...");
    const pdfLoader = new PDFLoader(path.join(import.meta.dirname,this.pdfDocument))
    this.documents = await pdfLoader.load();
  }
  
  /**
   * @description Split the documents into chunks of a given size with a specified overlap.
   */
  async splitDocuments(){
    console.log("Splitting documents...");
    const textSplitter = new CharacterTextSplitter({ 
      separator: " ",
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap 
    });
    this.texts = await textSplitter.splitDocuments(this.documents);
  }
  
  /**
   * @description Create Vector Store.
   */
  async createVectorStore(){
    console.log("Creating document embeddings...");
    this.db = await MemoryVectorStore.fromDocuments(this.texts, this.selectEmbedding);
  }
  
  /**
   * @description Generate a chunk retriever for the given search type and number of documents.
   */
  createRetriever(){
    console.log("Initialize vector store retriever...");
    this.retriever = this.db.asRetriever({ 
      k: this.kDocuments, 
      searchType: this.searchType 
    });
  }
  
  /**
   * @description
   */
  async createChain(){
    console.log("Creating Retrieval QA Chain...");
    const chain = RetrievalQAChain.fromLLM(this.llm, this.retriever);
    return chain;
  }
  
  /**
   * @description Returns the chain of the object.
   */
  queryChain(){

    return this.chain;

  }
}

/**
 * Levers in the RAG pipeline
 * 
 * RAG is quite tricky to get right, especially if you need it to be efficient. There are many levers we can pull in our pipeline, which influence the following things:
 * - How fast we can get our answers;
 * - How relevant our answers are (and related, how likely we are to get a hallucination);
 * - How complete our answers are.
 */

/**
 * Let's instantiate our PDF questioner with the following values:
 */
const pdfQa = await new PdfQA({
  model:       "llama3",
  pdfDocument,
  chunkSize:    1000,
  chunkOverlap: 0,
  searchType:   "similarity",
  kDocuments:   5,
  chainType:  "stuff",
}).init();

const pdfQaChain = pdfQa.queryChain(); 

// Let's try it out by asking how we can debug in PyCharm.
const answer1 = await pdfQaChain.invoke({ query: "How do we add a custom file type in PyCharm?" });
console.log( "🤖", answer1.text, "\n" );

// We can see the answer is very comprehensive. Let's have a look at the information it was based on from the documentation:
// for ( const document of answer1.sourceDocuments ){
// }

// We can see that the first three chunks are the most relevant, while the last three don't really add that much to the answer.
// If we'd like, we can go a bit deeper with our answer. We can set up a memory for the last answer the LLM gave us so we can ask follow up questions. In this case, let's see if the LLM left out anything about PyCharm's debugging.

const chatHistory1 = [ answer1.question, answer1.response ];
const answer2 = await pdfQaChain.invoke({ query: "Is there anything more to add here?", chatHistory: chatHistory1 });
console.log( "🤖", answer2.text, "\n" );

// If our model is capable of it, we can even enter queries in a different language to the source documentation, and get relevant answers back in this language. Here we question our English-language documentation in German ...

// Original question:
// const question3 = "Wie kann man PyCharm installieren?"; 
// Question tailored for mini version of the documentation:
const question3 = "Wie fügt man einen benutzerdefinierten Dateityp in PyCharm hinzu?";
const answer3 = await pdfQaChain.invoke({ query: question3 });

// ...and get a relevant answer in German!
console.log( "🤖", answer3.text, "\n" );


