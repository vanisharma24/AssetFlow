from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Allow all origins for development

# ---------- GROQ API SETUP ----------
# Get your FREE API key from: https://console.groq.com/keys
GROQ_API_KEY = "gsk_your_actual_groq_api_key_here"  # <-- REPLACE WITH YOUR ACTUAL KEY

# Groq API endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Available free models:
# - "mixtral-8x7b-32768" (best performance)
# - "llama3-70b-8192" (great for general chat)
# - "gemma2-9b-it" (fast and capable)
# - "llama3-8b-8192" (fastest)
# - "llama-3.1-70b-versatile" (latest)

MODEL = "mixtral-8x7b-32768"  # Change to any model you prefer

# System prompt to set the bot's personality
SYSTEM_PROMPT = """You are a helpful, friendly, and knowledgeable AI assistant. 
You respond in a conversational tone and provide accurate, useful information. 
Keep responses concise but informative. If you don't know something, be honest about it."""

# ---------- ROUTES ----------
@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Get the user message from the request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message'}), 400
        
        user_message = data['message']
        
        # Headers for Groq API
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Request payload
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": False
        }
        
        # Make request to Groq API
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        
        # Check if request was successful
        if response.status_code == 200:
            result = response.json()
            reply = result['choices'][0]['message']['content']
            return jsonify({'reply': reply})
        else:
            # Handle API errors
            error_msg = response.json().get('error', {}).get('message', 'Unknown error')
            return jsonify({'reply': f"⚠️ API Error: {error_msg}"}), response.status_code
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'reply': f"⚠️ Error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL,
        'api_key_set': bool(GROQ_API_KEY)
    })

# ---------- OPTIONAL: Add a root route to avoid 404 ----------
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': '🚀 Groq AI Chatbot Server is running!',
        'endpoints': {
            '/health': 'GET - Check server status',
            '/chat': 'POST - Send a message to the AI'
        },
        'example': {
            'POST /chat': {
                'body': {'message': 'Hello, how are you?'}
            }
        }
    })

if __name__ == '__main__':
    print("🚀 Groq AI Chatbot Server Running!")
    print(f"📡 Using model: {MODEL}")
    print(f"🔑 API Key: {GROQ_API_KEY[:15]}... (first 15 chars)")
    print("🌐 Server: http://127.0.0.1:5000")
    print("📍 Health check: http://127.0.0.1:5000/health")
    print("💬 Chat endpoint: http://127.0.0.1:5000/chat (POST)")
    print("🏠 Home: http://127.0.0.1:5000/")
    app.run(host='0.0.0.0', port=5000, debug=True)