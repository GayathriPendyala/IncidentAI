import mysql2 from "mysql2";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

const app = express();
app.use(express.json());
app.use(cookieParser());

// Set cors configuration
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));

const PORT = 8067;
// Start the server
app.listen(PORT, () => {
  console.log(`SERVER : http://localhost:${PORT}`);
  connection.connect((err) => {
    if (err) throw err;
    console.log("DATABASE CONNECTION SUCCESFUL");
  });
});

app.get("/api/getResources", async (req, res) => {
  res.send(txt);
});
app.post("/api/login", async (req, res) => {
  const body = req.body;
});

app.get("/api/resourceRequests/:locName", async (req, res) => {
  let locId = req.params.locName;
});
