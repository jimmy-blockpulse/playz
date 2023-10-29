import styles from "@styles/Navbar.module.css";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { FaChevronLeft, FaPowerOff } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import Landing from "./Landing";
import { useAuth } from "./AuthProvider";
import { Dispatch } from "react";

type NavbarProps = {
  title: string;
  setUploadedFile?: Dispatch<any>;
  isPost?: boolean;
};

const Navbar = ({ title, isPost, setUploadedFile }: NavbarProps) => {
  const router = useRouter();

  const { address } = useAccount();
  const { isSignedIn, fetchedUser, handleSignOut } = useAuth();

  if (!address || !isSignedIn || !fetchedUser) return <Landing />;

  return (
    <HStack
      className={styles.navbarContainer}
      w="100%"
      padding="1rem 3rem"
      spacing="0"
    >
      <HStack className={styles.navLeftSection} spacing="1rem">
        <VStack
          className={styles.leftIcon}
          onClick={() => {
            if (isPost) {
              setUploadedFile(null);
            } else router.back();
          }}
        >
          <FaChevronLeft />
        </VStack>
      </HStack>
      <Spacer />
      <HStack className={styles.navCenterSection}>
        <HStack className={styles.center} gap={0}>
          <Text className={styles.navHeader}>{isPost ? "Post" : title}</Text>
        </HStack>
      </HStack>
      <Spacer />
      <HStack className={styles.navRightSection}>
        <VStack className={styles.rightIcon} onClick={handleSignOut}>
          {/* <FaEllipsisH /> */}
          {router.pathname === "/user/[id]" && <FaPowerOff />}
        </VStack>
      </HStack>
    </HStack>
  );
};

export default Navbar;
