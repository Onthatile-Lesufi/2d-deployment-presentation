import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import "./css/ReviewSection.css";
import { Col } from "react-bootstrap";

const ReviewSection = ({ratingValue, reviewText, reviewer}) => {

    return (
        <Col className="review-section-container" md="4">
            <div className="review-section">
                <div className="rating-information">
                    <Rating 
                    readOnly={true}
                    precision={0.5}
                    value={ratingValue}
                    />
                    <br/>
                    <p>
                        {reviewer}
                    </p>
                </div>
                
                <p>{reviewText}</p>
            </div>
        </Col>
    );
}

export default ReviewSection;