import { useState, useEffect } from "react";
import VideoCard from "@components/VideoCard";
import styles from "@styles/Home.module.css";
import axios from "axios";
import { useAccount } from "wagmi";
import { Button } from "@chakra-ui/react";
import { sendTransaction } from "@wagmi/core";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function App() {
  const { address } = useAccount();
  const [videos, setvideos] = useState([]);
  const [videosLoaded, setvideosLoaded] = useState(false);

  const send = async () => {
    const { hash } = await sendTransaction({
      to: "0xc4e424b8ffe69309aecb273d53ee7c0464199ab7",
      value: parseEther("0.0001"),
    } as any);
  };

  const getVideos = async () => {
    try {
      const response = await axios.get("http://192.168.1.163:8888/videos"); // Change to your server URL if needed
      setvideos((oldVideos) => [...oldVideos, ...response.data]);
      setvideosLoaded(true);
    } catch (e) {
      console.error(e);
      setvideosLoaded(false);
    }
  };

  useEffect(() => {
    getVideos();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.sliderContainer}>
        {videos.length > 0 ? (
          <>
            {videos.map((video, id) => (
              <VideoCard
                key={id}
                index={id}
                video={video}
                lastVideoIndex={videos.length - 1}
                getVideos={getVideos}
              />
            ))}
          </>
        ) : (
          <>
            <h1>Nothing to show here</h1>
          </>
        )}
        {address && (
          <Button backgroundColor="black" onClick={send}>
            Send
          </Button>
        )}
        <ConnectButton />
      </div>
      {/* <BottomNav /> */}
    </main>
  );
}

export default App;
