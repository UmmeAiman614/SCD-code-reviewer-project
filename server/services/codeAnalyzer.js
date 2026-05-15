'use strict'

// ── Rules ─────────────────────────────────────────────────────────────────────
const LINE_RULES = [
  {
    id: 'no-console',
    severity: 'warning',
    test: l => /console\.(log|warn|info|debug)\s*\(/.test(l),
    msg:  (l, n) => `console.${l.match(/console\.(\w+)/)?.[1]} statement at line ${n}`,
    suggestion: 'Remove console statements in production. Use a logger (e.g. winston) instead.',
    code: `import logger from './logger';\nlogger.info('message');`,
  },
  {
    id: 'no-var',
    severity: 'warning',
    test: l => /^\s*var\s+\w/.test(l),
    msg:  (_, n) => `'var' declaration at line ${n} — use const or let`,
    suggestion: "Replace 'var' with 'const' (immutable) or 'let' (reassignable).",
    code: `const count = 0;\nlet mutable = 0;`,
  },
  {
    id: 'no-eval',
    severity: 'critical',
    test: l => /\beval\s*\(/.test(l),
    msg:  (_, n) => `Dangerous eval() at line ${n}`,
    suggestion: 'eval() is a serious security risk. Refactor to avoid dynamic code execution.',
  },
  {
    id: 'no-debugger',
    severity: 'critical',
    test: l => /^\s*debugger\b/.test(l),
    msg:  (_, n) => `debugger statement at line ${n}`,
    suggestion: 'Remove all debugger statements before committing.',
  },
  {
    id: 'no-hardcoded-secret',
    severity: 'critical',
    test: l => {
      const lower = l.toLowerCase()
      return /(password|secret|api_?key|token|private_?key)\s*[:=]\s*['"`][^'"`]{5,}['"`]/.test(lower)
          && !lower.includes('process.env') && !l.trim().startsWith('//')
    },
    msg:  (_, n) => `Possible hardcoded credential at line ${n}`,
    suggestion: 'Store secrets in environment variables. Never commit credentials to source code.',
    code: `const apiKey = process.env.API_KEY;`,
  },
  {
    id: 'eqeqeq',
    severity: 'warning',
    test: l => /[^=!<>]={2}[^=]/.test(l) && !/===/.test(l) && !/!==/.test(l),
    msg:  (_, n) => `Loose equality (==) at line ${n} — use ===`,
    suggestion: 'Always use strict equality (===) to avoid type coercion bugs.',
    code: `if (a === b) {}`,
  },
  {
    id: 'no-alert',
    severity: 'warning',
    test: l => /^\s*(alert|confirm|prompt)\s*\(/.test(l),
    msg:  (_, n) => `Browser dialog at line ${n} — replace with UI component`,
    suggestion: 'Native browser dialogs block the UI thread. Use modal components instead.',
  },
  {
    id: 'no-todo',
    severity: 'info',
    test: l => /\b(TODO|FIXME|HACK|XXX)\b/.test(l),
    msg:  (l, n) => `Unresolved ${l.match(/\b(TODO|FIXME|HACK|XXX)\b/)?.[1]} at line ${n}`,
    suggestion: 'Track this in your issue tracker instead of leaving inline comments.',
  },
  {
    id: 'no-magic-number',
    severity: 'info',
    test: l => {
      if (l.trim().startsWith('//') || /const|let|var/.test(l)) return false
      return /[^.\w\d-](?!0|1|-1)\d{2,}[^.\d\w]/.test(l)
    },
    msg:  (_, n) => `Magic number at line ${n}`,
    suggestion: 'Extract numeric literals into named constants for clarity.',
    code: `const MAX_RETRIES = 3;\nif (retries > MAX_RETRIES) {}`,
  },
  {
    id: 'no-single-letter-var',
    severity: 'info',
    test: l => !/^\s*for\s*\(/.test(l) && /\b(const|let|var)\s+([a-z])\s*=/.test(l),
    msg:  (l, n) => `Single-letter variable '${l.match(/(?:const|let|var)\s+([a-z])\s*=/)?.[1]}' at line ${n}`,
    suggestion: 'Use descriptive variable names to improve readability.',
  },
  {
    id: 'promise-no-catch',
    severity: 'warning',
    test: l => /\.then\s*\(/.test(l) && !/.catch\s*\(/.test(l),
    msg:  (_, n) => `Promise .then() without .catch() at line ${n}`,
    suggestion: 'Always handle promise rejections with .catch() or try/catch.',
    code: `fetch(url).then(r => r.json()).catch(err => console.error(err));`,
  },
  {
    id: 'no-callback-hell',
    severity: 'warning',
    test: l => { const m = l.match(/^(\s*)/); return m && m[1].length > 20 && /function|=>\s*\{/.test(l) },
    msg:  (_, n) => `Deeply nested callback at line ${n}`,
    suggestion: 'Flatten callbacks using async/await for better readability.',
  },
  {
    id: 'prefer-import',
    severity: 'info',
    test: l => /\brequire\s*\(['"`]/.test(l) && !l.trim().startsWith('//'),
    msg:  (_, n) => `CommonJS require() at line ${n} — prefer ES import`,
    suggestion: 'Use ES module imports for consistency.',
    code: `import fs from 'fs';`,
  },
  {
    id: 'no-throw-literal',
    severity: 'warning',
    test: l => /throw\s+['"`]|throw\s+\d/.test(l),
    msg:  (_, n) => `Throwing a literal value at line ${n}`,
    suggestion: 'Always throw Error objects so stack traces are available.',
    code: `throw new Error('Something went wrong');`,
  },
  {
    id: 'no-empty-catch',
    severity: 'warning',
    test: l => /catch\s*\(\s*\w+\s*\)\s*\{\s*\}/.test(l),
    msg:  (_, n) => `Empty catch block at line ${n}`,
    suggestion: 'Handle or at least log errors in catch blocks.',
  },
]

// ── Long function detection ───────────────────────────────
function detectLongFunctions(lines) {
  const issues = []
  const startPat = /^\s*(async\s+)?function\s+(\w+)|^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/
  let inFn = false, fnStart = 0, fnName = '', braces = 0, startDepth = 0

  lines.forEach((line, i) => {
    if (!inFn && startPat.test(line)) {
      inFn = true; fnStart = i + 1; startDepth = braces
      const m = line.match(/function\s+(\w+)/)
      fnName = m?.[1] || 'anonymous'
    }
    if (inFn) {
      braces += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
      if (braces <= startDepth && i > fnStart) {
        const len = i - fnStart + 1
        if (len > 50) {
          issues.push({ rule:'max-fn-length', severity:'warning', line: fnStart,
            message: `Function '${fnName}' is ${len} lines (max 50)`,
            suggestion: 'Break large functions into smaller single-responsibility functions.' })
        }
        inFn = false
      }
    }
  })
  return issues
}

// ── Main analyzer ─────────────────────────────────────────
function analyzeFile(content, filePath) {
  const lines  = content.split('\n')
  const issues = []

  lines.forEach((line, idx) => {
    const n = idx + 1
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*')) return

    for (const rule of LINE_RULES) {
      try {
        if (rule.test(line)) {
          issues.push({
            rule: rule.id, severity: rule.severity,
            message: rule.msg(line, n), file: filePath, line: n,
            suggestion: rule.suggestion || null, code: rule.code || null,
          })
          break
        }
      } catch {}
    }
  })

  issues.push(...detectLongFunctions(lines).map(i => ({ ...i, file: filePath })))
  return { issues, linesScanned: lines.length }
}

// ── Scoring ───────────────────────────────────────────────
function scoreCode(issues, lines) {
  if (!lines) return 10
  const W   = { critical: 3.5, warning: 1.2, info: 0.3 }
  const pen = issues.reduce((s, i) => s + (W[i.severity] || 0.3), 0)
  const raw = Math.max(0, 10 - (pen / Math.max(lines / 20, 1)))
  return Math.round(raw * 10) / 10
}

// ── Summary ───────────────────────────────────────────────
function summarize(issues, score, files) {
  const c = issues.filter(i => i.severity === 'critical').length
  const w = issues.filter(i => i.severity === 'warning').length
  const q = score >= 8 ? 'excellent' : score >= 6 ? 'good' : score >= 4 ? 'fair' : 'poor'
  let s = `Analyzed ${files} file${files !== 1 ? 's' : ''}. Quality is ${q} (${score}/10). `
  if (c) s += `⚠️ ${c} critical issue${c > 1 ? 's' : ''} need immediate attention. `
  if (w) s += `${w} warning${w > 1 ? 's' : ''} should be resolved. `
  if (!issues.length) s += '🎉 No issues detected — clean code!'
  return s.trim()
}

module.exports = { analyzeFile, scoreCode, summarize }
