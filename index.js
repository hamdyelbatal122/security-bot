'use strict';

const { scanPatch, buildSummaryComment, buildInlineComments } = require('./src/security-scanner');
const { setupRepository, labelPullRequest } = require('./src/repo-automation');

/**
 * Main Probot application entry point.
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info('security-bot is running 🚀');

  // ─────────────────────────────────────────────
  // EVENT 1: New repository created
  // → Setup branch protection, labels, welcome issue
  // ─────────────────────────────────────────────
  app.on('repository.created', async (context) => {
    await setupRepository(context);
  });

  // ─────────────────────────────────────────────
  // EVENT 2: Pull Request opened or new commits pushed
  // → Scan code diff for security vulnerabilities
  // → Post inline comments on affected lines
  // → Post a summary comment on the PR
  // → Apply security severity label
  // ─────────────────────────────────────────────
  app.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.reopened'], async (context) => {
    const pr = context.payload.pull_request;
    const repo = context.repo();

    app.log.info(`Scanning PR #${pr.number} in ${repo.owner}/${repo.repo}`);

    // 1. Fetch all changed files with their diffs
    const { data: files } = await context.octokit.pulls.listFiles({
      ...repo,
      pull_number: pr.number,
      per_page: 100,
    });

    // 2. Scan each file's patch
    const allFindings = [];
    for (const file of files) {
      if (!file.patch) continue; // binary or too large
      const findings = scanPatch(file.filename, file.patch);
      allFindings.push(...findings);
    }

    app.log.info(`Found ${allFindings.length} security issue(s) in PR #${pr.number}`);

    // 3. Post inline review comments on affected lines
    const inlineComments = buildInlineComments(allFindings);
    if (inlineComments.length > 0) {
      try {
        await context.octokit.pulls.createReview({
          ...repo,
          pull_number: pr.number,
          commit_id: pr.head.sha,
          event: allFindings.length > 0 ? 'REQUEST_CHANGES' : 'APPROVE',
          body: '🔐 **security-bot** — Security scan complete. See inline comments below.',
          comments: inlineComments.map(c => ({
            path: c.path,
            line: c.line,
            side: 'RIGHT',
            body: c.body,
          })),
        });
      } catch (err) {
        app.log.warn('Could not post review comments:', err.message);
        // Fallback: post as individual PR comments
        for (const comment of inlineComments) {
          await context.octokit.issues.createComment({
            ...repo,
            issue_number: pr.number,
            body: `**\`${comment.path}\` line ${comment.line}**\n\n${comment.body}`,
          }).catch(() => {});
        }
      }
    }

    // 4. Delete previous summary comment from this bot (if any)
    try {
      const { data: comments } = await context.octokit.issues.listComments({
        ...repo,
        issue_number: pr.number,
        per_page: 100,
      });
      const botComments = comments.filter(c =>
        c.user.type === 'Bot' &&
        c.body.includes('security-bot')
      );
      for (const c of botComments) {
        await context.octokit.issues.deleteComment({ ...repo, comment_id: c.id }).catch(() => {});
      }
    } catch { /* ignore */ }

    // 5. Post fresh summary comment
    await context.octokit.issues.createComment({
      ...repo,
      issue_number: pr.number,
      body: buildSummaryComment(allFindings),
    });

    // 6. Label the PR by severity
    await labelPullRequest(context, pr.number, allFindings);
  });

  // ─────────────────────────────────────────────
  // EVENT 3: Push directly to main/master
  // → Warn if sensitive patterns are detected
  // ─────────────────────────────────────────────
  app.on('push', async (context) => {
    const { ref, commits, repository } = context.payload;
    const defaultBranch = repository.default_branch;

    // Only scan direct pushes to the default branch
    if (ref !== `refs/heads/${defaultBranch}`) return;

    const repo = context.repo();
    const allFindings = [];

    for (const commit of commits) {
      // Fetch the commit diff
      try {
        const { data } = await context.octokit.repos.getCommit({
          ...repo,
          ref: commit.id,
        });
        for (const file of data.files || []) {
          if (!file.patch) continue;
          const findings = scanPatch(file.filename, file.patch);
          allFindings.push(...findings);
        }
      } catch { /* ignore individual commit errors */ }
    }

    if (allFindings.length === 0) return;

    // Create an issue alerting about the direct push with security issues
    const criticalOrHigh = allFindings.filter(f =>
      f.rule.severity === 'CRITICAL' || f.rule.severity === 'HIGH'
    );

    if (criticalOrHigh.length > 0) {
      await context.octokit.issues.create({
        ...repo,
        title: `🚨 Security issues detected in direct push to ${defaultBranch}`,
        body: [
          `**${criticalOrHigh.length} HIGH/CRITICAL security issue(s)** were detected in a direct push to \`${defaultBranch}\`.`,
          '',
          '> ⚠️ Direct pushes to the main branch bypass PR review. Please use Pull Requests.',
          '',
          buildSummaryComment(criticalOrHigh),
        ].join('\n'),
        labels: ['security:critical'],
      }).catch(() => {});
    }
  });
};
