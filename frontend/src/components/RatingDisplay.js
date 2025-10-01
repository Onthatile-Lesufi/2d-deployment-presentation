import * as React from 'react';
import Rating from '@mui/material/Rating';
import './css/RatingDisplay.css';


function RatingDisplay({value, onChange, readOnly = false}) {
  return (
      <Rating name="half-rating-read" value={value} precision={0.5} readOnly={readOnly} className='custom-rating' onChange={onChange} sx={{
    color: '#EE5D02'
  }}/>
  );
}

export default RatingDisplay;