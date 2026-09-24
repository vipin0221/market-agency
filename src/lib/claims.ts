const PATTERNS: RegExp[] = [
  /award[- ]winning/gi,
  /\bguaranteed\b/gi,
  /\bbest in\b/gi,
  /\bmarket leader\b/gi,
  /\bcustomers say\b/gi,
  /\btestimonial\b/gi,
  /\b5-star\b/gi,
  /\bfive-star\b/gi,
  /\b\d+(\.\d+)?%/g,
  /\b\d{1,3}(?:,\d{3})+\b/g,
];

export function corpusFrom(parts: string[]) {
  return parts.filter(Boolean).join("\n").toLowerCase();
}

export function findUnsourcedClaims(text: string, corpus: string) {
  const haystack = corpus.toLowerCase();
  const hits: string[] = [];
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const token = match[0];
      if (!haystack.includes(token.toLowerCase())) hits.push(token);
    }
  }
  return [...new Set(hits)];
}
