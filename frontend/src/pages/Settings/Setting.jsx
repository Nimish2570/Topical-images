import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Setting.css'; // Import the CSS file
import { ACCESS_TOKEN } from '../../constants';

const Setting = () => {
    const navigate = useNavigate(); // useNavigate hook
    const token = localStorage.getItem(ACCESS_TOKEN);
    const [profile, setProfile] = useState({ pexels_api: '', getImg_api: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // const apiBaseUrl = 'http://localhost:8000';
    const apiBaseUrl = 'https://r8oo8c8sc8c8kko04s4w0ckw.desync-game.com';

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
                    setProfile({ pexels_api: data.pexels_api || '', getImg_api: data.getImg_api || '' });
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
            <h2>Settings</h2>
            <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="pexels_api">Pexels API Key:</label>
                    <input
                        type="text"
                        id="pexels_api"
                        name="pexels_api"
                        className='apiInput'
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
                        className='apiInput'
                        value={profile.getImg_api}
                        onChange={handleChange}
                    />
                </div>
                <button className="save-button" type="submit">Save</button>
            </form>
        </div>
    );
};

export default Setting;
