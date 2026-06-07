import os
import json

from flask import Blueprint, request, jsonify
from flask_login import login_required

from .helpers import json_error

bp = Blueprint("ai", __name__, url_prefix="/api/ai")

# what we ask the model to pull out of a pasted posting — kept in sync with the
# fields the new-application form actually uses.
_SYSTEM_PROMPT = (
    "You extract structured data from a pasted job posting. "
    "Return ONLY a JSON object with exactly these string keys:\n"
    '  "role_title"   - the job title, or ""\n'
    '  "company_name" - the hiring company, or ""\n'
    '  "salary_range" - the pay range exactly as written (e.g. "$140k-$170k"), or ""\n'
    '  "source"       - where it is posted if identifiable (e.g. "LinkedIn"), or ""\n'
    '  "notes"        - a 1-2 sentence plain-language summary of the role, or ""\n'
    "Use an empty string for anything not present. Never invent values."
)

# only the keys we trust back from the model — anything else is ignored
_ALLOWED_FIELDS = ("role_title", "company_name", "salary_range", "source", "notes")


@bp.post("/parse-job")
@login_required
def parse_job():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return json_error("paste a job description first")
    # guardrail: cap input so a giant paste can't run up the token bill
    text = text[:12000]

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return json_error(
            "AI isn't configured — set OPENAI_API_KEY in the backend .env", status=503
        )

    try:
        # imported lazily so the app still boots if the package isn't installed yet
        from openai import OpenAI
    except ImportError:
        return json_error("AI dependency missing — run: pip install openai", status=503)

    try:
        client = OpenAI(
            api_key=api_key,
            # point at any OpenAI-compatible endpoint (Groq, local Ollama, etc.)
            base_url=os.getenv("OPENAI_BASE_URL") or None,
        )
        model = os.getenv("AI_MODEL", "gpt-4o-mini")
        resp = client.chat.completions.create(
            model=model,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
        )
        raw = resp.choices[0].message.content or "{}"
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return json_error("the AI returned something unexpected — try again", status=502)
    except Exception as exc:  # network / auth / rate-limit / etc. from the provider
        return json_error(f"AI request failed: {exc}", status=502)

    # keep only the fields we expect, coerced to trimmed strings
    fields = {k: str(parsed.get(k) or "").strip() for k in _ALLOWED_FIELDS}
    return jsonify(fields=fields)
