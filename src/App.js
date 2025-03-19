import React from "react";
import { BrowserRouter as Router,Route,Routes } from "react-router-dom";
import NavigationBar from "./components/NavBar";
import LowPopulariyTrack from "./components/LowPopularityTrack";

function App() {
  return(
    <Router>
      <NavigationBar/>
      <Routes>
        <Route path="/" element={<LowPopulariyTrack/>}/>
      </Routes>
    </Router>
); 
}

export default App;
