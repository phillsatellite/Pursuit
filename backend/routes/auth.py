import re
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import User
from .helpers import json_error

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# good-enough email check — full RFC compliance isn't worth the trouble here
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LEN = 8


@bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or "").strip() or None

    if not EMAIL_RE.match(email):
        return json_error("invalid email")
    if len(password) < MIN_PASSWORD_LEN:
        return json_error(f"password must be at least {MIN_PASSWORD_LEN} characters")

    user = User(email=email, display_name=display_name)
    user.set_password(password)

    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        # don't leak whether the email exists vs. some other constraint — but for
        # signup UX this is fine, users want to know "already registered"
        return json_error("email already registered", status=409)

    login_user(user)
    return jsonify(user=user.to_dict()), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return json_error("email and password required")

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        # generic message so we don't reveal which half of the pair was wrong
        return json_error("invalid credentials", status=401)

    login_user(user, remember=True)
    return jsonify(user=user.to_dict())


@bp.post("/logout")
@login_required
def logout():
    logout_user()
    return jsonify(ok=True)


@bp.get("/me")
def me():
    if not current_user.is_authenticated:
        # 200 with null is friendlier for the client's "am I logged in?" check
        # than a 401 — saves a try/catch on the consumer side.
        return jsonify(user=None)
    return jsonify(user=current_user.to_dict())
