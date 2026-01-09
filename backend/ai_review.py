from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

ai_bp = Blueprint("ai", __name__, url_prefix="/api")

client = OpenAI()


@ai_bp.route("/ai-review", methods=["POST"])
def ai_review():
    data = request.json

    code = data["code"]
    language = data["language"]
    problem = data["problem"]
    company = data["company"]
    result = data["result"]

    prompt = f"""
You are a senior {company} software engineer.

Problem: {problem}
Language: {language}

Candidate's Code:
{code}

Judge Result: {result}

Review this code as an interviewer.

1. Is this optimal?
2. What is its time & space complexity?
3. Would this pass real {company} interviews?
4. Give a more optimized solution
5. Explain why it is better
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert FAANG interviewer."},
                {"role": "user", "content": prompt}
            ]
        )

        return jsonify({
            "review": response.choices[0].message.content
        })

    except Exception as e:
        return jsonify({
            "review": "AI failed: " + str(e)
        }), 500
