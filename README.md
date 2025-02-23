### Eyedentify

Eyedentify is a web application that uses computer vision to detect and analyze eye strain. It integrates with Roboflow’s object detection model to track eye strain levels and notifies users when excessive strain is detected.

## 🚀 Features
	•	Live camera feed for real-time eye detection
	•	Roboflow model integration for eye strain analysis
	•	Screen time tracking
	•	Auth0 authentication for user login/logout
	•	Notifications for excessive eye strain

## 🛠 Setup & Installation

1️⃣ Clone the Repository
```sh git clone https://github.com/your-username/eyedentify.git
cd eyedentify

2️⃣ Install Dependencies
npm install

3️⃣ Set Up Environment Variables

Create a .env file in the root directory and add:
```REACT_APP_ROBOFLOW_API_KEY=your_api_key_here```
```REACT_APP_MODEL_PUBLIC_KEY=your_model_key_here```
```REACT_APP_MODEL_VERSION=your_model_version_here```

4️⃣ Run the App
```npm start```

Then, open http://localhost:3000/ in your browser.

## 🔧 How It Works
	1.	Log in using Auth0 authentication.
	2.	Click Start Model to enable the camera and begin eye detection.
	3.	The app processes video frames using Roboflow’s API and detects eye strain.
	4.	If prolonged strain is detected, the app notifies the user.

## 📦 Tech Stack
	•	React.js – Frontend framework
	•	Roboflow API – Computer vision model
	•	Auth0 – Authentication
	•	Inference.js – Runs Roboflow models in the browser
