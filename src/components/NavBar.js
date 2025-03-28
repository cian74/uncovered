import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";

const NavigationBar = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <Navbar bg="light" expand="lg" className="px-4">
      <Container
        className="navcon"
        fluid
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          paddingTop: "25px"
        }}
      >
        <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold">
          Uncover
        </Navbar.Brand>

        <Nav.Link as={Link} to="/liked-songs">
          <Nav style={{ display: "flex", alignItems: "center" }}>
            {user && (
              <img
                src={user.photoURL || "/default-profile.png"} // Fallback image
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: "43px",
                  height: "43px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: "3px solid #d8ff0a",
                }}
              />
            )}
          </Nav>
        </Nav.Link>
        <Nav.Link as={Link} to="/statistics">
          <img
            src="/barchart.png"
            className="rounded-circle"
            style={{
              width: "30px",
              height: "30px",
              marginLeft: "60px",
              marginRight: "40px",
              border: "3px solid #d8ff0a",
              padding: "7px"
            }}
          />
        </Nav.Link>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
