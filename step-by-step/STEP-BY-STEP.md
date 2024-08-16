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

  - Run the code: `node step-04.js`

  - Output: the number of documents created from the PDF `pycharm-documentation-mini.pdf` should be 9 according to the default PDFLoader settings. You should also be able to see the text content of the first Document created from the PDF along with the accompanying metadata.

## STEP 05: Split the Documents created by the PDFLoader into small chunks

  - Source: `/step-by-step/step-05.js`

  - Run the code: `node step-05.js`

  - Output: according to the provided `chunkSize` (1000) and `chunkOverlap` (0) settings, you will get 14 text chunks from the text splitter.

## STEP 06: Vectorize the (split) Documents and add them to the Vector Store

  - Source: `/step-by-step/step-06.js`

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

## STEP 08: 

  - Source: `/step-by-step/step-08.js`

  - Run the code: `node step-08.js`

  - Output: 

