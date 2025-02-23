import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import BlinkTracker from "./components/BlinkTracker";
import "./App.css"; // Import the CSS file
import logo from "./eyelogo.png"; // Path to your logo image

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [screenTime, setScreenTime] = useState(0); // Store the screen time in state

  useEffect(() => {
    let timer;
    if (isAuthenticated && user) {
      // Retrieve the user's total screen time from local storage
      const savedScreenTime = localStorage.getItem(`screenTime_${user.sub}`);
      if (savedScreenTime) {
        setScreenTime(parseInt(savedScreenTime, 10));
      }

      // Start tracking screen time once the user is authenticated
      timer = setInterval(() => {
        setScreenTime((prevTime) => prevTime + 1); // Increment every second
      }, 1000);
    }
    return () => clearInterval(timer); // Clean up the timer on unmount or if not authenticated
  }, [isAuthenticated, user]);

  // Save the screen time to local storage when the component unmounts or the user logs out
  useEffect(() => {
    return () => {
      if (isAuthenticated && user) {
        localStorage.setItem(`screenTime_${user.sub}`, screenTime.toString());
      }
    };
  }, [isAuthenticated, user, screenTime]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <img src={logo} alt="Eyedentify Logo" className="logo" />
      <h1>Eyedentify</h1>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log in</button>
      ) : (
        <div>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log out
          </button>
          <BlinkTracker />
        </div>
      )}
    </div>
  );
}

export default App;