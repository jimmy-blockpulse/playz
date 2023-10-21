import { useState, useEffect } from "react";
import BottomNav from "@components/BottomNav";
import VideoCard from "@components/VideoCard";
import styles from "@styles/Main.module.css";
import axios from "axios";
import { useAccount } from "wagmi";
import Landing from "@components/Landing";
import Home from "@components/Home";

function App() {
  const { address } = useAccount();

  return <Landing />;
  // return !address ? <Landing /> : <Home />;
}

export default App;
