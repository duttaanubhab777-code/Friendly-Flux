#The process is biulding

## Math OCR (scan-a-photo feature)

The /api/math/ocr endpoint reads a calculus expression from an uploaded photo
using Gemini's vision API, and returns it in the same syntax the calculus
engine expects (e.g. "sin(x)^2 * cos(x)").

Setup:
1. pip install -r requirements-3.txt  (adds google-generativeai)
2. Set an environment variable GEMINI_API_KEY with a Gemini API key
   (on PythonAnywhere: Web tab -> your app -> Environment variables)
3. Optional: GEMINI_OCR_MODEL to override the default model
   (defaults to gemini-2.0-flash)
