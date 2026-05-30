import React from 'react';

interface WegCoinProps {
  size?: number;
  style?: React.CSSProperties;
}

const WegCoin: React.FC<WegCoinProps> = ({ size = 16, style }) => {
  return (
    <img 
      src="/weg-coin.png" 
      alt="积分" 
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style 
      }} 
    />
  );
};

export default WegCoin;
