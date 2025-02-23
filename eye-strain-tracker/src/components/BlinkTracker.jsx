import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useAuth0 } from "@auth0/auth0-react"; // Import the useAuth0 hook

const BlinkTracker = () => {
    const videoRef = useRef(null);
    const { user, isAuthenticated } = useAuth0(); // Access Auth0 user data
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const API_KEY = process.env.REACT_APP_ROBOFLOW_API_KEY; // Add your API key from .env

    useEffect(() => {
        console.log("Initializing component...");
        startVideo();
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        console.log("Video feed is ready.");
                        videoRef.current.play();
                    };
                    videoRef.current.onplay = () => {
                        setVideoReady(true);
                        console.log("Video is playing.");
                        // Start analyzing only if models are loaded
                        if (isModelsLoaded) {
                            analyzeImage(); // Start analyzing when video is ready
                        }
                    };
                }
            })
            .catch((err) => console.error("Error accessing webcam:", err));
    };

    const loadModels = async () => {
        try {
            console.log("Loading models...");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            setIsModelsLoaded(true);
            console.log("Models loaded successfully.");
            // If the video is ready, start analyzing
            if (videoReady) {
                analyzeImage(); // Start analyzing when models are loaded
            }
        } catch (err) {
            console.error("Error loading models:", err);
        }
    };

    const captureFrame = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg'); // Get the image data URL
    };

    const analyzeImage = async () => {
        if (!isModelsLoaded || !videoReady || !videoRef.current) {
            console.log("Detection not started. Models or video feed not ready.");
            return;
        }

        const imageUrl = captureFrame(); // Capture the current frame

        try {
            const response = await fetch('https://detect.roboflow.com/infer/workflows/vasculens/detect-and-classify-4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: API_KEY, // Use the API key here
                    inputs: {
                        image: { type: 'url', value: imageUrl } // Send the captured image
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json(); // Get the result
            console.log("Roboflow Result:", result); // Log the result for debugging
        } catch (error) {
            console.error("Error during API call:", error); // Handle errors
        }

        // Call analyzeImage again after a delay (e.g., every second)
        setTimeout(analyzeImage, 1000); // Adjust the interval as needed
    };

    return (
        <div>
            <video ref={videoRef} autoPlay muted width="400" height="300" />
            {/* Display "Metrics for [User's Name]" at the bottom */}
            {isAuthenticated && user && (
                <p style={{ fontWeight: "bold" }}>Metrics for {user.name}</p>
            )}
        </div>
    );
};

export default BlinkTracker;