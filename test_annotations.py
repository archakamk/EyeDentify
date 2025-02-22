import json

# Load and print the JSON file
with open('/Users/kalyan/Desktop/VascuLens/EyeData/annotations.json', 'r') as f:
    data = json.load(f)

print(json.dumps(data, indent=4))  # Pretty-print the JSON content