import Landing from "@components/Landing";
import Home from "@components/Home";
import { useAuth } from "@components/AuthProvider";
import { VStack, Spinner } from "@chakra-ui/react";

// export const API_URL = "http://localhost:8888";
export const API_URL = "http://172.20.10.3:8888";

function App() {
  const { isSignedIn, fetchedUser, isFetchedUserLoading } = useAuth();

  if (isFetchedUserLoading)
    return (
      <VStack h="100vh" justifyContent="center">
        <Spinner color="white" />
      </VStack>
    );

  return !isSignedIn || !fetchedUser ? <Landing /> : <Home />;
}

export default App;
