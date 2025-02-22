import cv2
import os
import json

# Load pre-trained Haar cascades for eye and face detection
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

x = [] # random initialization for github push

def detect_redness(image):
    # Convert image to HSV for better color detection
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define the range for red color in HSV
    lower_red = (0, 70, 50)
    upper_red = (10, 255, 255)
    mask1 = cv2.inRange(hsv, lower_red, upper_red)
    
    lower_red = (170, 70, 50)
    upper_red = (180, 255, 255)
    mask2 = cv2.inRange(hsv, lower_red, upper_red)
    
    # Combine masks
    red_mask = mask1 | mask2

    # Count the number of red pixels
    red_pixel_count = cv2.countNonZero(red_mask)
    
    return red_pixel_count > 500  # Threshold for redness

def detect_bagginess(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if h > 5 and y > image.shape[0] // 2:  # Check for bagginess
            return True
            
    return False

def detect_watery_eyes(image):
    # Simple logic based on brightness in the eye region
    # Convert to HSV and check the V channel
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mean_brightness = cv2.mean(hsv[:, :, 2])[0]  # Average value in the V channel
    return mean_brightness > 200  # Threshold for determining watery eyes

def detect_glasses(image):
    # Load pre-trained Haar cascade for eye glasses detection
    glasses_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    glasses = glasses_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    return len(glasses) > 0  # Return true if glasses are detected

def annotate_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        print(f"Error: Unable to read image at {image_path}")
        return []  # Return empty if the image is not found

    # Detect features
    is_red = detect_redness(image)
    is_baggy = detect_bagginess(image)
    is_watery = detect_watery_eyes(image)
    has_glasses = detect_glasses(image)

    annotations = []
    if is_red:
        annotations.append({'label': 'red', 'confidence': 0.9})
    if is_baggy:
        annotations.append({'label': 'baggy', 'confidence': 0.9})
    if is_watery:
        annotations.append({'label': 'watery', 'confidence': 0.9})
    if has_glasses:
        annotations.append({'label': 'with glasses', 'confidence': 0.9})

    # Determine if the eyes are strained based on detected conditions
    if is_red or is_baggy or is_watery:
        annotations.append({'label': 'strained', 'confidence': 0.9})
    else:
        annotations.append({'label': 'not strained', 'confidence': 0.9})

    # Debug output
    # print(f"Processed {image_path}: {annotations}")

    return annotations

# Directory paths
input_dir = '/Users/kalyan/Desktop/VascuLens/EyeData/train'  # Update to your input directory
output_dir = '/Users/kalyan/Desktop/VascuLens/EyeData'  # Update to your output directory
os.makedirs(output_dir, exist_ok=True)

# List to store all annotations
annotations_list = []

# Loop through dataset
for filename in os.listdir(input_dir):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        image_path = os.path.join(input_dir, filename)
        annotations = annotate_image(image_path)
        
        # Save the annotations for each image
        annotations_list.append({filename: annotations})

# Save all annotations to a JSON file for Roboflow
with open(os.path.join(output_dir, 'annotations.json'), 'w') as f:
    json.dump(annotations_list, f)

# print(f"Annotated data saved to {output_dir}/annotations.json")