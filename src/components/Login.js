import { useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,} from "firebase/auth";
import { Link } from "react-router-dom";

const Login = ({ setUser }) => {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = auth.currentUser;

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  //todo: remove dead code 
  const handleSignUp = async () => {
    if(!email || !password) {
      setError("Email and password req.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth,email,password);
      setUser(userCredential.user);
    } catch (error) {
     setError(error); 
    }
  }

  //todo: fix database update when not logged in (updateSwipe)
  //have this handled on seperate page
  
  //todo: update sign up page styling 

  //delete login failed text after login
  const handleEmailLogin = async () => {
    if(!email || !password) {
      setError("email and password required");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);
      
    } catch (err) {
      setError("Login failed"); 
    }
  };

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="login-buttons">
  {user ? (
    <button className="btn" onClick={handleLogout}>Logout</button>
  ) : (
    <>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center"}}>
      <button className="btn" onClick={handleLogin}>Login with Google</button>
        <Link to="/email-login">
          <button className="btn" onClick={handleEmailLogin}>Login with Email</button>
        </Link>
    </div>
      
    </>
  )}
  {error && <p style={{ color: "red" }}>{error}</p>}
</div>
  );
};

export default Login;
