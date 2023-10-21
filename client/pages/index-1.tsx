import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const [uploadedModel, setUploadedModel] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState();
  const [fetchedFiles, setFetchedFiles] = useState<any[]>([]);
  const { address } = useAccount();

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`http://192.168.1.163:8888/files/${address}`);
      setFetchedFiles(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  function handleModelUpload(e) {
    setUploadedModel(e.target.files[0]);
  }

  async function handleSubmit() {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedModel);
    formData.append("address", address);

    try {
      const res = await axios.post(
        "http://192.168.1.163:8888/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;
      console.log(data);
      fetchFiles();
    } catch (e) {
      console.error(e);
      setError(e);
    }
    setIsLoading(false);
  }

  const handleUrlClick = (clickedUrl: string) => {
    setUrl(clickedUrl);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <ConnectButton />
        <input
          type="file"
          name="images"
          id="images"
          required
          multiple
          onChange={handleModelUpload}
        />
        {uploadedModel && uploadedModel.name}
        <button onClick={handleSubmit} disabled={!uploadedModel || isLoading}>
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        {url && <video src={url} autoPlay playsInline width="300px" />}

        {error && (error as any).message}
        <div>
          {fetchedFiles.map((fileData, index) => (
            <div key={index}>
              {Object.values(fileData.files).map((url: string) => (
                <p key={url} onClick={() => handleUrlClick(url)}>
                  {url}
                </p>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
