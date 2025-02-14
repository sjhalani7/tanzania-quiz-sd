from backend.oai import model
from backend.utils import create_query, get_query_results, update_table_query, execute_update_query
import json
import re


def get_questions_for_explanations():
    query_constructor = create_query(
        select=['answers.answer_id', 'questions.question_id', 'questions.question_text', ' answers.answer_text'],
        from_table=['questions'],
        join=[('answers', "answers.question_id = questions.question_id", "INNER JOIN")],
        where=[("answers.answer_type", "right")]
    )
    query_constructor.where_raw("answers.answer_explanation IS NULL")
    questions_list = get_query_results(query_constructor)
    return questions_list


def get_explanations_update_db(questions_list):
    for answer_id, question_id, question_text, answer_text in questions_list:
        inp_str = {
            'question': question_text,
            'answer': answer_text
        }

        print(answer_id, question_id, question_text, answer_text, "\n\n\n")
        model_explanation = model.query_model(inp_str)
        model_explanation_json = json.loads(model_explanation)
        answer_explanation = model_explanation_json["explanation"]
        answer_explanation = re.sub(r'"', "'", answer_explanation)
        query_constructor = update_table_query('answers', ("answer_explanation", answer_explanation), ("answer_id", answer_id))
        execute_update_query(query_constructor)

        
        


get_explanations_update_db(get_questions_for_explanations())  

