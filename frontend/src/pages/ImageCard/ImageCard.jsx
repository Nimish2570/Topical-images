import React from 'react';
import './ImageCard.css'; // Import a CSS file for styling the card

const ImageCard = ({ image, setimagehandler, setBackgroundImage, setFrameImage, setLogoImage }) => {
  return (
    <div className="ImageCard">
      <img key={image.id} src={image.src.medium} alt={image.alt} />
      <div className="button-group">
        <button type="button" onClick={() => setimagehandler(image, setBackgroundImage)}>
          Use 
        </button>
      </div>
    </div>
  );
};

export default ImageCard;
