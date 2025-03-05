import { Container,Nav,Navbar } from "react-bootstrap";

const NavigationBar = () =>{
    return(
        <Navbar>
            <Container>
                <Navbar.Brand href="/">Uncover</Navbar.Brand>
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