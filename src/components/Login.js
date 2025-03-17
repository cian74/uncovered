import { useEffect, useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";

const Login = ({ setUser }) => {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Google</button>
      <button onClick={handleLogout}>Logout</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
