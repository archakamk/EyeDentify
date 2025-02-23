import React, { useEffect, useRef, useState } from "react";

const WebcamFeed = () => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError("Webcam access denied or unavailable.");
                console.error("Error accessing webcam:", err);
            }
        };

        startWebcam();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop()); // Stop the webcam when component unmounts
            }
        };
    }, []);

    return (
        <div>
            <h2>Webcam Feed</h2>
            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "600px" }} />
            )}
        </div>
    );
};

export default WebcamFeed;
