import { useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup, signOut, createUserWithEmailAndPassword,} from "firebase/auth";

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

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button className="btn" onClick={handleLogin}>Login with Google</button>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
