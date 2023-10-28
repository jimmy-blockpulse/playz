import axios from "axios";
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

async function getRandomUsers(count: number = 1) {
  try {
    const response = await axios.get("https://randomuser.me/api/", {
      params: {
        results: count,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function main() {
  await mongoClient.connect();
  const creators = mongoClient.db("playz").collection("creators");

  const userCount = 200;
  const users = await getRandomUsers(userCount);

  // Modify users array to set _id as email.
  const formattedUsers = users.map((user: any) => ({
    ...user,
    _id: user.email,
  }));

  // Saving formatted users to the "creators" collection in MongoDB.
  await creators.insertMany(formattedUsers);
  console.log(
    `Inserted ${formattedUsers.length} users into the MongoDB creators collection.`
  );

  await mongoClient.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
