import React, { useState } from 'react';
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
  const [searchedimages, setSearchedImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generatedImages , setGeneratedImages ] = useState("");
  const [pexelApi , setPexelApi] = useState("");
  const [getImgApi , setGetImgApi] = useState("");
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const [outputFormat, setOutputFormat] = useState('');
  const [steps, setSteps] = useState(0);
 


  // const baseUrl = 'http://localhost:8000';
  const baseUrl = 'https://r8oo8c8sc8c8kko04s4w0ckw.desync-game.com';

  fetch(`${baseUrl}/profile/view/`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        'Content-Type': 'application/json',
    },
    })  
    .then(response => response.json())
    .then(data => {
        setPexelApi(data.pexels_api || '');
        setGetImgApi(data.getImg_api || '');
        setWidth(data.width || 1280);
        setHeight(data.height || 600);
        setSteps(data.steps || 4);
        setOutputFormat(data.output_format || 'jpeg');
       

        
    })



    const generateImages = async () => {
      const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: 'Bearer ' + getImgApi,
        },
        body: JSON.stringify({
          prompt: prompt,
          width: width,
          height: height,
          steps: steps,
          output_format: outputFormat,
          response_format: 'b64',

        
        })
      };
      
  
      try {
          const response = await fetch(url, options);
          const json = await response.json();
          if(json.image){
            const imageUrl = `data:image/jpeg;base64,${json.image}`;
            setGeneratedImages([imageUrl]); 
          }

      } catch (err) {
          console.error('error:', err);
      }
  };
  

  
  const handleGenerate = () => {
    generateImages();
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: {
          Authorization: pexelApi,
        },
        params: {
          query: searchTerm,
          per_page: 30, // Number of images to fetch
        },
      });
      setSearchedImages(response.data.photos);
    } catch (error) {
      console.error("Error fetching images:", error);
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


  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return <Navigate to="/login" />;
  }
  const createBlobFromImageUrl = (url) => {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => blob);
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
    }
    else{
      alert('Please select a background image');
      return
    }
    if (logoImage) {
      const logoImageBlob = await createBlobFromImageUrl((document.getElementById('Logo-Preview').src));
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
        const generateAI = document.querySelector('.generate-ai-image');
        const extraSettings = document.querySelector('.extra-settings');
        extraSettings.style.display = 'none' ;
        generateAI.style.display = 'none' ;


      }

    } catch (error) {
      alert('Error generating image',);
    }
  };
  
  const setimagehandler = (e,setImage) => {
  
    const imageUrl = e.src.medium;
    const blob = createBlobFromImageUrl(imageUrl);
    blob.then((blob) => {
      setImage(blob);
    });
  };




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

        <div className="button-group">
           <button type="button" onClick={stockPhotosSearchHandler}>Search Stock Photos</button>
           <button type="button" onClick={generateaihandler}>Generate AI Images</button>
        </div>
        <div className="extra-settings" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Search </label>
            <input type="text" placeholder="Search Background Images" value={searchTerm}  onChange={(e) => setSearchTerm(e.target.value)} />
            <button type="button"  onClick={handleSearch}>Search</button>
          </div>
          <div className="pexel-images">
          {searchedimages.length > 0 ? (
            searchedimages.map((image) => (
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
            <p>No images found</p>
          )}
        </div>
        </div>
        <div className="generate-ai-image" style={{ display: 'none' }}>
          <div className="form-group">
            <label>Write Prompt</label>
            <input type="text" placeholder="Search Images"   value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
            <button type="button"  onClick={handleGenerate}>Generate</button>
          </div>
          <div className="AI-generated-image">
          {generatedImages && (
            <ImageCard

               image={{ id: 1, src: { medium: generatedImages[0] } }}
              setimagehandler={setimagehandler}
              setBackgroundImage={setBackgroundImage}
              setFrameImage={setFrameImage}
              setLogoImage={setLogoImage}
            />
    
          )}
         
          </div>
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
