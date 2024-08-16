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
  
