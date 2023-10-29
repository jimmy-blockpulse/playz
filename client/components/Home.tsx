import { useState, useEffect } from "react";
import VideoCard from "@components/VideoCard";
import styles from "@styles/Home.module.css";
import axios from "axios";
import { VStack, Spinner } from "@chakra-ui/react";
import Header from "./Header";
import MenuBar from "./Menu";
import { API_URL } from "pages";
import Navbar from "./Navbar";
import CreateEdition from "./CreateEdition";

function Home() {
  const [videos, setvideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [mediaURL, setMediaURL] = useState(null);

  const [videosLoaded, setvideosLoaded] = useState(false);

  const getVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/videos`);
      const combinedVideos = [...response.data];
      // Shuffle videos using Fisher-Yates algorithm
      for (let i = combinedVideos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedVideos[i], combinedVideos[j]] = [
          combinedVideos[j],
          combinedVideos[i],
        ];
      }
      setvideos(combinedVideos);
      setvideosLoaded(true);
      // setvideos((oldVideos) => [...oldVideos, ...response.data]);
      // setvideosLoaded(true);
    } catch (e) {
      console.error(e);
      setvideosLoaded(false);
    }
  };

  const getCreators = async () => {
    try {
      const response = await axios.get(`${API_URL}/creators`);
      setCreators((oldVideos) => [...oldVideos, ...response.data]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getVideos();
    getCreators();
  }, []);

  if (uploadedFile)
    return (
      <main className={styles.main}>
        <Navbar title="" isPost setUploadedFile={setUploadedFile} />
        <CreateEdition
          uploadedFile={uploadedFile}
          mediaURL={mediaURL}
          setUploadedFile={setUploadedFile}
        />
      </main>
    );

  return (
    <main className={styles.main}>
      <Header isFeed={false} />
      <div className={styles.sliderContainer}>
        {videos.length > 0 ? (
          <>
            {videos.slice(0, 10).map((video, id) => (
              <VideoCard
                key={id}
                index={id}
                video={video}
                lastVideoIndex={videos.length - 1}
                getVideos={getVideos}
                creator={creators[video._id % 10]}
              />
            ))}
          </>
        ) : (
          <VStack h="100vh" justifyContent="center">
            <Spinner />
          </VStack>
        )}
      </div>
      <MenuBar setUploadedFile={setUploadedFile} setMediaURL={setMediaURL} />
    </main>
  );
}

export default Home;
