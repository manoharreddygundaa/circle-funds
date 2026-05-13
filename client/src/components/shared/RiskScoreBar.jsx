/**
 * RiskScoreBar — shows a borrower's credit score and risk tier.
 *
 * Credit score range: 300–900
 * Risk tiers:
 *   300–549  → High Risk   (red)
 *   550–699  → Medium Risk (yellow)
 *   700+     → Low Risk    (green)
 *
 * Used in:
 *   - BorrowerDashboard (header card)
 *   - LoanCard (lender view)
 *   - AdminUsers table
 */
export const RiskScoreBar = ({ score = 600, showLabel = true, compact = false }) => {
  const percent = ((score - 300) / 600) * 100;

  const tier =
    score >= 700
      ? { label: 'Low Risk', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' }
      : score >= 550
      ? { label: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' }
      : { label: 'High Risk', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };

  if (compact) {
    // Inline version — just the score + colour dot
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${tier.color}`}>
        <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
        {score}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Credit Score</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
            <span className={`text-xs font-semibold ${tier.color}`}>
              {score} · {tier.label}
            </span>
          </div>
        </div>
      )}

      {/* Gradient bar: red → yellow → green */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background:
              score >= 700
                ? '#22c55e'
                : score >= 550
                ? '#f59e0b'
                : '#ef4444',
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>300</span>
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
        <span>900</span>
      </div>
    </div>
  );
};
