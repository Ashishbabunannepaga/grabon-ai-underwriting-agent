# main.py
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from twilio.rest import Client

# --- Configuration ---
load_dotenv()
app = FastAPI()

# Setup Google Gemini Client
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-3-flash-preview')

# Setup Twilio Client
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
YOUR_WHATSAPP_NUMBER = os.getenv("YOUR_WHATSAPP_NUMBER")
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# --- Add CORS middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins, including StackBlitz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Data Validation ---
class UnderwritingOffer(BaseModel):
    decision: str
    credit_limit_inr: int
    interest_rate_tier: str
    tenure_options: list[int]
    rationale: str

# --- Core AI and Notification Functions ---
def send_whatsapp_offer(merchant_name: str, offer: UnderwritingOffer):
    if offer.decision.lower() == "approve":
        body = (
            f"Hi {merchant_name}, great news from GrabCredit!\n\n"
            f"You've been pre-approved for a working capital loan of *₹{offer.credit_limit_inr:,}*.\n\n"
            f"This offer is based on your strong business performance. You can review the full details and accept on your GrabOn merchant dashboard.\n\n"
            f"Regards,\nThe GrabCredit Team"
        )
        try:
            message = twilio_client.messages.create(
                body=body,
                from_=f'whatsapp:{TWILIO_WHATSAPP_FROM}',
                to=f'whatsapp:{YOUR_WHATSAPP_NUMBER}'
            )
            print(f"WhatsApp message sent: {message.sid}")
        except Exception as e:
            print(f"Error sending WhatsApp message: {e}")

def get_underwriting_decision(merchant_data: dict) -> UnderwritingOffer:
    prompt = f"""
    Analyze the following merchant data for GrabCredit and make a working capital loan decision.
    
    Merchant Data:
    {json.dumps(merchant_data)}

    Your underwriting rules are:
    - Tier 1 (Best Rates): Stable/Growing GMV, return_and_refund_rate < 4%, high customer_return_rate (>60%). Offer a credit limit of ~2x average monthly GMV.
    - Tier 2 (Standard Rates): Moderate GMV growth, return_and_refund_rate between 4-8%. Offer a credit limit of ~1x average monthly GMV.
    - Tier 3 (High Risk / Manual Review): Volatile/Declining GMV, return_and_refund_rate > 8%, or less than 6 months of data. Offer a very small "starter" loan or reject.
    - REJECT if return_and_refund_rate > 12% or GMV is consistently declining for 3+ months.

    Your response MUST be a single, valid JSON object following this exact structure. Do not add any other text, markdown, or explanations.
    {{
        "decision": "Approve",
        "credit_limit_inr": 1500000,
        "interest_rate_tier": "Tier 1",
        "tenure_options": [6, 9, 12],
        "rationale": "A 3-5 sentence explanation referencing at least THREE specific data points from the merchant's profile. For a rejection, the rationale must clearly state the primary reason based on the rules."
    }}
    """
    
    response = gemini_model.generate_content(prompt)
    
    try:
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
        offer_data = json.loads(cleaned_text)
        return UnderwritingOffer(**offer_data)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error decoding Gemini response: {e}")
        print(f"Raw response: {response.text}")
        raise HTTPException(status_code=500, detail="Failed to get a valid decision from the AI model.")


# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "GrabOn Underwriting AI Agent (powered by Gemini) is running."}

@app.get("/merchants")
def list_merchants():
    try:
        files = os.listdir('data')
        merchant_ids = sorted([f.replace('.json', '') for f in files if f.endswith('.json')])
        return {"merchant_ids": merchant_ids}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Data directory not found.")

@app.post("/underwrite/{merchant_id}", response_model=UnderwritingOffer)
def underwrite_merchant(merchant_id: str):
    try:
        with open(f"data/{merchant_id}.json", 'r') as f:
            merchant_data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Merchant not found.")

    offer = get_underwriting_decision(merchant_data)
    send_whatsapp_offer(merchant_data.get("name", "Merchant"), offer)
    return offer