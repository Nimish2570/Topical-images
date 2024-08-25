import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';
import './Setting.css';

const Setting = () => {
    // const apiBaseUrl = 'http://localhost:8000';
    const apiBaseUrl = 'https://r8oo8c8sc8c8kko04s4w0ckw.desync-game.com';

    const navigate = useNavigate();
    const token = localStorage.getItem(ACCESS_TOKEN);
    const [profile, setProfile] = useState({
        pexels_api: '',
        getImg_api: '',
        width: 1280,
        height: 600,
        steps: 4,
        output_format: 'jpeg',
       
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            fetch(`${apiBaseUrl}/profile/view/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    setProfile({
                        pexels_api: data.pexels_api || '',
                        getImg_api: data.getImg_api || '',
                        width: data.width || 1280,
                        height: data.height || 600,
                        steps: data.steps || 4,
                        output_format: data.output_format || 'jpeg',
                     
                    });
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching profile:', error);
                    setError('Error fetching profile data');
                    setLoading(false);
                });
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`${apiBaseUrl}/profile/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        })
            .then(response => response.json())
            .then(data => {
                alert('Profile updated successfully');
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                setError('Error updating profile');
            });
    };

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="settings-container">
            <button className="back-button" onClick={() => navigate('/')}>Back to Home</button>
            <h1>Settings</h1>
            <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="pexels_api">Pexels API Key:</label>
                    <input
                        type="text"
                        id="pexels_api"
                        name="pexels_api"
                        className="apiInput"
                        value={profile.pexels_api}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="getImg_api">Get Image API Key:</label>
                    <input
                        type="text"
                        id="getImg_api"
                        name="getImg_api"
                        className="apiInput"
                        value={profile.getImg_api}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="width">Width :{profile.width}</label>
                    <input 
                        type='range'
                        id="width"
                        name="width"
                        step="8"
                        className="apiInput"
                        min="256"
                        max="1280"
                        value={profile.width}
                        onChange={handleChange}

                    />
                </div>
                <div className="form-group">
                    <label htmlFor="height">Height :{profile.height}</label>
                    <input
                        type='range'
                        id="height"
                        name="height"
                        step="8"
                        className="apiInput"
                        min="256"
                        max="1280"
                        value={profile.height}
                        onChange={handleChange}
                       
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="steps">Steps (1 - 6):</label>
                    <input
                        type="number"
                        id="steps"
                        name="steps"
                        className="apiInput"
                        min="1"
                        max="6"
                        value={profile.steps}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="output_format">Output Format:</label>
                    <select
                        id="output_format"
                        name="output_format"
                        className="apiInput"
                        value={profile.output_format}
                        onChange={handleChange}
                    >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                    </select>
                </div>
               
                <button className="save-button" type="submit">Save</button>
            </form>
        </div>
    );
};

export default Setting;
