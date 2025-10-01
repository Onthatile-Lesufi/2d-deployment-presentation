import React, { useState } from 'react';
import '../components/css/WeaponChoice.css';
import gun from '../assets/images/gun.png';
import candlestick from '../assets/images/candlestick.png';
import rope from '../assets/images/rope.png';
import dumbell from '../assets/images/dumbell.png';
import knife from '../assets/images/knife.png';
import hammer from '../assets/images/hammer.png';

function WeaponChoice({ onWeaponSelect }) {
  const [selectedWeapon, setSelectedWeapon] = useState(null);

  const handleWeaponClick = (weaponCode) => {
    setSelectedWeapon(weaponCode);
   

    // Inform parent (LoginRegisterForm)
    if (onWeaponSelect) {
      onWeaponSelect(weaponCode);
    }
  };

  return (
    <div>
      <div className='weapon-choice-container'>
        <button type="button" onClick={() => handleWeaponClick('HAMMER')}>
          <img className='weapon-img' src={hammer} alt="Hammer" />
        </button>

        <button type="button" onClick={() => handleWeaponClick('CANDLESTICK')}>
          <img className='weapon-img' src={candlestick} alt="Candlestick" />
        </button>

        <button type="button" onClick={() => handleWeaponClick('KNIFE')}>
          <img className='weapon-img' src={knife} alt="Knife" />
        </button>

        <div className='weapon-img-stack'>
          <button type="button" onClick={() => handleWeaponClick('GUN')}>
            <img className='weapon-img' src={gun} alt="Gun" />
          </button>
          <button type="button" onClick={() => handleWeaponClick('DUMBELL')}>
            <img className='weapon-img' src={dumbell} alt="Dumbell" />
          </button>
        </div>

        <button type="button" onClick={() => handleWeaponClick('ROPE')}>
          <img className='weapon-img' src={rope} alt="Rope" />
        </button>
      </div>

      {/* Show the selected weapon text */}
      {selectedWeapon && (
        <p className="weapon-selected-text">
          Weapon chosen: <strong>{selectedWeapon}</strong>
        </p>
      )}
    </div>
  );
}

export default WeaponChoice;
