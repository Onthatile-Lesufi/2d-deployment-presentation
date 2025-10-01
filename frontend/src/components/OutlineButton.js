import { Button } from "react-bootstrap";
import "./css/OutlineButton.css";
import { Link } from "react-router-dom";

const OutlineButton = ({
  buttonLabel,
  buttonLink,
  buttonFunction,
  disabled = false,
}) => {
  return (
    <div className="outline-button-container">
      {/* Ternary operator to check if the frontend provided an onClick */}
      {buttonFunction ? (
        <Button
          className="outline-button-component"
          onClick={buttonFunction}
          disabled={disabled}
        >
          {buttonLabel}
        </Button>
      ) : disabled ? (
        <Button className="outline-button-component" disabled={disabled}>
          {buttonLabel}
        </Button>
      ) : (
        <Link className="outline-button-link" to={buttonLink}>
          <Button className="outline-button-component" disabled={disabled}>
            {buttonLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default OutlineButton;
