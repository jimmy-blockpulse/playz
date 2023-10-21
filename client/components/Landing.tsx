import { Button, VStack } from "@chakra-ui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import styles from "@styles/Main.module.css";
import { InjectedConnector } from "@wagmi/core";
import React, { useState, useEffect } from "react";
import { useConnect } from "wagmi";

function Landing() {
  const [currentVideo, setCurrentVideo] = useState(1);
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prevVideo) => (prevVideo === 3 ? 1 : prevVideo + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.hero}>
      {[1, 2, 3].map((videoNum) => (
        <video
          key={videoNum}
          autoPlay
          loop
          muted
          playsInline
          className={`${styles.backgroundVideo} ${
            currentVideo !== videoNum ? styles.fadeOut : ""
          }`}
        >
          <source src={`/${videoNum}.mp4`} type="video/mp4" />
        </video>
      ))}
      <VStack className={styles.textContainer}>
        <VStack className={styles.centeredText}>
          <div className={styles.title}>PLAYZ</div>
          <div className={styles.subtitle}>Unleash your creative capital</div>
        </VStack>
        <Button className={styles.connectBtn} onClick={openConnectModal}>
          CONNECT
        </Button>
      </VStack>
      <div className={styles.overlay} />
    </main>
  );
}

export default Landing;
