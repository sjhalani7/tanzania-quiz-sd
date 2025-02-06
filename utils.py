from query_constructor import QueryConstructor

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


