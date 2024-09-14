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
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));

async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    // Access the database and collection
    const database = client.db("incidentAI"); // Replace with your database name
    const volunteersCollection = database.collection("volunteer"); // Replace with your collection name

    // Define routes after the client has connected
    app.get("/api/getResources", async (req, res) => {
      try {
        // Define the query to find available volunteers
        const query = { incidentID: { $in: [null, ""] } };
    
        // Updated pipeline to group by rId
        const pipeline = [
          { $match: query },
          { $group: { _id: "$rId", count: { $sum: 1 } } },
        ];
    
        // Execute the aggregation pipeline
        const results = await volunteersCollection.aggregate(pipeline).toArray();
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

    // Other routes
    app.post("/api/login", async (req, res) => {
      const body = req.body;
      // Implement login logic
    });

    app.get("/api/resourceRequests/:locName", async (req, res) => {
      let locId = req.params.locName;
      // Implement resource request handling
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
