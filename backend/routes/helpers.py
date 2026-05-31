from flask import request, jsonify

# safe default + ceiling so a curious user can't request 100k rows at once
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


def get_pagination_args():
    """Pulls ?page= and ?per_page= off the request, clamps to sane bounds."""
    try:
        page = max(int(request.args.get("page", 1)), 1)
    except (TypeError, ValueError):
        page = 1
    try:
        per_page = int(request.args.get("per_page", DEFAULT_PAGE_SIZE))
    except (TypeError, ValueError):
        per_page = DEFAULT_PAGE_SIZE
    per_page = max(1, min(per_page, MAX_PAGE_SIZE))
    return page, per_page


def paginated_response(query, page, per_page, serialize):
    """Runs an offset paginate on `query` and serializes each row via `serialize(row)`."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify(
        items=[serialize(item) for item in pagination.items],
        page=pagination.page,
        per_page=pagination.per_page,
        total=pagination.total,
        pages=pagination.pages,
        has_next=pagination.has_next,
        has_prev=pagination.has_prev,
    )


def json_error(message, status=400, **extra):
    payload = {"error": message}
    payload.update(extra)
    return jsonify(payload), status
