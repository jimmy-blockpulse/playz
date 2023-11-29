import {
  VStack,
  HStack,
  Textarea,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Switch,
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import { useCallback, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { useSigner } from "wagmi";
import { TokenMetadata } from "@utils/types";
import { client } from "@utils/utils";
import { useAuth } from "./AuthProvider";
import PlayzProfile from "@data/PlayzProfile.json";
import { useRouter } from "next/router";

function CreateEdition({ uploadedFile, mediaURL, setUploadedFile }) {
  const { fetchedUser } = useAuth();
  const { data: signer, isError } = useSigner();
  const [description, setDescription] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState(0);
  const [tokenPrice, setTokenPrice] = useState("0");
  const [tokenRoyalty, setTokenRoyalty] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleTokenSupplyChange = (e: any) => {
    setTokenSupply(e.target.value);
  };

  const handleTokenPriceChange = (e: any) => {
    setTokenPrice((e.target.value as number).toString());
  };

  const handleTokenRoyaltyChange = (e: any) => {
    setTokenRoyalty(Math.round(e.target.value));
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
      _id: Math.round(Math.random() * 999999999) + 100000000,
      description: description,
      url: imageCID,
      video_files: [{ link: imageCID }],
      comments: {},
      likes: {},
    };

    const blob = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });

    const files = [new File([blob], "metadata.json")];
    const jsonCID = await client.put(files);
    const jsonLink = `https://${jsonCID}.ipfs.w3s.link/metadata.json`;

    return { jsonLink, jsonObject };
  }

  const handleMint = useCallback(
    async (cid: string) => {
      if (!fetchedUser) return;

      try {
        const contract = new ethers.Contract(
          fetchedUser.profileAddress,
          PlayzProfile.abi,
          signer
        );

        const nftResult = await contract[
          "createEdition(string,uint256,uint256,uint256,bool)"
        ](
          cid,
          BigNumber.from(tokenSupply),
          ethers.utils.parseEther(tokenPrice),
          BigNumber.from(tokenRoyalty),
          false
        );

        return nftResult;
      } catch (e) {
        console.log(e);
      }
    },
    [fetchedUser, signer, tokenPrice, tokenRoyalty, tokenSupply]
  );

  async function handleListAsset() {
    setLoading(true);
    const { jsonLink: uploadedJSON, jsonObject: metadata } = await uploadJSON();
    console.log("TokenMetadata successfully uploaded to IPFS: ", uploadedJSON);
    const nftResult = await handleMint(uploadedJSON);
    if (nftResult) {
      if (fetchedUser.username !== "jeremystarr_") router.push("/feed/1");
      else router.push("/");
    }
    setLoading(false);
  }

  return (
    <VStack pt="4.5rem" pl="1.5rem" pr="1.5rem" gap={3}>
      <HStack width="100%">
        <Textarea
          placeholder="Describe your content in details under 1000 characters."
          className={styles.descriptionInput}
          onChange={handleDescriptionChange}
        />
        {uploadedFile && uploadedFile.type.startsWith("video") ? (
          <video controls width="100">
            <source src={mediaURL} type={uploadedFile.type} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={mediaURL} alt="Uploaded preview" width="100" />
        )}
      </HStack>
      <HStack width="100%" justifyContent="space-between">
        <Text className={styles.label}>Number of Editions</Text>
        <Input
          placeholder="100"
          className={styles.labelInput}
          onChange={handleTokenSupplyChange}
          type="number"
        />
      </HStack>
      <HStack width="100%" justifyContent="space-between">
        <Text className={styles.label}>Price</Text>
        <Input
          placeholder="0 (in ETH)"
          className={styles.labelInput}
          onChange={handleTokenPriceChange}
          type="number"
        />
      </HStack>
      <HStack width="100%" justifyContent="space-between">
        <Text className={styles.label}>Royalty Percentage</Text>
        <Input
          placeholder="2%"
          className={styles.labelInput}
          onChange={handleTokenRoyaltyChange}
          type="number"
        />
      </HStack>
      <Accordion w="100%" border="none" allowToggle pt="1rem">
        <AccordionItem w="100%" border="none">
          <h2>
            <AccordionButton w="100%" p="0">
              <Text className={styles.label} w="100%" textAlign="left">
                Advanced Preferences
              </Text>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack w="100%" gap={5} pt="1rem">
              <HStack width="100%" justifyContent="space-between">
                <Text className={styles.label}>Only Visible to Members</Text>
                <Switch colorScheme="pink" />
              </HStack>
              <HStack width="100%" justifyContent="space-between">
                <Text className={styles.label}>Only Mintable by Members</Text>
                <Switch colorScheme="pink" />
              </HStack>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <HStack position="absolute" w="100%" bottom={0} p="1.5rem">
        <Button w="100%" onClick={() => setUploadedFile(null)}>
          <Text>Cancel</Text>
        </Button>
        <Button
          w="100%"
          color="white"
          backgroundColor="#ee4f69 !important"
          onClick={handleListAsset}
        >
          {isLoading ? <Spinner color="white" /> : "Post"}
        </Button>
      </HStack>
    </VStack>
  );
}

export default CreateEdition;
