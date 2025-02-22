import json
import os

# Load your existing JSON
with open("/Users/kalyan/Desktop/VascuLens/EyeData/annotations.json", "r") as f:
    raw_data = json.load(f)

# Initialize COCO JSON structure
coco_format = {
    "images": [],
    "annotations": [],
    "categories": []
}

# Define category mapping
category_mapping = {}
category_id_counter = 1
annotation_id = 1
image_id_counter = 1

for entry in raw_data:
    for filename, labels in entry.items():
        # Add image entry
        coco_format["images"].append({
            "id": image_id_counter,
            "file_name": filename,
            "width": 640,   # Default, change if necessary
            "height": 640   # Default, change if necessary
        })

        for label_info in labels:
            label = label_info["label"]

            # Assign category ID if not already mapped
            if label not in category_mapping:
                category_mapping[label] = category_id_counter
                coco_format["categories"].append({
                    "id": category_id_counter,
                    "name": label
                })
                category_id_counter += 1

            # Dummy bbox (COCO format requires bboxes)
            bbox = [50, 50, 100, 100]  # Default, adjust for real data

            # Add annotation entry
            coco_format["annotations"].append({
                "id": annotation_id,
                "image_id": image_id_counter,
                "category_id": category_mapping[label],
                "bbox": bbox,
                "area": bbox[2] * bbox[3],  # width * height
                "iscrowd": 0
            })

            annotation_id += 1

        image_id_counter += 1

# Save new COCO JSON
with open("coco_annotations.json", "w") as f:
    json.dump(coco_format, f, indent=4)

# print("✅ COCO annotations saved to coco_annotations.json")