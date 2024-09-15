// import express from "express";
// import cors from "cors";
// import { MongoClient, ServerApiVersion } from "mongodb";

// // DB connection string
// const uri =
//   "mongodb+srv://admin:f8jkTV44DGVj0C2j@cluster0.mep41.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// const app = express();
// app.use(express.json());

// // Set cors configuration
// app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));

// const PORT = 8067;
// // Start the server
// app.listen(PORT, () => {
//   console.log(`SERVER : http://localhost:${PORT}`);
// });

// app.get("/api/getResources", async (req, res) => {
//   let txt = "hello";
//   res.send(txt);
// });
// app.post("/api/login", async (req, res) => {
//   const body = req.body;
// });

// app.get("/api/resourceRequests/:locName", async (req, res) => {
//   let locId = req.params.locName;
// });

// server.js or index.js

import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import { run } from "./gemini_api.js";


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

    app.post("/api/creatingIncident", async (req, res) => { 
      try {
        const { incidentText, name, phoneNumber, address } = req.body;

        // Validate that incidentText is provided
        if (!incidentText) {
          return res.status(400).json({ error: "Incident text is required." });
        }

        const aiResult = await run(incidentText);

        // Construct the new incident object
        const newIncident = {
          incidentText, // Mandatory field
          name, // Optional
          phoneNumber, // Optional
          address, // Optional
          datetime: new Date(), // Auto-generated current datetime
          aiResult,
        };

        // Insert the new incident into the Incident collection
        const result = await client
          .db("incidentAI")
          .collection("Incident")
          .insertOne(newIncident);
        
        

        // Return the success response with the auto-generated _id
        res.status(201).json({
          message: "Incident created successfully",
          incidentId: result.insertedId, // Return MongoDB's auto-generated _id
          aiRecommendation: aiResult,
        });
      } catch (error) {
        console.error("Error creating incident:", error);
        res
          .status(500)
          .json({ error: "An error occurred while creating the incident." });
      }
    });
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

        // Send response
        res.status(200).json({ message: "Resources updated successfully" });
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

// Call the main function to run the server
main().catch(console.error);
