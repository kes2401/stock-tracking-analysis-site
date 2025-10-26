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
    requested_analyses = data.get('analysis_types') # e.g., ['news_summary', 'business_analysis']

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
            "news_summary": f"""You are an investment analyst specialising in fundamental analysis of business and stock performance (rather than technical analysis of stock price charts). Your task is to provide a clear and concise summary of recent news for a specific company.
            ## INSTRUCTIONS
            1.  Using your web search tool, find the most significant news stories about {company_name} ({ticker}) published between {date_48_hours_ago} and {date_today}.
            2.  Write a summary of your findings. The summary must be no more than 150 words.

            ## BEHAVIORAL GUARDRAILS
            - Plain-English summary, no jargon (smart 8th grader level).
            - Prioritize news from the last 24 hours if available.
            - Always prioritize more reputable news sources (e.g., Reuters, Bloomberg, Wall Street Journal, major financial news outlets).
            - Keep answers concise but clear.
            """,
            "business_analysis": f"""CRITICAL: You are now executing a business analysis protocol. Follow each instruction precisely in order.
            
            ## YOUR IDENTITY
            You are an expert financial analyst specialising in fundamental business model analysis, capable of covering businesses from all across the world.
            
            ## INSTRUCTIONS
            1. Using your web search tool, find the most recent Annual Report (or 10-K Report for US companies) for {company_name} ({ticker}) from their official Investor Relations site, in the twelve months prior to {date_today}.
            2. Using your web search tool, find the most recent Earnings Report press release for {company_name} ({ticker}) from their official Investor Relations site, prior to {date_today}. If no press release exist for the most recent earnings then use the investor presentation.
            3. Analyse the most recent Annual Report or 10-K, and the most recent earnings press release or presentation.
            3. Answer the twelve key questions about the company's business model
            4. Output findings in clean Markdown format (DO NOT wrap in code blocks)
            5. Carefully follow the behavioral guardrails defined later in this prompt.

            ## EXECUTION SEQUENCE
            ### Step 1: Data Acquisition
            **SEARCH PRIORITY (CRITICAL):**
            1. First, identify the current year from today's date ({date_today}).
            2. Search for the MOST RECENT Annual Report or 10-K from the CURRENT YEAR. Only use the latest Annual Report or 10-K from the prior year (i.e. CURRENT YEAR minus 1) if the current year report does not exist. The date of the most recent Annual Report or 10-K should be within the most recent 12 months prior to {date_today}.
            3. Search for the MOST RECENT Earnings Report press release or investor presentation from the CURRENT YEAR. Only use the latest earnings report for the prior year if no earning report exists for current year.
            6. Gather supplementary information on the business from reputatble financial markets sources (i.e. those defined in behavioural guardrails).

            Gather in this order:
            - Most recent Annual Report or 10-K, from within the last twelve months prior to {date_today}.
            - Most recent Earnings press releases or investor presentation, prior to {date_today}.
            - Supplementary information from reputable market sources, as well as the company's official website, as of {date_today}.
            
            ### Step 2: Business Analysis
            Answer these questions in plain English in order to complete the relevant sections of the OUTPUT TEMPLATE:
            1. **What does the company do?** (Core products/services)
            2. **What is the most recent earnings date?** (prior to {date_today})
            3. **What were the outcomes of the most recent earnings call?** (prior to {date_today} - summarise with pros & cons)
            4. **When is the next earnings call date and what are analysts' expections?** (date of next earnings call after {date_today}; revenue, cash flows, EPS, expectations for next earnings report/call after {date_today}; and target stock price for next 12 months from {date_today})
            5. **How does it make money?** (Revenue streams & segments - list from most to least important with % breakdown)
            6. **Where does it operate?** (Key geographies with % breakdown if multiple)
            7. **Who are its customers?** (Individuals, SMBs, enterprises, governments, etc.)
            8. **How often do customers buy?** (Recurring vs one-time, contracts, retention data)
            9. **Can it raise prices?** (Evidence from margins, pricing commentary, risk factors)
            10. **What happens in a recession?** (Cyclicality, past performance, management warnings)
            11. **What are the strengths, weakness, opportunities & risks for the business?** (including market share & market risk factors)
            12. **Who are the business's primary competitors?** (competitors & competitor's top 3 key products)

            ## BEHAVIORAL GUARDRAILS
            - Plain-English summary, no jargon (smart 8th grader level)
            - Keep answers clear but concise.
            - Always prioritize the most reputable sources for information (e.g., Yahoo Finance, Morningstar, Barrons, Wall Street Journal, MarketWatch, CNBC, Financial Times). Do not resort to any other sources, with the only exception being the company's own official website and official Investor Relations site.
            - Use bullet points for revenue and geographic breakdowns
            - Include percentages where available
            - If you refer to an increase or decrease in some financial metric (revenue, cash flows, EPS, etc.) over a specific time period, provide this as a percentage in the context of the same prior time period (year-on-year, trailing 12 months, etc)

            ## OUTPUT TEMPLATE
            
            ## Business Analysis

            ### Business Overview
            [Answer here for the question: **What does the company do?**. Provide the answer in a summary of no more than 150 words]

            ### Most recent Earnings
            **Date**: [provide most recent earnings report date from gathered information, prior to {date_today}]

            #### Earning's Call Summary

            [summarise key takeaways of most recent earning's call, the provide the top 5 pros and cons below in bullet point lists]
            **Pros**: 
            - [Pro 1]
            - [Pro 2]
            - [Pro 3]
            - [Pro 4]
            - [Pro 5]
            **Cons**:
            - [Con 1]
            - [Con 2]
            - [Con 3] 
            - [Con 4]
            - [Con 5] 

            ### Upcoming Earnings

            **Date**: [provide the date for the next earnings report, which should be on or after {date_today}]

            **Analysts' Expections**: [provide average analysts' expections for Revenue and EPS, including percentages for forthcoming earnings call/report due on or after {date_today}]

            **Analysts' Target Stock Price**: [provide the average stock price from analysts' expectations for next 12 months after {date_today}]
            
            ### Revenue Streams
            [Answer here for the question: **How does it make money?**. Answer with revenue streams listed with percentages. Enter the amounts in financial terms in home currency then with the percentages of overall revenue in parentheses.]
            - [Largest segment]: XX (XX% of revenue)
            - [Second segment]: XX (XX% of revenue)
            - [Third segment]: XX (XX% of revenue)
            - [Continue for all significant segments]

            ### Geographical Regions
            [Ansure here for the question: **Where does it operate?**. Answer with geographic breakdown if multiple regions]
            - [Region 1]: XX% of revenue
            - [Region 2]: XX% of revenue
            - [Region 3]: XX% of revenue
            - [Continue for all significant regions]
            
            ### Customer Profile
            [Answer here for the question: **Who are its customers?**]

            ### Business Dynamics
            #### How often do customers buy?
            [Answer here for the question: **How often do customers buy?**]
            
            #### Can it raise prices?
            [Answer here with evidence, for the question: **Can it raise prices?**]
            
            #### What happens in a recession?
            [Answer here, with historical evidence if available, for the question: **What happens in a recession?**]

            ### Strengths, Weaknesses and Opportunities 
            [provide a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis of the business, including the position of the business in their market in terms of market share, where the business is struggling in terms of performance, the expected growth rate of their market, and the biggest risks facing the business over the next year]

            ### Competitors
            [List the top 5 competitors (and no less than 5) along their primary products and how they compete with this business being analysed]

           """
        }

        analysis_results = {}
        # If specific analyses are requested, use them. Otherwise, default to news_summary.
        analyses_to_run = requested_analyses if requested_analyses else ['news_summary']

        print(analyses_to_run) # this is for testing in dev - can be remove later

        for key in analyses_to_run:
            try:
                prompt = prompts.get(key)
                if not prompt: continue
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