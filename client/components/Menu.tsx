import { useState, useRef } from "react";
import styles from "@styles/Menu.module.css";
import { Button, HStack, VStack } from "@chakra-ui/react";
import {
  FaCommentDots,
  FaHeart,
  FaHome,
  FaMoneyBill,
  FaUserAlt,
  FaVideo,
} from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

const MenuBar = ({ setUploadedFile, setMediaURL }) => {
  const [selectedIcon, setSelectedIcon] = useState("home");
  const { fetchedUser } = useAuth();
  const fileInputRef = useRef(null);

  const getColor = (iconKey) =>
    selectedIcon === iconKey ? "white" : "#565757";

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setMediaURL(URL.createObjectURL(file));
    }
  };

  return (
    <HStack
      className={styles.menubarOverlay}
      w="100%"
      padding="2rem 3rem"
      spacing="0"
    >
      <HStack className={styles.menubarContainer}>
        <FaHome
          size={25}
          color={getColor("home")}
          onClick={() => setSelectedIcon("home")}
        />
        <FaHeart
          size={25}
          color={getColor("heart")}
          onClick={() => setSelectedIcon("heart")}
        />
        <VStack className={styles.uploadBtn} onClick={handleUploadClick}>
          <FaVideo size={22} />
        </VStack>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <FaCommentDots
          size={25}
          color={getColor("comment")}
          onClick={() => setSelectedIcon("comment")}
        />
        <Link
          href={
            fetchedUser && fetchedUser.username !== "jeremystarr_"
              ? "/user/1"
              : "/user/2"
          }
        >
          <a>
            <FaUserAlt size={25} color={getColor("user")} />
          </a>
        </Link>
      </HStack>
    </HStack>
  );
};

export default MenuBar;
