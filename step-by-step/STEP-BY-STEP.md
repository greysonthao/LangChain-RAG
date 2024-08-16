# STEP BY STEP

  - Change to the `/step-by-step/` folder and study each step carefully.

  - `cd step-by-step/`

  - **NOTE:** Make sure to have [Ollama installed and running](https://www.youtube.com/watch?v=0n3D2nNq7AE) before running the examples.

## STEP 01: Create a Class and instantiate it

  - Source: `/step-by-step/step-01.js`

  - Run the code: `node step-01.js`

  - Output: `{ pdfQa: PdfQA {} }`

## STEP 02: Initialize a Language Model

  - Source: `/step-by-step/step-02.js`

  - Install dependencies: `npm install`
    - `Ollama`

  - Run the code: `node step-02.js`

  - Output: 
  
  ```js
  pdfQa: PdfQA {
    model: 'llama3',
    llm: Ollama {}
  }
  ```

## STEP 03: Chat with the loaded model

  - Source: `/step-by-step/step-03.js`

  - Run the code: `node step-03.js`

  - Output: `The capital of Zimbabwe is Harare.`
  
## STEP 04: Load PDF Document

  - Source: `/step-by-step/step-04.js`

  - Install dependencies: `npm install`
    - `PDFLoader`

  - Run the code: `node step-04.js`

  - Output: the number of documents created from the PDF `pycharm-documentation-mini.pdf` should be 9 according to the default PDFLoader settings. You should also be able to see the text content of the first Document created from the PDF along with the accompanying metadata.

## STEP 05: Split the Documents created by the PDFLoader into small chunks

  - Source: `/step-by-step/step-05.js`

  - Install dependencies: `npm install`
    - `CharacterTextSplitter`
    - `path`

  - Run the code: `node step-05.js`

  - Output: according to the provided `chunkSize` (1000) and `chunkOverlap` (0) settings, you will get 14 text chunks from the text splitter.

## STEP 06: Vectorize the (split) Documents and add them to the Vector Store

  - Source: `/step-by-step/step-06.js`

  - Install dependencies: `npm install`
    - `MemoryVectorStore`
    - `CharacterTextSplitter`
    - `OllamaEmbeddings`

  - Run the code: `node step-06.js`

  - Output:

  ```
  Embeddings model:  all-minilm:latest
  # of embeddings:  14
  ```

## STEP 07: Configure a Vector store retriever

  This component will search the vector store for relevant documents.

  - Source: `/step-by-step/step-07.js`

  - Run the code: `node step-07.js`

  - Output: 

  ```
  # of returned documents:  5
  Search type:  similarity
  ```

## STEP 08: Create the query => search => results Chain:

  - Source: `/step-by-step/step-08.js`

  - Install dependencies: `npm install`
    - `RetrievalQAChain`

  - Run the code: `node step-08.js`

  - Output: The output should be a relevant response according to the documentation. For example something like this:

  ```
  🤖 According to the context, you can add a custom file type association in PyCharm by:

  1. Pressing ⌘Сmd to open the IDE settings and then selecting Editor | File Types.
  2. In the Recognized File Types list, selecting the file type that you want to associate with other filename patterns.
  3. Using the File name patterns section to make the necessary changes, which can include adding a new pattern (), removing an existing one (), or modifying an existing pattern ().

  Additionally, if PyCharm cannot identify the type of the file you are trying to open or create, it will display the Register New File Type Association dialog where you can choose how to process the file.   
  ```

## STEP 09: Replacing legacy RetrievalQAChain

  According to the official documentation, the legacy `RetrievalQAChain` class is deprecated as of version 2.x and will be completely removed in the upcoming 3.x version.

  The API reference provides an alternative. In this step, we replace the `RetrievalQAChain` with the proposed setup. Here is the [reference link](https://v02.api.js.langchain.com/classes/langchain.chains.RetrievalQAChain.html) that contains the suggested refactoring.

  - Source: `/step-by-step/step-09.js`

  - Install dependencies: `npm install`
    - `ChatPromptTemplate`
    - `createStuffDocumentsChain`
    - `createRetrievalChain`

  - Run the code: `node step-09.js`

  - Output: you will get an answer along with the number of documents used as context to the LLM's response.

## STEP 10: Set up memory and use last answer to ask follow up questions / Ask in german

  We set up a short-term memory so that the retriever can get some extra content the next time we ask a question. The previous question and related response is passed as context.

  Also, we are looping through the relevant documents that were found through the retriever and ask a question in german.

  - Source: `/step-by-step/step-10.js`

  - Run the code: `node step-10.js`

# Extras

## STEP 11: Optimizations

  Here are some extra optimizations and updates to the code from the previous step (10):

  - A new `temperature` parameter has been added to the class that configures the model's temperature.
  
  - Source: `/step-by-step/extras-step-11.js`

  - Run the code: `node step-11.js`
