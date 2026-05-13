import { useMemo, useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Amortization schedule breakdown.
 *
 * Each EMI = Interest portion + Principal portion.
 * As months progress, interest share DECREASES and principal share INCREASES.
 * This is the standard reducing-balance method used by banks.
 *
 * Formula for each month:
 *   interestDue  = outstandingPrincipal × monthlyRate
 *   principalPaid = EMI - interestDue
 *   outstandingPrincipal = outstandingPrincipal - principalPaid
 */
const buildSchedule = (principal, annualRate, months, startDate = new Date()) => {
  const r = annualRate / 100 / 12; // monthly interest rate
  const emi =
    r === 0
      ? principal / months
      : (principal * r * Math.pow(1 + r, months)) /
        (Math.pow(1 + r, months) - 1);

  let balance = principal;
  const rows = [];

  for (let i = 1; i <= months; i++) {
    const interestDue = Math.round(balance * r * 100) / 100;
    const principalPaid = Math.round((emi - interestDue) * 100) / 100;
    balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    rows.push({
      month: i,
      emi: Math.round(emi * 100) / 100,
      principal: principalPaid,
      interest: interestDue,
      balance,
      dueDate,
    });
  }
  return rows;
};

export const RepaymentScheduleTable = ({ amount, rate, duration }) => {
  const [expanded, setExpanded] = useState(false);
  const schedule = useMemo(
    () => buildSchedule(amount, rate, duration),
    [amount, rate, duration]
  );

  // Show first 3 rows when collapsed, all when expanded
  const visible = expanded ? schedule : schedule.slice(0, 3);

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Repayment Schedule
      </h4>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              {['Mo.', 'Due Date', 'EMI', 'Principal', 'Interest', 'Balance'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {visible.map((row) => (
              <tr
                key={row.month}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400">
                  {row.month}
                </td>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(row.dueDate)}
                </td>
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {formatCurrency(row.emi)}
                </td>
                {/* Principal cell — blue fill shows how much of balance is cleared */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(row.principal / row.emi) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {formatCurrency(row.principal)}
                    </span>
                  </div>
                </td>
                {/* Interest cell — orange fill shows cost of borrowing */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{
                          width: `${(row.interest / row.emi) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-orange-500 whitespace-nowrap">
                      {formatCurrency(row.interest)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand / collapse toggle */}
      {duration > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Show all {duration} installments
            </>
          )}
        </button>
      )}
    </div>
  );
};
