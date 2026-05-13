/**
 * Risk Score: 0-100 (higher = riskier)
 * Risk Levels: low (<30), medium (30-60), high (>60)
 */
const calculateRiskScore = (user, loanAmount) => {
  let score = 0;

  // Credit score factor (higher credit score = lower risk)
  if (user.creditScore >= 750) score += 0;
  else if (user.creditScore >= 650) score += 15;
  else if (user.creditScore >= 550) score += 30;
  else score += 50;

  // Missed payments factor
  if (user.missedPayments === 0) score += 0;
  else if (user.missedPayments <= 2) score += 15;
  else score += 35;

  // Loan frequency (too many loans = risky)
  if (user.totalLoansApplied <= 2) score += 0;
  else if (user.totalLoansApplied <= 5) score += 10;
  else score += 20;

  // Loan amount relative to history
  if (loanAmount <= 10000) score += 0;
  else if (loanAmount <= 50000) score += 5;
  else if (loanAmount <= 200000) score += 10;
  else score += 15;

  // Account age (older account = lower risk)
  const accountAgeMonths = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (accountAgeMonths >= 12) score -= 10;
  else if (accountAgeMonths >= 6) score -= 5;

  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel;
  if (finalScore < 30) riskLevel = 'low';
  else if (finalScore <= 60) riskLevel = 'medium';
  else riskLevel = 'high';

  // Suggested interest rate based on risk
  let suggestedRate;
  if (riskLevel === 'low') suggestedRate = 10;
  else if (riskLevel === 'medium') suggestedRate = 14;
  else suggestedRate = 18;

  return { riskScore: finalScore, riskLevel, suggestedRate };
};

module.exports = { calculateRiskScore };
