from http.server import BaseHTTPRequestHandler
import json
import pickle
import numpy as np
import os

# Get the absolute path to the directory where this script is located
dir_path = os.path.dirname(os.path.realpath(__file__))

# Construct the full paths for the model and scaler files
model_path = os.path.join(dir_path, 'xgboost_sklearn_model.pkl')
scaler_path = os.path.join(dir_path, 'robust_scaler.pkl')

# --- Load the Model and Scaler ---
# It's best practice to load these once when the function starts
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
except FileNotFoundError as e:
    # If files are not found, we'll have a clear error
    # This helps in debugging during deployment
    model = None
    scaler = None
    print(f"Error loading model/scaler: {e}")


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        if not model or not scaler:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Model or scaler not loaded on the server."}).encode())
            return

        content_len = int(self.headers.get('Content-Length'))
        post_body = self.rfile.read(content_len)
        data = json.loads(post_body)

        # IMPORTANT: The order of features must match the order used during model training
        feature_order = ['marketCap', 'peRatio', 'psRatio', 'revenueCagr', 'totalAssets', 'totalDebt', 'longTermDebt', 'capEx', 'fcf', 'netCash']
        
        input_values = []
        for feature in feature_order:
            # Safely get value, defaulting to 0 if empty or missing
            value = float(data.get(feature) or 0)
            if feature == 'capEx':
                # Negate the positive value entered by the user, as the model expects a negative value for expenditure.
                value = -value
            elif feature == 'revenueCagr':
                # Convert percentage to decimal for the model
                value = value / 100
            input_values.append(value)

        # Create a numpy array from the input data in the correct order
        input_features = np.array(input_values).reshape(1, -1)

        # Scale the features and make a prediction
        scaled_features = scaler.transform(input_features)
        prediction = model.predict(scaled_features)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        # Assuming the model returns a single value in a numpy array
        response = {"predicted_margin_of_safety": prediction[0]}
        self.wfile.write(json.dumps(response).encode())
        return