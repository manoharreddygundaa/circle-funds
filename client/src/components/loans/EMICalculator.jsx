import { useState, useMemo } from 'react';
import { calcEMI, formatCurrency } from '../../utils/formatCurrency';
import { RepaymentScheduleTable } from './RepaymentScheduleTable';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * EMI Calculator — interactive component with live recalculation.
 *
 * Can be used in two modes:
 *  1. Standalone (on Apply Loan page) — shows output only
 *  2. Embedded (with onApply callback) — "Apply with these values" button
 */
export const EMICalculator = ({ onApply, defaultAmount, defaultDuration, defaultRate }) => {
  const [amount, setAmount]     = useState(defaultAmount   ?? 50000);
  const [duration, setDuration] = useState(defaultDuration ?? 12);
  const [rate, setRate]         = useState(defaultRate     ?? 14);
  const [showSchedule, setShowSchedule] = useState(false);

  // useMemo prevents recalculating on every render, only when inputs change
  const { emi, totalPayable, totalInterest } = useMemo(() => {
    const emi = calcEMI(amount, rate, duration);
    const totalPayable = Math.round(emi * duration * 100) / 100;
    const totalInterest = Math.round((totalPayable - amount) * 100) / 100;
    return { emi, totalPayable, totalInterest };
  }, [amount, duration, rate]);

  const interestPercent = Math.round((totalInterest / totalPayable) * 100);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">EMI Calculator</h3>
      </div>

      <div className="space-y-6">
        {/* Loan Amount Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Loan Amount</label>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={500000}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>₹1K</span>
            <span>₹5L</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Duration</label>
            <span className="text-sm font-bold text-blue-600">{duration} months</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 mo</span>
            <span>60 mo</span>
          </div>
        </div>

        {/* Interest Rate Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Interest Rate (p.a.)</label>
            <span className="text-sm font-bold text-blue-600">{rate}%</span>
          </div>
          <input
            type="range"
            min={6}
            max={30}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>6%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 mb-1">Monthly EMI</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(emi)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Principal</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(amount)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Total Interest</p>
            <p className="font-semibold text-orange-500">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Total Repayable</p>
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              {formatCurrency(totalPayable)}
            </p>
          </div>
        </div>

        {/* Visual split bar: principal vs interest */}
        <div className="mt-3">
          <div className="flex rounded-full overflow-hidden h-2">
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${100 - interestPercent}%` }}
            />
            <div
              className="bg-orange-400 transition-all duration-300"
              style={{ width: `${interestPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
              Principal {100 - interestPercent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-400 rounded-full inline-block" />
              Interest {interestPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Schedule toggle */}
      <button
        type="button"
        onClick={() => setShowSchedule((v) => !v)}
        className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border border-dashed border-gray-200 dark:border-gray-700"
      >
        {showSchedule ? (
          <><ChevronUp className="w-3.5 h-3.5" /> Hide repayment schedule</>
        ) : (
          <><ChevronDown className="w-3.5 h-3.5" /> View repayment schedule</>
        )}
      </button>

      {showSchedule && (
        <RepaymentScheduleTable amount={amount} rate={rate} duration={duration} />
      )}

      {/* Optional apply button */}
      {onApply && (
        <button
          type="button"
          onClick={() => onApply({ amount, duration, interestRate: rate })}
          className="btn-primary w-full mt-4 text-sm"
        >
          Apply with these values
        </button>
      )}
    </div>
  );
};
