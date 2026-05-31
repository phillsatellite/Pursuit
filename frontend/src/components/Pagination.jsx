export default function Pagination({ page, pages, total, hasPrev, hasNext, onPageChange }) {
  // nothing to page through on an empty list — hide the controls entirely
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-300">
        {/* the API reports 0 pages for an empty result, so floor the display at 1 */}
        Page {page} of {Math.max(pages, 1)} — {total} total
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
