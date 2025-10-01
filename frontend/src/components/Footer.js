import './css/Footer.css';
import BigLogo from '../assets/images/Asset_58x.png';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import TiktokLogo from '../assets/images/tiktok.svg';
import FacebookLogo from '../assets/images/facebook.svg';
import YoutubeLogo from '../assets/images/youtube.svg';
import ThreadsLogo from '../assets/images/threads.svg';
import InstagramLogo from '../assets/images/instagram.svg';

function Footer() {
    const LogoRowOne = [ThreadsLogo,TiktokLogo,InstagramLogo];
    const LogoRowTwo = [YoutubeLogo,FacebookLogo,InstagramLogo];

    return (
        <div className='footer'>
            <Container className='footer-container'>
                <Row>
                    <Col className='logo-link-column'>
                        <Link className='footer-button' to='/'>
                            <img src={BigLogo} className='footer-logo'/>
                        </Link> 
                    </Col>
                    <Col md="4" className='footer-page-links'>
    <Link className='page-link' to='/'>HOME</Link> 
    <Link className='page-link' to='/shop'>SHOP</Link>
    <Link className='page-link' to='/about'>ABOUT</Link>
</Col>

                    <Col >
                        <Container className='socials-container'>
                            <Row className='socials-row'>
                                {LogoRowOne.map((logo) => (
                                    <Col className='socials-column'>
                                        <img className='footer-socials' src={logo}/>
                                    </Col>
                                ))}
                            </Row>
                            <Row className='socials-row'>
                                {LogoRowTwo.map((logo) => (
                                    <Col className='socials-column'>
                                        <img className='footer-socials' src={logo}/>
                                    </Col>
                                ))}
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Footer;