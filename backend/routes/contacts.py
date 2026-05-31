from datetime import date

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from extensions import db
from models import Contact, Company
from .helpers import get_pagination_args, paginated_response, json_error

bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")


def _parse_date(value, field):
    if value is None or value == "":
        return None, None
    try:
        return date.fromisoformat(value), None
    except ValueError:
        return None, json_error(f"{field} must be YYYY-MM-DD")


def _company_belongs_to_user(company_id):
    if company_id is None:
        return True  # company is optional on a contact
    company = db.session.get(Company, company_id)
    return company is not None and company.user_id == current_user.id


def _get_owned_or_404(contact_id):
    contact = db.session.get(Contact, contact_id)
    if contact is None or contact.user_id != current_user.id:
        return None
    return contact


@bp.get("")
@login_required
def list_contacts():
    page, per_page = get_pagination_args()
    q = Contact.query.filter_by(user_id=current_user.id)

    company_id = request.args.get("company_id")
    if company_id:
        try:
            q = q.filter(Contact.company_id == int(company_id))
        except ValueError:
            return json_error("company_id must be an integer")

    search = (request.args.get("q") or "").strip()
    if search:
        q = q.filter(Contact.name.ilike(f"%{search}%"))

    q = q.order_by(Contact.name.asc())
    return paginated_response(q, page, per_page, lambda c: c.to_dict())


@bp.post("")
@login_required
def create_contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return json_error("name is required")

    company_id = data.get("company_id")
    if company_id and not _company_belongs_to_user(company_id):
        return json_error("company_id is invalid")

    last_contacted, err = _parse_date(data.get("last_contacted"), "last_contacted")
    if err:
        return err

    contact = Contact(
        user_id=current_user.id,
        name=name,
        role=(data.get("role") or None),
        email=(data.get("email") or None),
        company_id=company_id or None,
        last_contacted=last_contacted,
        notes=(data.get("notes") or None),
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201


@bp.get("/<int:contact_id>")
@login_required
def get_contact(contact_id):
    contact = _get_owned_or_404(contact_id)
    if contact is None:
        return json_error("not found", status=404)
    return jsonify(contact.to_dict())


@bp.patch("/<int:contact_id>")
@login_required
def update_contact(contact_id):
    contact = _get_owned_or_404(contact_id)
    if contact is None:
        return json_error("not found", status=404)

    data = request.get_json(silent=True) or {}

    if "name" in data:
        new_name = (data["name"] or "").strip()
        if not new_name:
            return json_error("name cannot be empty")
        contact.name = new_name

    if "company_id" in data:
        new_company_id = data["company_id"]
        if new_company_id and not _company_belongs_to_user(new_company_id):
            return json_error("company_id is invalid")
        contact.company_id = new_company_id or None

    if "last_contacted" in data:
        parsed, err = _parse_date(data["last_contacted"], "last_contacted")
        if err:
            return err
        contact.last_contacted = parsed

    for field in ("role", "email", "notes"):
        if field in data:
            setattr(contact, field, data[field] or None)

    db.session.commit()
    return jsonify(contact.to_dict())


@bp.delete("/<int:contact_id>")
@login_required
def delete_contact(contact_id):
    contact = _get_owned_or_404(contact_id)
    if contact is None:
        return json_error("not found", status=404)
    db.session.delete(contact)
    db.session.commit()
    return jsonify(ok=True)
