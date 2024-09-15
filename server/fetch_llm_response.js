import { run } from "./gemini_api.js";


const prompt = incidentText;
const result = await run(prompt) ;
  
console.log(result)

