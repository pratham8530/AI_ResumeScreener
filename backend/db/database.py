import sqlite3

def init_db():
    conn = sqlite3.connect("recruitment.db")
    cursor = conn.cursor()
    
    # Create table for job descriptions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            skills TEXT NOT NULL,
            responsibilities TEXT NOT NULL,
            requirements TEXT NOT NULL,
            keywords TEXT NOT NULL,
            original_text TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect("recruitment.db")