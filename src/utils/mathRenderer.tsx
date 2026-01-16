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
const mathOperators = '×÷±∓·∗∘∙√∛∜∝∞≈≠≡≤≥≪≫∈∉⊂⊃⊆⊇∩∪∅∀∃∄∇∂∫∬∭∮∑∏πΣ∏';

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
 * Check if a token contains math characters that need KaTeX rendering
 */
function containsMath(token: string): boolean {
  // Check for superscripts (Unicode or caret notation)
  if ([...token].some(c => superscriptChars.includes(c))) return true;
  // Check for subscripts
  if ([...token].some(c => subscriptChars.includes(c))) return true;
  // Check for math operators
  if ([...token].some(c => mathOperators.includes(c))) return true;
  // Check for caret exponent notation like x^2
  if (/\^/.test(token)) return true;
  // Check for fractions like a/b when both are alphanumeric
  if (/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/.test(token)) return true;
  
  return false;
}

/**
 * Convert a math token to LaTeX
 */
function tokenToLatex(token: string): string {
  let latex = token;
  
  // Step 1: Handle expressions with Unicode superscripts like 5ⁿ⁺² → 5^{n+2}
  // Also handle cases like a³/8 where the superscript is attached to the base
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᵃᵇᶜᵈᵉᶠᵍʰʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (match, base, exp) => {
    const expConverted = convertSuperscripts(exp);
    return `${base}^{${expConverted}}`;
  });
  
  // Step 2: Handle subscripts with Unicode (e.g., x₁ → x_{1})
  latex = latex.replace(/([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (match, base, sub) => {
    const subConverted = convertSubscripts(sub);
    return `${base}_{${subConverted}}`;
  });
  
  // Step 3: Convert caret superscripts with expressions (e.g., x^{n+2})
  latex = latex.replace(/([a-zA-Z0-9\)\]]+)\^([a-zA-Z0-9+\-*/()]+)/g, '$1^{$2}');
  
  // Step 4: Convert underscore subscripts
  latex = latex.replace(/([a-zA-Z])_([a-zA-Z0-9]+)/g, '$1_{$2}');
  
  // Step 5: Convert division symbol early
  latex = latex.replace(/÷/g, '\\div');
  
  // Step 6: Handle fractions with parentheses like (a/b) or (6/2)³
  // Must come before simple fraction conversion
  latex = latex.replace(/\(([^\/\(\)]+)\/([^\(\)]+)\)(\^{[^}]+})?/g, (match, num, den, exp) => {
    if (exp) {
      return `\\left(\\frac{${num}}{${den}}\\right)${exp}`;
    }
    return `\\left(\\frac{${num}}{${den}}\\right)`;
  });
  
  // Step 7: Convert fractions where numerator has exponent like a³/8 or x²/y³
  latex = latex.replace(/([a-zA-Z0-9]+)\^{([^}]+)}\/([a-zA-Z0-9]+)(\^{([^}]+)})?/g, (match, num, numExp, den, denWithExp, denExp) => {
    if (denExp) {
      return `\\frac{${num}^{${numExp}}}{${den}^{${denExp}}}`;
    }
    return `\\frac{${num}^{${numExp}}}{${den}}`;
  });
  
  // Step 8: Convert fractions where only denominator has exponent like 1/x³
  latex = latex.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\^{([^}]+)}/g, '\\frac{$1}{$2^{$3}}');
  
  // Step 9: Convert simple numeric fractions like 144/36 or 216/8
  // But not if already converted to \frac
  if (!latex.includes('\\frac')) {
    latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
  }
  
  // Step 10: Convert simple variable fractions like a/b, 1/m, 2a/b
  // But not if already converted to \frac
  if (!latex.includes('\\frac')) {
    latex = latex.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
  }
  
  // Step 11: Handle remaining 1/x type fractions that weren't caught
  if (!latex.includes('\\frac')) {
    latex = latex.replace(/1\/([a-zA-Z0-9]+)/g, '\\frac{1}{$1}');
  }
  
  // Step 12: Convert multiplication symbol
  latex = latex.replace(/×/g, '\\times');
  
  return latex;
}

/**
 * Renders a mathematical expression, mixing regular text with KaTeX-rendered math
 * This preserves proper spacing between words
 */
export function renderMathMixed(text: string): string {
  // Split into tokens: words, punctuation, and whitespace preserved
  const parts: string[] = [];
  let currentPart = '';
  let inMath = false;
  
  // Simple tokenization: split by spaces while keeping spaces
  const tokens = text.split(/(\s+)/);
  
  for (const token of tokens) {
    // If it's just whitespace, add it directly
    if (/^\s+$/.test(token)) {
      parts.push(token);
      continue;
    }
    
    // Check if this token contains math
    if (containsMath(token)) {
      // Handle punctuation attached to math (e.g., "5ⁿ,")
      const punctuationMatch = token.match(/^(.+?)([.,?!:;]+)$/);
      if (punctuationMatch) {
        const [, mathPart, punctuation] = punctuationMatch;
        try {
          const latex = tokenToLatex(mathPart);
          const html = katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
            output: 'html',
          });
          parts.push(html + punctuation);
        } catch (error) {
          parts.push(token);
        }
      } else {
        try {
          const latex = tokenToLatex(token);
          const html = katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
            output: 'html',
          });
          parts.push(html);
        } catch (error) {
          parts.push(token);
        }
      }
    } else {
      // Regular text - just add it (preserve as-is including punctuation)
      parts.push(token);
    }
  }
  
  return parts.join('');
}

/**
 * Renders a mathematical expression using KaTeX (for display mode - full equations)
 */
export function renderMath(expression: string, displayMode: boolean = false): string {
  if (displayMode) {
    // For display mode, convert entire expression to LaTeX
    try {
      let latex = expression;
      
      // Handle expressions with superscripts
      latex = latex.replace(/([a-zA-Z0-9\)\]]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᵃᵇᶜᵈᵉᶠᵍʰʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+)/g, (match, base, exp) => {
        const expConverted = convertSuperscripts(exp);
        return `${base}^{${expConverted}}`;
      });
      
      // Handle subscripts
      latex = latex.replace(/([a-zA-Z])([₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ]+)/g, (match, base, sub) => {
        const subConverted = convertSubscripts(sub);
        return `${base}_{${subConverted}}`;
      });
      
      // Convert operators
      latex = latex.replace(/×/g, '\\times');
      latex = latex.replace(/÷/g, '\\div');
      
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
    } catch (error) {
      console.error('Error rendering math:', error);
      return expression;
    }
  }
  
  // For inline mode, use the mixed renderer that preserves text spacing
  return renderMathMixed(expression);
}

/**
 * Component to render math inline - preserves text spacing while rendering math expressions
 */
export const MathText = ({ children, className = '' }: { children: string; className?: string }) => {
  const html = renderMathMixed(children);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

/**
 * Component to render math in display mode (centered, larger)
 */
export const MathDisplay = ({ children, className = '' }: { children: string; className?: string }) => {
  const html = renderMath(children, true);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
