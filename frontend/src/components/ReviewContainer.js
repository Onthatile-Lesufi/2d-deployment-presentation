import { Button, Container, Form, Row, Col } from "react-bootstrap";
import RatingDisplay from "./RatingDisplay";
import { useEffect, useState } from "react";
import ReviewSection from "./ReviewSection";
import "./css/ReviewContainer.css";
import axios from "axios";

const ReviewContainer = ({productId}) => {
    const [user, setUser] = useState(null);
    const [loadedUser, setIsLoadedUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState([]);
    const [itemRating, setItemRating] = useState(null);
    const [reviewRows, setReviewRows] = useState(null);
    

    async function CheckCredentials() {
      try {
        const _user = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/logged`, {
            withCredentials: true, // Ensure cookies are sent with the request
        });
        console.log(_user.data.user);
        setUser(_user.data?.user);
        console.log("User Loaded", user);
        
      } catch (error) {
        console.log(error);
      }
    }

    const GenerateReviewRows = () => {
        if (reviews.length <= 0) return;
        let _reviewRows = [];
        let _tempRow = [];
        
        for (let _i = 1; _i <= reviews.length; _i++) {
            _tempRow.push(<ReviewSection reviewer={reviews[_i-1].userEmail} ratingValue={reviews[_i-1].rating} reviewText={reviews[_i-1].review}/>);

            if (_i % 3 === 0) {
                _reviewRows.push(
                    <Row>
                        {_tempRow}
                    </Row>
                )

                _tempRow = [];
            }
        }
        _reviewRows.push(
            <Row>
                {_tempRow}
            </Row>
        )

        setReviewRows(_reviewRows);
    }

    async function CaptureReviewInformation () {
        if (itemRating) {
            try {
                
                const _tempResult = await axios.post(`${process.env.REACT_APP_API_URL}/api/products/${productId}/review/post`, {
                    _rating: parseFloat(itemRating),
                    _productReview: reviewText,
                    _user: user.email
                });
                const _rating = await axios.put(`${process.env.REACT_APP_API_URL}/api/products/${productId}/rating`);
            } catch (error) {
                console.log(error);
            }
            
        }
    }

    async function GrabReviews() {
        try {
            const _reviews = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${productId}/reviews`);
            console.log(_reviews);
            setReviews(_reviews.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        GenerateReviewRows();
        console.log(user);
    },[reviews]);

    useEffect (() => {
        CheckCredentials();
        GrabReviews();
    },[]); 

    return (
        <div>
            {user ?
                <Form className="review-form" onSubmit={CaptureReviewInformation}>
                {/* // <Form className="review-form"> */}
                    <div className="review-rating-display">
                        <RatingDisplay  onChange={(i) => setItemRating(i.target.value)}/>
                    </div>
                    <textarea
                        className="review-text-input"
                        placeholder="Review (Optional)"
                        onChange={(i) => setReviewText(i.target.value)}
                    />
                    <Button className="review-submit-button" type="submit">Post Review</Button>
                </Form>
                :
                null
            }
            
            <Container>
                <hr/>
                {reviewRows}
            </Container>
            
        </div>
    );
}

export default ReviewContainer;