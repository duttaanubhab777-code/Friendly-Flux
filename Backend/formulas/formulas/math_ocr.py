"""
Math OCR — একটা ছবিতে থাকা ক্যালকুলাস এক্সপ্রেশন পড়ে সেটাকে calculus_engine
যে flat syntax বোঝে (যেমন "sin(x)^2 * cos(x)") ঠিক সেই ফরম্যাটে ফেরত দেয়।

Mathpix-এর মতো ডেডিকেটেড math-OCR API ব্যবহার না করে Gemini-এর vision
ক্ষমতা বেছে নেওয়ার কারণ:
  - Mathpix মূলত LaTeX আউটপুট দেয় — সেটা আবার calculus_engine-এর flat
    syntax-এ রূপান্তর করতে হতো (আরেকটা parsing ধাপ, আরেকটা failure point)।
  - Gemini-কে প্রম্পটেই বলে দেওয়া যায় ঠিক কোন syntax-এ লিখতে হবে —
    engine যা বোঝে, হুবহু সেই ফরম্যাটে একধাপেই উত্তর পাওয়া যায়।
  - Beyonder AI প্রজেক্টেও একই Gemini API ব্যবহার হচ্ছে, তাই চাইলে একই
    API key পুনরায় ব্যবহার করা যায় — আলাদা করে billing/key ম্যানেজ
    করতে হয় না।

সেটআপ: এনভায়রনমেন্ট ভ্যারিয়েবলে GEMINI_API_KEY বসাতে হবে
(PythonAnywhere-এ Web tab > Environment variables, অথবা লোকাল টেস্টের
জন্য টার্মিনালে export করে)। key না থাকলে এই মডিউল স্পষ্ট এরর দেবে,
চুপচাপ ফেল করবে না।
"""
import os
import re

try:
    import google.generativeai as genai
except ImportError:  # ডিপেন্ডেন্সি ইনস্টল না থাকলে স্পষ্ট এরর, cryptic ImportError নয়
    genai = None

from .calculus_engine import ALLOWED_CHARS, MAX_EXPRESSION_LENGTH, check_balanced_brackets, CalculusError

_API_KEY = os.environ.get("GEMINI_API_KEY")
_MODEL_NAME = os.environ.get("GEMINI_OCR_MODEL", "gemini-2.0-flash")

_PROMPT = """You are transcribing a single calculus expression from a photo — nothing else.

Output ONLY the expression itself, in this exact plain-text syntax (no LaTeX, no
markdown, no explanation, no "x =", no surrounding text):
  - power:            x^2      (never x**2, never LaTeX exponent notation)
  - multiplication:   * or a space, e.g. 2*x or 2x
  - functions:        sin( cos( tan( cot( sec( csc(
                       asin( acos( atan( acot( asec( acsc(
                       sinh( cosh( tanh( csch( sech( coth(
                       asinh( acosh( atanh( acsch( asech( acoth(
                       ln( log( exp( sqrt( abs(
                       x!  for factorial, floor( ceil( sign( gamma(
  - constants:        pi , e
  - square root:      sqrt(...)  — not a radical symbol
  - fraction:         a/b

If the photo has more than one expression, transcribe only the main/first one.
If you cannot make out a valid mathematical expression, output exactly: UNREADABLE
"""


class OcrError(ValueError):
    pass


def _clean_model_output(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```[a-zA-Z]*\s*|\s*```$", "", cleaned).strip()
    cleaned = cleaned.strip("` \n\t")
    # মডেল কখনো কখনো সামনে "= " জুড়ে দেয়
    cleaned = re.sub(r"^=\s*", "", cleaned)
    return cleaned


def extract_expression_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    if genai is None:
        raise OcrError("Server is missing the 'google-generativeai' package — run pip install -r requirements-3.txt")
    if not _API_KEY:
        raise OcrError("Server is not configured with a GEMINI_API_KEY")
    if not image_bytes:
        raise OcrError("No image data received")

    genai.configure(api_key=_API_KEY)
    model = genai.GenerativeModel(_MODEL_NAME)

    try:
        response = model.generate_content(
            [_PROMPT, {"mime_type": mime_type, "data": image_bytes}],
            generation_config={"temperature": 0, "max_output_tokens": 200},
        )
        raw = (response.text or "").strip()
    except Exception as e:
        raise OcrError(f"Couldn't reach the OCR model — try again in a moment ({e})")

    if not raw or raw.strip().upper() == "UNREADABLE":
        raise OcrError("Couldn't make out a clear expression in this photo — try better lighting or a closer shot")

    expression = _clean_model_output(raw)

    if not expression:
        raise OcrError("Couldn't make out a clear expression in this photo — try better lighting or a closer shot")
    if len(expression) > MAX_EXPRESSION_LENGTH:
        raise OcrError("The recognized expression is too long")
    if not ALLOWED_CHARS.match(expression):
        raise OcrError("The recognized text has symbols the calculator can't use — try typing it manually")
    try:
        check_balanced_brackets(expression)
    except CalculusError as e:
        raise OcrError(str(e))

    return expression
