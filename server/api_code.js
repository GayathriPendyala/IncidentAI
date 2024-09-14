/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "As an AI assistant, use the attached file as a knowledge base for first responder roles. Based on the incident input from the user (either text or image), categorize the incident by severity and type. Then, suggest the appropriate number and type of first responders required to resolve the incident. Use the descriptions in the knowledge base to recommend roles and quantities.\n\n\nFirst Responder Roles and Descriptions:\n\nRegistered Nurse (Type 1)\nSupervises a team of nurses and patient care providers while functioning as the nurse manager.\n\nRegistered Nurse (Type 2)\nPractices nursing specialties to treat and manage specific injuries, illnesses, and exposures. Works under direct supervision of higher-level nurses or medical professionals.\n\nRegistered Nurse (Type 3)\nProvides health care to individuals, families, and communities, focusing on health promotion, disease prevention, and comprehensive healthcare. Coordinates multidisciplinary care and clinical assessments.\n\nAdvanced Practice Registered Nurse (APRN) \nFunctions as a healthcare professional licensed to diagnose and treat a range of health problems, either independently or in collaboration with other practitioners. Specializes in areas such as anesthesia, emergency care, pediatrics, geriatrics, psychiatry, and more.\n\nAmbulance Ground Team – Basic Life Support (BLS)\nProvides Emergency Medical Services (EMS) at an Emergency Medical Technician (EMT) level. Deploys with personnel, ambulance, equipment, and supplies to offer patient transport along with emergency medical care.\n\nAmbulance Ground Team – Advanced Life Support (ALS)\nProvides EMS at a Paramedic level. Deploys with personnel, ambulance, equipment, and supplies for patient transport with emergency medical care.\n\nMedical Ambulance Bus (MAB)\nCapable of providing medical transportation services during mass casualty incidents. This multi-patient medical transportation vehicle provides care to patients before and during transport to medical receiving facilities.\n\nWildland Firefighter (Type 2)\nA member of a wildland fire suppression crew, working under general supervision to assist with fire containment and suppression.\n\nWildland Firefighter (Type 1) \nA senior member of a wildland fire suppression crew with some supervisory responsibilities, overseeing fire suppression efforts.\n\nStructural Firefighter (Type 1)\nSupervises and directs a firefighting team, including both Type 1 and Type 2 Structural Firefighters, to combat structural fires.\n\nStructural Firefighter (Type 2) \nWorks as part of a firefighting team under direct supervision to assist with structural firefighting efforts.\n\nAirport Firefighter \nEngages in firefighting involving aircraft, cargo, airport facilities, and equipment. Communicates incident information to command and air traffic control, gains access to aircraft, assists with evacuation, performs disentanglement, and triages patients.\n\n\n\nThe output should follow this format:\n\nIncident Category: Specify the type of incident, e.g., \"Forest Fire\" or \"Car Accident.\"\nDescription: Briefly describe the incident based on the user's input.\nRecommendation: Suggest appropriate first responder roles, including the number of personnel, based on the incident and the knowledge base. Make sure to match the roles with their capabilities as described.\"",
});

const generationConfig = {
  temperature: 2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  console.log(result.response.text());
}

run();