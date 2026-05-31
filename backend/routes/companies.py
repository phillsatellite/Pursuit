from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from extensions import db
from models import Company
from .helpers import get_pagination_args, paginated_response, json_error

bp = Blueprint("companies", __name__, url_prefix="/api/companies")


def _get_owned_or_404(company_id):
    company = db.session.get(Company, company_id)
    # treat "not yours" and "not found" the same way so we don't leak existence
    if company is None or company.user_id != current_user.id:
        return None
    return company


@bp.get("")
@login_required
def list_companies():
    page, per_page = get_pagination_args()
    q = Company.query.filter_by(user_id=current_user.id)

    search = (request.args.get("q") or "").strip()
    if search:
        q = q.filter(Company.name.ilike(f"%{search}%"))

    q = q.order_by(Company.name.asc())
    return paginated_response(q, page, per_page, lambda c: c.to_dict(include_counts=True))


@bp.post("")
@login_required
def create_company():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return json_error("name is required")

    company = Company(
        user_id=current_user.id,
        name=name,
        industry=(data.get("industry") or None),
        size=(data.get("size") or None),
        website=(data.get("website") or None),
        location=(data.get("location") or None),
        notes=(data.get("notes") or None),
    )
    db.session.add(company)
    db.session.commit()
    return jsonify(company.to_dict(include_counts=True)), 201


@bp.get("/<int:company_id>")
@login_required
def get_company(company_id):
    company = _get_owned_or_404(company_id)
    if company is None:
        return json_error("not found", status=404)
    return jsonify(company.to_dict(include_counts=True))


@bp.patch("/<int:company_id>")
@login_required
def update_company(company_id):
    company = _get_owned_or_404(company_id)
    if company is None:
        return json_error("not found", status=404)

    data = request.get_json(silent=True) or {}
    for field in ("name", "industry", "size", "website", "location", "notes"):
        if field in data:
            value = data[field]
            if field == "name" and not (value or "").strip():
                return json_error("name cannot be empty")
            setattr(company, field, (value or None) if field != "name" else value.strip())

    db.session.commit()
    return jsonify(company.to_dict(include_counts=True))


@bp.delete("/<int:company_id>")
@login_required
def delete_company(company_id):
    company = _get_owned_or_404(company_id)
    if company is None:
        return json_error("not found", status=404)
    db.session.delete(company)
    db.session.commit()
    return jsonify(ok=True)
