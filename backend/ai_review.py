import json
import os
import urllib.error
import urllib.request

from flask import Blueprint, jsonify, request

ai_bp = Blueprint("ai", __name__, url_prefix="/api")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_MODEL}:generateContent"
)


def build_review_prompt(data):
    return f"""
You are a senior {data["company"]} software engineer and DSA interviewer.

Problem: {data["problem"]}
Language: {data["language"]}
Judge Result: {data["result"]}

Candidate's Code:
{data["code"]}

Review the submission in a clear, practical interview style.

Return these sections:
1. Verdict
2. Correctness
3. Time and space complexity
4. Interview readiness
5. Suggested improvement
6. Cleaner optimized solution if useful

Keep the feedback concise, direct, and helpful for a student preparing for company interviews.
"""


def call_gemini(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return (
            "AI review is not configured yet. Add GEMINI_API_KEY to your "
            "environment to enable Gemini feedback."
        )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.35,
            "maxOutputTokens": 1200,
        },
    }

    request_data = json.dumps(payload).encode("utf-8")
    gemini_request = urllib.request.Request(
        f"{GEMINI_ENDPOINT}?key={api_key}",
        data=request_data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(gemini_request, timeout=30) as response:
        response_data = json.loads(response.read().decode("utf-8"))

    candidates = response_data.get("candidates", [])
    if not candidates:
        return "Gemini did not return a review. Your code was still accepted by the local judge."

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(part.get("text", "") for part in parts).strip()
    return text or "Gemini returned an empty review. Your code was still accepted by the local judge."


@ai_bp.route("/ai-review", methods=["POST"])
def ai_review():
    data = request.get_json() or {}
    required_fields = ["code", "language", "problem", "company", "result"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({
            "review": f"AI review skipped. Missing fields: {', '.join(missing_fields)}."
        }), 400

    try:
        review = call_gemini(build_review_prompt(data))
        return jsonify({"review": review})
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="ignore")
        if error.code in (401, 403):
            review = "Gemini API key was rejected. Check that GEMINI_API_KEY is correct and enabled."
        elif error.code == 429:
            review = "Gemini review is temporarily unavailable because the quota or rate limit was reached."
        else:
            review = f"Gemini review failed with HTTP {error.code}. Your code was still accepted by the local judge."

        return jsonify({"review": review, "details": message}), 200
    except urllib.error.URLError:
        return jsonify({
            "review": "Gemini review could not connect. Check your internet connection and try again."
        }), 200
    except Exception:
        return jsonify({
            "review": "Gemini review is temporarily unavailable. Your code was still accepted by the local judge."
        }), 200
