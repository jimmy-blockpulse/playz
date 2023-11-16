import { useState } from "react";
import styles from "@styles/Header.module.css";
import { HStack, Input, Spacer, Text, VStack } from "@chakra-ui/react";
import { FaEllipsisH, FaSearch } from "react-icons/fa";
import Link from "next/link";

const Header = ({ isFeed }) => {
  const [selectedTab, setSelectedTab] = useState("foryou");
  const [isSearchBar, setSearchBar] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  function handleInputChange(e) {
    setInputValue(e.target.value);
  }

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
        {isSearchBar ? (
          <VStack>
            <HStack className={styles.pill} gap={0}>
              <HStack className={styles.followingPill}>
                <Input
                  border="none"
                  _focus={{ outline: 0 }}
                  _active={{ border: "none" }}
                  fontSize="12px"
                  onChange={handleInputChange}
                  value={inputValue}
                />
              </HStack>
            </HStack>
            {inputValue === "playzboy" && (
              <Link href="/feed/1">
                <HStack className={styles.pill} gap={0}>
                  <HStack className={styles.followingPill}>
                    <Text>@playzboy</Text>
                  </HStack>
                </HStack>
              </Link>
            )}
            {inputValue === "jeremystarr_" && (
              <Link href="/user/2">
                <HStack className={styles.pill} gap={0}>
                  <HStack className={styles.followingPill}>
                    <Text>@jeremystarr_</Text>
                  </HStack>
                </HStack>
              </Link>
            )}
          </VStack>
        ) : isFeed ? (
          <HStack className={styles.pill} gap={0}>
            <HStack className={styles.followingPill}>
              <Text>Feed</Text>
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
        <VStack
          className={styles.search}
          onClick={() => setSearchBar(!isSearchBar)}
        >
          <FaSearch size={15} />
        </VStack>
      </HStack>
    </HStack>
  );
};

export default Header;
