import React, { useState,useCallback ,useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import dummyimage from './../components/Images/404.png';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { Navigate } from 'react-router-dom';
import ImageCard from './ImageCard/ImageCard';
import Header from './Header/Header';

const Home = () => {
  const [title, setTitle] = useState('');
  const [list, setList] = useState('');
  const [frameImage, setFrameImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedImages, setSearchedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState("");
  const [pexelApi, setPexelApi] = useState("");
  const [getImgApi, setGetImgApi] = useState("");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(600);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [steps, setSteps] = useState(4);

  const baseUrl = 'https://r8oo8c8sc8c8kko04s4w0ckw.desync-game.com';
  // const baseUrl = 'http://localhost:8000';

  const fetchProfileData = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/profile/view/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'; // Redirect to login if unauthorized
        }
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setPexelApi(data.pexels_api || '');
      setGetImgApi(data.getImg_api || '');
      setWidth(data.width || 1280);
      setHeight(data.height || 600);
      setSteps(data.steps || 4);
      setOutputFormat(data.output_format || 'jpeg');
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      localStorage.removeItem(ACCESS_TOKEN);
      window.location.reload();
      alert('Your session has expired. Please log in again.');
    }
  }, [baseUrl]);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN)) {
      fetchProfileData();
    }
  }, [fetchProfileData]);

  const generateImages = async () => {
    if (!getImgApi) {
      alert('Please enter your GetImg Api key in settings');
      return;
    }

    const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${getImgApi}`,
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        steps,
        output_format: outputFormat,
        response_format: 'b64',
      }),
    };

    try {
      const response = await fetch(url, options);
      const json = await response.json();
      if (json.image) {
        const imageUrl = `data:image/jpeg;base64,${json.image}`;
        const blob = await createBlobFromImageUrl(imageUrl);
        setBackgroundImage(blob);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error generating image. Check your API key.');
    }
  };

  const handleGenerate = () => {
    generateImages();
  };

  const fetchImages = async () => {
    if (!pexelApi) {
      alert('Please enter your Pexel Api key in settings');
      return;
    }

    try {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: {
          Authorization: pexelApi,
        },
        params: {
          query: searchTerm,
          per_page: 30,
        },
      });
      setSearchedImages(response.data.photos);
    } catch (error) {
      console.error("Error fetching images:", error);
      alert('Error fetching images. Check your API key.');
    }
  };

  const handleSearch = () => {
    fetchImages();
  };

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const createBlobFromImageUrl = async (url) => {
    const res = await fetch(url);
    return res.blob();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('list', list);

    if (frameImage) {
      const frameImageBlob = await createBlobFromImageUrl(document.getElementById('Frame-Preview').src);
      formData.append('frame_image', frameImageBlob, 'frame_image.png');
    }
    if (backgroundImage) {
      const backgroundImageBlob = await createBlobFromImageUrl(document.getElementById('Background-Preview').src);
      formData.append('background_image', backgroundImageBlob, 'background_image.png');
    } else {
      alert('Please select a background image');
      return;
    }
    if (logoImage) {
      const logoImageBlob = await createBlobFromImageUrl(document.getElementById('Logo-Preview').src);
      formData.append('logo_image', logoImageBlob, 'logo_image.png');
    }

    try {
      const response = await api.post('/generateImage/', formData, {
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
        setDownloadName(response.data.output_image_name);
        
        document.querySelector('.generate-ai-image').style.display = 'none';
        document.querySelector('.extra-settings').style.display = 'none';
      }
    } catch (error) {
      alert('Error generating image.');
    }
  };

  const setImageHandler = (e, setImage) => {
    const imageUrl = e.src.medium;
    createBlobFromImageUrl(imageUrl).then((blob) => {
      setImage(blob);
    });
  };

  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return <Navigate to="/login" />;
  }





  const stockPhotosSearchHandler = () => {
    const extraSettings = document.querySelector('.extra-settings');
    const generateAI = document.querySelector('.generate-ai-image');
    generateAI.style.display = 'none' ;
    extraSettings.style.display = extraSettings.style.display === 'block' ? 'none' : 'block';

  };

  const generateaihandler = () => {
    const generateAI = document.querySelector('.generate-ai-image');
    const extraSettings = document.querySelector('.extra-settings');
    extraSettings.style.display = 'none' ;
    generateAI.style.display = generateAI.style.display === 'block' ? 'none' : 'block';

    
  };

  document.querySelectorAll('textarea').forEach(textarea => {
    textarea.style.overflow = 'hidden'; // Disable scrollbars
    textarea.style.resize = 'vertical'; // Allow vertical resizing

    textarea.addEventListener('input', function() {
      this.style.height = 'auto'; // Reset height to auto to recalculate the new height
      this.style.height = this.scrollHeight + 'px'; // Set height to scrollHeight
    });
  });

  return (
    <div className="container">
       <Header />
      
      <h1>Topical Images</h1>
      
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <textarea
             
            
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>List:</label>
          <textarea 
             style={{height: '100px'}}
            placeholder="Enter list items"
            value={list}
            onChange={(e) => setList(e.target.value)}
          />
        </div>
        <div className="button-group">
           <button type="button" onClick={stockPhotosSearchHandler}>Search Stock Photos</button>
           <button type="button" onClick={generateaihandler}>Generate AI Images</button>
        </div>

        <div className="extra-settings" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Search </label>
            <textarea  placeholder="Search Background Images" value={searchTerm}  onChange={(e) => setSearchTerm(e.target.value)} />
            <button type="button"  onClick={handleSearch}>Search</button>
          </div>
          <div className="pexel-images">
          {searchedImages.length > 0 ? (
            searchedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                setimagehandler={setimagehandler}
                setBackgroundImage={setBackgroundImage}
                setFrameImage={setFrameImage}
                setLogoImage={setLogoImage}
              />
            ))
          ) : (
            <></>
          )}
        </div>
        </div>
        <div className="generate-ai-image" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Write Prompt</label>
            <textarea  placeholder="Search Images"   value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
            <button type="button"  onClick={handleGenerate}>Generate</button>
          </div>
        </div>
        <div className="image-input-group">
          <div className="image-input">
            <label>Frame Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setFrameImage)}
            />
            {frameImage && <img src={URL.createObjectURL(frameImage)} alt="Frame Preview" className="inputImg" id='Frame-Preview' />}
          </div>
          <div className="image-input">
            <label>Background Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setBackgroundImage)}
            />
            {backgroundImage && <img src={URL.createObjectURL(backgroundImage)} alt="Background Preview" className="inputImg" id='Background-Preview' />}
    
          </div>
          <div className="image-input">
            <label>Logo Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setLogoImage)}
            />
            {logoImage && <img src={URL.createObjectURL(logoImage)} alt="Logo Preview" className="inputImg" id='Logo-Preview' />}
          </div>
        </div>

        <div className="button-group">
          <button type="submit">Generate Final Image</button>
        </div>

        
        
      </form>
      
       {generatedImageUrl?
       <div className="generated-image-area">
        <h2>Generated Image</h2>
        <img src={generatedImageUrl} alt="Generated" className="generated-image" />
       
        <a href={downloadUrl} download={downloadName}>
          <button type="button" className='downloadButton'>Download</button>
        </a>
      </div>:
      <div className="generated-image-area">
      </div>}
    </div>
  );
};

export default Home;
