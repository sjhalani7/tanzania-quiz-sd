from query_constructor import QueryConstructor
import mysql.connector
import config
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

def create_query(select:list, from_table:list, where:list=[], join:list=[]):
    query = QueryConstructor()
    query.select(select)
    for table in from_table:
        query.from_table(table)
    if where:
        for condition in where:
            query.where_eq(condition[0], condition[1])

    if join:
        for condition in join:
            query.join(condition[0], condition[1], condition[2])

    return query


def get_query_results(query_constructor):
    query_string = query_constructor.get_query_string()
    query_params = query_constructor.get_query_params()
    cursor.execute(query_string, query_params)
    query_result = cursor.fetchall()
    return query_result