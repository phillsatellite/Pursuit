from datetime import datetime, timedelta

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func

from extensions import db
from models import Application, Interview, Company, Contact, APPLICATION_STATUSES

bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@bp.get("")
@login_required
def dashboard_stats():
    user_id = current_user.id

    by_status_rows = (
        db.session.query(Application.status, func.count(Application.id))
        .filter(Application.user_id == user_id)
        .group_by(Application.status)
        .all()
    )
    # zero-fill any statuses that don't appear in the user's data so the
    # frontend doesn't have to do this defensively.
    by_status = {status: 0 for status in APPLICATION_STATUSES}
    for status, count in by_status_rows:
        by_status[status] = count

    total_applications = sum(by_status.values())

    # upcoming interviews = scheduled in the next 14 days, owned by this user
    now = datetime.utcnow()
    horizon = now + timedelta(days=14)
    upcoming_interviews = (
        db.session.query(Interview)
        .join(Application, Interview.application_id == Application.id)
        .filter(Application.user_id == user_id)
        .filter(Interview.scheduled_at != None)  # noqa: E711 — SQLAlchemy needs ==/!= not is/is not
        .filter(Interview.scheduled_at >= now)
        .filter(Interview.scheduled_at <= horizon)
        .order_by(Interview.scheduled_at.asc())
        .limit(5)
        .all()
    )

    # avg days from applied_date -> first_response_at across apps that did respond
    apps_with_response = (
        Application.query
        .filter(Application.user_id == user_id)
        .filter(Application.first_response_at != None)  # noqa: E711
        .all()
    )
    if apps_with_response:
        total_days = sum(
            (a.first_response_at.date() - a.applied_date).days for a in apps_with_response
        )
        avg_days_to_response = round(total_days / len(apps_with_response), 1)
    else:
        avg_days_to_response = None

    company_count = Company.query.filter_by(user_id=user_id).count()
    contact_count = Contact.query.filter_by(user_id=user_id).count()

    # most recent applications, useful for a "recent activity" section
    recent_applications = (
        Application.query.filter_by(user_id=user_id)
        .order_by(Application.created_at.desc())
        .limit(5)
        .all()
    )

    return jsonify(
        total_applications=total_applications,
        by_status=by_status,
        upcoming_interviews=[
            {**i.to_dict(),
             "application": {
                 "id": i.application.id,
                 "role_title": i.application.role_title,
                 "company": {"id": i.application.company.id, "name": i.application.company.name}
                 if i.application.company else None,
             }}
            for i in upcoming_interviews
        ],
        avg_days_to_response=avg_days_to_response,
        company_count=company_count,
        contact_count=contact_count,
        recent_applications=[a.to_dict() for a in recent_applications],
    )
