import Landing from "@components/Landing";
import Home from "@components/Home";
import { useAuth } from "@components/AuthProvider";

export const API_URL = "https://playz-server.onrender.com";

function App() {
  const { isSignedIn, fetchedUser } = useAuth();

  return !isSignedIn || !fetchedUser ? <Landing /> : <Home />;
}

export default App;
