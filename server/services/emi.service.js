/**
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * P = principal, r = monthly interest rate, n = months
 */
const calculateEMI = (principal, annualRate, durationMonths) => {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / durationMonths;
  const emi = (principal * r * Math.pow(1 + r, durationMonths)) /
              (Math.pow(1 + r, durationMonths) - 1);
  return Math.round(emi * 100) / 100;
};

const generateRepaymentSchedule = (principal, annualRate, durationMonths, startDate = new Date()) => {
  const emi = calculateEMI(principal, annualRate, durationMonths);
  const schedule = [];

  for (let i = 1; i <= durationMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      installmentNumber: i,
      amount: emi,
      dueDate,
      status: 'pending',
    });
  }
  return schedule;
};

module.exports = { calculateEMI, generateRepaymentSchedule };
