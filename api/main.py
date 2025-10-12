import json
import pickle
import numpy as np
import os
import pandas as pd
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

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running"}), 200


@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({"error": "Model or scaler not loaded on the server."}), 500

    data = request.get_json()
    
    # The exact column names and order from model training
    model_feature_order = [
        'P/S Ratio', 'Total Debt', 'Free Cash Flow', 'Capital Expenditure', 
        'Long-Term Debt', 'Net Cash', 'P/E Ratio', 'Market Cap', 
        'Revenue 3yr CAGR', 'Total Assets'
    ]

    # Map incoming JSON keys to the model's expected feature names and order
    input_data = {
        'P/S Ratio': float(data.get('psRatio', 0)),
        'Total Debt': float(data.get('totalDebt', 0)),
        'Free Cash Flow': float(data.get('fcf', 0)),
        'Capital Expenditure': -float(data.get('capEx', 0)), # Negate CapEx
        'Long-Term Debt': float(data.get('longTermDebt', 0)),
        'Net Cash': float(data.get('netCash', 0)),
        'P/E Ratio': float(data.get('peRatio', 0)),
        'Market Cap': float(data.get('marketCap', 0)),
        'Revenue 3yr CAGR': float(data.get('revenueCagr', 0)) / 100, # Convert to decimal
        'Total Assets': float(data.get('totalAssets', 0))
    }

    # Create the DataFrame with the correct column order
    input_df = pd.DataFrame([input_data], columns=model_feature_order)
    scaled_features = scaler.transform(input_df)
    prediction = model.predict(scaled_features)

    response = {"predicted_margin_of_safety": float(prediction[0])}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))