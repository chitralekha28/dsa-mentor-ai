import subprocess
import tempfile
import os

from flask import Blueprint, jsonify

problems_bp = Blueprint("problems", __name__, url_prefix="/api")

PROBLEMS = {
    "google": [
        {
            "id": 1,
            "title": "Two Sum",
            "difficulty": "Easy",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "examples": [
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] == 9"
                }
            ],
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9"
            ]
        }
    ]
}


@problems_bp.route("/problems/<company>", methods=["GET"])
def get_problems(company):
    return jsonify(PROBLEMS.get(company, []))

@problems_bp.route("/run/python", methods=["POST"])
def run_python_code():
    from flask import request

    code = request.json.get("code", "")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
        f.write(code.encode())
        file_path = f.name

    try:
        result = subprocess.run(
            ["python", file_path],
            capture_output=True,
            text=True,
            timeout=5
        )

        output = result.stdout if result.stdout else result.stderr
    except Exception as e:
        output = str(e)
    finally:
        os.remove(file_path)

    return jsonify({"output": output})

@problems_bp.route("/problem/<company>/<int:problem_id>", methods=["GET"])
def get_problem(company, problem_id):
    for problem in PROBLEMS.get(company, []):
        if problem["id"] == problem_id:
            return jsonify(problem)
    return jsonify({"error": "Problem not found"}), 404
