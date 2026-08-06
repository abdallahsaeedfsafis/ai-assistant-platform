/**
 * Cleans up stray LaTeX commands that the model sometimes emits outside
 * of proper $...$ delimiters, converting them to plain readable symbols.
 * Properly delimited math ($...$ or $$...$$) is left untouched so
 * remark-math/KaTeX can still render real equations correctly.
 */
export function sanitizeMathText(text) {
  const protectedBlocks = [];

  let cleaned = text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g, (match) => {
    protectedBlocks.push(match);
    return `__MATH_BLOCK_${protectedBlocks.length - 1}__`;
  });

  cleaned = cleaned
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\cdot/g, "×")
    .replace(/\\pm/g, "±")
    .replace(/\\neq/g, "≠")
    .replace(/\\geq/g, "≥")
    .replace(/\\leq/g, "≤")
    .replace(/\\approx/g, "≈")
    .replace(/\\infty/g, "∞")
    .replace(/\{,\}/g, ",")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1/$2)");

  cleaned = cleaned.replace(/__MATH_BLOCK_(\d+)__/g, (_, i) => protectedBlocks[Number(i)]);

  return cleaned;
}