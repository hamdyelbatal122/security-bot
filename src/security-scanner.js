'use strict';

/**
 * Security Scanner — detects OWASP Top 10 patterns in code diffs.
 * Each rule has: id, severity, description, pattern (regex), and advice.
 */

const RULES = [
  // A01 — Broken Access Control
  {
    id: 'SEC001',
    severity: 'HIGH',
    category: 'Broken Access Control',
    description: 'Possible path traversal via unsanitized user input',
    pattern: /(\.\.[\/\\]){1,}/g,
    advice: 'Sanitize file paths and use `realpath()` / `Path.resolve()` with an allowlist of base directories.',
  },

  // A02 — Cryptographic Failures
  {
    id: 'SEC002',
    severity: 'CRITICAL',
    category: 'Cryptographic Failure',
    description: 'Hardcoded secret, password, or API key detected',
    pattern: /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*['"][^'"]{6,}['"]/gi,
    advice: 'Never hardcode credentials. Use environment variables or a secrets manager (e.g., `.env`, AWS Secrets Manager, Vault).',
  },
  {
    id: 'SEC003',
    severity: 'HIGH',
    category: 'Cryptographic Failure',
    description: 'Weak hashing algorithm (MD5 / SHA1) used',
    pattern: /\b(md5|sha1)\s*\(/gi,
    advice: 'Use a strong algorithm: `bcrypt`, `argon2` for passwords, or `SHA-256+` for digests.',
  },

  // A03 — Injection
  {
    id: 'SEC004',
    severity: 'CRITICAL',
    category: 'SQL Injection',
    description: 'Raw SQL query built with string concatenation or interpolation',
    pattern: /(?:query|execute|exec|raw)\s*\(\s*["'`][^"'`]*\$[^"'`]*["'`]/gi,
    advice: 'Use parameterized queries / prepared statements. Never interpolate user input directly into SQL.',
  },
  {
    id: 'SEC005',
    severity: 'CRITICAL',
    category: 'Command Injection',
    description: 'Shell command executed with potentially unsanitized input',
    pattern: /(?:exec|system|shell_exec|passthru|popen|proc_open|eval)\s*\(/gi,
    advice: 'Avoid shell execution. If required, use `escapeshellarg()` / `child_process.execFile()` with a fixed command and validated arguments.',
  },
  {
    id: 'SEC006',
    severity: 'HIGH',
    category: 'XSS',
    description: 'Possible XSS — unescaped output written to HTML',
    pattern: /(?:innerHTML|document\.write|outerHTML)\s*[+]?=/gi,
    advice: 'Use `textContent` instead of `innerHTML`, or sanitize with DOMPurify before inserting HTML.',
  },

  // A05 — Security Misconfiguration
  {
    id: 'SEC007',
    severity: 'MEDIUM',
    category: 'Security Misconfiguration',
    description: '`var_dump`, `dd()`, or debug output left in code',
    pattern: /\b(var_dump|print_r|console\.log|dd|dump)\s*\(/g,
    advice: 'Remove all debug output before committing to production branches.',
  },
  {
    id: 'SEC008',
    severity: 'HIGH',
    category: 'Security Misconfiguration',
    description: 'SSL/TLS certificate verification disabled',
    pattern: /(?:CURLOPT_SSL_VERIFYPEER|rejectUnauthorized|verify\s*=\s*False)/gi,
    advice: 'Never disable certificate verification in production. Use a valid certificate instead.',
  },

  // A07 — Identification & Authentication Failures
  {
    id: 'SEC009',
    severity: 'HIGH',
    category: 'Weak Authentication',
    description: 'Insecure random number generation for security-sensitive use',
    pattern: /\bMath\.random\(\)|rand\(\)|mt_rand\(\)/g,
    advice: 'Use a cryptographically secure RNG: `crypto.randomBytes()` (Node.js) or `random_bytes()` (PHP).',
  },

  // A09 — Security Logging & Monitoring Failures
  {
    id: 'SEC010',
    severity: 'MEDIUM',
    category: 'Sensitive Data Exposure',
    description: 'Sensitive data (password/token) potentially logged',
    pattern: /(?:log|logger|console)\s*\.?\s*(?:info|warn|error|debug|log)\s*\([^)]*(?:password|token|secret)[^)]*\)/gi,
    advice: 'Never log sensitive fields. Mask or omit credentials from log output.',
  },

  // A03 — Injection (Code)
  {
    id: 'SEC011',
    severity: 'CRITICAL',
    category: 'Code Injection',
    description: '`eval()` or `new Function()` used with dynamic input',
    pattern: /\beval\s*\(|new\s+Function\s*\(/gi,
    advice: 'Never use `eval()` or `new Function()`. Use safer alternatives like `JSON.parse()` for data parsing.',
  },

  // A10 — Server-Side Request Forgery (SSRF)
  {
    id: 'SEC012',
    severity: 'HIGH',
    category: 'SSRF',
    description: 'Unvalidated user-supplied URL passed to HTTP fetch/request',
    pattern: /(?:fetch|axios|request|http\.get|https\.get)\s*\(\s*(?:req\.|request\.|params\.|query\.|body\.)/gi,
    advice: 'Validate and whitelist URLs before making server-side HTTP requests. Use an allowlist of trusted domains.',
  },

  // A08 — Software and Data Integrity Failures
  {
    id: 'SEC013',
    severity: 'HIGH',
    category: 'Insecure Deserialization',
    description: 'Potentially unsafe object deserialization detected',
    pattern: /(?:unserialize|pickle\.loads|yaml\.load\s*\(|marshal\.loads)\s*\(/gi,
    advice: 'Avoid deserializing untrusted data. Use `yaml.safe_load()` instead of `yaml.load()`, and validate input before deserializing.',
  },

  // A03 — Injection (NoSQL)
  {
    id: 'SEC014',
    severity: 'CRITICAL',
    category: 'NoSQL Injection',
    description: 'Potential NoSQL injection — user input used directly in MongoDB query operator',
    pattern: /(?:find|findOne|updateOne|deleteOne|aggregate)\s*\(\s*\{[^}]*\$(?:where|gt|lt|ne|in|nin|regex|or|and)/gi,
    advice: 'Sanitize and validate all fields before using them in NoSQL queries. Use strict type checks and schema validation (e.g., Mongoose).',
  },
];

const SEVERITY_EMOJI = {
  CRITICAL: '🔴',
  HIGH:     '🟠',
  MEDIUM:   '🟡',
  LOW:      '🔵',
};

/**
 * Scan a single file's patch (diff) for security issues.
 * @param {string} filename
 * @param {string} patch — raw diff patch from GitHub API
 * @returns {Array<{rule, filename, line, code}>}
 */
function scanPatch(filename, patch) {
  if (!patch) return [];

  const findings = [];
  const lines = patch.split('\n');
  let lineNumber = 0;

  for (const line of lines) {
    // Track line numbers from diff hunks: @@ -a,b +c,d @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
    if (hunkMatch) {
      lineNumber = parseInt(hunkMatch[1], 10) - 1;
      continue;
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      lineNumber++;
      const codeLine = line.slice(1); // strip leading '+'

      for (const rule of RULES) {
        rule.pattern.lastIndex = 0; // reset regex state
        if (rule.pattern.test(codeLine)) {
          findings.push({
            rule,
            filename,
            line: lineNumber,
            code: codeLine.trim(),
          });
        }
      }
    } else if (!line.startsWith('-')) {
      lineNumber++;
    }
  }

  return findings;
}

/**
 * Build a formatted PR review comment body from findings.
 * @param {Array} findings
 * @returns {string}
 */
function buildSummaryComment(findings) {
  if (findings.length === 0) {
    return [
      '## ✅ Security Scan — No Issues Found',
      '',
      'No security vulnerabilities were detected in this pull request.',
      '',
      '> Scanned by **security-bot** · Powered by [OWASP Top 10](https://owasp.org/www-project-top-ten/)',
    ].join('\n');
  }

  const bySeverity = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
  for (const f of findings) {
    (bySeverity[f.rule.severity] || bySeverity.LOW).push(f);
  }

  const lines = [
    '## 🔐 Security Scan Report',
    '',
    `> **${findings.length} issue(s)** found in this pull request. Please review before merging.`,
    '',
  ];

  for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
    const items = bySeverity[severity];
    if (!items.length) continue;

    lines.push(`### ${SEVERITY_EMOJI[severity]} ${severity} (${items.length})`);
    lines.push('');

    for (const f of items) {
      lines.push(`**[${f.rule.id}] ${f.rule.description}**`);
      lines.push(`- **File:** \`${f.filename}\` — Line ${f.line}`);
      lines.push(`- **Category:** ${f.rule.category}`);
      lines.push(`- **Code:** \`${f.code.substring(0, 120)}\``);
      lines.push(`- **Fix:** ${f.rule.advice}`);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('> Scanned by **security-bot** · Powered by [OWASP Top 10](https://owasp.org/www-project-top-ten/)');

  return lines.join('\n');
}

/**
 * Build inline review comments (position-based) for each finding.
 * @param {Array} findings
 * @returns {Array<{path, position, body}>}
 */
function buildInlineComments(findings) {
  return findings.map(f => ({
    path: f.filename,
    line: f.line,
    body: [
      `${SEVERITY_EMOJI[f.rule.severity]} **[${f.rule.id}] ${f.rule.severity} — ${f.rule.description}**`,
      '',
      `**Category:** ${f.rule.category}`,
      `**Fix:** ${f.rule.advice}`,
    ].join('\n'),
  }));
}

module.exports = { scanPatch, buildSummaryComment, buildInlineComments, RULES };
