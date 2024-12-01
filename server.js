import express from "express";
import adler32 from "adler-32";
import fs from "fs";
import data from "./data/data.json" assert { type: "json" };
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import { table } from "console";


const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_USER_PASSWORD}@gfglearning.6xzu0.mongodb.net/?retryWrites=true&w=majority&appName=GfgLearning`;

async function main(){
    await mongoose.connect(uri);
}
main();

const tableSchema = new mongoose.Schema({
  original_url: String,
  hash: String,
})

const primaryTable = mongoose.model("primaryTable", tableSchema)


// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/info", (req, res) => {
  res.send(
    'This is url shortner. Send POST request to /shortner with your full url body = {"original_url":"https://www.google.com" }'
  );
});

app.get("/", async (req, res) => {
    const records = await primaryTable.find();
  res.json(records);
});

app.get("/:hash",async (req, res) => {
  const hash = req.params.hash;
  console.log(hash);
  const item = await primaryTable.find({hash : hash});
  if (item.length > 0) {
    res.json(item[0].original_url);
    return;
  }
  res.send("Not found check your hash");
});

app.post("/shortner", async (req, res) => {
  const { original_url } = req.body;
  console.log(original_url);
  const hash = adler32.str(original_url);
  const hashHex = hash.toString(16).padStart(8, "0");
  const newRecord = await primaryTable.create({
    original_url: original_url,
    hash: hashHex
  })
//   const mapping = {
//     original_url: original_url,
//     hash: hashHex,
//   };
//   data.push(mapping);
//   fs.writeFileSync("./data/data.json", JSON.stringify(data));
  if (newRecord) {
    res.status(200);
    console.log(newRecord);
    res.json(newRecord);
    return;
  } else {
     res.status(500);
     res.send("something went wrong"); 
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
