import { useRef, useState, useEffect } from "react";
import styles from "@styles/Home.module.css";
import useIsInViewport from "./useIsInViewport";
import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegCommentDots,
  FaRegHeart,
} from "react-icons/fa";
import { VStack, Text, useDisclosure, Input, Box } from "@chakra-ui/react";
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

const VideoCard = ({ index, video, lastVideoIndex, getVideos }) => {
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

  // check if the current user's address is in the video's likes object and the value is true
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

      // Sending a request to the server
      axios
        .put(`http://192.168.1.6:8888/videos/${video._id}/like`, {
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
        `http://192.168.1.6:8888/videos/${video._id}/comment`,
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
      >
        <source src={video.video_files[0].link} type="video/mp4" />
      </video>
      <VStack className={styles.contentContainer} gap={2}>
        <VStack className={styles.reactionContainer}>
          {isLiked ? (
            <FaHeart
              size={35}
              onClick={handleLikesClick}
              className={styles.heartIcon}
              cursor="pointer"
            />
          ) : (
            <FaRegHeart size={35} onClick={handleLikesClick} cursor="pointer" />
          )}
          <Text className={styles.unclickable}>{likes}</Text>
          <FaRegCommentDots
            size={35}
            onClick={handleCommentsClick}
            cursor="pointer"
          />
          <Text className={styles.unclickable}>{comments}</Text>
          {isBookmarked ? (
            <FaBookmark
              size={35}
              onClick={handleBookmarkClick}
              className={styles.bookmarkIcon}
            />
          ) : (
            <FaRegBookmark size={35} onClick={handleBookmarkClick} />
          )}
        </VStack>
        <Drawer
          placement="bottom"
          onClose={onClose}
          isOpen={isOpen}
          autoFocus={false}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">
              <Text>{Object.keys(video.comments || {}).length} comments</Text>
            </DrawerHeader>
            <DrawerBody>
              <VStack h="400px" className={styles.drawer}>
                {video.comments &&
                  Object.entries(video.comments).map(
                    ([address, comment], index) => (
                      <Box key={index}>
                        <Text>{`${abridgeAddress(address)}: ${comment}`}</Text>
                      </Box>
                    )
                  )}
                {newComment && (
                  <Box key={index}>
                    <Text>{`${abridgeAddress(address)}: ${newComment}`}</Text>
                  </Box>
                )}
                <form onSubmit={handleSubmitComment}>
                  <Input
                    type="text"
                    autoFocus={false}
                    tabIndex={-1}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </form>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </VStack>
    </div>
  );
};

export default VideoCard;
