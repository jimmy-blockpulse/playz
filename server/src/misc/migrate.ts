import fs from "fs";
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

type InputType = {
  _id: number;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    link: string;
  }[];
  image: string;
  url: string;
  comments?: { [key: string]: string };
  likes?: { [key: string]: boolean };
};

type OutputType = {
  _id: string;
  url: string;
  thumbnail: string;
  tokenId: string;
  creator: string;
  creatorProfile: string;
  description: string;
  supply: number;
  price: number;
  royalty: number;
  isMemberEdition: boolean;
  likes: {};
  comments: {};
};

async function fetchVideos() {
  try {
    await mongoClient.connect();
    const videosCollection = await mongoClient.db("playz").collection("videos");
    const videos: any = await videosCollection.find().limit(25).toArray();

    return videos;
  } catch (err) {
    console.log(err);
  }
}

function transformData(data: InputType[]): OutputType[] {
  return data.map((item: InputType) => {
    let mobileVideoLink =
      item.video_files.find((video: any) => video.quality === "mobile")?.link ||
      "";

    const urlSegments = item.url.split("/");
    const descriptionSegment = urlSegments.slice(-2, -1)[0] || "";
    const cleanDescription = descriptionSegment
      .replace(/-\d+$/, "")
      .replace(/-/g, " ");
    const description =
      cleanDescription.charAt(0).toUpperCase() +
      cleanDescription.slice(1) +
      ".";

    if (!mobileVideoLink) {
      mobileVideoLink = item.video_files[0].link || "";
    }

    return {
      _id: "",
      url: mobileVideoLink,
      thumbnail: item.image,
      tokenId: "",
      creator: "",
      creatorProfile: "",
      description: description,
      supply: 100,
      price: 0.001,
      royalty: 2,
      isMemberEdition: false,
      likes: {},
      comments: {},
    };
  });
}

async function main() {
  const inputData = await fetchVideos();
  const transformedData = transformData(inputData);
  const jsonData = JSON.stringify(transformedData, null, 2);

  fs.writeFile("cachedVideos.json", jsonData, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Data has been written to output.json");
    }
  });
}

main();
