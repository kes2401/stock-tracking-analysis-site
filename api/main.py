import json
import pickle
import numpy as np
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Load the Model and Scaler ---
# It's best practice to load these once when the app starts
try:
    dir_path = os.path.dirname(os.path.realpath(__file__))
    model_path = os.path.join(dir_path, 'xgboost_sklearn_model.pkl')
    scaler_path = os.path.join(dir_path, 'robust_scaler.pkl')

    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
except FileNotFoundError as e:
    model = None
    scaler = None
    print(f"Error loading model/scaler: {e}")


@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({"error": "Model or scaler not loaded on the server."}), 500

    data = request.get_json()
    feature_order = ['marketCap', 'peRatio', 'psRatio', 'revenueCagr', 'totalAssets', 'totalDebt', 'longTermDebt', 'capEx', 'fcf', 'netCash']
    
    input_values = []
    for feature in feature_order:
        value = float(data.get(feature) or 0)
        if feature == 'capEx':
            value = -value
        elif feature == 'revenueCagr':
            value = value / 100
        input_values.append(value)

    input_features = np.array(input_values).reshape(1, -1)
    scaled_features = scaler.transform(input_features)
    prediction = model.predict(scaled_features)

    response = {"predicted_margin_of_safety": prediction[0]}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))