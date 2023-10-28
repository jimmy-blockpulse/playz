import * as dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import fs from "fs"; // Import the fs module

dotenv.config();
const MONGO_USER = process.env.MONGO_USER ?? "";
const MONGO_PW = process.env.MONGO_PW ?? "";

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PW}@cluster0.hsk5jk6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  await mongoClient.connect();
  const videosCollection = mongoClient.db("playz").collection("videos");
  const videos = await videosCollection.find().limit(10).toArray();

  // Save the videos to a local JSON file
  const filePath = "./videos.json"; // Define the path where you want to save the JSON file
  fs.writeFileSync(filePath, JSON.stringify(videos, null, 2)); // Write data to the file in a pretty-printed format

  console.log("Finished saving videos locally.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
