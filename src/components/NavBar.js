import { Container,Nav,Navbar } from "react-bootstrap";

const NavigationBar = () =>{
    return(
        <Navbar>
            <Container>
                <h1><Navbar.Brand href="/">Uncover</Navbar.Brand></h1>
                <Nav>
                    <Nav.Link></Nav.Link>
                    <Nav.Link></Nav.Link>
                    <Nav.Link></Nav.Link>
                    <Nav.Link></Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;