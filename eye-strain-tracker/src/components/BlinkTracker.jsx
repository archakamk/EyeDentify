import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { useAuth0 } from "@auth0/auth0-react"; // Import the useAuth0 hook

const BlinkTracker = () => {
    const videoRef = useRef(null);
    const { user, isAuthenticated } = useAuth0(); // Access Auth0 user data
    const [blinkCount, setBlinkCount] = useState(0);
    const [bpm, setBpm] = useState(0);
    const [lastBlinkTime, setLastBlinkTime] = useState(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [timer, setTimer] = useState(60); // Countdown timer for 60 seconds
    const [useBrowserNotification, setUseBrowserNotification] = useState(true);
    const [screenTime, setScreenTime] = useState(0); // Session screen time
    const [totalScreenTime, setTotalScreenTime] = useState(0); // Total screen time (persisted across sessions)
    const [isLookingAtScreen, setIsLookingAtScreen] = useState(false); // Track if user is looking at the screen

    const lastUpdateTime = useRef(Date.now()); // Track the last update time for both timers

    useEffect(() => {
        console.log("Initializing component...");
        startVideo();
        loadModels();
        requestNotificationPermission();
    }, []);

    // Retrieve the user's total screen time from local storage on component mount
    useEffect(() => {
        if (isAuthenticated && user) {
            const savedScreenTime = localStorage.getItem(`screenTime_${user.sub}`);
            console.log("Retrieved total screen time from local storage:", savedScreenTime);
            if (savedScreenTime) {
                const parsedScreenTime = parseFloat(savedScreenTime);
                console.log("Parsed total screen time:", parsedScreenTime);
                setTotalScreenTime((prevTotal) => {
                    console.log("Setting total screen time to:", parsedScreenTime);
                    return parsedScreenTime; // Update the total screen time
                });
            }
        }
    }, [isAuthenticated, user]);

    // Save the screen time to local storage when the component unmounts or the user logs out
    useEffect(() => {
        return () => {
            if (isAuthenticated && user && screenTime != 0) {
                console.log("Saving total screen time to local storage:", totalScreenTime);
                localStorage.setItem(`screenTime_${user.sub}`, totalScreenTime.toString());
            }
        };
    }, [isAuthenticated, user, totalScreenTime]);

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
                    };
                }
            })
            .catch((err) => console.error("Error accessing webcam:", err));
    };

    const loadModels = async () => {
        try {
            console.log("Loading models...");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            console.log("Tiny Face Detector model loaded.");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            console.log("Face Landmark 68 model loaded.");
            setIsModelsLoaded(true);
            console.log("Models loaded successfully.");
        } catch (err) {
            console.error("Error loading models:", err);
        }
    };

    const detectBlinks = useCallback(async () => {
        if (!isModelsLoaded || !videoReady || !videoRef.current) {
            console.log("Detection not started. Models or video feed not ready.");
            return;
        }

        if (videoRef.current && !videoRef.current.paused) {
            setInterval(async () => {
                const detections = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks();

                console.log("Detections:", detections);
                if (!detections) {
                    console.log("No face detected.");
                    setIsLookingAtScreen(false); // User is not looking at the screen
                    return;
                }

                const landmarks = detections.landmarks;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();

                // Check if user is looking at the screen
                const gazeDirection = calculateGazeDirection(leftEye, rightEye);
                setIsLookingAtScreen(gazeDirection === "Center"); // User is looking at the screen if gaze is centered

                if (isBlinking(leftEye, rightEye)) {
                    handleBlink();
                }
            }, 300); // Adjust interval for performance
        }
    }, [isModelsLoaded, videoReady]);

    const isBlinking = (leftEye, rightEye) => {
        const eyeAspectRatio = (eye) => {
            const verticalDist = Math.abs(eye[1].y - eye[5].y) + Math.abs(eye[2].y - eye[4].y);
            const horizontalDist = Math.abs(eye[0].x - eye[3].x);
            return verticalDist / (2.0 * horizontalDist);
        };

        const leftEAR = eyeAspectRatio(leftEye);
        const rightEAR = eyeAspectRatio(rightEye);
        console.log("Left EAR:", leftEAR, "Right EAR:", rightEAR);

        const EAR_THRESHOLD = 0.26; // Adjust if needed
        return leftEAR < EAR_THRESHOLD && rightEAR < EAR_THRESHOLD;
    };

    const handleBlink = () => {
        const currentTime = Date.now();
        if (!lastBlinkTime || currentTime - lastBlinkTime > 300) {
            setBlinkCount((prev) => prev + 1);
            setLastBlinkTime(currentTime);
        }
    };

    // Calculate gaze direction
    const calculateGazeDirection = (leftEye, rightEye) => {
        const leftEyeCenter = {
            x: leftEye.reduce((sum, point) => sum + point.x, 0) / leftEye.length,
            y: leftEye.reduce((sum, point) => sum + point.y, 0) / leftEye.length,
        };
        const rightEyeCenter = {
            x: rightEye.reduce((sum, point) => sum + point.x, 0) / rightEye.length,
            y: rightEye.reduce((sum, point) => sum + point.y, 0) / rightEye.length,
        };

        const gazeAngle = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x) * (180 / Math.PI);

        if (gazeAngle < -15) return "Left";
        if (gazeAngle > 15) return "Right";
        return "Center";
    };

    // Single interval to handle both timers
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedTime = (now - lastUpdateTime.current) / 1000; // Elapsed time in seconds
            lastUpdateTime.current = now;

            // Round elapsedTime to 2 decimal places to avoid floating-point precision issues
            const roundedElapsedTime = Math.round(elapsedTime * 100) / 100;

            // Update screen time if the user is looking at the screen
            if (isLookingAtScreen) {
                setScreenTime((prev) => prev + roundedElapsedTime);
                setTotalScreenTime((prev) => {
                    const newTotalScreenTime = prev + roundedElapsedTime;
                    console.log("Updated total screen time:", newTotalScreenTime);
                    return newTotalScreenTime;
                });
            }

            // Update countdown timer only if the user is looking at the screen
            setTimer((prev) => {
                if (prev <= 0) {
                    setBpm(blinkCount);
                    setBlinkCount(0);
                    console.log("Blink count reset. Current BPM:", blinkCount);

                    if (blinkCount <= 10) {
                        sendNotification();
                    }
                    return 60; // Reset the timer
                }
                return prev - roundedElapsedTime; // Decrement by elapsed time
            });
        }, 1000); // Run every second

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [blinkCount, isLookingAtScreen]);

    useEffect(() => {
        if (isModelsLoaded && videoReady) {
            console.log("Starting blink detection.");
            detectBlinks();
        }
    }, [isModelsLoaded, videoReady, detectBlinks]);

    const requestNotificationPermission = () => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }
    };

    const sendNotification = () => {
        if (useBrowserNotification && Notification.permission === "granted") {
            new Notification("Time to take a break!", {
                body: "Your blink rate is low. Take a short break to rest your eyes.",
                icon: "/logoeye.png",
            });
        } else {
            alert("Time to take a break!\nYour blink rate is low. Take a short break to rest your eyes.");
        }
    };

    const toggleNotificationPreference = () => {
        setUseBrowserNotification((prev) => !prev);
    };

    return (
        <div>
            <video ref={videoRef} autoPlay muted width="400" height="300" />
            {/* Display "Metrics for [User's Name]" at the bottom */}
            {isAuthenticated && user && (
                <p style={{ fontWeight: "bold" }}>Metrics for {user.name}</p>
            )}
            <p>Blinks per minute: {bpm}</p>
            <p>Time until next calculation: {Math.floor(timer)} seconds</p>
            <p>Session screen time: {Math.floor(screenTime)} seconds</p>
            <p>Total screen time: {Math.floor(totalScreenTime)} seconds</p> {/* Display total screen time */}
            <button onClick={toggleNotificationPreference}>
                {useBrowserNotification ? "Switch to Popup Alerts" : "Switch to Browser Notifications"}
            </button>
        </div>
    );
};

export default BlinkTracker;
