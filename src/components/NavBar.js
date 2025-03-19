import { Container,Nav,Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavigationBar = () =>{
    return(
        <Navbar>
            <Container>
                <h1><Navbar.Brand href="/">Uncover</Navbar.Brand></h1>
                <Nav>
                <Nav.Link as={Link} to="/liked-songs">Liked Songs</Nav.Link>

                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;