import { useState } from "react";
import styles from "@styles/Header.module.css";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { FaEllipsisH, FaSearch } from "react-icons/fa";

const Header = ({ isFeed }) => {
  const [selectedTab, setSelectedTab] = useState("foryou");

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <HStack
      className={styles.navbarContainer}
      w="100%"
      padding="2rem 3rem"
      spacing="0"
    >
      <HStack className={styles.navLeftSection} spacing="1rem">
        <VStack className={styles.ellipse}>
          <FaEllipsisH />
        </VStack>
      </HStack>
      <Spacer />
      <HStack className={styles.navCenterSection}>
        {isFeed ? (
          <HStack className={styles.pill} gap={0}>
            <HStack className={styles.followingPill}>
              <Text>My Posts</Text>
            </HStack>
          </HStack>
        ) : (
          <HStack className={styles.pill} gap={0}>
            <HStack
              className={styles.followingPill}
              backgroundColor={selectedTab === "following" ? "#ee4f69" : ""}
              onClick={() => handleTabClick("following")}
            >
              <Text>Following</Text>
            </HStack>
            <HStack
              className={styles.foryouPill}
              backgroundColor={selectedTab === "foryou" ? "#ee4f69" : ""}
              onClick={() => handleTabClick("foryou")}
            >
              <Text>For You</Text>
            </HStack>
          </HStack>
        )}
      </HStack>
      <Spacer />
      <HStack className={styles.navRightSection}>
        <VStack className={styles.search}>
          <FaSearch size={15} />
        </VStack>
      </HStack>
    </HStack>
  );
};

export default Header;
