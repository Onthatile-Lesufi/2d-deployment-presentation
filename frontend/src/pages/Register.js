//Imports
import { Link } from "react-router-dom";
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./css/LogIn.css";
import RegisterForm from "../components/LoginRegisterForms";

function Register() {
  return (
    <Container style={{ minHeight: "100vh" }}>
      <Row className="login-row">
        <Col md={12} className="login-col">
          <h1 className="login-title">REGISTER</h1>
        
          {/* Form */}
          <div style={{ width: "100%" }}>
            <RegisterForm isLogin={false} />
          </div>

          
          <div className="login-text">
            <p>
              Already have an account?{" "}
              <Link to="/log-in" className="login-link">
                Log in
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
