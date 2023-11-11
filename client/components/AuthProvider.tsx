import axios from "axios";
import { API_URL } from "pages";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

type User = {
  bio: string;
  username: string;
  profilePicture: string;
  profileAddress: string;
};

type AuthContextType = {
  isSignedIn: boolean;
  fetchedUser: User | null;
  fetchUser: () => void;
  handleSignIn: () => void;
  handleSignOut: () => void;
};

const initContext: AuthContextType = {
  isSignedIn: false,
  fetchedUser: null,
  fetchUser: () => {},
  handleSignIn: () => {},
  handleSignOut: () => {},
};

const AuthContext = createContext<AuthContextType>(initContext);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: any) {
  const { connect } = useConnect();
  const { address } = useAccount();

  const [fetchedUser, setFetchedUser] = useState(null);

  const [isSignedIn, setSignedIn] = useState(() => {
    const cachedStatus = window.localStorage.getItem("PLAYZ_IS_SIGNED_IN");
    return cachedStatus === "true";
  });

  const { isSuccess, signMessage } = useSignMessage({
    message: "Welcome to Playz! Empowering Creators, One Token at a Time.",
  });
  const connector = useMemo(() => new InjectedConnector(), []);

  const handleSignIn = useCallback(() => {
    if (!connector) return null;
    if (!address) connect({ connector });
    signMessage();
  }, [connector, address, connect, signMessage]);

  const handleSignOut = useCallback(() => {
    setSignedIn(false);
    window.localStorage.setItem("PLAYZ_IS_SIGNED_IN", "false");
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setSignedIn(true);
      window.localStorage.setItem("PLAYZ_IS_SIGNED_IN", "true");
    }
  }, [isSuccess]);

  const fetchUser = useCallback(() => {
    if (address) {
      axios
        .get(`${API_URL}/users`, { params: { address } })
        .then((response) => {
          console.log("fetch user response.data: ", response.data);
          if (response.data) {
            setFetchedUser(response.data);
          } else {
            setFetchedUser(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setFetchedUser(null);
        });
    }
  }, [address]);

  useEffect(() => {
    fetchUser();
  }, [address, fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        fetchedUser,
        fetchUser,
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
