import katex from 'katex';

/**
 * Map Unicode superscript characters to regular digits
 */
const superscriptMap: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
};

/**
 * Map Unicode subscript characters to regular digits  
 */
const subscriptMap: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
};

/**
 * Converts common text representations of math to LaTeX
 */
export function textToLatex(text: string): string {
  let latex = text;
  
  // Handle negative exponents with Unicode superscripts (e.g., x⁻³ → x^{-3}, x⁻¹² → x^{-12})
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)⁻([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, exp) => {
    const expDigits = exp.split('').map((c: string) => superscriptMap[c] || c).join('');
    return `${base}^{-${expDigits}}`;
  });
  
  // Handle positive exponents with Unicode superscripts (e.g., x² → x^{2}, x¹² → x^{12})
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, exp) => {
    const expDigits = exp.split('').map((c: string) => superscriptMap[c] || c).join('');
    return `${base}^{${expDigits}}`;
  });
  
  // Handle subscripts with Unicode (e.g., x₁ → x_{1})
  latex = latex.replace(/([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉]+)/g, (match, base, sub) => {
    const subDigits = sub.split('').map((c: string) => subscriptMap[c] || c).join('');
    return `${base}_{${subDigits}}`;
  });
  
  // Convert caret superscripts with negative (e.g., x^-12 → x^{-12})
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)\^-([0-9]+)/g, '$1^{-$2}');
  
  // Convert caret superscripts (e.g., x^12 → x^{12})
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)\^([0-9]+)/g, '$1^{$2}');
  
  // Convert underscore subscripts
  latex = latex.replace(/([a-zA-Z])_([0-9]+)/g, '$1_{$2}');
  
  // Convert fractions like 1/x³ to proper LaTeX fractions
  latex = latex.replace(/1\/([a-zA-Z])\^{([^}]+)}/g, '\\frac{1}{$1^{$2}}');
  
  // Convert division symbol and slash for display
  latex = latex.replace(/÷/g, ' \\div ');
  
  // Handle fractions with parentheses like (a/b)
  latex = latex.replace(/\(([^\/\)]+)\/([^\)]+)\)/g, '\\left(\\frac{$1}{$2}\\right)');
  
  // Convert fractions with exponents like 12^{2}/6^{2} or a^{2}/b^{2}
  latex = latex.replace(/([a-zA-Z0-9]+)\^{([^}]+)}\/([a-zA-Z0-9]+)\^{([^}]+)}/g, '\\frac{$1^{$2}}{$3^{$4}}');
  
  // Convert simple numeric fractions like 144/36
  latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
  
  // Convert simple variable fractions like a/b (not already converted)
  latex = latex.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, (match, num, den) => {
    // Don't convert if already in a frac
    if (match.includes('\\frac')) {
      return match;
    }
    return `\\frac{${num}}{${den}}`;
  });
  
  // Convert 1/x type fractions
  latex = latex.replace(/1\/([a-zA-Z0-9]+)/g, '\\frac{1}{$1}');
  
  // Convert multiplication symbol
  latex = latex.replace(/×/g, ' \\times ');
  
  return latex;
}

/**
 * Renders a mathematical expression using KaTeX
 */
export function renderMath(expression: string, displayMode: boolean = false): string {
  try {
    const latex = textToLatex(expression);
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch (error) {
    console.error('Error rendering math:', error);
    return expression;
  }
}

/**
 * Component to render math inline
 */
export const MathText = ({ children, className = '' }: { children: string; className?: string }) => {
  const html = renderMath(children, false);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

/**
 * Component to render math in display mode (centered, larger)
 */
export const MathDisplay = ({ children, className = '' }: { children: string; className?: string }) => {
  const html = renderMath(children, true);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
