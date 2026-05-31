from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from extensions import db
from models import Application, Interview
from .helpers import json_error

# Mounted under /api so we can host both
# /api/applications/<id>/interviews and /api/interviews/<id> in one blueprint.
bp = Blueprint("interviews", __name__, url_prefix="/api")


def _parse_datetime(value, field):
    if value is None or value == "":
        return None, None
    try:
        cleaned = value.replace("Z", "+00:00") if value.endswith("Z") else value
        return datetime.fromisoformat(cleaned), None
    except ValueError:
        return None, json_error(f"{field} must be an ISO datetime")


def _owned_application(application_id):
    app_row = db.session.get(Application, application_id)
    if app_row is None or app_row.user_id != current_user.id:
        return None
    return app_row


def _owned_interview(interview_id):
    interview = db.session.get(Interview, interview_id)
    if interview is None:
        return None
    # Interview has no user_id; check via parent application
    if interview.application.user_id != current_user.id:
        return None
    return interview


@bp.get("/applications/<int:application_id>/interviews")
@login_required
def list_interviews(application_id):
    app_row = _owned_application(application_id)
    if app_row is None:
        return json_error("not found", status=404)
    return jsonify(items=[i.to_dict() for i in app_row.interviews])


@bp.post("/applications/<int:application_id>/interviews")
@login_required
def create_interview(application_id):
    app_row = _owned_application(application_id)
    if app_row is None:
        return json_error("not found", status=404)

    data = request.get_json(silent=True) or {}
    round_type = (data.get("round_type") or "").strip()
    if not round_type:
        return json_error("round_type is required")

    scheduled_at, err = _parse_datetime(data.get("scheduled_at"), "scheduled_at")
    if err:
        return err

    interview = Interview(
        application_id=app_row.id,
        round_type=round_type,
        scheduled_at=scheduled_at,
        interviewer_name=(data.get("interviewer_name") or None),
        outcome=(data.get("outcome") or "pending"),
        notes=(data.get("notes") or None),
    )
    db.session.add(interview)
    db.session.commit()
    return jsonify(interview.to_dict()), 201


@bp.patch("/interviews/<int:interview_id>")
@login_required
def update_interview(interview_id):
    interview = _owned_interview(interview_id)
    if interview is None:
        return json_error("not found", status=404)

    data = request.get_json(silent=True) or {}

    if "round_type" in data:
        new_type = (data["round_type"] or "").strip()
        if not new_type:
            return json_error("round_type cannot be empty")
        interview.round_type = new_type

    if "scheduled_at" in data:
        parsed, err = _parse_datetime(data["scheduled_at"], "scheduled_at")
        if err:
            return err
        interview.scheduled_at = parsed

    for field in ("interviewer_name", "outcome", "notes"):
        if field in data:
            setattr(interview, field, data[field] or None)

    db.session.commit()
    return jsonify(interview.to_dict())


@bp.delete("/interviews/<int:interview_id>")
@login_required
def delete_interview(interview_id):
    interview = _owned_interview(interview_id)
    if interview is None:
        return json_error("not found", status=404)
    db.session.delete(interview)
    db.session.commit()
    return jsonify(ok=True)
