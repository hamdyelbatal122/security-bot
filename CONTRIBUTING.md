# Contributing to security-bot

Thank you for your interest in contributing! We welcome contributions from everyone.

## Code of Conduct

This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:

1. **Description**: What is the problem?
2. **Steps to Reproduce**: How can we reproduce it?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happened?
5. **Environment**: Node version, OS, etc.

### Suggesting Features

Have an idea? Open an issue with the `enhancement` label and describe:

1. **Problem**: What problem does this solve?
2. **Solution**: How should it work?
3. **Alternatives**: Any other approaches?

### Submitting Pull Requests

1. **Fork** the repository
2. **Branch**: Create a feature branch (`git checkout -b feat/your-feature`)
3. **Commit**: Use conventional commit messages:
   - `feat: add new security rule`
   - `fix: correct regex pattern`
   - `docs: update README`
   - `test: add unit tests`
4. **Push**: To your fork
5. **Pull Request**: Open a PR with a clear description
6. **Review**: Address feedback from maintainers
7. **Merge**: Once approved, your changes are merged!

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/security-bot.git
cd security-bot

# Add upstream remote
git remote add upstream https://github.com/hamdyelbatal122/security-bot.git

# Install dependencies
npm install

# Create .env
cp .env.example .env
# Fill in APP_ID, PRIVATE_KEY_PATH, WEBHOOK_SECRET

# Start development server
npm run dev
```

---

## Adding a New Security Rule

To add a new detection rule:

1. **Edit** `src/security-scanner.js`
2. **Add** a new rule object to the `RULES` array:

```javascript
{
  id: 'SEC015',
  severity: 'HIGH',               // CRITICAL, HIGH, MEDIUM, LOW
  category: 'Your Category',
  description: 'What you detect',
  pattern: /your-regex-here/gi,   // Must be global + case-insensitive
  advice: 'How to fix it',
},
```

3. **Test** by running `npm test` (if tests exist)
4. **Update** README.md with the new rule
5. **Commit** and open a PR

### Guidelines for Patterns

- Use **global** flag (`g`) for multiple matches
- Use **case-insensitive** flag (`i`) when appropriate
- Avoid overly broad patterns to reduce false positives
- Test with real-world code samples

---

## Code Style

- Use `'use strict'` at the top of files
- Use `const` instead of `var`
- Use `async/await` instead of callbacks
- Comment complex logic
- Use trailing semicolons

---

## Testing

```bash
# Run tests (if any)
npm test

# Lint code
npm run lint
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**
```
feat: add new NoSQL injection detection rule

- Detects MongoDB query operators in user input
- Covers find, findOne, updateOne, deleteOne, aggregate
- Includes advice to use strict type checks

Fixes #123
```

---

## Pull Request Process

1. Update documentation if needed
2. Ensure all changes are committed
3. Push to your fork
4. Open a PR with a clear title and description
5. Link related issues: `Fixes #123`
6. Wait for maintainer review
7. Address feedback
8. Once approved, we'll merge!

---

## Questions?

- 📖 Check [README.md](README.md)
- 🔗 Open an [issue](https://github.com/hamdyelbatal122/security-bot/issues)
- 💬 Start a [discussion](https://github.com/hamdyelbatal122/security-bot/discussions)

---

Thank you for contributing! 🎉
