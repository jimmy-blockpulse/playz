import * as dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import fs from "fs";
import { Web3Storage, File, Blob } from "web3.storage";
import { MongoClient, ServerApiVersion } from "mongodb";
import { createClient } from "pexels";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 8888;

const WEB3_STORAGE_API_KEY = process.env.WEB3_STORAGE_API_KEY ?? "";
const MONGO_USER = process.env.MONGO_USER ?? "";
const MONGO_PW = process.env.MONGO_PW ?? "";

const client = new Web3Storage({
  token: WEB3_STORAGE_API_KEY,
  endpoint: new URL("https://api.web3.storage"),
});

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PW}@cluster0.hsk5jk6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get("/videos", async (_, res) => {
  try {
    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");

    const videos = await videosCollection.find().limit(50).toArray();

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});

app.get("/files/:address", async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    await mongoClient.connect();

    const filesCollection = await mongoClient.db("playz").collection("files");

    const files = await filesCollection.find({ _id: address as any }).toArray();

    res.status(200).send(files);
  } catch (error) {
    console.error("Error while fetching files:", error);
    res.status(500).send("An error occurred");
  }
});

app.post("/upload", async (req: Request, res: Response) => {
  const files = (req as any).files;

  console.log("request received: ", files);

  if (!files) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  const address = req.body.address;

  console.log("address fetched: ", address);

  const uploadedFile = files.file;
  const filePath = "./uploads/" + uploadedFile.name;

  // Move the uploaded file to the uploads directory
  uploadedFile.mv(filePath, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "File upload failed" });
    }

    try {
      // Create a Blob from the uploaded file
      const blob = new Blob([fs.readFileSync(filePath)], {
        type: uploadedFile.mimetype,
      });

      // Create a File array
      const fileToUpload = [new File([blob], uploadedFile.name)];

      // Upload to web3.storage
      const fileCID = await client.put(fileToUpload);

      console.log("fileCID: ", fileCID);

      // Generate link to the file on web3.storage
      const url = `https://${fileCID}.ipfs.w3s.link/${uploadedFile.name}`;

      console.log("url: ", url);

      // Delete the file from server after it's been uploaded to the Web3.Storage
      fs.unlinkSync(filePath);

      await mongoClient.connect();

      const filesCollection = await mongoClient.db("playz").collection("files");

      await filesCollection.updateOne(
        { _id: address as any },
        {
          $set: {
            ["files." + fileCID]: url,
          },
        },
        { upsert: true }
      );

      res.status(200).send({
        message: "File uploaded successfully to Web3.Storage",
        url,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Web3.Storage upload failed" });
    }
  });
});

app.put("/videos/:videoId/like", async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const { address, isLiked } = req.body;

    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");

    console.log(isLiked);

    let update;

    if (isLiked) {
      update = {
        $set: {
          likes: { [address]: true },
        },
      };
    } else {
      update = {
        $set: {
          likes: { [address]: null },
        },
      };
    }

    const result = await videosCollection.updateOne(
      { _id: videoId as any },
      update,
      {
        upsert: true,
      }
    );
    console.log(result);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update video likes." });
  }
});

app.put("/videos/:videoId/comment", async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const { address, comment } = req.body;

    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");

    const update = {
      $set: {
        [`comments.${address}`]: comment,
      },
    };

    const result = await videosCollection.updateOne(
      { _id: videoId as any },
      update,
      {
        upsert: true,
      }
    );
    console.log(result);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update video comments." });
  }
});

app.delete("/videos/:videoId/comment", async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const { address } = req.body;

    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");

    const update = {
      $unset: {
        [`comments.${address}`]: 1,
      },
    };

    const result = await videosCollection.updateOne(
      { _id: videoId as any },
      update
    );
    console.log(result);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video comment." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
