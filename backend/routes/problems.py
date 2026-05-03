import json
import subprocess
import tempfile
import textwrap
import time
from pathlib import Path

from flask import Blueprint, jsonify, request
from data.questions_data import (
    get_question_by_company_and_id,
    get_question_by_id,
    get_questions_by_company,
)

problems_bp = Blueprint("problems", __name__, url_prefix="/api/problems")

@problems_bp.route("/", methods=["GET"])
def get_problems():
    company = request.args.get("company")
    if not company:
        return jsonify({"error": "Company required"}), 400

    questions = get_questions_by_company(company)
    return jsonify([
        {
            "id": question["id"],
            "company": question["company"],
            "title": question["title"],
            "difficulty": question["difficulty"],
            "tags": question.get("tags", []),
            "description": question.get("description", ""),
        }
        for question in questions
    ])

@problems_bp.route("/<qid>", methods=["GET"])
def get_problem(qid):
    question = get_question_by_id(qid)
    if not question:
        return jsonify({}), 404
    return jsonify(question)


@problems_bp.route("/<company>/<qid>", methods=["GET"])
def get_company_problem(company, qid):
    question = get_question_by_company_and_id(company, qid)
    if not question:
        return jsonify({"error": "Problem not found"}), 404
    return jsonify(question)


def _normalise_answer(value):
    if isinstance(value, tuple):
        return list(value)
    return value


def _run_python_solution(code, question):
    namespace = {}
    exec(code, namespace)

    function_name = question.get("functionName")
    candidate = namespace.get(function_name)
    if not callable(candidate):
        return {
            "status": "error",
            "message": f"Function {function_name} was not found.",
        }

    start_time = time.perf_counter()
    for index, test_case in enumerate(question.get("hiddenTestCases", []), start=1):
        result = _normalise_answer(candidate(*test_case["input"]))
        expected = test_case["expected"]
        if result != expected:
            return {
                "status": "failed",
                "message": f"Test case {index} failed.",
                "expected": expected,
                "got": result,
            }

    runtime_ms = round((time.perf_counter() - start_time) * 1000, 2)
    return {
        "status": "success",
        "message": "All test cases passed.",
        "runtime": f"{runtime_ms} ms",
    }


def _format_cpp_value(value):
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, list):
        return "vector<int>{" + ", ".join(str(item) for item in value) + "}"
    return str(value)


def _cpp_type_for_value(value):
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "vector<int>"
    return "int"


def _build_cpp_source(code, question):
    function_name = question.get("functionName")
    checks = []

    for index, test_case in enumerate(question.get("hiddenTestCases", []), start=1):
        setup = []
        arg_names = []
        for arg_index, arg in enumerate(test_case["input"]):
            name = f"arg_{index}_{arg_index}"
            setup.append(
                f"{_cpp_type_for_value(arg)} {name} = {_format_cpp_value(arg)};"
            )
            arg_names.append(name)

        expected_type = _cpp_type_for_value(test_case["expected"])
        expected_name = f"expected_{index}"
        setup.append(
            f"{expected_type} {expected_name} = {_format_cpp_value(test_case['expected'])};"
        )

        args = ", ".join(arg_names)
        checks.append(
            f"""
            {" ".join(setup)}
            if ({function_name}({args}) != {expected_name}) {{
                cout << "Test case {index} failed.";
                return 1;
            }}
            """
        )

    return textwrap.dedent(f"""
        #include <bits/stdc++.h>
        using namespace std;

        {code}

        int main() {{
            {"".join(checks)}
            cout << "All test cases passed.";
            return 0;
        }}
    """)


def _format_java_value(value, expected=False):
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, list):
        return "new int[]{" + ", ".join(str(item) for item in value) + "}"
    return str(value)


def _build_java_source(code, question):
    function_name = question.get("functionName")
    checks = []

    for index, test_case in enumerate(question.get("hiddenTestCases", []), start=1):
        args = ", ".join(_format_java_value(arg) for arg in test_case["input"])
        expected = _format_java_value(test_case["expected"], expected=True)

        if isinstance(test_case["expected"], list):
            condition = f"!Arrays.equals(solution.{function_name}({args}), {expected})"
        else:
            condition = f"solution.{function_name}({args}) != {expected}"

        checks.append(
            f"""
            if ({condition}) {{
                System.out.print("Test case {index} failed.");
                return;
            }}
            """
        )

    return textwrap.dedent(f"""
        import java.util.*;

        class Solution {{
            {code}
        }}

        public class Main {{
            public static void main(String[] args) {{
                Solution solution = new Solution();
                {"".join(checks)}
                System.out.print("All test cases passed.");
            }}
        }}
    """)


def _build_javascript_source(code, question):
    function_name = question.get("functionName")
    tests = json.dumps(question.get("hiddenTestCases", []))

    return textwrap.dedent(f"""
        {code}

        const tests = {tests};
        for (let i = 0; i < tests.length; i += 1) {{
          const result = {function_name}(...tests[i].input);
          if (JSON.stringify(result) !== JSON.stringify(tests[i].expected)) {{
            console.log(`Test case ${{i + 1}} failed.`);
            process.exit(1);
          }}
        }}
        console.log("All test cases passed.");
    """)


def _run_subprocess_solution(code, question, language):
    start_time = time.perf_counter()

    with tempfile.TemporaryDirectory(prefix="dsa-judge-") as temp_dir:
        temp_path = Path(temp_dir)

        if language == "javascript":
            source_file = temp_path / "solution.js"
            source_file.write_text(_build_javascript_source(code, question), encoding="utf-8")
            command = ["node", str(source_file)]
            compile_command = None
        elif language == "cpp":
            source_file = temp_path / "solution.cpp"
            output_file = temp_path / "solution.exe"
            source_file.write_text(_build_cpp_source(code, question), encoding="utf-8")
            compile_command = ["g++", str(source_file), "-std=c++17", "-O2", "-o", str(output_file)]
            command = [str(output_file)]
        elif language == "java":
            source_file = temp_path / "Main.java"
            source_file.write_text(_build_java_source(code, question), encoding="utf-8")
            compile_command = ["javac", str(source_file)]
            command = ["java", "-cp", str(temp_path), "Main"]
        else:
            return {
                "status": "error",
                "message": "Language is not supported.",
            }

        if compile_command:
            subprocess.run(
                compile_command,
                capture_output=True,
                check=True,
                text=True,
                timeout=10,
            )

        completed = subprocess.run(
            command,
            capture_output=True,
            check=False,
            text=True,
            timeout=10,
        )

    runtime_ms = round((time.perf_counter() - start_time) * 1000, 2)
    output = (completed.stdout or completed.stderr).strip()

    if completed.returncode == 0:
        return {
            "status": "success",
            "message": output or "All test cases passed.",
            "runtime": f"{runtime_ms} ms",
        }

    return {
        "status": "failed",
        "message": output or "Code did not pass the test cases.",
    }


def _run_solution(code, question, language):
    if language == "python":
        return _run_python_solution(code, question)
    return _run_subprocess_solution(code, question, language)


@problems_bp.route("/run", methods=["POST"])
def run_code():
    data = request.get_json() or {}
    question = get_question_by_id(data.get("problemId", ""))
    if not question:
        return jsonify({"status": "error", "message": "Problem not found."}), 404

    try:
        return jsonify(_run_solution(
            data.get("code", ""),
            question,
            data.get("language"),
        ))
    except FileNotFoundError as exc:
        return jsonify({
            "status": "error",
            "message": f"Required compiler/runtime was not found: {exc.filename}",
        }), 400
    except subprocess.CalledProcessError as exc:
        message = (exc.stderr or exc.stdout or "Compilation failed.").strip()
        return jsonify({"status": "error", "message": message}), 400
    except subprocess.TimeoutExpired:
        return jsonify({"status": "error", "message": "Execution timed out."}), 400
    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400


@problems_bp.route("/submit", methods=["POST"])
def submit_code():
    data = request.get_json() or {}
    question = get_question_by_id(data.get("problemId", ""))
    if not question:
        return jsonify({"status": "error", "message": "Problem not found."}), 404

    try:
        result = _run_solution(
            data.get("code", ""),
            question,
            data.get("language"),
        )
        if result["status"] == "success":
            result["status"] = "accepted"
        return jsonify(result)
    except FileNotFoundError as exc:
        return jsonify({
            "status": "error",
            "message": f"Required compiler/runtime was not found: {exc.filename}",
        }), 400
    except subprocess.CalledProcessError as exc:
        message = (exc.stderr or exc.stdout or "Compilation failed.").strip()
        return jsonify({"status": "error", "message": message}), 400
    except subprocess.TimeoutExpired:
        return jsonify({"status": "error", "message": "Execution timed out."}), 400
    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
