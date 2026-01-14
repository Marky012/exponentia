import katex from 'katex';

/**
 * Map Unicode superscript characters to regular digits and symbols
 */
const superscriptMap: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
  'ⁿ': 'n', 'ⁱ': 'i', 'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c',
  'ᵈ': 'd', 'ᵉ': 'e', 'ᶠ': 'f', 'ᵍ': 'g', 'ʰ': 'h',
  'ʲ': 'j', 'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ᵒ': 'o',
  'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 'ᵘ': 'u',
  'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z'
};

/**
 * Map Unicode subscript characters to regular digits  
 */
const subscriptMap: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
  'ₐ': 'a', 'ₑ': 'e', 'ₕ': 'h', 'ᵢ': 'i', 'ⱼ': 'j',
  'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₒ': 'o',
  'ₚ': 'p', 'ᵣ': 'r', 'ₛ': 's', 'ₜ': 't', 'ᵤ': 'u',
  'ᵥ': 'v', 'ₓ': 'x'
};

// Characters that indicate math content
const superscriptChars = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᵃᵇᶜᵈᵉᶠᵍʰʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ';
const subscriptChars = '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ';
const mathSymbols = '×÷=+\\-*/()[]{}πΣ∏√';

/**
 * Check if a character is a superscript
 */
function isSuperscript(char: string): boolean {
  return superscriptChars.includes(char);
}

/**
 * Convert superscript characters to regular characters
 */
function convertSuperscripts(text: string): string {
  return text.split('').map(c => superscriptMap[c] || c).join('');
}

/**
 * Convert subscript characters to regular characters
 */
function convertSubscripts(text: string): string {
  return text.split('').map(c => subscriptMap[c] || c).join('');
}

/**
 * Converts common text representations of math to LaTeX
 * Preserves proper spacing in sentences while converting math notation
 */
export function textToLatex(text: string): string {
  // Split text preserving whitespace and punctuation
  const tokens = text.split(/(\s+|(?<=[.,?!:;])|(?=[.,?!:;]))/);
  let result = '';
  
  for (const token of tokens) {
    if (!token) continue;
    
    // If it's just whitespace, add a space in text mode
    if (/^\s+$/.test(token)) {
      result += '\\text{ }';
      continue;
    }
    
    // If it's just punctuation, add in text mode
    if (/^[.,?!:;]$/.test(token)) {
      result += `\\text{${token}}`;
      continue;
    }
    
    // Check if the token contains math characters
    const hasSuperscript = [...token].some(c => isSuperscript(c));
    const hasSubscript = [...token].some(c => subscriptChars.includes(c));
    const hasMathSymbol = [...token].some(c => mathSymbols.includes(c));
    const hasExponentNotation = /\d+[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]/.test(token) || /[a-z][⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]/i.test(token);
    
    const hasMath = hasSuperscript || hasSubscript || hasMathSymbol || hasExponentNotation;
    
    if (hasMath) {
      let latex = token;
      
      // Handle expressions with superscripts like 5ⁿ⁺² → 5^{n+2}
      latex = latex.replace(/([a-zA-Z0-9\)\]]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᵃᵇᶜᵈᵉᶠᵍʰʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (match, base, exp) => {
        const expConverted = convertSuperscripts(exp);
        return `${base}^{${expConverted}}`;
      });
      
      // Handle subscripts with Unicode (e.g., x₁ → x_{1})
      latex = latex.replace(/([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (match, base, sub) => {
        const subConverted = convertSubscripts(sub);
        return `${base}_{${subConverted}}`;
      });
      
      // Convert caret superscripts with expressions (e.g., x^{n+2})
      latex = latex.replace(/([a-zA-Z0-9\)\]]+)\^([a-zA-Z0-9+\-*/()]+)/g, '$1^{$2}');
      
      // Convert underscore subscripts
      latex = latex.replace(/([a-zA-Z])_([a-zA-Z0-9]+)/g, '$1_{$2}');
      
      // Convert fractions like 1/x³ to proper LaTeX fractions
      latex = latex.replace(/1\/([a-zA-Z])\^{([^}]+)}/g, '\\frac{1}{$1^{$2}}');
      
      // Convert division symbol
      latex = latex.replace(/÷/g, ' \\div ');
      
      // Handle fractions with parentheses like (a/b)
      latex = latex.replace(/\(([^\/\)]+)\/([^\)]+)\)/g, '\\left(\\frac{$1}{$2}\\right)');
      
      // Convert fractions with exponents
      latex = latex.replace(/([a-zA-Z0-9]+)\^{([^}]+)}\/([a-zA-Z0-9]+)\^{([^}]+)}/g, '\\frac{$1^{$2}}{$3^{$4}}');
      
      // Convert simple numeric fractions like 144/36
      latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
      
      // Convert simple variable fractions like a/b
      latex = latex.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, (match, num, den) => {
        if (match.includes('\\frac')) return match;
        return `\\frac{${num}}{${den}}`;
      });
      
      // Convert 1/x type fractions
      latex = latex.replace(/1\/([a-zA-Z0-9]+)/g, '\\frac{1}{$1}');
      
      // Convert multiplication symbol
      latex = latex.replace(/×/g, ' \\times ');
      
      result += latex;
    } else {
      // Regular text - wrap in \text{} for proper spacing
      result += `\\text{${token}}`;
    }
  }
  
  // Clean up empty text blocks
  result = result.replace(/\\text\{\}/g, '');
  // Merge adjacent text blocks for cleaner output
  result = result.replace(/\\text\{([^}]*)\}\\text\{ \}\\text\{([^}]*)\}/g, '\\text{$1 $2}');
  
  return result;
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
