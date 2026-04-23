export type DomainValidationResult = {
  isMatch: boolean;
  detectedDomain: "technical" | "finance" | "unknown";
  reason: string;
};

export function validateQueryAgainstDomain(
  query: string,
  selectedDomain: "technical" | "finance"
): DomainValidationResult {
  const q = query.toLowerCase();

  const technicalKeywords = [
    "authorization",
    "authorisation",
    "permission",
    "permissions",
    "access",
    "access denied",
    "user access",
    "security",
    "role",
    "roles",
    "policy",
    "rule",
    "tcsec",
    "cannot access",
    "login issue",
  ];

  const financeKeywords = [
    "finance",
    "invoice",
    "payment",
    "ledger",
    "general ledger",
    "gl",
    "journal",
    "posting",
    "voucher",
    "tax",
    "credit note",
    "debit note",
    "accounting",
    "accounts payable",
    "accounts receivable",
    "ap",
    "ar",
    "reconciliation",
    "bank",
    "cash",
    "fiscal",
    "month end",
    "month-end",
    "trial balance",
  ];

  const technicalMatches = technicalKeywords.filter((k) => q.includes(k)).length;
  const financeMatches = financeKeywords.filter((k) => q.includes(k)).length;

  let detectedDomain: "technical" | "finance" | "unknown" = "unknown";
  let reason = "No strong domain keywords found";

  if (technicalMatches > financeMatches && technicalMatches > 0) {
    detectedDomain = "technical";
    reason = `Matched ${technicalMatches} technical keyword(s)`;
  } else if (financeMatches > technicalMatches && financeMatches > 0) {
    detectedDomain = "finance";
    reason = `Matched ${financeMatches} finance keyword(s)`;
  }

  if (detectedDomain === "unknown") {
    return {
      isMatch: true,
      detectedDomain,
      reason,
    };
  }

  return {
    isMatch: detectedDomain === selectedDomain,
    detectedDomain,
    reason,
  };
}