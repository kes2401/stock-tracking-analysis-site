import json
import pickle
import numpy as np
import os
import pandas as pd
import time
from datetime import datetime, timedelta, timezone
from google import genai
from google.genai import types
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Configure Gemini API ---
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error configuring Gemini: {e}")

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

@app.route('/stock-analysis', methods=['POST'])
def stock_analysis():
    data = request.get_json()
    company_name = data.get('name')
    ticker = data.get('ticker')

    if not company_name or not ticker:
        return jsonify({"error": "Company name and ticker are required."}), 400

    # Calculate dynamic dates for the prompt
    date_today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    date_48_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=48)).strftime('%Y-%m-%d')

    try:
        # Configure less restrictive safety settings and initialize the model
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        
        client = genai.Client()

        prompts = {
            "news_summary": f"""You are an investment analyst. Your task is to provide a clear and concise summary of recent news for a specific company.
            ## INSTRUCTIONS
            1.  Using your web search tool, find the most significant news stories about {company_name} ({ticker}) published between {date_48_hours_ago} and {date_today}.
            2.  Write a summary of your findings. The summary must be no more than 150 words.

            ## BEHAVIORAL GUARDRAILS
            - Plain-English summary, no jargon (smart 8th grader level).
            - Prioritize news from the last 24 hours if available.
            - Always prioritize more reputable news sources (e.g., Reuters, Bloomberg, Wall Street Journal, major financial news outlets).
            - Keep answers concise but clear.
            """,
            #"swot_analysis": f"Provide a brief SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for {company_name}.",
            #"competitors": f"List the top 3 competitors for {company_name} and their primary products.",
            #"earnings_summary": f"Summarize the key takeaways from the most recent quarterly earnings call for {company_name}.",
            #"risks": f"What are the biggest market risks facing {company_name} in the next year?"
        }

        analysis_results = {}
        for key, prompt in prompts.items():
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash-lite',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[
                            types.Tool(
                                google_search=types.GoogleSearch()
                            )
                        ]
                    )
                )
                # Log the full response to check for block reasons
                print(f"Gemini response for '{key}': {response}")
                analysis_results[key] = response.text
            except Exception as e:
                # This is where the error is likely happening
                print(f"Error generating content for '{key}': {e}")
                analysis_results[key] = "Could not generate a response for this topic."

            time.sleep(1) # Add a 1-second delay to avoid hitting rate limits

        return jsonify(analysis_results)

    except Exception as e:
        # This will catch errors like a missing/invalid API key
        print(f"An error occurred during Gemini API call: {e}")
        return jsonify({"error": "An error occurred while analyzing the stock. Check the backend logs for details."}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))