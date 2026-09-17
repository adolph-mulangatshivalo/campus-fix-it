from flask import Flask, jsonify, g, render_template, session, redirect, url_for, send_from_directory
import os
from config import Config
import mysql.connector
from mysql.connector import Error

# Import blueprints
from routes.auth import auth_bp
from routes.student import student_bp
from routes.admin import admin_bp
from routes.worker import worker_bp

app = Flask(__name__)
app.config.from_object(Config)

# Configure Uploads
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
except OSError:
    # Vercel has a read-only filesystem, so we ignore this error.
    # Note: Local image uploads will not persist on Vercel's standard plan.
    pass

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(worker_bp, url_prefix='/worker')

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=app.config['DB_HOST'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            database=app.config['DB_NAME'],
            port=app.config['DB_PORT'],
            ssl_verify_cert=True,
            ssl_verify_identity=True
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@app.before_request
def before_request():
    """Establish a database connection before every request."""
    g.db = get_db_connection()

@app.teardown_request
def teardown_request(exception):
    """Close the database connection after every request."""
    db = getattr(g, 'db', None)
    if db is not None and db.is_connected():
        db.close()

@app.route('/')
def index():
    if 'user_id' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin.dashboard'))
        elif session.get('role') == 'worker':
            return redirect(url_for('worker.dashboard'))
        else:
            return redirect(url_for('student.dashboard'))
    return redirect(url_for('auth.login'))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/test-db')
def test_db():
    if g.db and g.db.is_connected():
        return jsonify({"status": "success", "message": "Successfully connected to the database!"})
    else:
        return jsonify({"status": "error", "message": "Failed to connect to the database. Check your .env credentials."}), 500

if __name__ == '__main__':
    app.run(debug=True)
