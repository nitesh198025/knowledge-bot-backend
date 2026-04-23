export type DomainRoute = {
  domain: "authorization" | "finance" | "unknown";
  namespace: string;
  reason: string;
};

export function detectDomainRoute(query: string): DomainRoute {
  const q = query.toLowerCase();

  const authKeywords = [
    "authorization",
    "authorisation",
    "permission",
    "permissions",
    "access",
    "role",
    "roles",
    "security",
    "user access",
    "cannot access",
    "access denied",
    "policy",
    "rule",
    "tcsec",
  ];

  const financeKeywords = [
    "finance",
    "invoice",
    "payment",
    "ledger",
    "gl",
    "general ledger",
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
  ];

  const authMatches = authKeywords.filter((k) => q.includes(k)).length;
  const financeMatches = financeKeywords.filter((k) => q.includes(k)).length;

  if (authMatches > financeMatches && authMatches > 0) {
    return {
      domain: "authorization",
      namespace: "auth-sop-v1",
      reason: `Matched ${authMatches} authorization keyword(s)`,
    };
  }

  if (financeMatches > authMatches && financeMatches > 0) {
    return {
      domain: "finance",
      namespace: "finance-sop-v1",
      reason: `Matched ${financeMatches} finance keyword(s)`,
    };
  }

  // Default fallback
  return {
    domain: "unknown",
    namespace: "auth-sop-v1",
    reason: "No strong match found, using default namespace",
  };
}