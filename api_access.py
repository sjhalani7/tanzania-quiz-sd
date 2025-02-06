from flask import Flask, request
import requests
import json
import mysql.connector
import config
from query_constructor import QueryConstructor
from utils import create_query

DB_HOST = config.DB_HOST
DB_USER = config.DB_USER
DB_PASS = config.DB_PASS
DB_NAME = config.DB_NAME
DB_PORT = config.DB_PORT
conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
    port=DB_PORT
)
cursor = conn.cursor()
app = Flask(__name__)


#API for given a topic (topic number) and difficulty, grab questions(paginate) with answers

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    query_constructor = QueryConstructor()
    query_constructor.select('*')
    query_constructor.from_table('subjects')
    query_string = query_constructor.get_query_string()
    cursor.execute(query_string)
    subjects = cursor.fetchall()

    return_list = []

    for subject_number, subject_title in subjects:
        subject_json = {}
        subject_json["subject_numbers"] = subject_number
        subject_json["subject_name"] = subject_title
        return_list.append(subject_json)
    return json.dumps(return_list)

@app.route("/api/topics", methods=['GET'])
def get_topics():
    form_id = request.args.get('form_id')
    query_constructor = QueryConstructor()
    query_constructor.select('*')
    query_constructor.from_table('topics')
    query_constructor.where_eq('form_id', form_id)
    query_string = query_constructor.get_query_string()
    query_params = query_constructor.get_query_params()
    cursor.execute(query_string, query_params)
    topics = cursor.fetchall()
    

    return_list = []
    for topic_id, form_id, topic_no, topic_name in topics:
        topic_json = {}
        topic_json["topic_id"] = topic_id
        topic_json["form_id"] = form_id
        topic_json["topic_no"] = topic_no
        topic_json["topic_name"] = topic_name

        return_list.append(topic_json)
    return json.dumps(return_list)

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """
    - Get topic, difficulty return questions
    """
    topic_id = request.args.get('topic_id')
    difficulty = request.args.get('difficulty')

    filtered_topic_CTE = create_query(select=["topic_id"], from_table=['topics'], where=[("topic_id", topic_id)])
    filtered_subtopics_CTE = create_query(select=["subtopic_id"], from_table=['subtopics'], join=[("filtered_topics", "filtered_topics.topic_id = subtopics.topic_id", "INNER JOIN")])
    filtered_objectives_CTE = create_query(select=["objective_id"], from_table=['objectives'], join=[("filtered_subtopics", "filtered_subtopics.subtopic_id = objectives.subtopic_id", "INNER JOIN")])
    filtered_questions_CTE = create_query(select=["question_id", "question_text"], from_table=['questions'], join=[("filtered_objectives", "filtered_objectives.objective_id = questions.objective_id", "INNER JOIN")])

    main_query_constructor = create_query(
        select=["answers.question_id", "question_text", "answer_id", "answer_text", "answer_type"], 
        from_table=['filtered_questions'], 
        join= [("answers", "answers.question_id = filtered_questions.question_id", "INNER JOIN")],
    )

    main_query_constructor.where_raw('answer_type = %s OR answer_type="right"', difficulty)
    main_query_constructor.with_cte('filtered_topics', filtered_topic_CTE)    
    main_query_constructor.with_cte('filtered_subtopics', filtered_subtopics_CTE)    
    main_query_constructor.with_cte('filtered_objectives', filtered_objectives_CTE)
    main_query_constructor.with_cte('filtered_questions', filtered_questions_CTE)

    query_string = main_query_constructor.get_query_string()
    query_params = main_query_constructor.get_query_params()

    print(query_string, query_params)
    cursor.execute(query_string, query_params)
    questions = cursor.fetchall()
    question_map = {}

    for question_id, question_text, answer_id, answer_text, answer_type in questions: 
        if question_id not in question_map:
            question_map[question_id] = {
                "question_text": question_text,
                "answers": []
            }
        question_map[question_id]['answers'].append(
                {
                    'answer_id': answer_id, 
                    'answer_text': answer_text,
                    'answer_type': answer_type
                }
            )
    
    return json.dumps(question_map)





if __name__ == "__main__":
    app.run(debug=True)

