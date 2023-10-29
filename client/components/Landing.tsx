import { Button, VStack, Text, Box, HStack, Spinner } from "@chakra-ui/react";
import styles from "@styles/Main.module.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { FaPlusCircle, FaUser } from "react-icons/fa";
import { ethers } from "ethers";
import PlayzProfile from "@data/PlayzProfile.json";
import { useAccount, useSigner } from "wagmi";
import { abridgeAddress, client } from "@utils/utils";
import axios from "axios";
import { API_URL } from "pages";
import { profile } from "console";
import SuccessLottie from "./SuccessLottie";

function Landing() {
  const { fetchedUser } = useAuth();
  const [currentVideo, setCurrentVideo] = useState(0);

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
      {fetchedUser ? <SignIn /> : <SignUp />}
      <div className={styles.overlay} />
    </main>
  );
}

function SignIn() {
  const { handleSignIn } = useAuth();
  return (
    <VStack className={styles.textContainer}>
      <VStack className={styles.centeredText}>
        <div className={styles.title}>PLAYZ</div>
        <div className={styles.subtitle}>Unleash your creative capital</div>
      </VStack>
      <Button className={styles.connectBtn} onClick={handleSignIn}>
        SIGN IN
      </Button>
    </VStack>
  );
}

function SignUp() {
  const { address } = useAccount();
  const { isSignedIn, handleSignIn, fetchUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [mediaURL, setMediaURL] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [profileAddress, setProfileAddress] = useState("");
  const fileInputRef = useRef(null);
  const { data: signer, isError } = useSigner();

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUsernameChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setMediaURL(URL.createObjectURL(file));
    }
  };

  const handleStepOne = () => {
    if (!isSignedIn) {
      setLoading(true);
      handleSignIn();
    }
    // setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (isSignedIn) {
      setCurrentStep((prev) => prev + 1);
      setLoading(false);
    }
  }, [isSignedIn]);

  const handleStepTwo = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleStepThree = () => {
    deployContract();
  };

  const handleStepFour = async () => {
    await fetchUser();
  };

  const goBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  async function uploadImage() {
    if (!uploadedFile) return;

    const blob = new Blob([uploadedFile], { type: uploadedFile.type });
    const imageToUpload = [new File([blob], "file")];
    const imageCID = await client.put(imageToUpload);
    const imageLink = `https://${imageCID}.ipfs.w3s.link/file`;

    return imageLink;
  }

  async function uploadJSON() {
    const imageCID = await uploadImage();

    const jsonObject = {
      username: username,
      bio: "description",
      image: imageCID,
    };

    const blob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });

    const files = [new File([blob], "profile.json")];
    const jsonCID = await client.put(files);
    const jsonLink = `https://${jsonCID}.ipfs.w3s.link/profile.json`;

    return { jsonLink, jsonObject, imageCID };
  }

  async function deployContract() {
    if (!signer) return;
    setLoading(true);

    try {
      const {
        jsonLink: uploadedJSON,
        jsonObject,
        imageCID,
      } = await uploadJSON();

      console.log("collection metadata successfully uploaded: ", uploadedJSON);

      const contractFactory = new ethers.ContractFactory(
        PlayzProfile.abi,
        PlayzProfile.bytecode,
        signer
      );

      const contract = await contractFactory.deploy(uploadedJSON);
      setProfileAddress(contract.address);
      console.log("contract deployed");
      console.log("contract address: ", contract.address);

      if (contract) {
        const userData = {
          address,
          username,
          imageCID,
          profileURI: uploadedJSON,
          profileAddress: contract.address,
        };

        const response = await axios.post(`${API_URL}/users`, userData);
        if (response.data) {
          setCurrentStep((prev) => prev + 1);
        }
        console.log("Response from server:", response.data);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  function getComponent() {
    switch (currentStep) {
      case 0:
        return (
          <VStack className={styles.textContainer}>
            <VStack className={styles.centeredText}>
              <div className={styles.title}>PLAYZ</div>
              <div className={styles.subtitle}>
                Unleash your creative capital
              </div>
            </VStack>
            <Button className={styles.connectBtn} onClick={handleStepOne}>
              {isLoading ? <Spinner color="white" /> : "SIGN IN"}
            </Button>
          </VStack>
        );
      case 1:
        return (
          <VStack className={styles.textContainer}>
            <VStack position="absolute" pt="80px" pb="80px">
              <Text className={styles.welcome}>Welcome!</Text>
              <Text className={styles.createHeader}>
                Create your Playz profile to get started.
              </Text>
            </VStack>
            <VStack className={styles.centeredText2}>
              <VStack>
                <Text>Select a username</Text>
                <input
                  className={styles.usernameInput}
                  onChange={handleUsernameChange}
                  value={username}
                />
              </VStack>
            </VStack>
            <Button
              position="absolute"
              className={styles.continueBtn}
              onClick={handleStepTwo}
            >
              CONTINUE
            </Button>
          </VStack>
        );
      case 2:
        return (
          <VStack className={styles.textContainer}>
            <VStack position="absolute" pt="80px" pb="80px">
              <Text className={styles.welcome}>Welcome!</Text>
              <Text className={styles.createHeader}>
                Create your Playz profile to get started.
              </Text>
            </VStack>
            {!mediaURL ? (
              <VStack className={styles.centeredText2}>
                <Text>Add Profile Picture</Text>
                <VStack
                  className={styles.uploadBtn}
                  onClick={handleUploadClick}
                >
                  <Box className={styles.uploadProfile}>
                    <FaUser size={60} />
                    <Box className={styles.plusBtn}>
                      <FaPlusCircle size={25} />
                    </Box>
                  </Box>
                </VStack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Text className={styles.username}>@{username}</Text>
              </VStack>
            ) : (
              <VStack className={styles.centeredText2}>
                <Text>Preview Profile</Text>
                <img
                  src={mediaURL}
                  alt="Uploaded preview"
                  className={styles.uploadedProfile}
                />
                <Text className={styles.username}>@{username}</Text>
              </VStack>
            )}
            <HStack position="absolute" bottom="80px">
              <Button className={styles.backBtn} bottom="0px" onClick={goBack}>
                GO BACK
              </Button>
              <Button
                className={styles.continueBtn}
                bottom="0px"
                onClick={handleStepThree}
              >
                {isLoading ? <Spinner color="white" /> : "CREATE"}
              </Button>
            </HStack>
          </VStack>
        );
      case 3:
        return (
          <VStack className={styles.textContainer}>
            <VStack position="absolute" pt="80px" pb="80px">
              <Text className={styles.welcome}>Welcome!</Text>
              <Text className={styles.createHeader}>
                You've successfully created your profile.
              </Text>
            </VStack>
            <VStack className={styles.centeredText2}>
              <Text>Your Playz Profile</Text>
              <img
                src={mediaURL ?? ""}
                alt="Uploaded preview"
                className={styles.uploadedProfile}
              />
              <Text className={styles.username}>@{username}</Text>
            </VStack>
            <HStack position="absolute" bottom="80px">
              <Button
                className={styles.continueBtn}
                bottom="0px"
                onClick={handleStepFour}
                zIndex={99}
              >
                {isLoading ? <Spinner color="white" /> : "ENTER APP"}
              </Button>
            </HStack>
            <HStack position="absolute" height="100vh">
              <SuccessLottie />
            </HStack>
          </VStack>
        );
    }
  }

  return getComponent();
}

export default Landing;
