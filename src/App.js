import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NavigationBar from "./components/NavBar";
import LowPopulariyTrack from "./components/LowPopularityTrack";
import LikedSongs from "./components/LikedSongs";
import Login from "./components/Login";
import Statistics from "./components/Statistics";
import SignUp from "./components/SignUp";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user state when auth state changes
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return (
    <Router>
      <NavigationBar user={user} />
      <Routes>
        <Route path="/" element={<LowPopulariyTrack user={user} />} />
        <Route path="/statistics" element={<Statistics user={user}/>} />
        <Route path="/liked-songs" element={<LikedSongs user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
