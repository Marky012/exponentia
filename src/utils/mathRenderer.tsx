import katex from 'katex';

/**
 * Converts common text representations of math to LaTeX
 */
export function textToLatex(text: string): string {
  let latex = text;
  
  // Map Unicode superscript digits to regular digits
  const superscriptMap: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
  };
  
  // Handle negative exponents with Unicode superscripts (e.g., x⁻³ → x^{-3})
  latex = latex.replace(/([a-zA-Z0-9\)]+)⁻([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, exp) => {
    const expDigits = exp.split('').map((c: string) => superscriptMap[c] || c).join('');
    return `${base}^{-${expDigits}}`;
  });
  
  // Handle positive exponents with Unicode superscripts (e.g., x² → x^{2})
  latex = latex.replace(/([a-zA-Z0-9\)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, exp) => {
    const expDigits = exp.split('').map((c: string) => superscriptMap[c] || c).join('');
    return `${base}^{${expDigits}}`;
  });
  
  // Convert caret superscripts (e.g., x^12 → x^{12})
  latex = latex.replace(/([a-zA-Z0-9]+)\^([0-9]+)/g, '$1^{$2}');
  latex = latex.replace(/([a-zA-Z0-9]+)\^-([0-9]+)/g, '$1^{-$2}');
  
  // Convert subscripts
  latex = latex.replace(/([a-zA-Z])_([0-9]+)/g, '$1_{$2}');
  
  // Convert division - handle fractions like a/b
  latex = latex.replace(/\//g, ' \\div ');
  
  // Convert multiplication
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
