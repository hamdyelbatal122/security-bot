'use strict';

/**
 * Repository Automation — manages student repositories lifecycle.
 */

const BRANCH_PROTECTION = {
  required_status_checks: null,
  enforce_admins: false,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true,
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
};

const LABELS = [
  { name: 'security:critical', color: 'B60205', description: 'Critical security vulnerability' },
  { name: 'security:high',     color: 'E4E669', description: 'High severity security issue' },
  { name: 'security:medium',   color: 'FFA500', description: 'Medium severity security issue' },
  { name: 'security:clean',    color: '0E8A16', description: 'No security issues found' },
  { name: 'needs-review',      color: 'C5DEF5', description: 'Waiting for instructor review' },
  { name: 'assignment',        color: '7057FF', description: 'Student assignment' },
];

const WELCOME_ISSUE_TITLE = '👋 Welcome to the course repository!';

/**
 * Setup a newly created repository:
 * - Protect the default branch
 * - Create standard labels
 * - Open a welcome issue with instructions
 */
async function setupRepository(context) {
  const repo = context.repo();
  const octokit = context.octokit;

  context.log.info(`Setting up repository: ${repo.owner}/${repo.repo}`);

  // 1. Protect main/master branch
  try {
    await octokit.repos.updateBranchProtection({
      ...repo,
      branch: 'main',
      ...BRANCH_PROTECTION,
    });
    context.log.info('Branch protection applied to main');
  } catch {
    // Try master if main doesn't exist yet
    try {
      await octokit.repos.updateBranchProtection({
        ...repo,
        branch: 'master',
        ...BRANCH_PROTECTION,
      });
      context.log.info('Branch protection applied to master');
    } catch (err) {
      context.log.warn('Branch protection skipped (no default branch yet):', err.message);
    }
  }

  // 2. Create standard labels (ignore if already exists)
  for (const label of LABELS) {
    try {
      await octokit.issues.createLabel({ ...repo, ...label });
    } catch {
      // Label already exists — update it
      try {
        await octokit.issues.updateLabel({ ...repo, ...label });
      } catch { /* ignore */ }
    }
  }
  context.log.info('Labels created');

  // 3. Open welcome issue
  try {
    await octokit.issues.create({
      ...repo,
      title: WELCOME_ISSUE_TITLE,
      body: buildWelcomeBody(repo),
      labels: ['assignment'],
    });
    context.log.info('Welcome issue created');
  } catch (err) {
    context.log.warn('Could not create welcome issue:', err.message);
  }
}

/**
 * Add security labels to a PR based on scan findings.
 * @param {object} context
 * @param {number} pullNumber
 * @param {Array}  findings
 */
async function labelPullRequest(context, pullNumber, findings) {
  const repo = context.repo();

  // Remove old security labels first
  const securityLabels = LABELS.filter(l => l.name.startsWith('security:')).map(l => l.name);

  try {
    const { data: current } = await context.octokit.issues.listLabelsOnIssue({
      ...repo,
      issue_number: pullNumber,
    });
    const toRemove = current.map(l => l.name).filter(n => securityLabels.includes(n));
    for (const name of toRemove) {
      await context.octokit.issues.removeLabel({ ...repo, issue_number: pullNumber, name }).catch(() => {});
    }
  } catch { /* ignore */ }

  // Apply appropriate label
  let labelName = 'security:clean';
  if (findings.length > 0) {
    const severities = findings.map(f => f.rule.severity);
    if (severities.includes('CRITICAL'))    labelName = 'security:critical';
    else if (severities.includes('HIGH'))   labelName = 'security:high';
    else                                     labelName = 'security:medium';
  }

  await context.octokit.issues.addLabels({
    ...repo,
    issue_number: pullNumber,
    labels: [labelName],
  });
}

/**
 * Build the welcome issue body for a new student repo.
 */
function buildWelcomeBody(repo) {
  return `
## Welcome to \`${repo.repo}\`! 🎓

This repository is part of your course and is managed by **edu-security-bot**.

### What this bot does automatically:

| Feature | Description |
|---------|-------------|
| 🔐 **Security Scan** | Every Pull Request is scanned for OWASP Top 10 vulnerabilities |
| 🏷️ **Auto Labels** | PRs are labeled by security severity |
| 💬 **Inline Comments** | Security issues are commented directly on the affected lines |
| 🛡️ **Branch Protection** | The main branch is protected — changes require a PR |

### How to submit your work:

1. **Create a branch** for your work: \`git checkout -b feature/your-task\`
2. **Commit** your changes
3. **Open a Pull Request** — the security bot will scan your code automatically
4. **Fix** any flagged issues before requesting a review
5. **Request a review** from your instructor

### Security Rules Enforced:

- No hardcoded passwords or API keys
- No SQL injection patterns
- No command injection
- No weak hashing (MD5/SHA1)
- No disabled SSL verification
- No XSS vulnerabilities
- No debug output (\`var_dump\`, \`dd()\`, etc.)

---
> 🤖 Managed by **edu-security-bot** — [GitHub Developer Program](https://docs.github.com/en/developers)
`.trim();
}

module.exports = { setupRepository, labelPullRequest, LABELS, BRANCH_PROTECTION };
