from flask import Flask
from flask_cors import CORS
from routes.problems import problems_bp
from ai_review import ai_bp


app = Flask(__name__)
CORS(app)

# Register blueprint
app.register_blueprint(problems_bp)
app.register_blueprint(ai_bp)

@app.route("/")
def home():
    return {"message": "DSA Mentor AI Backend Running"}

if __name__ == "__main__":
    app.run(debug=True)
