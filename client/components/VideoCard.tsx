import { useRef, useState, useEffect, useCallback } from "react";
import styles from "@styles/Home.module.css";
import useIsInViewport from "@hooks/useIsInViewport";
import {
  FaArrowUp,
  FaCommentDots,
  FaHeart,
  FaShare,
  FaShoppingBag,
} from "react-icons/fa";
import {
  VStack,
  Text,
  useDisclosure,
  Input,
  HStack,
  Image,
  useToast,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import axios from "axios";
import { useAccount, useSigner } from "wagmi";
import dummyUsers from "@data/Users.json";
import dummyComments from "@data/Comments.json";
import { API_URL } from "pages";
import { useAuth } from "./AuthProvider";
import { ethers, BigNumber } from "ethers";
import PlayzProfile from "@data/PlayzProfile.json";

const VideoCard = ({ index, video, lastVideoIndex, getVideos, creator }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const toast = useToast();

  const { address } = useAccount();
  const isInViewport = useIsInViewport(videoRef);
  const [loadNewVidsAt, setloadNewVidsAt] = useState(lastVideoIndex);
  const [comment, setComment] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: signer, isError } = useSigner();

  // count the number of true values in the likes object
  const initialLikesCount = Object.values(video.likes || {}).filter(
    Boolean
  ).length;
  const [likes, setLikes] = useState(Math.round(Math.random() * 25) + 15);

  const initialIsLiked = Boolean(video.likes && video.likes[address]);
  const [isLiked, setLiked] = useState(initialIsLiked);

  const initialCommentsCount = Object.values(video.comments || {}).length;
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setBookmarked] = useState(false);

  const { fetchedUser, fetchedUser1 } = useAuth();

  const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  useEffect(() => {
    const numComments = 6 + Math.floor(Math.random() * 8);
    const generateUsers = () => {
      let randomUsers = [];
      for (let i = 0; i < numComments; i++) {
        const randomUser = getRandomItem(dummyUsers);
        randomUsers.push(randomUser);
      }
      setUsers(randomUsers);
    };
    const generateComments = () => {
      let randomComments = [];
      for (let i = 0; i < numComments; i++) {
        const randomComment = getRandomItem(dummyComments);
        randomComments.push(randomComment);
      }
      setComments(randomComments);
    };

    generateUsers();
    generateComments();
  }, []);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${API_URL}/videos/${video._id}/comment`,
        {
          address,
          comment,
        }
      );

      if (response.data.success) {
        setNewComment(comment);
        setComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isInViewport) {
    setTimeout(() => {
      if (videoRef && videoRef.current) {
        videoRef.current.play();
      }
    }, 1000);

    if (
      videoRef &&
      videoRef.current &&
      loadNewVidsAt === Number(videoRef.current.id)
    ) {
      setloadNewVidsAt((prev) => prev + 2);
      getVideos(3);
    }
  }

  const togglePlay = () => {
    if (videoRef && videoRef.current) {
      let currentVideo = videoRef.current;

      if (currentVideo.paused) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    }
  };

  const handleLikesClick = () => {
    setLiked((prevLiked) => {
      const newLikedStatus = !prevLiked;

      axios
        .put(`${API_URL}/videos/${video._id}/like`, {
          address,
          isLiked: newLikedStatus,
        })
        .then((res) => {
          if (res.data.success) {
            setLikes((prevLikes) =>
              newLikedStatus ? prevLikes + 1 : prevLikes - 1
            );
          }
        })
        .catch((err) => console.error(err));

      return newLikedStatus;
    });
  };

  const handleCommentsClick = () => {
    onOpen();
  };

  // const handleSubmitComment = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.put(
  //       `${API_URL}/videos/${video._id}/comment`,
  //       {
  //         address,
  //         comment,
  //       }
  //     );

  //     if (response.data.success) {
  //       setComments((prevComments) => prevComments + 1);
  //       setNewComment(comment);
  //       setComment("");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleShareClicked = () => {
    toast({
      title: "Link copied.",
      status: "success",
      duration: 3000,
      isClosable: true,
      containerStyle: { marginBottom: "25px !important" },
    });
  };

  const handleBuy = useCallback(async () => {
    if (!fetchedUser) return;

    try {
      const contract = new ethers.Contract(
        fetchedUser.username === "jeremystarr_"
          ? fetchedUser1.profileAddress
          : fetchedUser.profileAddress,
        PlayzProfile.abi,
        signer
      );

      const nftResult = await contract["mintEdition(uint256,uint256)"](
        BigNumber.from(1),
        BigNumber.from(1)
      );

      return nftResult;
    } catch (e) {
      console.log(e);
    }
  }, [fetchedUser, signer]);

  useEffect(() => {
    if (!isInViewport) {
      videoRef.current.pause();
    }
  }, [isInViewport]);

  return (
    <div className={styles.sliderChildren}>
      <video
        playsInline
        loop
        className={styles.video}
        ref={videoRef}
        onClick={togglePlay}
        id={index}
        autoPlay={index === 1}
        muted // TOOD: remove later
      >
        <source src={video && video.video_files[0].link} type="video/mp4" />
      </video>
      <VStack className={styles.overlay} />
      {creator && (
        <HStack className={styles.creatorContainer}>
          <Image
            alt="hi"
            src={creator.picture.thumbnail}
            className={styles.creatorAvatar}
          />
          <VStack className={styles.creatorContentContainer} gap={0.5}>
            <Text
              className={styles.creatorTitle}
            >{`${creator.name.first} ${creator.name.last}`}</Text>
            <Text className={styles.creatorSubtitle}>
              {creator.location.city}
            </Text>
          </VStack>
        </HStack>
      )}
      <VStack className={styles.contentContainer} gap={2}>
        <VStack className={styles.reactionContainer} gap={5}>
          <VStack gap={1}>
            <FaShoppingBag size={40} onClick={handleBuy} />
            <Text className={styles.unclickable}>0</Text>
          </VStack>
          <VStack gap={1}>
            {isLiked ? (
              <FaHeart
                size={40}
                onClick={handleLikesClick}
                className={styles.heartIcon}
                cursor="pointer"
              />
            ) : (
              <FaHeart size={40} onClick={handleLikesClick} cursor="pointer" />
            )}
            <Text className={styles.unclickable}>{likes}</Text>
          </VStack>
          <VStack gap={1}>
            <FaCommentDots
              size={40}
              onClick={handleCommentsClick}
              cursor="pointer"
            />
            <Text className={styles.unclickable}>
              {newComment ? comments.length + 1 : comments.length}
            </Text>
          </VStack>
          {isBookmarked ? (
            <FaShare
              size={40}
              onClick={handleShareClicked}
              className={styles.bookmarkIcon}
            />
          ) : (
            <FaShare size={40} onClick={handleShareClicked} />
          )}
        </VStack>
        <Drawer
          placement="bottom"
          onClose={onClose}
          isOpen={isOpen}
          autoFocus={false}
        >
          <DrawerOverlay />
          <DrawerContent borderTopLeftRadius={30} borderTopRightRadius={30}>
            <DrawerHeader borderBottomWidth="1px">
              <Text color="black">
                <Text>
                  {newComment ? comments.length + 1 : comments.length} comments
                </Text>
              </Text>
            </DrawerHeader>
            <DrawerBody>
              <VStack
                h="350px"
                marginBottom="60px"
                className={styles.drawer}
                pt="0.3rem"
                gap={5}
                overflowY="scroll"
              >
                {comments.map((comment, index) => (
                  <VStack key={index} className={styles.commentContainer}>
                    <Text
                      className={styles.username}
                    >{`@${users[index]}`}</Text>
                    <Text className={styles.comment}>{comment}</Text>
                  </VStack>
                ))}
                {newComment && (
                  <VStack className={styles.commentContainer}>
                    <Text
                      className={styles.username}
                    >{`@${fetchedUser.username}`}</Text>
                    <Text className={styles.comment}>{newComment}</Text>
                  </VStack>
                )}
                <HStack className={styles.commentInputContainer}>
                  <form onSubmit={handleSubmitComment}>
                    <Input
                      type="text"
                      autoFocus={false}
                      tabIndex={-1}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={styles.commentInput}
                    />
                  </form>
                  <VStack
                    className={styles.commentSubmitBtn}
                    onClick={handleSubmitComment}
                  >
                    <FaArrowUp color="white" />
                  </VStack>
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </VStack>
    </div>
  );
};

export default VideoCard;
