from openai import OpenAI
import config

client = OpenAI(api_key=config.open_ai_api_key)


def query_model(prompt_file, question_query):
    with open(prompt_file, 'r') as file:  
        developer_query = file.read()
    
    completion = client.chat.completions.create(
    model = "gpt-4o",
    messages = [
        {"role": "developer", "content": f"{developer_query}"},
        {
            "role": "user",
            "content": f"{question_query}"
        }
    ],
    response_format = {
        "type": "json_schema",
        "json_schema":{ 
            "name": "qa_schema",
            "schema": {
                "type": "object",
                "properties": {
                "question_id": {
                    "type": "int",
                    "description": "Interal question_id of question"
                },
                "question": {
                    "type": "string",
                    "description": "The question being asked."
                },
                "answer": {
                    "type": "string",
                    "description": "The answer to the question."
                },
                "explanation": {
                    "type": "string",
                    "description": "A detailed explanation supporting the answer."
                }
                },
                "required": [
                "question",
                "answer",
                "explanation"
                ],
                "additionalProperties": False
            },
            "strict": True
        }
    }
    )
    return completion.choices[0]

        