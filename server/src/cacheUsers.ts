import * as dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

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
  const userCollection = mongoClient.db("playz").collection("users");
  const videos = await videosCollection.find().toArray();

  for (const video of videos) {
    await userCollection.updateOne(
      { _id: video.user.id },
      { $set: video.user },
      { upsert: true }
    );
  }
  console.log("Finished caching videos.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
