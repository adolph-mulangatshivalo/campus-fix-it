import mysql.connector
from config import Config
from werkzeug.security import generate_password_hash
import getpass

def create_admin():
    print("--- Create Admin Account ---")
    full_name = input("Enter Full Name: ")
    email = input("Enter Email Address: ")
    password = getpass.getpass("Enter Password: ")
    
    password_hash = generate_password_hash(password)
    
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT
        )
        
        cursor = connection.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"Error: Email {email} is already registered!")
            return
            
        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, 'admin')",
            (full_name, email, password_hash)
        )
        
        connection.commit()
        print(f"Success! Admin account for {email} has been created.")
        
    except mysql.connector.Error as e:
        print(f"Database Error: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    create_admin()
