import csv
import mysql.connector
import config

DB_HOST = config.DB_HOST
DB_USER = config.DB_USER
DB_PASS = config.DB_PASS
DB_NAME = config.DB_NAME
DB_PORT = config.DB_PORT


SYLLABUS_CSV = 'data/Syllabus.csv'
UNIQUE_TOPICS_CSV = 'data/UniqueTopics.csv'  
F1_QUESTIONS_CSV = 'data/F1Questions.csv'
F2_QUESTIONS_CSV = 'data/F2Questions.csv'


conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
    port=DB_PORT
)
cursor = conn.cursor()

def get_or_create_subject(name):
    # find subject in db
    cursor.execute("SELECT subject_id FROM subjects WHERE name = %s", (name,))
    row = cursor.fetchone()
    if row:
        return row[0]  # subject_id

    # If not found, insert
    cursor.execute("INSERT INTO subjects (name) VALUES (%s)", (name,))
    conn.commit()
    return cursor.lastrowid

subject_id = get_or_create_subject("Physics")
print(f"Subject 'Physics' has subject_id = {subject_id}")

### Local Cache 

forms_dict = {}       # key: form_name (e.g., "1"),     val: form_id
topics_dict = {}      # key: (form_id, topic_no, topic_name), val: topic_id
subtopics_dict = {}   # key: (topic_id, subtopic_no, subtopic_name), val: subtopic_id
objectives_dict = {}  # key: (subtopic_id, objective_no, objective_desc), val: objective_id


def get_or_create_form(form_str):
    """
    form_str could be "1" => 'Form 1', or "2" => 'Form 2', etc.
    We'll standardize that 'Form X' is the name in forms table.
    """
    form_name = f"Form {form_str}"
    if form_name in forms_dict:
        return forms_dict[form_name]

    cursor.execute("""
        SELECT form_id FROM forms 
        WHERE subject_id = %s AND name = %s
    """, (subject_id, form_name))
    row = cursor.fetchone()
    if row:
        forms_dict[form_name] = row[0]
        return row[0]

    cursor.execute("""
        INSERT INTO forms (subject_id, name)
        VALUES (%s, %s)
    """, (subject_id, form_name))
    conn.commit()
    new_id = cursor.lastrowid
    forms_dict[form_name] = new_id
    return new_id


def get_or_create_topic(form_id, topic_no, topic_name):
    key = (form_id, topic_no, topic_name)
    if key in topics_dict:
        return topics_dict[key]

    cursor.execute("""
        SELECT topic_id FROM topics
        WHERE form_id = %s AND topic_no = %s AND name = %s
    """, (form_id, topic_no, topic_name))
    row = cursor.fetchone()
    if row:
        topics_dict[key] = row[0]
        return row[0]


    cursor.execute("""
        INSERT INTO topics (form_id, topic_no, name)
        VALUES (%s, %s, %s)
    """, (form_id, topic_no, topic_name))
    conn.commit()
    new_id = cursor.lastrowid
    topics_dict[key] = new_id
    return new_id


def get_or_create_subtopic(topic_id, subtopic_no, subtopic_name):
    key = (topic_id, subtopic_no, subtopic_name)
    if key in subtopics_dict:
        return subtopics_dict[key]

    cursor.execute("""
        SELECT subtopic_id FROM subtopics
        WHERE topic_id = %s AND subtopic_no = %s AND name = %s
    """, (topic_id, subtopic_no, subtopic_name))
    row = cursor.fetchone()
    if row:
        subtopics_dict[key] = row[0]
        return row[0]

    cursor.execute("""
        INSERT INTO subtopics (topic_id, subtopic_no, name)
        VALUES (%s, %s, %s)
    """, (topic_id, subtopic_no, subtopic_name))
    conn.commit()
    new_id = cursor.lastrowid
    subtopics_dict[key] = new_id
    return new_id



def get_or_create_objective(subtopic_id, objective_no, description):
    key = (subtopic_id, objective_no, description)
    if key in objectives_dict:
        return objectives_dict[key]

    cursor.execute("""
        SELECT objective_id FROM objectives
        WHERE subtopic_id = %s AND objective_no = %s AND description = %s
    """, (subtopic_id, objective_no, description))
    row = cursor.fetchone()
    if row:
        objectives_dict[key] = row[0]
        return row[0]

    cursor.execute("""
        INSERT INTO objectives (subtopic_id, objective_no, description)
        VALUES (%s, %s, %s)
    """, (subtopic_id, objective_no, description))
    conn.commit()
    new_id = cursor.lastrowid
    objectives_dict[key] = new_id
    return new_id



with open(SYLLABUS_CSV, mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, delimiter=',') 
    for row in reader:
        # row keys: "Subject", "Form", "Topic No.", "Topic", "Subtopic No.", "Subtopic", "Objective No.", "Objective"
        print(row)
        subject_name = row["Subject"].strip()
        form_str = row["Form"].strip()  # e.g. "1"
        topic_no = int(row["Topic No."].strip()) if row["Topic No."].strip() else None
        topic_name = row["Topic"].strip()
        subtopic_no = int(row["Subtopic No."].strip()) if row["Subtopic No."].strip() else None
        subtopic_name = row["Subtopic"].strip()
        objective_no = int(row["Objective No."].strip()) if row["Objective No."].strip() else None
        objective_desc = row["Objective"].strip()


        form_id = get_or_create_form(form_str)
        topic_id = get_or_create_topic(form_id, topic_no, topic_name)
        subtopic_id = get_or_create_subtopic(topic_id, subtopic_no, subtopic_name)
        objective_id = get_or_create_objective(subtopic_id, objective_no, objective_desc)

print("Finished processing Syllabus.csv")

objective_desc_to_id = {}
for (subtopic_id, objective_no, desc), obj_id in objectives_dict.items():
    objective_desc_to_id[desc] = obj_id


def insert_question(objective_id, question_text):
    sql = """INSERT INTO questions (objective_id, question_text) 
             VALUES (%s, %s)"""
    cursor.execute(sql, (objective_id, question_text))
    conn.commit()
    return cursor.lastrowid

def insert_answer(question_id, answer_text, is_correct, answer_type):
    sql = """INSERT INTO answers (question_id, answer_text, is_correct, answer_type)
             VALUES (%s, %s, %s, %s)"""
    cursor.execute(sql, (question_id, answer_text, is_correct, answer_type))
    
    conn.commit()

def process_questions_csv(csv_path):
    """
    Reads columns:
      - Objective
      - Question
      - Right Answer(s)
      - Easy Wrong Answer(s)
      - Meh Wrong Answer(s)
      - Hard Wrong Answer(s)
      - Comments
    Inserts into questions, answers.
    """
    with open(csv_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            objective_text = row["Objective"].strip()
            question_text = row["Question"].strip()

    
            if objective_text not in objective_desc_to_id:
                print(f"WARNING: Objective '{objective_text}' not found in DB. Skipping row.")
                continue
            objective_id = objective_desc_to_id[objective_text]

    
            q_id = insert_question(objective_id, question_text)

    
            right_answers_raw = row["Right Answer(s)"].strip()
            if right_answers_raw:
    
                right_answers = [ans.strip() for ans in right_answers_raw.split(';')]
                for ans in right_answers:
                    if ans:
                        insert_answer(q_id, ans, True, 'right')

           
            easy_wrong_raw = row["Easy Wrong Answer(s)"].strip()
            if easy_wrong_raw:
                easy_wrongs = [ans.strip() for ans in easy_wrong_raw.split(';')]
                for ans in easy_wrongs:
                    if ans:
                        insert_answer(q_id, ans, False, 'easy_wrong')

           
            meh_wrong_raw = row["Meh Wrong Answer(s)"].strip()
            if meh_wrong_raw:
                meh_wrongs = [ans.strip() for ans in meh_wrong_raw.split(';')]
                for ans in meh_wrongs:
                    if ans:
                        insert_answer(q_id, ans, False, 'meh_wrong')

            
            hard_wrong_raw = row["Hard Wrong Answer(s)"].strip()
            if hard_wrong_raw:
                hard_wrongs = [ans.strip() for ans in hard_wrong_raw.split(';')]
                for ans in hard_wrongs:
                    if ans:
                        insert_answer(q_id, ans, False, 'hard_wrong')




# process_questions_csv(F1_QUESTIONS_CSV)
# print("Finished processing F1 questions & answers.")

# process_questions_csv(F2_QUESTIONS_CSV)
# print("Finished processing F2 questions & answers.")


cursor.close()
conn.close()

# print("All data imported successfully!")
