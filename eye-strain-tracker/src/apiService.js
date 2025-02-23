// apiService.js
export const fetchRoboflowResult = async (imageData) => {
    const response = await fetch('https://detect.roboflow.com/infer/workflows/vasculens/detect-and-classify-4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: 'DjmU9CiFoLeqn8JyX5lg',
            inputs: {
                image: { type: 'base64', value: imageData.split(',')[1] }, // Extract base64 part of the image
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); // Return JSON response
};