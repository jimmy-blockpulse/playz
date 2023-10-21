import * as dotenv from "dotenv";
import { createClient } from "pexels";
import { MongoClient, ServerApiVersion } from "mongodb";
import Bottleneck from "bottleneck";

dotenv.config();

const client = createClient(
  "RVYfixYLghmAlg9vIxztS4LF9EgOXGBIPtWV9zMFcWeslL6orXvixEvk"
);

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

// create a new limiter
const limiter = new Bottleneck({
  minTime: 3000, // minimum time between jobs in ms
});

async function main() {
  // connect to MongoDB
  await mongoClient.connect();
  const videosCollection = mongoClient.db("playz").collection("videos");

  // fetch and cache 1000 videos
  let page = 1;
  let totalVideos = 0;
  while (totalVideos < 1000) {
    // rate limited call
    await limiter.schedule(async () => {
      try {
        const videos = await client.videos.popular({
          page: page,
          per_page: 80,
        });

        for (const video of (videos as any).videos) {
          // store each video in MongoDB
          await videosCollection.updateOne(
            { _id: video.id },
            { $set: video },
            { upsert: true }
          );
        }

        totalVideos += (videos as any).videos.length;
        console.log(totalVideos, " videos cached");
        page++;
      } catch (error) {
        console.error("An error occurred:", error);
      }
    });
  }

  console.log("Finished caching videos.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
