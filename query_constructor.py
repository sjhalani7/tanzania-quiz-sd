class QueryConstructor:
    def __init__(self):
        self._query = ""
        self._select_columns = [] #list of cols to select
        self._from_tables = [] #list of tables for select
        self._where_conditions = [] # list of where conditions
        self._join_conditions = [] # incl (join_type, table, condition)
        self._order_by = [] 
        self._group_by = []
        self._limit = None
        self._distinct = False
    
    def select(self, *columns):
        self._select_columns.extend(columns)
        return self
    
    def select_single_column(self, column):
        self._select_columns.append(column)
        return self
    
    def from_table(self, table):
        self._from_tables.append(table)
        return self
    
    def where(self, condition):
        self._where_conditions.append(condition)
        return self
    
    def join(self, table, condition, join_type="JOIN"):
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
        return 
    
    def reset(self):
        self._query = ""
        self._select_columns = []
        self._from_tables = []
        self._where_conditions = []
        self._join_conditions = []
        self._order_by = []
        self._group_by = []
        self._limit = None
        self._distinct = False
        return

    def distinct(self, distinct_flag):
        self._distinct = distinct_flag
        return self
    
    def build(self):
        self._query = "SELECT "
        if self._distinct:
            self._query += "DISTINCT "
    
        if self._select_columns:
            self._query += ", ".join(self._select_columns)
        else:
            self._query += "SELECT *"

        if not self._from_tables:
            raise Exception('Invalid SQL statement without FROM table. Cannot SELECT without FROM statement')
        else:
            self._query += " FROM " + ", ".join(self._from_tables)

        
        if self._join_conditions:
            for join_type, table, condition in self._join_conditions:
                self._query += f" JOIN {table} ON {condition}"
        
        if self._where_conditions:
            self._query += " WHERE " + " AND ".join(self._where_conditions)
        
        if self._group_by:
            self._query += " GROUP BY " + ", ".join(self._group_by)
        
        if self._order_by:
            self._query += " ORDER BY " + ", ".join(self._order_by)
        
        if self._limit is not None:
            self._query += f" LIMIT {self._limit}"
        
        self._query += ';'
        return self
    
    def get_query_string(self):
        self.build()
        return self._query
    