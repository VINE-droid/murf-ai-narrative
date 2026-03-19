import os
import requests
import PyPDF2
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Configuration ---
# Set up Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables.", flush=True)
genai.configure(api_key=gemini_api_key)

# Set up Murf AI
MURF_API_KEY = os.environ.get("MURF_API_KEY")
MURF_API_URL = "https://api.murf.ai/v1/speech/generate"

MODEL_NAME = "gemini-2.5-flash"

# --- Routes ---
@app.route("/", methods=["GET"])
def index():
    return "Murf + Gemini Backend is running."

@app.route("/summarize", methods=["POST"])
def summarize():
    text = ""
    tone = "neutral"
    
    # Handle both JSON and Multipart Form Data
    if request.is_json:
        data = request.json
        text = data.get("text", "")
        tone = data.get("tone", "neutral")
    else:
        text = request.form.get("text", "")
        tone = request.form.get("tone", "neutral")
        
        # Check for uploaded PDF
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename.endswith('.pdf'):
                try:
                    pdf_reader = PyPDF2.PdfReader(file)
                    extracted_text = ""
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += page_text + "\n"
                    
                    if extracted_text.strip():
                        # Use PDF text instead of manual text input if both are provided
                        text = extracted_text
                except Exception as e:
                    return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 400

    if not text:
        return jsonify({"error": "No text or valid PDF provided"}), 400

    prompt = (f"Summarize the following text in a {tone} tone. "
              f"Keep it concise but capture the main points:\n\n{text}")

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        summary_text = response.text.replace("*", "").strip()
        return jsonify({"summary": summary_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/story", methods=["POST"])
def story():
    data = request.json
    genre = data.get("genre", "cyberpunk")
    tone = data.get("tone", "suspenseful")
    action = data.get("action")
    context = data.get("context", "")
    premise = data.get("premise", "").strip()

    try:
        model = genai.GenerativeModel(MODEL_NAME, generation_config={"response_mime_type": "application/json"})
        
        system_instruction = (
            "You must output ONLY raw JSON data in the exact following format: "
            '{"segment": "The 2-3 sentence narrative.", "options": [{"text": "Short Action 1", "description": "What this implies"}, {"text": "Short Action 2", "description": "What this implies"}]} '
            "Do not output markdown block backticks or any other text outside the JSON."
        )

        if not action:
            # Starting point
            prompt = (f"You are the narrator of a {genre} choose-your-own-adventure story. "
                      f"The tone should be {tone}. ")
            if premise:
                prompt += f"The user has provided the following custom premise, concept, or character to base the story on: '{premise}'. Use this strictly as the foundation of the opening scene. "
            prompt += (f"Set the scene and provide the opening scenario in exactly 2-3 sentences. "
                       f"End with a direct situation that demands a choice between two distinct actions. {system_instruction}")
        else:
            # Continuation
            prompt = (f"You are the narrator of a {genre} story with a {tone} tone. "
                      f"Here is the story so far: {context}\n\n"
                      f"The protagonist has chosen to '{action}'. "
                      f"Continue the story based on this choice. Describe the immediate consequence "
                      f"and present a new situation in exactly 2-3 sentences. End with a subtle physical element to act upon, demanding a new choice between two distinct actions. {system_instruction}")

        response = model.generate_content(prompt)
        import json
        
        # Gemini sometimes adds markdown json wrappers even with json mime type, parse safely
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        json_data = json.loads(raw_text.strip())
        
        return jsonify({
            "segment": json_data.get("segment", "Error parsing segment."),
            "options": json_data.get("options", [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/speak", methods=["POST"])
def speak():
    data = request.json
    text = data.get("text", "")
    voice = data.get("voice", "en-US-terrell")  # Example default Murf Voice ID

    if not text:
        return jsonify({"error": "No text to speak"}), 400

    if not MURF_API_KEY:
        return jsonify({"error": "MURF_API_KEY is missing."}), 400
        
    headers = {
        "api-key": MURF_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    payload = {
        "voiceId": voice,
        "text": text,
        "format": "MP3",
        "sampleRate": 44100
    }

    try:
        murf_response = requests.post(MURF_API_URL, json=payload, headers=headers)
        
        if murf_response.status_code == 200:
            audio_url = murf_response.json().get('audioFile')
            return jsonify({"audio_url": audio_url})
        else:
            error_msg = f"Murf API failed (Code {murf_response.status_code}): {murf_response.text}"
            print(error_msg, flush=True)
            return jsonify({"error": error_msg}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=3000, debug=True)