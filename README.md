#  GrabCredit & GrabInsurance: AI Merchant Underwriting Agent

**Candidate:** Ashish Babu Nannepaga (Generative AI & Full-Stack Developer)  
**Challenge:** GrabOn Vibe Coder Challenge 2025 – Project 07  
**Time to Production:** ~1 Hour

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Gemini](https://img.shields.io/badge/Google_Gemini_1.5_Pro-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=Twilio&logoColor=white)

## 🔗 Quick Links
* 🎥 **[Watch the Loom Demo Video](https://drive.google.com/file/d/1pIPWQNs-JsGxATumLentrZWSLEZvuKTG/view?usp=sharing)**
* 💻 **[Live Frontend Demo (StackBlitz)](https://stackblitz.com/~/github.com/Ashishbabunannepaga/grabon-ai-underwriting-agent?file=README.md)**

---

##  Executive Summary
This project is an end-to-end, autonomous AI Underwriting Agent designed for GrabOn's merchant ecosystem. It ingests merchant transaction data (GMV, refund rates, loyalty metrics), utilizes **Google Gemini 1.5 Pro** to evaluate financial risk, and generates hyper-personalized working capital limits and embedded insurance quotes.

Built with a focus on **Explainable AI** and **Premium UX**, the system provides a data-backed rationale for every decision and completely automates the loan approval lifecycle—from data ingestion to **WhatsApp notification** and **NACH Mandate simulation**.

---

##  Key Features (100% Requirement Match)
1. **Dual-Mode Underwriting:** Dynamically generates both GrabCredit working capital limits and GrabInsurance business interruption quotes based on merchant health.
2. **Explainable AI (XAI):** Eliminates "black-box" decision-making. The LLM is strictly prompted to justify its Risk Tier using 3 specific data points from the merchant's profile.
3. **Real-Time Batch Processing:** A robust frontend pipeline that sequentially evaluates the entire merchant queue to respect API rate limits.
4. **Automated WhatsApp Offers:** Integrates with the Twilio API to automatically dispatch formatted business offers to approved Tier 1 and Tier 2 merchants.
5. **Mock NACH Flow:** Seamless one-click UI integration simulating the merchant accepting the offer and establishing a NACH mandate.

---

##  Architecture & Design Decisions

To ensure production-grade stability, enterprise security, and a flawless evaluation experience, I made the following architectural decisions:

* **Zero-Dependency Frontend (StackBlitz + Tailwind):** To avoid local CLI compatibility issues (specifically Vite vs. Shadcn Next.js conflicts), I deployed a cloud-native React frontend. The UI utilizes pure Tailwind CSS and Framer Motion to create a "Glassmorphic" Fintech Command Center, optimizing for high-end demo quality without local build failures.
* **Ngrok Secure Tunneling:** Browsers block requests from secure HTTPS frontends to local HTTP backends (Mixed Content Policy). I implemented an Ngrok secure tunnel to expose the local FastAPI server, instantly resolving CORS/Mixed Content blocks.
* **Strict JSON Enforcement:** The Gemini 1.5 Pro system prompt is engineered to return strict JSON strings, wrapped in backend error-handling logic (`json.JSONDecodeError`) to ensure the Python API never crashes due to LLM hallucinations.
* **Sequential Processing (Edge Case Handling):** Instead of using `Promise.all()` to fetch all merchant data simultaneously (which would trigger an HTTP 429 Too Many Requests error), the frontend processes the queue sequentially using a `for...of` loop.

---

##  How to Run Locally

### 1. Backend Setup (Python / FastAPI)
Open your terminal and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install requirements
pip install -r requirements.txt

# Create your environment variables
cp .env.example .env
# IMPORTANT: Open .env and add your Google Gemini & Twilio API Keys

# Start the server
uvicorn main:app --reload
```

### 2. Establish the Secure Tunnel
In a **new terminal window**, create an HTTPS tunnel to your local backend:
```bash
npx ngrok http 8000
```
*Note the forwarding URL provided by Ngrok (e.g., `https://xxxx-xxxx.ngrok-free.app`).*

**⚠️ CRITICAL HANDSHAKE STEP:** 
Open a browser tab, paste your Ngrok URL, and click **"Visit Site"** to bypass the Ngrok security warning screen.

### 3. Frontend Setup (React / Vite)
You can view the live frontend via the StackBlitz link above, or run it locally:
```bash
cd frontend
npm install

# Update the API_BASE URL in App.tsx
# Change line 16 to: const API_BASE = "YOUR_NGROK_URL"

npm run dev
```

---

## 🧪 Testing Edge Cases
* **The "Star" Merchant (`merchant_001`):** Shows high GMV and low return rates. Will trigger a Tier 1 approval, high credit limit, and fire a WhatsApp message.
* **The "Risky" Merchant (`merchant_002`):** Simulates an electronics merchant with a 15% refund rate. Will trigger an immediate AI Rejection based on the programmed risk guardrails.

---

*Designed and developed by Ashish Babu Nannepaga for the GrabOn Vibe Coder Challenge 2025.*

