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

mongoClient
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
  const { address } = req.query;
  try {
    await mongoClient.connect();
    const usersCollection = await mongoClient.db("playz").collection("users");
    const fetchedUser = await usersCollection.findOne({ _id: address as any });
    res.json(fetchedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.post("/users", async (req: Request, res: Response) => {
  const { address, username, imageCID, profileAddress } = req.body;

  try {
    await mongoClient.connect();

    const usersCollection = await mongoClient.db("playz").collection("users");

    const addedUser = await usersCollection.updateOne(
      { _id: address as any },
      {
        $set: {
          username: username,
          bio: "",
          image: imageCID,
          profileAddress: profileAddress,
        },
      },
      { upsert: true }
    );

    res.json({ message: "User successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user." });
  }
});

app.get("/videos", async (_, res) => {
  try {
    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");

    const videos = await videosCollection
      .find()
      .sort({ order: -1 })
      .limit(25)
      .toArray();

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});
app.get("/videos/:address", async (req, res) => {
  try {
    await mongoClient.connect();

    const videosCollection = await mongoClient.db("playz").collection("videos");
    const { address } = req.params;

    const videos = await videosCollection
      .find({ _id: address as any })
      .limit(10)
      .toArray();

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos by userId." });
  }
});

app.get("/creators", async (_, res) => {
  try {
    await mongoClient.connect();

    const creatorsCollection = await mongoClient
      .db("playz")
      .collection("creators");

    const creators = await creatorsCollection.find().limit(50).toArray();

    res.json(creators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch creators." });
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

  if (!files) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  const address = req.body.address;

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

      // Generate link to the file on web3.storage
      const url = `https://${fileCID}.ipfs.w3s.link/${uploadedFile.name}`;

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
