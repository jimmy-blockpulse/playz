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
import Landing from "@components/Landing";
import { useCallback, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import PlayzProfile from "@data/PlayzProfile.json";
import { useAccount, useSigner } from "wagmi";

const PRIMARY_COLOR = "#ee4f69";

function User() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useAccount();
  const { isSignedIn, fetchedUser } = useAuth();
  const { data: signer, isError } = useSigner();
  const [isSuccess, setSuccess] = useState(false);
  const [isMember, setMember] = useState(false);
  const toast = useToast();

  const fetchMembership = useCallback(async () => {
    if (!fetchedUser) return;

    try {
      const contract = new ethers.Contract(
        fetchedUser.profileAddress,
        PlayzProfile.abi,
        signer
      );

      const balance = await contract["balanceOf(address,uint256)"](address, 0);
      setMember(balance.toString() === "1");
    } catch (e) {
      console.log(e);
    }
  }, [address, fetchedUser, signer]);

  const purchaseMembership = useCallback(async () => {
    if (!fetchedUser) return;

    try {
      const contract = new ethers.Contract(
        fetchedUser.profileAddress,
        PlayzProfile.abi,
        signer
      );

      const nftResult = await contract["mintMembership()"]();
      setSuccess(!!nftResult);
    } catch (e) {
      console.log(e);
    }
  }, [fetchedUser, signer]);

  useEffect(() => {
    if (isSuccess)
      toast({
        title: "Purchase successful.",
        status: "success",
        duration: 3000,
        isClosable: true,
        containerStyle: { marginBottom: "25px !important" },
      });
  }, [isSuccess, toast]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  if (!isSignedIn || !fetchedUser) return <Landing />;

  return (
    <VStack w="100%">
      <Navbar title={`${fetchedUser.username}`} />
      <VStack overflowY="scroll" w="100%">
        <UserHeader
          id={id}
          fetchedUser={fetchedUser}
          purchaseMembership={purchaseMembership}
          isMember={isMember}
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
            {/* this height here has to be dynamic based on number of rows */}
            <TabPanel padding="0" height="343px" w="100%">
              <UserContent fetchedUser={fetchedUser} isMember={isMember} />
            </TabPanel>
            <TabPanel>{/* <UserContent /> */}</TabPanel>
            <TabPanel>{/* <UserContent /> */}</TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </VStack>
  );
}

export default User;

function UserHeader({ id, fetchedUser, purchaseMembership, isMember }) {
  const { data: signer, isError } = useSigner();

  return (
    <VStack pt="5rem" pb=".5rem">
      <Image alt="hi" src={fetchedUser.image} className={styles.profileImg} />
      <Text>@{fetchedUser.username}</Text>
      {isMember && fetchedUser.username !== "jeremystarr_" && (
        <HStack mt="0.1rem" mb="0.25rem">
          <Button
            className={styles.memberBtn}
            backgroundColor={PRIMARY_COLOR}
            color="white"
          >
            Verified Member
          </Button>
          <Button
            className={styles.giftBtn}
            onClick={async () => {
              await signer.sendTransaction({
                to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
                value: ethers.utils.parseEther("0.0001"),
              });
            }}
          >
            <FaGift size={15} />
          </Button>
        </HStack>
      )}
      {id == 2 && fetchedUser.username !== "jeremystarr_" && (
        <HStack mt="0.1rem" mb="0.25rem">
          <Button
            className={styles.memberBtn}
            backgroundColor={PRIMARY_COLOR}
            color="white"
            onClick={purchaseMembership}
          >
            Become a member
          </Button>
          <Button
            className={styles.giftBtn}
            onClick={async () => {
              await signer.sendTransaction({
                to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
                value: ethers.utils.parseEther("0.0001"),
              });
            }}
          >
            <FaGift size={15} />
          </Button>
        </HStack>
      )}
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

function UserContent({ fetchedUser, isMember }) {
  const router = useRouter();

  return fetchedUser.username !== "jeremystarr_" ? (
    <VStack w="100%" pt="5rem" pl="1rem" pr="1rem">
      <Text fontSize="14px">You have not created any editions yet.</Text>
      <Button
        w="200px"
        color="white"
        mt="1rem"
        backgroundColor="#ee4f69 !important"
        fontSize="14px"
      >
        Create Edition
      </Button>
    </VStack>
  ) : (
    <SimpleGrid columns={3} spacing={1} className={styles.grid}>
      {isMember && (
        <VStack
          className={styles.thumbnailContainer}
          onClick={() => router.push("/feed/2")}
        >
          <video src="/newVideo.mp4" className={styles.thumbnail} />
          <HStack className={styles.thumbnailCaption}>
            <FaHeart size="12px" />
            <Text fontSize="12px">0</Text>
          </HStack>
        </VStack>
      )}
      {jeremy.map(({ video_files }, i) => (
        <VStack className={styles.thumbnailContainer} key={i}>
          <video src={video_files[0].link} className={styles.thumbnail}></video>
          <HStack className={styles.thumbnailCaption}>
            <FaHeart size="12px" />
            <Text fontSize="12px">{Math.round(Math.random() * 400) + 95}</Text>
          </HStack>
        </VStack>
      ))}
    </SimpleGrid>
  );
}
