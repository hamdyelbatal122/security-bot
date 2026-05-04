'use strict';

const { scanPatch, buildSummaryComment, buildInlineComments } = require('./src/security-scanner');
const { setupRepository, labelPullRequest } = require('./src/repo-automation');
const eventBus = require('./src/event-bus');
const { createDashboardHandler } = require('./src/dashboard');
const pkg = require('./package.json');

/**
 * Main Probot application entry point.
 * @param {import('probot').Probot} app
 * @param {{ addHandler: function }} options
 */
module.exports = (app, { addHandler } = {}) => {
  app.log.info('security-bot is running 🚀');

  // ── Dashboard ──────────────────────────────────
  if (addHandler) {
    const port = process.env.PORT || '3000';
    const localBase = 'http://localhost:' + port;
    const publicBase = (process.env.APP_BASE_URL || '').replace(/\/$/, '');
    const connectUrl = 'https://github.com/settings/apps/new?manifest_url=' + localBase + '/api/github/app-manifest';
    const publicConnectUrl = publicBase
      ? 'https://github.com/settings/apps/new?manifest_url=' + publicBase + '/api/github/app-manifest'
      : '';

    addHandler(createDashboardHandler({
      appId: process.env.APP_ID || '',
      port,
      webhookProxyUrl: process.env.WEBHOOK_PROXY_URL || '',
      connectUrl,
      publicConnectUrl,
    }));
    app.log.info('Dashboard available at http://localhost:' + port + '/dashboard');
  }

  eventBus.emit('bot.started', { version: pkg.version });

  // ─────────────────────────────────────────────
  // EVENT 1: New repository created
  // → Setup branch protection, labels, welcome issue
  // ─────────────────────────────────────────────
  app.on('repository.created', async (context) => {
    await setupRepository(context);
    eventBus.emit('repo.setup', { repo: context.payload.repository.full_name });
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
    const prId = pr.number;
    const repoName = repo.owner + '/' + repo.repo;

    try {
    app.log.info(`Scanning PR #${prId} in ${repoName}`);
    eventBus.emit('scan.started', { pr: prId, repo: repoName });

    // 1. Fetch all changed files with their diffs
    const { data: files } = await context.octokit.rest.pulls.listFiles({
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

    // Emit individual findings to dashboard
    for (const f of allFindings) {
      eventBus.emit('scan.finding', {
        pr: prId,
        repo: repoName,
        ruleId: f.rule.id,
        severity: f.rule.severity,
        description: f.rule.description,
        filename: f.filename,
        line: f.line,
        code: f.code,
      });
    }

    // 3. Post inline review comments on affected lines
    const inlineComments = buildInlineComments(allFindings);
    if (inlineComments.length > 0) {
      try {
        await context.octokit.rest.pulls.createReview({
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
          await context.octokit.rest.issues.createComment({
            ...repo,
            issue_number: pr.number,
            body: `**\`${comment.path}\` line ${comment.line}**\n\n${comment.body}`,
          }).catch(() => {});
        }
      }
    }

    // 4. Delete previous summary comment from this bot (if any)
    try {
      const { data: comments } = await context.octokit.rest.issues.listComments({
        ...repo,
        issue_number: pr.number,
        per_page: 100,
      });
      const botComments = comments.filter(c =>
        c.user.type === 'Bot' &&
        c.body.includes('security-bot')
      );
      for (const c of botComments) {
        await context.octokit.rest.issues.deleteComment({ ...repo, comment_id: c.id }).catch(() => {});
      }
    } catch { /* ignore */ }

    // 5. Post fresh summary comment
    await context.octokit.rest.issues.createComment({
      ...repo,
      issue_number: pr.number,
      body: buildSummaryComment(allFindings),
    });

    // 6. Label the PR by severity
    await labelPullRequest(context, pr.number, allFindings);

    // Determine applied label for dashboard
    const severities = allFindings.map(f => f.rule.severity);
    let appliedLabel = 'security:clean';
    if (severities.includes('CRITICAL'))  appliedLabel = 'security:critical';
    else if (severities.includes('HIGH')) appliedLabel = 'security:high';
    else if (allFindings.length > 0)      appliedLabel = 'security:medium';

    eventBus.emit('scan.completed', { pr: prId, repo: repoName, count: allFindings.length, label: appliedLabel });

    } catch (err) {
      app.log.error('PR scan failed: ' + (err && err.message) + ' | ' + (err && err.stack));
      eventBus.emit('scan.error', { pr: prId, repo: repoName, message: err && err.message });
    }
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
        const { data } = await context.octokit.rest.repos.getCommit({
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
      await context.octokit.rest.issues.create({
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

    eventBus.emit('push.scanned', {
      repo: repo.owner + '/' + repo.repo,
      branch: defaultBranch,
      count: allFindings.length,
    });
  });
};
