import express from "express";
import axios from "axios";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import.meta.url;

import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from "mongodb";
import { run } from "./gemini_api.js";

import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// DB connection string
const uri =
  "mongodb+srv://admin:f8jkTV44DGVj0C2j@cluster0.mep41.mongodb.net/volunteerDB?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
app.use(express.json());

// Set cors configuration
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
const uploadDir = path.join(__dirname, 'uploads');


// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    // Access the database and collection
    const database = client.db("incidentAI"); // Replace with your database name
    const volunteersCollection = database.collection("volunteer"); // Replace with your collection name

    // Define routes after the client has connected
    app.get("/api/getResources/:zipcode", async (req, res) => {
      try {
        const { zipcode } = req.params;

        if (!zipcode) {
          return res.status(400).json({ error: "Zipcode is required" });
        }
        // Define the query to find available volunteers
        const query = { incidentID: { $in: [null, ""] }, zipcode };

        // Updated pipeline to group by rId
        const pipeline = [
          { $match: query },
          { $group: { _id: "$rId", count: { $sum: 1 } } },
        ];

        // Execute the aggregation pipeline
        const results = await volunteersCollection
          .aggregate(pipeline)
          .toArray();
        const responseObject = {};
        results.forEach((item) => {
          responseObject[item._id] = item.count;
        });
        res.json(responseObject);
      } catch (error) {
        console.error("Error fetching available resources:", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/creatingIncident", upload.single('image'), async (req, res) => {
      try {
        const { incidentText, name, phoneNumber, lat, lng } = req.body;
        const allocated = false;
        
        // Log the request body and file
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);

        // Check if a file was uploaded
        if (!req.file) {
          console.log("No file was uploaded");
        }

        // If an image is uploaded, get the file path
        // const imageName = req.file.filename;
        const imagePath = req.file ? req.file.path : null;
        const imageBase64 = imagePath ? fs.readFileSync(imagePath, { encoding: 'base64' }) : null;
        //const relativeImagePath = 'uploads/' + imageName;
        if (imagePath) {
          console.log("Image saved at:", imagePath);
        }

        // Validate that incidentText is provided
        // if (!incidentText) {
        //   return res.status(400).json({ error: "Incident text is required." });
        // }
        // Validate that latitude and longitude are provided
        if (!lat || !lng) {
          return res.status(400).json({
            error: "Latitude and longitude are required for geolocation.",
          });
        }
        // Fetch the address using reverse geocoding
        const streetAddress = await getReverseGeocoding(lat, lng);

        const aiResult = await run(incidentText, imageBase64);

        // Construct the new incident object
        const newIncident = {
          incidentText,
          name,
          phoneNumber,
          streetAddress,
          image: req.file.filename,
          imagePath, 
          datetime: new Date(),
          aiResult,
          allocated
        };

        const result = await database.collection("Incident").insertOne(newIncident);

        // Return the success response with the auto-generated _id
        res.status(201).json({
          message: "Incident created successfully",
          incidentId: result.insertedId, // Return MongoDB's auto-generated _id
          aiRecommendation: aiResult,
          image: imagePath ? `http://localhost:8067/uploads/${path.basename(imagePath)}` : null
        });
      } catch (error) {
        console.error("Error creating incident:", error);
        res.status(500).json({ error: "An error occurred while creating the incident." });
      }
    });

    // Serve static files from the "uploads" directory
    app.use('/uploads', express.static(uploadDir));
    // Other routes
    app.post("/api/login", async (req, res) => {
      const body = req.body;
      // Implement login logic
    });

    app.get("/api/listIncidents", async (req, res) => {
      try {
        // Fetch all incidents from the Incident collection
        const incidents = await client
          .db("incidentAI")
          .collection("Incident")
          .find({})
          .toArray();

        // Send the incidents as a JSON response
        res.status(200).json(incidents);
      } catch (error) {
        console.error("Error fetching incidents:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching the incidents." });
      }
    });
    app.post("/api/assignResources", async (req, res) => {
      const zipcode = req.body.zipcode;
      const newIncidentID = req.body.incidentID;

      try {
        // Initialize MongoDB client and collection
        const database = await client.db("incidentAI");
        const volunteersCollection = await database.collection("volunteer");
        const incidentCollection = await database.collection("Incident");

        // Process each rId
        for (const [rId, count] of Object.entries(req.body.resources)) {
          // Find documents with matching zipcode, empty incidentID, and specific rId

          const docsToUpdate = await volunteersCollection
            .find({
              $and: [
                { zipcode: String(zipcode) },
                { incidentID: { $in: [null, ""] } },
                { rId: rId },
              ],
            })
            .limit(count)
            .toArray();

          // If there are documents to update, perform the update
          if (docsToUpdate.length > 0) {
            await volunteersCollection.updateMany(
              {
                _id: { $in: docsToUpdate.map((doc) => doc._id) }, // Update only the documents we found
              },
              {
                $set: { incidentID: String(newIncidentID) },
              }
            );
          }
        }
        const incident = await incidentCollection
          .find({ incidentID: String(newIncidentID) })
          .toArray();
        if (incident.length > 0) {
          await incidentCollection.updateMany(
            { incidentID: String(newIncidentID) },
            { $set: { allocated: true } }
          );
        }

        // Send response
        res.status(200).json({
          message: "Resources updated successfully and incident status updated",
        });
      } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: error.message });
      }
    });
    // Start the server
    const PORT = 8067;
    app.listen(PORT, () => {
      console.log(`SERVER : http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e);
  }
}
async function getLocation(email) {
  await client.connect();
  console.log("Connected to MongoDB");

  // Access the database and collection
  const database = client.db("incidentAI");
  const volunteersCollection = database.collection("admin");
  try {
    // Fetch all incidents from the Incident collection
    const details = await volunteersCollection
      .find(
        { email: String(email) },
        { projection: { city: 1, zipcode: 1, _id: 0 } }
      )
      .toArray();

    // Send the incidents as a JSON response
    console.log(details);
  } catch (error) {
    console.log("Error fetching details:", error);
  }
}

//getLocation("khavin@vt.edu");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

//process.env.GOOGLE_API_KEY;
// Function to get address from lat/lng
async function getReverseGeocoding(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
  console.log(url);
  try {
    const response = await axios.get(url);
    const address = response.data.results[0]?.formatted_address || null;
    return address;
  } catch (error) {
    console.error("Error fetching reverse geocoding:", error);
    throw error;
  }
}
//getReverseGeocoding(37.245441, -80.419952);
// Call the main function to run the server
main().catch(console.error);
