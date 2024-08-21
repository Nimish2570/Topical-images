import React, { useState } from 'react';
import axios from 'axios';
import './Home.css';
import dummyimage from './../components/Images/404.png';
import api from '../api';

const Home = () => {
  const [title, setTitle] = useState('');
  const [list, setList] = useState('');
  const [frameImage, setFrameImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('list', list);
    if (frameImage) formData.append('frame_image', frameImage);
    if (backgroundImage) formData.append('background_image', backgroundImage);
    if (logoImage) formData.append('logo_image', logoImage);

    try {
      const response = await axios.post('http://localhost:8000/generateImage/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.output) {
        const uniqueUrl = `${response.data.output}?${new Date().getTime()}`;
        setGeneratedImageUrl(uniqueUrl);

        const blob = new Blob([Uint8Array.from(atob(response.data.output_image_data), c => c.charCodeAt(0))], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }

    } catch (error) {
      console.error(error);
    }
  };





  const extrasettinghandler = () => {
    const extraSettings = document.querySelector('.extra-settings');
    extraSettings.style.display = extraSettings.style.display === 'block' ? 'none' : 'block';
  };

  const generateaihandler = () => {
    const generateAI = document.querySelector('.generate-ai-image');
    generateAI.style.display = generateAI.style.display === 'block' ? 'none' : 'block';
  };

  return (
    <div className="container">
      <h1>Topical Images</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>List:</label>
          <textarea
            placeholder="Enter list items"
            value={list}
            onChange={(e) => setList(e.target.value)}
          />
        </div>
        <div className="image-input-group">
          <div className="image-input">
            <label>Frame Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setFrameImage)}
            />
            {frameImage && <img src={URL.createObjectURL(frameImage)} alt="Frame Preview" className="inputImg" />}
          </div>
          <div className="image-input">
            <label>Background Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setBackgroundImage)}
              required
            />
            {backgroundImage && <img src={URL.createObjectURL(backgroundImage)} alt="Background Preview" className="inputImg" />}
          </div>
          <div className="image-input">
            <label>Logo Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setLogoImage)}
            />
            {logoImage && <img src={URL.createObjectURL(logoImage)} alt="Logo Preview" className="inputImg" />}
          </div>
        </div>

        <div className="button-group">
          <button type="submit">Generate Image</button>
        </div>
        <div className="extra-settings" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Search </label>
            <input type="text" placeholder="Search Background Images" />
            <button type="button">Search</button>
          </div>
          <div className="pexel-images"></div>
        </div>
        <div className="generate-ai-image" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Write Prompt</label>
            <input type="text" placeholder="Search Images" />
            <button type="button">Generate</button>
          </div>
          <div className="AI-generated-image"></div>
        </div>
      </form>
      <div className="button-group">
        <button type="button" onClick={extrasettinghandler}>Extra Settings</button>
        <button type="button" onClick={generateaihandler}>Generate AI Images</button>
      </div>
       {generatedImageUrl?
       <div className="generated-image-area">
        <h2>Generated Image</h2>
        <img src={generatedImageUrl} alt="Generated" className="generated-image" />
       
        <a href={downloadUrl} download='generated_image.png'>
          <button type="button" className='downloadButton'>Download</button>
        </a>
      </div>:<div className="generated-image-area">
        
      </div>}


      
    </div>
  );
};

export default Home;
