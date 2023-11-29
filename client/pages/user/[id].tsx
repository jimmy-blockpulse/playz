import {
  VStack,
  Text,
  Image,
  HStack,
  Divider,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Button,
  useToast,
} from "@chakra-ui/react";
import Navbar from "@components/Navbar";
import { useRouter } from "next/router";
import styles from "@styles/User.module.css";
import jeremy from "@data/jeremy.json";
import { FaFilm, FaGift, FaHeart, FaVideo } from "react-icons/fa";
import { useAuth } from "@components/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import PlayzProfile from "@data/PlayzProfile.json";
import { useAccount, useSigner } from "wagmi";

const PRIMARY_COLOR = "#ee4f69";

function User() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useAccount();
  const { isSignedIn, user } = useAuth();
  const { data: signer, isError } = useSigner();
  const [isSuccess, setSuccess] = useState(false);
  const [isMember, setMember] = useState(false);
  const toast = useToast();

  const sampleSendTxn = async () => {
    await signer.sendTransaction({
      to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      value: ethers.utils.parseEther("0.0001"),
    });
  };

  // INCOMPELTE
  const fetchMembership = useCallback(async () => {
    if (!user) return;

    try {
      const contract = new ethers.Contract(user._id, PlayzProfile.abi, signer);

      const balance = await contract["balanceOf(address,uint256)"](address, 0);
      // ...
    } catch (e) {
      console.log(e);
    }
  }, [address, user, signer]);

  const purchaseMembership = useCallback(async () => {
    if (!user) return;

    try {
      const contract = new ethers.Contract(user._id, PlayzProfile.abi, signer);

      const nftResult = await contract["mintMembership()"]();
      setSuccess(!!nftResult);
    } catch (e) {
      console.log(e);
    }
  }, [signer, user]);

  //   useEffect(() => {
  //     if (isSuccess)
  //       toast({
  //         title: "Purchase successful.",
  //         status: "success",
  //         duration: 3000,
  //         isClosable: true,
  //         containerStyle: { marginBottom: "25px !important" },
  //       });
  //   }, [isSuccess, toast]);

  useEffect(() => {
    // fetchMembership();
  }, [fetchMembership]);

  console.log("issignedin: ", isSignedIn);
  console.log("user: ", user);

  return (
    <VStack w="100%">
      <Navbar title={`${user.username}`} />
      <VStack overflowY="scroll" w="100%">
        <UserHeader
          id={id}
          user={user}
          purchaseMembership={purchaseMembership}
          isMember={isMember}
          sampleSendTxn={sampleSendTxn}
        />
        <Tabs isFitted width="100%" pl="0.2rem" pr="0.2rem">
          <TabList w="100%">
            <Tab
              _selected={{
                color: PRIMARY_COLOR,
                borderBottomColor: PRIMARY_COLOR,
              }}
            >
              <FaFilm />
            </Tab>
            <Tab
              _selected={{
                color: PRIMARY_COLOR,
                borderBottomColor: PRIMARY_COLOR,
              }}
            >
              <FaVideo />
            </Tab>
            <Tab
              _selected={{
                color: PRIMARY_COLOR,
                borderBottomColor: PRIMARY_COLOR,
              }}
            >
              <FaHeart />
            </Tab>
          </TabList>
          <TabPanels w="100%">
            <TabPanel padding="0" height="343px" w="100%">
              <UserContent />
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </VStack>
  );
}

function UserHeader({ id, user, purchaseMembership, isMember, sampleSendTxn }) {
  return (
    <VStack pt="5rem" pb=".5rem">
      <Image alt="hi" src={user.image} className={styles.profileImg} />
      <Text>@{user.username}</Text>
      <HStack mt="0.1rem" mb="0.25rem">
        <Button
          className={styles.memberBtn}
          backgroundColor={PRIMARY_COLOR}
          color="white"
          onClick={purchaseMembership}
        >
          {isMember ? "Verified Member" : "Become a member"}
        </Button>
        <Button className={styles.giftBtn} onClick={sampleSendTxn}>
          <FaGift size={15} />
        </Button>
      </HStack>
      <HStack className={styles.cellContainer}>
        <VStack gap={0}>
          <Text className={styles.cellTitle}>{id == 2 ? 38 : 0}</Text>
          <Text className={styles.cellSubtitle}>Posts</Text>
        </VStack>
        <Divider
          orientation="vertical"
          colorScheme="whiteAlpha"
          height="1rem"
        />
        <VStack gap={0}>
          <Text className={styles.cellTitle}>{id == 2 ? "1.5K" : "0"}</Text>
          <Text className={styles.cellSubtitle}>Likes</Text>
        </VStack>
        <Divider
          orientation="vertical"
          colorScheme="whiteAlpha"
          height="1rem"
        />
        <VStack gap={0}>
          <Text className={styles.cellTitle}>{id == 2 ? "392" : "0"}</Text>
          <Text className={styles.cellSubtitle}>Members</Text>
        </VStack>
      </HStack>
    </VStack>
  );
}

function UserContent() {
  return (
    <SimpleGrid columns={3} spacing={1} className={styles.grid}>
      {jeremy.map(({ video_files }, i) => (
        <VStack className={styles.thumbnailContainer} key={i}>
          <Image
            alt="image"
            src={video_files[0].image}
            className={styles.thumbnail}
          ></Image>
          <HStack className={styles.thumbnailCaption}>
            <FaHeart size="12px" />
            <Text fontSize="12px">{Math.round(Math.random() * 400) + 95}</Text>
          </HStack>
        </VStack>
      ))}
    </SimpleGrid>
  );
}

export default User;
