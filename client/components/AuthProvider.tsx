import { Users } from "@data/data";
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
import Landing from "./Landing";
import { User } from "@utils/types";

type AuthContextType = {
  isSignedIn: boolean;
  user: User | null;
  fetchUser: () => void;
  handleSignIn: () => void;
  handleSignOut: () => void;
};

const initContext: AuthContextType = {
  isSignedIn: false,
  user: null,
  fetchUser: () => {},
  handleSignIn: () => {},
  handleSignOut: () => {},
};

const AuthContext = createContext<AuthContextType>(initContext);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: any) {
  const { connect } = useConnect();
  const { address } = useAccount();

  const [user, setUser] = useState(null);

  const [isSignedIn, setSignedIn] = useState(() => {
    const cachedStatus = window.localStorage.getItem("playz.isSignedIn");
    return cachedStatus === "true";
  });

  const { data, isSuccess, signMessage } = useSignMessage({
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
    window.localStorage.setItem("playz.isSignedIn", "false");
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setSignedIn(true);
      window.localStorage.setItem("playz.isSignedIn", "true");
    }
  }, [isSuccess]);

  const fetchUser = useCallback(() => {
    if (address) {
      //  TODO: bring back legit logic
      //   axios
      //     .get(`${API_URL}/users`, { params: { address } })
      //     .then((response) => {
      //       console.log("fetch user response.data: ", response.data);
      //       if (response.data) {
      //         setUser(response.data);
      //       } else {
      //         setUser(null);
      //       }
      //     })
      //     .catch((error) => {
      //       console.error("Error fetching user data:", error);
      //       setUser(null);
      //     });
      const fetchedUser = Users.find((u) => u.address == address);
      setUser(fetchedUser);
    }
  }, [address]);

  useEffect(() => {
    if (!user) fetchUser();
  }, [address, fetchUser, user]);

  if (!isSignedIn || !user) return <Landing />;

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        fetchUser,
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
