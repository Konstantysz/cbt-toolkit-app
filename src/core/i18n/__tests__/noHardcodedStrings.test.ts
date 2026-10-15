/**
 * Guards issue #64: user-facing Polish strings must live in i18n files.
 * Fails on string literals in JSX text, user-facing JSX attributes, Alert.alert calls
 * and common user-facing object properties (title, text, body, ...).
 */
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

const SRC = path.resolve(__dirname, '../../..');
const HAS_LETTER = /\p{L}/u;
const POLISH_LETTER = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
const USER_FACING_ATTRS = new Set([
  'placeholder',
  'title',
  'label',
  'accessibilityLabel',
  'accessibilityHint',
  'accessibilityValue',
  'aria-label',
]);
const USER_FACING_PROPS = new Set([
  'title',
  'headerTitle',
  'text',
  'body',
  'message',
  'placeholder',
]);
// Files that legitimately contain Polish data rather than UI literals.
const EXCLUDED = [
  /[\\/]i18n[\\/]/,
  /[\\/]__tests__[\\/]/,
  /[\\/]migrations[\\/]/,
  /[\\/]theme[\\/]/, // color tokens (a `text` property is a color, not copy)
  /repository\.ts$/, // onboarding seed entries (stored data)
  /feelingsWheel\.ts$/, // emotion vocabulary (stored data)
  /bibliography\.tsx$/, // bibliographic citations (proper names and titles)
];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx?$/.test(e.name) && !EXCLUDED.some((r) => r.test(full)) ? [full] : [];
  });
}

function literalText(node: ts.Node | undefined): string | null {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map((s) => s.literal.text).join('');
  }
  if (ts.isJsxExpression(node)) return literalText(node.expression);
  return null;
}

function findViolations(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const out: string[] = [];
  const report = (node: ts.Node, what: string) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    out.push(`${path.relative(SRC, file)}:${line + 1} ${what}`);
  };
  const flag = (node: ts.Node, text: string | null, what: string) => {
    if (text !== null && HAS_LETTER.test(text)) report(node, `${what}: "${text.trim()}"`);
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) flag(node, node.text, 'JSX text');
    if (ts.isJsxExpression(node) && node.parent && ts.isJsxElement(node.parent)) {
      flag(node, literalText(node), 'JSX string expression');
    }
    if (ts.isJsxAttribute(node) && node.initializer && USER_FACING_ATTRS.has(node.name.getText())) {
      flag(node, literalText(node.initializer), `JSX attribute ${node.name.getText()}`);
    }
    if (ts.isCallExpression(node) && node.expression.getText() === 'Alert.alert') {
      node.arguments.slice(0, 2).forEach((a) => flag(a, literalText(a), 'Alert.alert argument'));
    }
    if (
      ts.isPropertyAssignment(node) &&
      USER_FACING_PROPS.has(node.name.getText()) &&
      !file.endsWith('.d.ts')
    ) {
      flag(node, literalText(node.initializer), `property ${node.name.getText()}`);
    }
    // Catch-all: Polish letters inside any string (HTML export templates, constants, ...)
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      if (POLISH_LETTER.test(node.text)) report(node, `Polish text: "${node.text.trim()}"`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return out;
}

describe('i18n: no hardcoded user-facing strings', () => {
  it('keeps every user-facing literal in the i18n files', () => {
    const violations = walk(SRC).flatMap(findViolations);
    expect(violations).toEqual([]);
  });

  it('detects a literal in JSX text and Alert.alert (self-check)', () => {
    const tmp = path.join(SRC, '__lint_fixture__.tsx');
    fs.writeFileSync(
      tmp,
      "export const A = () => <Text>Cześć</Text>;\nAlert.alert('Błąd', 'Ups');\n"
    );
    try {
      expect(findViolations(tmp).length).toBeGreaterThanOrEqual(3);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
