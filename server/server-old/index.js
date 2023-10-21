const axios = require("axios");
const request = require("request");
const fs = require("fs");

// var options = {
//   method: "POST",
//   url: "https://api.thetavideoapi.com/upload",
//   headers: {
//     "x-tva-sa-id": "srvacc_73d1t3xkj7schx68m525evrzw",
//     "x-tva-sa-secret": "pkq3w8xq63ggzkuaj7k5rbxpnxbtsmrc",
//   },
// };

const options1 = {
  method: "PUT",
  url: "https://storage.googleapis.com/files.thetavideoapi.com/srvacc_73d1t3xkj7schx68m525evrzw/upload_ba38ffj7kbit0und7tike5ypp?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=prod-tva-dispatcher-sa%40prod-theta-video-api.iam.gserviceaccount.com%2F20230519%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230519T054254Z&X-Goog-Expires=901&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=5e877b00611e88ba96ec0d5849690c77fa054a68c20716a414aa3eae3756ade090e02c46c7c4e66aaf9c3c2f59659bbeebaea88eaa99ad733fc23c05fd65e50732fc47233504407153ed785a8feaf03854259e86624576b8923ce51c23aae30e1d994d46b6da934a275f4b1ad6f9e36d7bb36cf8c3cb04f42c7d72f23010f69a3c3324f4f65ba63f50ed8ea5003bfb63ebb39bcf07485917ee07c64f4bfbb0e8d4ace36478a378f1b300522f774fc149754f860ec4b7c4e340545a8c10205afa61ff0e728a04e5cbc5a6758f4184fbbbd26a41c7327c399498e94f991e6be9f68b4fdaef53dcba226c5789177f0a1169c5bec63abb7610d24ab567855c58ad85",
  headers: {
    "Content-Type": "application/octet-stream",
  },
  body: fs.createReadStream("video.mp4"),
};

async function main() {
  request(options1, function (error, response) {
    if (error) throw new Error(error);

    const options2 = {
      method: "POST",
      url: "https://api.thetavideoapi.com/video",
      headers: {
        "x-tva-sa-id": "srvacc_73d1t3xkj7schx68m525evrzw",
        "x-tva-sa-secret": "pkq3w8xq63ggzkuaj7k5rbxpnxbtsmrc",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_upload_id: response.body.uploads[0].id,
        playback_policy: "public",
        nft_collection: "0x5d0004fe2e0ec6d002678c7fa01026cabde9e793",
      }),
    };

    request(options2, function (error, response) {
      if (error) throw new Error(error);
      return response.body;
    });
  });
}

main();
