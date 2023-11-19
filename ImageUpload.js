import React, { useRef } from 'react';

const ImageUpload = ({ onImageUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = () => {
    const file = fileInputRef.current.files[0];

    if (file) {
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button onClick={handleButtonClick}>Add Background image</button>
    </div>
  );
};

export default ImageUpload;
