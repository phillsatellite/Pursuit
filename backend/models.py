from datetime import datetime, date
from flask_login import UserMixin
from extensions import db, bcrypt


# the high-level pipeline shown on the dashboard.
# the more detailed interview type (phone screen, technical, onsite)
# lives on the Interview model under round_type instead.
APPLICATION_STATUSES = (
    "Applied",
    "Contacted",
    "Interview",
    "Offer",
    "Rejected",
    "Withdrawn",
)


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(200), unique=True, nullable=False, index=True)
    # bcrypt hash, never the plaintext
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    companies = db.relationship(
        "Company", back_populates="owner", cascade="all, delete-orphan"
    )
    applications = db.relationship(
        "Application", back_populates="owner", cascade="all, delete-orphan"
    )
    contacts = db.relationship(
        "Contact", back_populates="owner", cascade="all, delete-orphan"
    )

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    name = db.Column(db.String(200), nullable=False)
    industry = db.Column(db.String(120))
    size = db.Column(db.String(60))  # free-form for now ("11-50", "Startup", etc.)
    website = db.Column(db.String(300))
    location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    owner = db.relationship("User", back_populates="companies")
    # delete the company, the related apps and contacts go with it.
    # this matches what the user actually expects when they hit delete.
    applications = db.relationship(
        "Application", back_populates="company", cascade="all, delete-orphan"
    )
    contacts = db.relationship(
        "Contact", back_populates="company", cascade="all, delete-orphan"
    )

    def to_dict(self, include_counts=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "industry": self.industry,
            "size": self.size,
            "website": self.website,
            "location": self.location,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_counts:
            data["application_count"] = len(self.applications)
            data["contact_count"] = len(self.contacts)
        return data


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    role_title = db.Column(db.String(200), nullable=False)
    company_id = db.Column(
        db.Integer, db.ForeignKey("companies.id"), nullable=False, index=True
    )
    status = db.Column(db.String(40), nullable=False, default="Applied")
    applied_date = db.Column(db.Date, default=date.today, nullable=False)
    # where you found the job (LinkedIn, referral, company site, etc.)
    source = db.Column(db.String(120))
    salary_range = db.Column(db.String(120))
    # full job description, pasted in — handy to re-read when prepping for interviews
    jd_text = db.Column(db.Text)
    notes = db.Column(db.Text)
    # only set once the company first replies, used for days-to-response stat
    first_response_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    owner = db.relationship("User", back_populates="applications")
    company = db.relationship("Company", back_populates="applications")
    interviews = db.relationship(
        "Interview",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="Interview.scheduled_at",
    )

    def to_dict(self, include_company=True, include_interviews=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "role_title": self.role_title,
            "company_id": self.company_id,
            "status": self.status,
            "applied_date": self.applied_date.isoformat() if self.applied_date else None,
            "source": self.source,
            "salary_range": self.salary_range,
            "jd_text": self.jd_text,
            "notes": self.notes,
            "first_response_at": self.first_response_at.isoformat()
            if self.first_response_at
            else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_company and self.company is not None:
            data["company"] = {"id": self.company.id, "name": self.company.name}
        if include_interviews:
            data["interviews"] = [i.to_dict() for i in self.interviews]
        return data


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(
        db.Integer, db.ForeignKey("applications.id"), nullable=False, index=True
    )
    # phone screen, technical, onsite, final, etc.
    round_type = db.Column(db.String(80), nullable=False)
    scheduled_at = db.Column(db.DateTime)
    interviewer_name = db.Column(db.String(160))
    # pending / passed / failed / no-show / pending feedback
    outcome = db.Column(db.String(60), default="pending")
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    application = db.relationship("Application", back_populates="interviews")

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "round_type": self.round_type,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "interviewer_name": self.interviewer_name,
            "outcome": self.outcome,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    name = db.Column(db.String(160), nullable=False)
    role = db.Column(db.String(160))
    email = db.Column(db.String(200))
    # a contact belongs to a company, but the company is optional here —
    # someone can be a recruiter you met at a meetup before they're "officially" tied to a role
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), index=True)
    last_contacted = db.Column(db.Date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    owner = db.relationship("User", back_populates="contacts")
    company = db.relationship("Company", back_populates="contacts")

    def to_dict(self, include_company=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "role": self.role,
            "email": self.email,
            "company_id": self.company_id,
            "last_contacted": self.last_contacted.isoformat()
            if self.last_contacted
            else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_company and self.company is not None:
            data["company"] = {"id": self.company.id, "name": self.company.name}
        return data
