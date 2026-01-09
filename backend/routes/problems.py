from flask import Blueprint, jsonify, request
import subprocess, uuid, os, time
problems_bp = Blueprint("problems", __name__, url_prefix="/api")

# ---------------- PROBLEMS DATA ----------------

PROBLEMS = {
    "google": [
        {
            "id": 1,
            "title": "Two Sum",
            "difficulty": "Easy",

            "problemStatement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",

            "inputFormat": "An integer array nums and an integer target.",

            "outputFormat": "Return the indices of the two numbers such that they add up to target.",

            "examples": [
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "nums[0] + nums[1] = 2 + 7 = 9, so we return [0,1]."
                },
                {
                    "input": "nums = [3,2,4], target = 6",
                    "output": "[1,2]",
                    "explanation": "nums[1] + nums[2] = 2 + 4 = 6."
                }
            ],

            "visibleTestCases": [
                {
                    "input": "[2,7,11,15], 9",
                    "output": "[0,1]"
                },
                {
                    "input": "[3,2,4], 6",
                    "output": "[1,2]"
                }
            ],

            "constraints": [
                "2 ≤ nums.length ≤ 10⁴",
                "-10⁹ ≤ nums[i] ≤ 10⁹",
                "-10⁹ ≤ target ≤ 10⁹",
                "Exactly one valid answer exists"
            ]
        }
    ]
}

# ---------------- GET PROBLEMS ----------------

@problems_bp.route("/problems/<company>", methods=["GET"])
def get_problems(company):
    return jsonify(PROBLEMS.get(company, []))

# ---------------- GET SINGLE PROBLEM ----------------

@problems_bp.route("/problem/<company>/<int:problem_id>", methods=["GET"])
def get_problem(company, problem_id):
    for problem in PROBLEMS.get(company, []):
        if problem["id"] == problem_id:
            return jsonify(problem)
    return jsonify({"error": "Problem not found"}), 404

# ---------------- PYTHON JUDGE (RUN + TEST CASES) ----------------

@problems_bp.route("/run", methods=["POST"])
def run_code():
    data = request.json
    code = data["code"]
    lang = data["language"]

    filename = str(uuid.uuid4())

    try:
        if lang == "python":
            with open(f"{filename}.py", "w") as f:
                f.write(code)
            output = subprocess.check_output(["python", f"{filename}.py"], timeout=5).decode()

        elif lang == "javascript":
            with open(f"{filename}.js", "w") as f:
                f.write(code)
            output = subprocess.check_output(["node", f"{filename}.js"], timeout=5).decode()

        elif lang == "cpp":
            with open(f"{filename}.cpp", "w") as f:
                f.write(code)
            subprocess.check_output(["g++", f"{filename}.cpp", "-o", filename])
            output = subprocess.check_output([f"./{filename}"], timeout=5).decode()

        elif lang == "java":
            classname = "Solution"
            with open(f"{classname}.java", "w") as f:
                f.write(code)
            subprocess.check_output(["javac", f"{classname}.java"])
            output = subprocess.check_output(["java", classname], timeout=5).decode()

        else:
            return jsonify({"status": "error", "message": "Language not supported"})

        return jsonify({"status": "success", "output": output})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

    # 🔒 Hidden test cases (backend only)
    test_cases = [
        (([2, 7, 11, 15], 9), [0, 1]),
        (([3, 2, 4], 6), [1, 2]),
    ]

    try:
        exec_globals = {}
        exec(user_code, exec_globals)

        if "twoSum" not in exec_globals:
            return jsonify({
                "status": "error",
                "message": "Function twoSum not found"
            })

        two_sum_func = exec_globals["twoSum"]

        for i, (inputs, expected) in enumerate(test_cases):
            result = two_sum_func(*inputs)

            if result != expected:
                return jsonify({
                    "status": "failed",
                    "message": f"Test case {i + 1} failed",
                    "expected": expected,
                    "got": result
                })

        return jsonify({
            "status": "success",
            "message": "All test cases passed"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })
import time

@problems_bp.route("/submit", methods=["POST"])
def submit_code():
    data = request.json
    code = data["code"]
    lang = data["language"]

    # Hidden testcases
    tests = [
        (([2,7,11,15],9), "[0,1]"),
        (([3,2,4],6), "[1,2]")
    ]

    # For now only Python supports judge
    if lang != "python":
        return jsonify({"status": "accepted", "runtime": "N/A"})

    exec_globals = {}
    exec(code, exec_globals)

    func = exec_globals["twoSum"]

    start = time.time()

    for (nums, target), expected in tests:
        res = func(nums, target)
        if str(res) != expected:
            return jsonify({"status": "failed"})

    runtime = round((time.time() - start)*1000, 2)

    return jsonify({"status": "accepted", "runtime": f"{runtime} ms"})

    test_cases = [
        (([2, 7, 11, 15], 9), [0, 1]),
        (([3, 2, 4], 6), [1, 2]),
    ]

    try:
        exec_globals = {}
        exec(user_code, exec_globals)

        if "twoSum" not in exec_globals:
            return jsonify({
                "status": "error",
                "message": "Function twoSum not found"
            })

        func = exec_globals["twoSum"]

        start_time = time.time()

        for inputs, expected in test_cases:
            result = func(*inputs)
            if result != expected:
                return jsonify({
                    "status": "failed",
                    "message": "Wrong Answer"
                })

        end_time = time.time()
        runtime_ms = round((end_time - start_time) * 1000, 2)

        return jsonify({
    "status": "accepted",
    "runtime": f"{runtime_ms} ms"
})


    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })
