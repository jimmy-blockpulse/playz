import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Input,
  Box,
  Text,
} from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import dummyUsers from "@data/Users.json";
import dummyComments from "@data/Comments.json";
import { API_URL } from "pages";

export default function CommentDrawer({ onClose, isOpen, video }) {
  const initialCommentsCount = Object.values(video.comments || {}).length;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [comment, setComment] = useState("");

  const address = "";

  const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  useEffect(() => {
    const generateComments = () => {
      let randomComments = [];
      const numComments = 6 + Math.floor(Math.random() * 2); // Gives a number between 6 and 7

      for (let i = 0; i < numComments; i++) {
        const randomUser = getRandomItem(dummyUsers);
        const randomComment = getRandomItem(dummyComments);

        randomComments.push(`@${randomUser}: ${randomComment}`);
      }

      setComments(randomComments);
    };

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
        setComments((prevComments) => [
          ...prevComments,
          `@${address}: ${comment}`,
        ]);
        setNewComment(comment);
        setComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Drawer
      placement="bottom"
      onClose={onClose}
      isOpen={isOpen}
      autoFocus={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <Text>{comments.length} comments</Text>
        </DrawerHeader>
        <DrawerBody>
          <VStack h="400px" className={styles.drawer}>
            {comments.map((comment, index) => (
              <Box key={index}>
                <Text>{comment}</Text>
              </Box>
            ))}
            <form onSubmit={handleSubmitComment}>
              <Input
                type="text"
                autoFocus={false}
                tabIndex={-1}
                placeholder="Add a comment..."
                className={styles.commentInput}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </form>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
