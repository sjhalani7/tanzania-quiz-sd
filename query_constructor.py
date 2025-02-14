class QueryConstructor:
    
    def __init__(self):
        self._query = ""
        self._select_columns = [] #list of cols to select
        self._from_tables = [] #list of tables for select
        self._where_conditions = [] # list of where conditions
        self._join_conditions = [] # incl (join_type, table, condition)
        self._where_params = [] # list of where condition values
        self._order_by = [] 
        self._group_by = []
        self._limit = None
        self._distinct = False
        self._cte_expressions = [] #(alias, query_string, query_params) tuple list
    
    def select(self, columns:list):
        self._select_columns += columns
        return self
    
    def select_single_column(self, column):
        self._select_columns.append(column)
        return self
    
    def from_table(self, table):
        self._from_tables.append(table)
        return self
    
    def where_eq(self, column, value):
        self._where_conditions.append(f"{column} = %s")
        self._where_params.append(value)
        return self

    def where_in(self, column, values):
        self._where_conditions.append(f"{column} IN ({','.join(['%s']*len(values))})")
        self._where_params.extend(values)
        return self
    
    def where_bw(self, column, value1, value2):
        self._where_conditions.append(f"{column} BETWEEN %s AND %s")
        self._where_params.append(value1)
        self._where_params.append(value2)
        return self
    
    def where_raw(self, condition, *params):
        self._where_conditions.append(condition)
        self._where_params.extend(params)
        return self

    
    def join(self, table, condition, join_type):
        self._join_conditions.append((join_type, table, condition))
        return self
    
    def order_by(self, *columns):
        self._order_by.extend(columns)
        return self
    
    def group_by(self, *columns):
        self._group_by.extend(columns)
        return self
    
    def limit(self, limit_count):
        self._limit = limit_count
        return self
    
    def with_cte(self, alias, query_builder):
        self._cte_expressions.append((alias, query_builder.get_query_string(), query_builder.get_query_params()))
        return self
    
    def reset(self):
        self._query = ""
        self._select_columns = [] 
        self._from_tables = [] 
        self._where_conditions = [] 
        self._join_conditions = [] 
        self._where_params = [] 
        self._order_by = [] 
        self._group_by = []
        self._limit = None
        self._distinct = False
        self._cte_expressions = []
        return self

    def distinct(self, distinct_flag):
        self._distinct = distinct_flag
        return self
    
    def build(self):
        cte_params = []

        if self._cte_expressions:
            cte_parts = []
            for cte_alias, query_string, query_params in self._cte_expressions:
                cleaned_query_string = query_string.rstrip(';')
                cte_parts.append(f"{cte_alias} AS ({cleaned_query_string}) ")
                cte_params.extend(query_params)
            self._query = "WITH " + ", ".join(cte_parts) + " "
        else:
            self._query = ""

        self._query += "SELECT "
        if self._distinct:
            self._query += "DISTINCT "
    
        if self._select_columns:
            if len(self._select_columns) > 1:
                self._query += ", ".join(self._select_columns)
            else: 
                self._query += self._select_columns[0]
        else:
            self._query += "* "

        if not self._from_tables:
            raise Exception('Invalid SQL statement without FROM table. Cannot SELECT without FROM statement')
        else:
            self._query += " FROM " + ", ".join(self._from_tables)

        
        if self._join_conditions:
            for join_type, table, condition in self._join_conditions:
                self._query += f" {join_type} {table} ON {condition}"
        
        if self._where_conditions:
            self._query += " WHERE " + " AND ".join(self._where_conditions)
        
        if self._group_by:
            self._query += " GROUP BY " + ", ".join(self._group_by)
        
        if self._order_by:
            self._query += " ORDER BY " + ", ".join(self._order_by)
        
        if self._limit is not None:
            self._query += f" LIMIT {self._limit}"
        
        self._query += ';'
        self._where_params = cte_params + self._where_params
        return self
    
    def get_query_string(self):
        if self._query == "":
            self.build()
        return self._query
    
    def get_query_params(self):
        if self._query == "":
            self.build()
        return self._where_params
    