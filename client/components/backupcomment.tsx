import { useRef, useState, useEffect } from "react";
import styles from "@styles/Home.module.css";
import useIsInViewport from "@hooks/useIsInViewport";
import {
  FaArrowUp,
  FaBookmark,
  FaCommentDots,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import {
  VStack,
  Text,
  useDisclosure,
  Input,
  Box,
  HStack,
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import { useAccount } from "wagmi";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
} from "@chakra-ui/react";
import { abridgeAddress } from "@utils/utils";
import { API_URL } from "pages";

const VideoCard = ({ index, video, lastVideoIndex, getVideos, creator }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { address } = useAccount();
  const isInViewport = useIsInViewport(videoRef);
  const [loadNewVidsAt, setloadNewVidsAt] = useState(lastVideoIndex);
  const [comment, setComment] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // count the number of true values in the likes object
  const initialLikesCount = Object.values(video.likes || {}).filter(
    Boolean
  ).length;
  const [likes, setLikes] = useState(initialLikesCount);

  const initialIsLiked = Boolean(video.likes && video.likes[address]);
  const [isLiked, setLiked] = useState(initialIsLiked);

  const initialCommentsCount = Object.values(video.comments || {}).length;
  const [comments, setComments] = useState(initialCommentsCount);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setBookmarked] = useState(false);

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
        setComments((prevComments) => prevComments + 1);
        setNewComment(comment);
        setComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkClick = () => {
    setBookmarked(!isBookmarked);
  };

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
        <source src={video.video_files[0].link} type="video/mp4" />
      </video>
      <VStack className={styles.overlay} />
      {creator && (
        <HStack className={styles.creatorContainer}>
          <Image
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
            <Text className={styles.unclickable}>{comments}</Text>
          </VStack>
          {isBookmarked ? (
            <FaBookmark
              size={40}
              onClick={handleBookmarkClick}
              className={styles.bookmarkIcon}
            />
          ) : (
            <FaBookmark size={40} onClick={handleBookmarkClick} />
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
                {Object.keys(video.comments || {}).length} comments
              </Text>
            </DrawerHeader>
            <DrawerBody>
              <VStack h="400px" className={styles.drawer}>
                {video.comments &&
                  Object.entries(video.comments).map(
                    ([address, comment], index) => (
                      <HStack
                        key={index}
                        width="100%"
                        pt="0.5rem"
                        justifyContent="space-evenly"
                      >
                        <HStack width="100%">
                          <VStack
                            backgroundColor="lightgrey"
                            borderRadius="100%"
                            padding="0.5rem"
                            marginRight="0.25rem"
                          >
                            <FaUser />
                          </VStack>
                          <VStack gap={0} alignItems="flex-start !important">
                            <Text
                              fontSize={12}
                              fontWeight={700}
                              opacity={0.6}
                            >{`${abridgeAddress(address)}`}</Text>
                            <Text fontSize={12}>{comment as string}</Text>
                          </VStack>
                        </HStack>
                        <FaHeart />
                      </HStack>
                    )
                  )}
                {newComment && (
                  <Box key={index}>
                    <Text>{`${abridgeAddress(address)}: ${newComment}`}</Text>
                  </Box>
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
