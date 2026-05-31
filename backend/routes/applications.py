from datetime import date

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from extensions import db
from models import Application, Company, APPLICATION_STATUSES
from .helpers import (
    get_pagination_args,
    paginated_response,
    json_error,
    parse_date,
    parse_datetime,
)

bp = Blueprint("applications", __name__, url_prefix="/api/applications")


def _get_owned_or_404(application_id):
    app_row = db.session.get(Application, application_id)
    if app_row is None or app_row.user_id != current_user.id:
        return None
    return app_row


def _company_belongs_to_user(company_id):
    if company_id is None:
        return False
    company = db.session.get(Company, company_id)
    return company is not None and company.user_id == current_user.id


@bp.get("")
@login_required
def list_applications():
    page, per_page = get_pagination_args()
    q = Application.query.filter_by(user_id=current_user.id)

    status = (request.args.get("status") or "").strip()
    if status and status in APPLICATION_STATUSES:
        q = q.filter(Application.status == status)

    company_id = request.args.get("company_id")
    if company_id:
        try:
            q = q.filter(Application.company_id == int(company_id))
        except ValueError:
            return json_error("company_id must be an integer")

    search = (request.args.get("q") or "").strip()
    if search:
        q = q.filter(Application.role_title.ilike(f"%{search}%"))

    q = q.order_by(Application.applied_date.desc(), Application.id.desc())
    return paginated_response(q, page, per_page, lambda a: a.to_dict())


@bp.post("")
@login_required
def create_application():
    data = request.get_json(silent=True) or {}

    role_title = (data.get("role_title") or "").strip()
    if not role_title:
        return json_error("role_title is required")

    company_id = data.get("company_id")
    if not company_id:
        return json_error("company_id is required")
    if not _company_belongs_to_user(company_id):
        # same response shape whether the company doesn't exist or belongs to
        # another user — no information leak.
        return json_error("company_id is invalid")

    status = data.get("status") or "Applied"
    if status not in APPLICATION_STATUSES:
        return json_error(f"status must be one of {list(APPLICATION_STATUSES)}")

    applied_date, err = parse_date(data.get("applied_date"), "applied_date")
    if err:
        return err
    first_response_at, err = parse_datetime(data.get("first_response_at"), "first_response_at")
    if err:
        return err

    app_row = Application(
        user_id=current_user.id,
        role_title=role_title,
        company_id=company_id,
        status=status,
        applied_date=applied_date or date.today(),
        source=(data.get("source") or None),
        salary_range=(data.get("salary_range") or None),
        jd_text=(data.get("jd_text") or None),
        notes=(data.get("notes") or None),
        first_response_at=first_response_at,
    )
    db.session.add(app_row)
    db.session.commit()
    return jsonify(app_row.to_dict(include_interviews=True)), 201


@bp.get("/<int:application_id>")
@login_required
def get_application(application_id):
    app_row = _get_owned_or_404(application_id)
    if app_row is None:
        return json_error("not found", status=404)
    return jsonify(app_row.to_dict(include_interviews=True))


@bp.patch("/<int:application_id>")
@login_required
def update_application(application_id):
    app_row = _get_owned_or_404(application_id)
    if app_row is None:
        return json_error("not found", status=404)

    data = request.get_json(silent=True) or {}

    if "role_title" in data:
        title = (data["role_title"] or "").strip()
        if not title:
            return json_error("role_title cannot be empty")
        app_row.role_title = title

    if "company_id" in data:
        new_company_id = data["company_id"]
        if not _company_belongs_to_user(new_company_id):
            return json_error("company_id is invalid")
        app_row.company_id = new_company_id

    if "status" in data:
        if data["status"] not in APPLICATION_STATUSES:
            return json_error(f"status must be one of {list(APPLICATION_STATUSES)}")
        app_row.status = data["status"]

    if "applied_date" in data:
        parsed, err = parse_date(data["applied_date"], "applied_date")
        if err:
            return err
        if parsed is not None:
            app_row.applied_date = parsed

    if "first_response_at" in data:
        parsed, err = parse_datetime(data["first_response_at"], "first_response_at")
        if err:
            return err
        app_row.first_response_at = parsed

    for field in ("source", "salary_range", "jd_text", "notes"):
        if field in data:
            setattr(app_row, field, data[field] or None)

    db.session.commit()
    return jsonify(app_row.to_dict(include_interviews=True))


@bp.delete("/<int:application_id>")
@login_required
def delete_application(application_id):
    app_row = _get_owned_or_404(application_id)
    if app_row is None:
        return json_error("not found", status=404)
    db.session.delete(app_row)
    db.session.commit()
    return jsonify(ok=True)
