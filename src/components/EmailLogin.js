import { useState } from "react";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword,} from "firebase/auth";
import { Card, Container, Button, Alert, Form} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const EmailLogin = () => {
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setLocalUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    if(firebaseUser){
        setLocalUser(firebaseUser)
        navigate("/");
    }
  });

  return () => unsubscribe();

  }, [navigate]);
  
  //todo: remove dead code 
  const handleSignUp = async () => {
    if(!email || !password) {
      setError("Email and password req.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth,email,password);
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
      setLocalUser(userCredential.user);
      setError(null);
      navigate("/");
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

  return  (
    <Container className="email-login-container">
    {user ? (
      <Button variant="danger" size="lg" onClick={handleLogout}>Logout</Button>
    ) : (
      <Card className="email-login-card">
        <Card.Body>
          <Card.Title className="text-center large-text" style={{padding: "10px"}}>Login</Card.Title>
          <Form className="email-login-form">
            <Form.Group controlId="formEmail">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-input"
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-input"
              />
            </Form.Group>

            <Button size="lg" className="mt-3" style={{backgroundColor: "#9046CF", color: "#F6F740"}} onClick={handleEmailLogin}>
              Login
            </Button>
          </Form>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          <Link to="/" className="back-link">← Back to main login</Link>
        </Card.Body>
      </Card>
    )}
  </Container>
  );
};

export default EmailLogin;
