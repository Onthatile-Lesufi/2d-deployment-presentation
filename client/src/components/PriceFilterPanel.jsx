import React, { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import priceRanges from "../constants/priceRanges";
import "../styles/PriceFilterPanel.css";

const PriceFilterPanel = ({
  priceSort,
  setPriceSort,
  priceRangeIdx,
  setPriceRangeIdx,
}) => {
  // Local state for slider
  const [sliderValue, setSliderValue] = useState(priceRangeIdx);

  // Update local slider value as user drags
  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  // Only update the filter when user releases the slider
  const handleSliderCommit = () => {
    setPriceRangeIdx(sliderValue);
  };

  return (
    <div className="price-filter-panel">
      <h2 className="filter-title">Filter by Price</h2>
      <Accordion alwaysOpen={false} className="filterAccordion" id="priceFilterAccordion">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Sort</Accordion.Header>
          <Accordion.Body>
            <button
              className={`price-sort-btn ${
                priceSort === "low-high" ? "active" : ""
              }`}
              onClick={() => setPriceSort("low-high")}
            >
              Low to High
            </button>
            <button
              className={`price-sort-btn ${
                priceSort === "high-low" ? "active" : ""
              }`}
              onClick={() => setPriceSort("high-low")}
            >
              High to Low
            </button>
            <button
              className={`price-sort-btn ${priceSort === "a-z" ? "active" : ""}`}
              onClick={() => setPriceSort("a-z")}
            >
              A - Z
            </button>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Price Range</Accordion.Header>
          <Accordion.Body>
            <div className="slider-labels">
              <span>{priceRanges[sliderValue].label}</span>
            </div>
            <input
              type="range"
              min={0}
              max={priceRanges.length - 1}
              value={sliderValue}
              onChange={handleSliderChange}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              className="price-slider"
            />
            <div className="slider-ticks">
              {priceRanges.map((range, idx) => (
                <span
                  key={range.label}
                  className={`slider-tick${
                    idx === sliderValue ? " active" : ""
                  }`}
                  style={{ left: `${(idx / (priceRanges.length - 1)) * 100}%` }}
                />
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default PriceFilterPanel;