import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./css/FeaturedCard.css";

const FeaturedCard = ({ name, description, image, price }) => {
    return (
        <Link className="featured-link">
            <Card className="featured-card-container">
                <div className="featured-image-container">
                    <Card.Img variant="top" src={image} />
                </div>
                <Card.Body className="featured-text-container">
                    {name ? (
                        <Card.Title className="card-title">{name}</Card.Title>
                    ) : (
                        <Card.Title className="card-title">Card Title</Card.Title>
                    )}

                    {description ? (
                        <Card.Text>{description}</Card.Text>
                    ) : (
                        <Card.Text>Quick text to build on the card.</Card.Text>
                    )}

                    {price ? <p>{price}</p> : <p>R free.99</p>}
                </Card.Body>
            </Card>
        </Link>
    );
};

export default FeaturedCard;
