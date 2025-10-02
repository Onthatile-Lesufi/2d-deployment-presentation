import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


const PurchaseConfirmation = () => {
    const navigate = useNavigate();
    useEffect( () => {
        const autoNavigate = setTimeout(() => {
            navigate('/');
        }, 3000);
    }, []);
    return (
    <div style={{ height: '100vh' }}>
        <Container>
            <Row>
                <Col>
                    <h1>Thank You For Your Purchase!</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Your Order has been completed successfully!</h2>
                </Col>
            </Row>
        </Container>
    </div>
    );
};

export default PurchaseConfirmation;