from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from routes.problems import problems_bp, run_code as problems_run_code, submit_code as problems_submit_code
from ai_review import ai_bp
from data.questions_data import get_question_by_company_and_id, get_questions_by_company, get_question_by_id


load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(problems_bp)
app.register_blueprint(ai_bp)

@app.route("/")
def home():
    return {"message": "DSA Mentor AI Backend Running"}

@app.route("/api/questions")
def get_questions():
    company = request.args.get("company")
    if not company:
        return jsonify({"error": "Company required"}), 400

    questions = get_questions_by_company(company)
    if not questions:
        return jsonify({"error": "No questions found"}), 404

    return jsonify([
        {
            "id": q["id"],
            "title": q["title"],
            "difficulty": q["difficulty"],
            "tags": q["tags"]
        } for q in questions
    ])

@app.route("/api/questions/<qid>")
def get_single_question(qid):
    question = get_question_by_id(qid)
    if not question:
        return jsonify({"error": "Question not found"}), 404
    return jsonify(question)

@app.route("/api/problem/<company>/<qid>")
def get_problem_compat(company, qid):
    question = get_question_by_company_and_id(company, qid)
    if not question:
        return jsonify({"error": "Question not found"}), 404
    return jsonify(question)

@app.route("/api/run", methods=["POST"])
def run_code_compat():
    return problems_run_code()

@app.route("/api/submit", methods=["POST"])
def submit_code_compat():
    return problems_submit_code()

if __name__ == "__main__":
    app.run(debug=True)
