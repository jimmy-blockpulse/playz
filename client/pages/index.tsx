import Landing from "@components/Landing";
import Home from "@components/Home";
import { useAuth } from "@components/AuthProvider";

export const API_URL = "https://playz-server.onrender.com";

function App() {
  const { isSignedIn, user } = useAuth();

  return !isSignedIn || !user ? <Landing /> : <Home />;
}

export default App;
