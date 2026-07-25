interface ExplanationInput {
  lawTested: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

const lawExplanations: Record<string, { rule: string; formula: string; description: string }> = {
  'Product of Powers': {
    rule: 'Product of Powers Rule',
    formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    description: 'When multiplying powers with the same base, add the exponents.',
  },
  'Quotient of Powers': {
    rule: 'Quotient of Powers Rule',
    formula: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ',
    description: 'When dividing powers with the same base, subtract the exponents.',
  },
  'Power of a Power': {
    rule: 'Power of a Power Rule',
    formula: '(aᵐ)ⁿ = aᵐⁿ',
    description: 'When raising a power to another power, multiply the exponents.',
  },
  'Zero Exponent Rule': {
    rule: 'Zero Exponent Rule',
    formula: 'a⁰ = 1 (a ≠ 0)',
    description: 'Any non-zero number raised to the power of 0 equals 1.',
  },
  'Negative Exponent Rule': {
    rule: 'Negative Exponent Rule',
    formula: 'a⁻ⁿ = 1/aⁿ',
    description: 'A negative exponent means take the reciprocal and make the exponent positive.',
  },
  'Power of a Product': {
    rule: 'Power of a Product Rule',
    formula: '(ab)ⁿ = aⁿbⁿ',
    description: 'When raising a product to a power, distribute the exponent to each factor.',
  },
  'Power of a Quotient': {
    rule: 'Power of a Quotient Rule',
    formula: '(a/b)ⁿ = aⁿ / bⁿ',
    description: 'When raising a quotient to a power, distribute the exponent to numerator and denominator.',
  },
  'Identity Exponent Rule': {
    rule: 'Identity Exponent Rule',
    formula: 'a¹ = a',
    description: 'Any number raised to the power of 1 remains itself.',
  },
};

export function generateExplanation(input: ExplanationInput): string {
  const lawInfo = lawExplanations[input.lawTested];
  if (!lawInfo) {
    return `The correct answer is ${input.correctAnswer}.`;
  }

  const isWordProblem = input.question.length > 60 && (
    input.question.toLowerCase().includes('scientist') ||
    input.question.toLowerCase().includes('computer') ||
    input.question.toLowerCase().includes('cube') ||
    input.question.toLowerCase().includes('bacteria') ||
    input.question.toLowerCase().includes('area') ||
    input.question.toLowerCase().includes('volume') ||
    input.question.toLowerCase().includes('how many') ||
    input.question.toLowerCase().includes('express')
  );

  let explanation = `${lawInfo.rule}: ${lawInfo.description}\nFormula: ${lawInfo.formula}`;

  if (isWordProblem) {
    explanation += '\n\nThis is a word problem — translate the context into a mathematical expression first, then apply the rule.';
  }

  explanation += `\nApplying this rule gives the correct answer: ${input.correctAnswer}.`;

  return explanation;
}
