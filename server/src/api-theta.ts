import * as dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
// import { assets } from "./assets";
import fileUpload from "express-fileupload";
import axios from "axios";
import fs from "fs";
import request from "request";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 8888;

// Setup middlewares
app.use(helmet()); // Helmet helps to secure Express apps by setting various HTTP headers
app.use(cors()); // CORS middleware to handle cross-origin requests
app.use(express.json()); // Built-in middleware to parse incoming requests with JSON payloads
// app.use("/assets", assets);

// Handle file uploads
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.post("/upload", async (req: Request, res: Response) => {
  const files = (req as any).files;

  console.log("request received: ", files);

  // Check if file was provided in the request
  if (!files) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  const uploadedFile = files.file;
  const filePath = "./uploads/" + uploadedFile.name;

  // Move the uploaded file to the uploads directory
  uploadedFile.mv(filePath, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "File upload failed" });
    }

    console.log("API ID: ", process.env.API_ID);
    console.log("API SEC: ", process.env.API_SECRET);

    const options = {
      method: "POST",
      url: "https://api.thetavideoapi.com/upload",
      headers: {
        "x-tva-sa-id": process.env.API_ID,
        "x-tva-sa-secret": process.env.API_SECRET,
      },
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });

    // try {
    //   if (!process.env.API_ID || !process.env.API_SECRET) {
    //     console.log("env keys messed up");
    //     res.status(500).send({ message: "Theta API request failed" });
    //     return;
    //   }
    //   // Make a PUT request to Theta API with the uploaded file
    //   const response1 = await axios.post(
    //     "https://api.thetavideoapi.com/upload",
    //     {}, // you can replace this with the actual payload if there's any
    //     {
    //       headers: {
    //         "x-tva-sa-id": process.env.API_ID,
    //         "x-tva-sa-secret": process.env.API_SECRET,
    //       },
    //     }
    //   );

    //   console.log(
    //     "response1 URL: ",
    //     response1.data.body.uploads[0].presigned_url
    //   );

    //   // Make a PUT request to Theta API with the uploaded file
    //   await axios.put(
    //     // url should be generated dynamically
    //     response1.data.body.uploads[0].presigned_url,
    //     fs.createReadStream(filePath),
    //     {
    //       headers: { "Content-Type": "application/octet-stream" },
    //     }
    //   );

    //   // Make a POST request to Theta API with necessary information
    //   const response2 = await axios.post(
    //     "https://api.thetavideoapi.com/video",
    //     {
    //       source_upload_id: response1.data.body.uploads[0].id,
    //       playback_policy: "public",
    //       nft_collection: "0x5d0004fe2e0ec6d002678c7fa01026cabde9e793",
    //     },
    //     {
    //       headers: {
    //         "x-tva-sa-id": process.env.API_ID ?? "",
    //         "x-tva-sa-secret": process.env.API_SECRET ?? "",
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   console.log("response2 URL: ", response2.data.body);

    //   // Delete the file from server after it's been uploaded to the Theta API
    //   fs.unlinkSync(filePath);

    //   res.status(200).send(response2.data.body);
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).send({ message: "Theta API request failed" });
    // }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
