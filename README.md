# EyeDentify

## Overview  
Eye Condition Detector is a web-based application that uses a trained **Roboflow** model to analyze eye images and detect conditions such as **redness, bagginess, strain, watery eyes, or no strain**. The frontend is built with **React.js**, and the model is integrated using the **Roboflow API**.

## Features  
✅ Upload an image for analysis  
✅ Detect different eye conditions  
✅ Display predictions with confidence scores  
✅ Easy-to-use interface  

## Tech Stack  
- **Frontend:** React.js  
- **Model Deployment:** Roboflow API  
- **HTTP Requests:** Axios  

---

## Setup and Installation  

### 1️⃣ Clone the Repository  
```git clone https://github.com/your-username/eye-condition-detector.git```
```cd eye-condition-detector```

### 2️⃣ Install Dependencies
```npm install```

### 3️⃣ Configure Roboflow API
	• Go to Roboflow and get your API key and model ID.
	•	Open src/roboflow.js and replace the placeholders:
```REACT_APP_ROBOFLOW_API_KEY=your-api-key```
```REACT_APP_MODEL_ID=your-model-id```
```REACT_APP_VERSION_NUMBER=your-version-number```

## Running the Application

### 🚀 Start the Development Server
```npm start```
