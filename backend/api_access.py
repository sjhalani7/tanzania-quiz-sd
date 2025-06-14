from flask import Flask, request
import json
from backend.query_constructor import QueryConstructor
from backend.utils import create_query, get_query_results
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#API for given a topic (topic number) and difficulty, grab questions(paginate) with answers
difficulty_map = {
    'Easy':'easy_wrong',
    'Medium':'meh_wrong',
    'Hard':'hard_wrong'
}

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    query_constructor = create_query(
        select=[" * "],
        from_table=["subjects"] 
    )
    subjects = get_query_results(query_constructor)

    return_list = []

    for subject_number, subject_title in subjects:
        subject_json = {}
        subject_json["subject_id"] = subject_number
        subject_json["subject_name"] = subject_title
        return_list.append(subject_json)
    return json.dumps(return_list)

@app.route('/api/forms', methods=['GET'])
def get_forms_list():
    subject_id = request.args.get('subject_id')
    query_constructor = create_query(
        select=["form_id", "name"],
        from_table=["forms"],
        where=[("subject_id", subject_id)]
    )
    forms = get_query_results(query_constructor)

    return_list = []
    for form_id, form_name in forms: 
        form_json = {}
        form_json["form_id"] = form_id
        form_json["form_name"] = form_name
        return_list.append(form_json)
    
    return json.dumps(return_list)


@app.route("/api/topics", methods=['GET'])
def get_topics():
    form_id = request.args.get('form_id')
    query_constructor = QueryConstructor()
    query_constructor.select('*')
    query_constructor.from_table('topics')
    query_constructor.where_eq('form_id', form_id)
    topics = get_query_results(query_constructor)
    

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
    difficulty = difficulty_map[request.args.get('difficulty')]

    filtered_topic_CTE = create_query(select=["topic_id"], from_table=['topics'], where=[("topic_id", topic_id)])
    filtered_subtopics_CTE = create_query(select=["subtopic_id"], from_table=['subtopics'], join=[("filtered_topics", "filtered_topics.topic_id = subtopics.topic_id", "INNER JOIN")])
    filtered_objectives_CTE = create_query(select=["objective_id"], from_table=['objectives'], join=[("filtered_subtopics", "filtered_subtopics.subtopic_id = objectives.subtopic_id", "INNER JOIN")])
    filtered_questions_CTE = create_query(select=["question_id", "question_text"], from_table=['questions'], join=[("filtered_objectives", "filtered_objectives.objective_id = questions.objective_id", "INNER JOIN")])

    main_query_constructor = create_query(
        select=["answers.question_id", "question_text", "answer_id", "answer_text", "answer_type", "answers.answer_explanation"], 
        from_table=['filtered_questions'], 
        join=[("answers", "answers.question_id = filtered_questions.question_id", "INNER JOIN")]
    )

    main_query_constructor.where_raw('answer_type = %s OR answer_type="right"', difficulty)
    main_query_constructor.with_cte('filtered_topics', filtered_topic_CTE)    
    main_query_constructor.with_cte('filtered_subtopics', filtered_subtopics_CTE)    
    main_query_constructor.with_cte('filtered_objectives', filtered_objectives_CTE)
    main_query_constructor.with_cte('filtered_questions', filtered_questions_CTE)

    questions = get_query_results(main_query_constructor)
    question_map = {}

    for question_id, question_text, answer_id, answer_text, answer_type, answer_explanation in questions: 
        if question_id not in question_map:
            question_map[question_id] = {
                "question_text": question_text,
                "answers": []
            }
        question_map[question_id]['answers'].append(
                {
                    'answer_id': answer_id, 
                    'answer_text': answer_text,
                    'answer_type': answer_type,
                    'answer_explanation': answer_explanation if answer_explanation else None
                }
            )
    
    return json.dumps(question_map)





if __name__ == "__main__":
    app.run(debug=True)

