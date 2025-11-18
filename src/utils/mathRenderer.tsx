import katex from 'katex';

/**
 * Converts common text representations of math to LaTeX
 */
export function textToLatex(text: string): string {
  let latex = text;
  
  // Convert superscripts
  latex = latex.replace(/([a-zA-Z0-9]+)\^([0-9]+)/g, '$1^{$2}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁰/g, '$1^{0}');
  latex = latex.replace(/([a-zA-Z0-9]+)¹/g, '$1^{1}');
  latex = latex.replace(/([a-zA-Z0-9]+)²/g, '$1^{2}');
  latex = latex.replace(/([a-zA-Z0-9]+)³/g, '$1^{3}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁴/g, '$1^{4}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁵/g, '$1^{5}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁶/g, '$1^{6}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁷/g, '$1^{7}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁸/g, '$1^{8}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁹/g, '$1^{9}');
  latex = latex.replace(/([a-zA-Z0-9]+)⁻([0-9]+)/g, '$1^{-$2}');
  
  // Convert subscripts
  latex = latex.replace(/([a-zA-Z])_([0-9]+)/g, '$1_{$2}');
  
  // Convert division
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
