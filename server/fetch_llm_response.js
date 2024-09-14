import { run } from "./gemini_api.js";


const prompt = "Two cars collided";
const result = await run(prompt) ;
  
console.log(result)

