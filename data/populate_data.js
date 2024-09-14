const { MongoClient, ServerApiVersion } = require("mongodb");
const { faker } = require("@faker-js/faker");

// DB connection string
const uri =
  "mongodb+srv://admin:f8jkTV44DGVj0C2j@cluster0.mep41.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = await client.db("incidentAI");

    await addVolunteers(db);
    await addAdmins(db);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function addAdmins(db) {
  await db.collection("admin").drop();
  const collection = await db.collection("admin");
  const admins = [
    {
      _id: 0,
      name: "Vineela Yerrabelli",
      email: "vineela@vt.edu",
      gender: "female",
      age: faker.number.int({ min: 18, max: 35 }),
      phoneNumber: "(540)-###-####",
      city: "Richmond",
      state: "VA",
      zipcode: "23220",
      rId: "0-0",
      dLNo: "1234",
      passwordHash: "DF0+w5DtqqcQi3FWg59D1Jb4yPNNqypA0ijRhVAQuXk=",
      salt: "N6qXwL1sKmRmCLNLzMMpPg==",
      role: "admin",
    },
    {
      _id: 1,
      name: "Khavin Krishnan Kalpana",
      email: "khavin@vt.edu",
      gender: "male",
      age: faker.number.int({ min: 18, max: 35 }),
      phoneNumber: "(540)-###-####",
      city: "Alexandria",
      state: "VA",
      zipcode: "22301",
      rId: "0-0",
      dLNo: "1234",
      passwordHash: "ggZ/jBgGpiAjofMxWl51NzCQySa6PxiW/B2O6i9aZCE=",
      salt: "3f+mjmZZPI4q/W+e/J0E9Q==",
      role: "admin",
    },
    {
      _id: 2,
      name: "Sai Kiran",
      email: "kiran@vt.edu",
      gender: "male",
      age: faker.number.int({ min: 18, max: 35 }),
      phoneNumber: "(540)-###-####",
      city: "Blacksburg",
      state: "VA",
      zipcode: "24060",
      rId: "0-0",
      dLNo: "1234",
      passwordHash: "pw+5d0BQAMazY/hF9/movqBrb6VrUbptEMRfAd62Mmw=",
      salt: "G07o1Yf7bY9fABR+MyueKw==",
      role: "admin",
    },
    {
      _id: 3,
      name: "Gayathri Pendyala",
      email: "gayathri@vt.edu",
      gender: "female",
      age: faker.number.int({ min: 18, max: 35 }),
      phoneNumber: "(540)-###-####",
      city: "Roanoke",
      state: "VA",
      zipcode: "24011",
      rId: "0-0",
      locId: 1,
      dLNo: "1234",
      passwordHash: "pw+5d0BQAMazY/hF9/movqBrb6VrUbptEMRfAd62Mmw=",
      salt: "G07o1Yf7bY9fABR+MyueKw==",
      role: "admin",
    },
  ];

  await addDocuments(collection, admins);
}

async function addVolunteers(db) {
  await db.collection("volunteer").drop();
  const collection = await db.collection("volunteer");

  const n = 1100;
  const volunteers = [];
  for (let i = 10; i < n; i++) {
    let v = createVolunteer(i);
    volunteers.push(v);
  }

  await addDocuments(collection, volunteers);
}

async function addDocuments(collectionObj, docs) {
  try {
    const insertManyresult = await collectionObj.insertMany(docs);
    console.log(`${insertManyresult.insertedCount} documents were inserted.`);
  } catch (e) {
    console.log("Error inserting documents: " + e);
  }
}

function createResources() {
  // Generated resources
  let gResources = [];

  for (let key in resourcesInfo) {
    // create a separate resource for each type
    for (let i = 0; i < resourcesInfo[key]["types"]; i++) {
      // resource object to be inserted into db
      let r = [key + "-" + i, resourcesInfo[key]["name"], i + 1];
      gResources.push(r);
    }
  }

  return gResources;
}

// Resources info
let resourcesInfo = {
  "12-509-1079": {
    name: "Registered Nurse",
    types: 3,
    educationReq: {
      1: ["Bachelor of Science in Nursing"],
      2: ["Nursing - Specialty Preparation"],
      3: ["Graduate of an accredited nursing program"],
    },
    trainingReq: {
      1: [],
      2: [],
      3: [
        "Introduction to the Incident Command System, ICS-100",
        "S-200: Basic Incident Command System for Initial Response, ICS-200",
        "National Incident Management System, An Introduction, IS-700",
        "National Response Framework, An Introduction, IS-800",
        "Training in accordance with Occupational Safety and Health Administration (OSHA) 29 Code of Federal Regulations (CFR) Part 1910.120: Hazardous Materials Awareness",
        "Training in accordance with OSHA 29 CFR Part 1910.134: Respiratory Protection",
        "Training in accordance with OSHA 29 CFR Part 1910.1030: Bloodborne Pathogens",
      ],
    },
    experienceReq: {
      1: [
        {
          name: "Supervisory position within a healthcare setting",
          years: 3,
        },
      ],
      2: [
        {
          name: "Experience in the specialty practice area",
          years: 1,
        },
      ],
      3: [
        {
          name: "Experience in a clinical practice setting",
          years: 2,
        },
      ],
    },
    certificationReq: {
      1: [],
      2: [],
      3: [
        "State, District of Columbia or US territory-granted active status of legal authority to function as an RN without restrictions",
      ],
    },
  },
  "4-509-1481": {
    name: "Firefighter (Structural)",
    types: 2,
    educationReq: {
      1: [],
      2: [],
    },
    trainingReq: {
      1: [],
      2: [
        "Introduction to the Incident Command System, ICS-100",
        "S-200: Basic Incident Command System for Initial Response, ICS-200",
        "National Incident Management System, An Introduction, IS-700",
        "National Response Framework, An Introduction, IS-800",
        "Training in accordance with NFPA 472: Standard for Competence of Responders to Hazardous Materials/Weapons of Mass Destruction Incidents Operations Level, or equivalent basic instruction on responding to and operating in a chemical, biological, radiological, nuclear and explosive (CBRNE) incident",
        "Training in accordance with NFPA 1001: Standards for Fire Fighter Level I, or equivalent",
        "Additional Authority Having Jurisdiction (AHJ)-determined training",
      ],
    },
    experienceReq: {
      1: [],
      2: [
        {
          name: "Relevant, full-time firefighting experience, or equivalent, as the AHJ determines",
          years: 0,
        },
      ],
    },
    certificationReq: {
      1: [
        "AHJ certification equivalent to NFPA 1001: Standard for Fire Fighter Professional Qualifications, Firefighter Level II",
      ],
      2: [
        "AHJ certification equivalent to NFPA 472: Standard for Competence of Responders to Hazardous Materials/Weapons of Mass Destruction Incidents Operations Level or Occupational Safety and Health Administration (OSHA) 29 Code of Federal Regulations (CFR) Part 1910.120: Hazardous Waste Operations and Emergency Response",
        "AHJ certification equivalent to NFPA 1001: Standard for Fire Fighter Professional Qualifications, Firefighter Level I",
        "Any other AHJ-determined certification and recertification requirements",
      ],
    },
  },
  "3-509-1011": {
    name: "Ambulance Operator",
    types: 2,
    educationReq: {
      1: [
        "Completion of a state-approved Emergency Medical Technician (EMT) program, or completion of the minimum terminal learning objectives for EMT as defined by the NHTSA EMS Education Standards",
      ],
      2: [
        "High School Diploma",
        "A state-approved Emergency Medical Responder (EMR) program, or completion of the minimum terminal learning objectives for EMR as defined by the National Highway Traffic Safety Administration (NHTSA) National Emergency Medical Services (EMS) Education Standards",
      ],
    },
    trainingReq: {
      1: [],
      2: [
        "Introduction to the Incident Command System, ICS-100",
        "S-200: Basic Incident Command System for Initial Response, ICS-200",
        "National Incident Management System, An Introduction, IS-700",
        "National Response Framework, An Introduction, IS-800",
        "Training in accordance with Occupational Safety and Health Administration (OSHA) 29 Code of Federal Regulations (CFR) Part 1910.120: Hazardous Materials Awareness",
        "Training in accordance with OSHA 29 CFR Part 1910.134: Respiratory Protection",
        "Training in accordance with OSHA 29 CFR Part 1910.1030: Bloodborne Pathogens",
        "Authority Having Jurisdiction (AHJ) Emergency Vehicle Operators Course (EVOC)",
      ],
    },
    experienceReq: {
      1: [],
      2: [
        {
          name: "Emergency driving",
          years: 2,
        },
        { name: "Ambulance Operator", years: 1 },
      ],
    },
    certificationReq: {
      1: ["AHJ-certified EMT"],
      2: [
        "Valid state driver’s license, with appropriate endorsements where applicable",
        "AHJ-certified EMR",
        "AVOC, EVOC, or other recognized equivalent certification, as applicable",
      ],
    },
  },
  0: {
    name: "General",
    types: 1,
    educationReq: {
      1: [],
    },
    trainingReq: {
      1: [],
    },
    experienceReq: {
      1: [],
    },
    certificationReq: {
      1: [],
    },
  },
};

const resources = createResources();

let locations = [
  { City: "Alexandria", "ZIP Code": "22301" },
  { City: "Blacksburg", "ZIP Code": "24060" },
  { City: "Richmond", "ZIP Code": "23220" },
  { City: "Arlington", "ZIP Code": "22201" },
  { City: "Norfolk", "ZIP Code": "23510" },
  { City: "Virginia Beach", "ZIP Code": "23456" },
  { City: "Chesapeake", "ZIP Code": "23320" },
  { City: "Newport News", "ZIP Code": "23601" },
  { City: "Hampton", "ZIP Code": "23666" },
  { City: "Roanoke", "ZIP Code": "24011" },
  { City: "Lynchburg", "ZIP Code": "24501" },
  { City: "Charlottesville", "ZIP Code": "22901" },
  { City: "Fredericksburg", "ZIP Code": "22401" },
  { City: "Suffolk", "ZIP Code": "23434" },
  { City: "Portsmouth", "ZIP Code": "23701" },
  { City: "Manassas", "ZIP Code": "20109" },
  { City: "Danville", "ZIP Code": "24541" },
  { City: "Harrisonburg", "ZIP Code": "22801" },
  { City: "Leesburg", "ZIP Code": "20175" },
  { City: "Petersburg", "ZIP Code": "23803" },
  { City: "Winchester", "ZIP Code": "22601" },
  { City: "Salem", "ZIP Code": "24153" },
  { City: "Staunton", "ZIP Code": "24401" },
  { City: "Fairfax", "ZIP Code": "22030" },
  { City: "Herndon", "ZIP Code": "20170" },
  { City: "Hopewell", "ZIP Code": "23860" },
  { City: "Christiansburg", "ZIP Code": "24073" },
  { City: "Waynesboro", "ZIP Code": "22980" },
  { City: "Culpeper", "ZIP Code": "22701" },
  { City: "Bristol", "ZIP Code": "24201" },
];

// Create volunteer object
function createVolunteer(id) {
  let loc = faker.helpers.arrayElement(locations);

  return {
    _id: id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    gender: faker.person.sex(),
    age: faker.number.int({ min: 18, max: 35 }),
    phoneNumber: "(540)-###-####",
    city: loc["City"],
    state: "VA",
    zipcode: loc["ZIP Code"],
    rId: faker.helpers.arrayElement(resources)[0],
    locId: loc["ZIP Code"],
    passwordHash: "test",
    salt: "test",
    role: "volunteer",
    incidentID: "",
  };
}

run();
