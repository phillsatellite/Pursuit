import os
from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from extensions import db, migrate, login_manager, bcrypt

# load .env early so SQLALCHEMY_DATABASE_URI picks up DATABASE_URL when present
load_dotenv()


def create_app():
    app = Flask(__name__)

    # Heroku/Render-style DATABASE_URL sometimes starts with postgres://
    # SQLAlchemy 1.4+ wants postgresql://, so normalize it here.
    db_url = os.getenv("DATABASE_URL", "sqlite:///tracker.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    # noisy and we don't use the events — turning it off saves a bit of memory
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # required for session signing. set a real value in production.
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    # remember-me cookie lives for 14 days
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=14)
    # SameSite=Lax is enough when the SPA is served from the same host in
    # production; for local dev across :5173 -> :5000 we rely on
    # supports_credentials on CORS and credentials: 'include' on fetch.
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_HTTPONLY"] = True

    # CORS: allow the Vite dev server with credentials. Tighten before prod.
    CORS(
        app,
        resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")}},
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # API-friendly response when an endpoint requires login but caller is anonymous
    @login_manager.unauthorized_handler
    def _unauthorized():
        return jsonify(error="authentication required"), 401

    # importing inside the factory keeps the model file from being imported
    # at module-load time (which would break migrate's autogenerate)
    from models import User, Company, Application, Interview, Contact  # noqa: F401

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from routes.auth import bp as auth_bp
    from routes.companies import bp as companies_bp
    from routes.applications import bp as applications_bp
    from routes.interviews import bp as interviews_bp
    from routes.contacts import bp as contacts_bp
    from routes.stats import bp as stats_bp
    from routes.ai import bp as ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(companies_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(interviews_bp)
    app.register_blueprint(contacts_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(ai_bp)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    return app


# gunicorn / `flask run` both look for this name
app = create_app()


if __name__ == "__main__":
    # only used when running `python app.py` directly during local hacking
    app.run(host="127.0.0.1", port=5000, debug=True)
