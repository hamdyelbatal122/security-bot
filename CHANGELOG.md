# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-04

### Added
- Initial release of security-bot GitHub App
- 14 OWASP Top 10 security detection rules (SEC001-SEC014)
- Inline PR review comments with actionable fix guidance
- Auto severity labeling: critical/high/medium/clean
- Branch protection setup for new repositories
- Welcome issue with workflow instructions on new repos
- Direct push alerts for critical/high findings
- GitHub Actions CI workflow for Node.js 18 & 20
- Comprehensive README with quick start guide
- CONTRIBUTING.md for community contributions
- SECURITY.md for vulnerability reporting
- CODE_OF_CONDUCT.md for community standards
- MIT License

### Features
- ✅ Zero configuration (mostly) — just install and go
- ✅ Automatic security scanning on PR open/update/reopen
- ✅ Branch protection with required PR reviews
- ✅ No code modification — read-only analysis
- ✅ Works on public and private repositories
- ✅ Fallback to individual PR comments if review API fails

---

For historical releases, see the [GitHub Releases](https://github.com/hamdyelbatal122/security-bot/releases).
