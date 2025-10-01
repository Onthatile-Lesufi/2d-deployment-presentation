import { Card } from "react-bootstrap";
import "./css/ShopItemCard.css";
import RatingDisplay from "./RatingDisplay";

const ShopItemCard = ({ productImage, productName, productPrice, productRating }) => {
    return (
        <Card className="shop-item-card">
            <Card.Img variant="top" src={productImage} className="shop-item-image" />
            <Card.Body className="shop-item-body">
                <Card.Title className="shop-item-title">{productName}</Card.Title>
                <Card.Text className="shop-item-text">
                    <RatingDisplay value={productRating} readOnly={true} />
                </Card.Text>
                <Card.Text className="shop-item-price">R {productPrice}</Card.Text>
            </Card.Body>
        </Card>
    );
};

export default ShopItemCard;
