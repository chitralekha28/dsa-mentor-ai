from google_problem import google_questions
from amazon_problem import amazon_questions

def get_questions_by_company(company):
    company = company.lower()
    if company == "google":
        return google_questions
    elif company == "amazon":
        return amazon_questions
    return []

def get_question_by_id(qid):
    all_questions = google_questions + amazon_questions
    for q in all_questions:
        if q["id"] == qid:
            return q
    return None

def get_question_by_company_and_id(company, qid):
    for question in get_questions_by_company(company):
        if question["id"] == qid:
            return question
    return None
