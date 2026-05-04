'use strict';

const fs = require('fs');
const path = require('path');
const {
  scanPatch,
  buildSummaryComment,
  buildInlineComments,
} = require('../src/security-scanner');

function buildSyntheticPatch(filePath, content) {
  const lines = content.split('\n');
  const hunkHeader = `@@ -0,0 +1,${lines.length} @@`;
  const addedLines = lines.map((line) => `+${line}`).join('\n');
  return {
    filename: filePath,
    patch: `${hunkHeader}\n${addedLines}`,
  };
}

function main() {
  const relativeFile = 'test/vulnerable-example.js';
  const absoluteFile = path.resolve(process.cwd(), relativeFile);

  if (!fs.existsSync(absoluteFile)) {
    throw new Error(`Demo file not found: ${absoluteFile}`);
  }

  const content = fs.readFileSync(absoluteFile, 'utf8');
  const synthetic = buildSyntheticPatch(relativeFile, content);

  const findings = scanPatch(synthetic.filename, synthetic.patch);
  const inline = buildInlineComments(findings);

  console.log('Security Bot Local Demo');
  console.log('=======================');
  console.log(`Scanned file: ${relativeFile}`);
  console.log(`Findings: ${findings.length}`);
  console.log('');

  console.log('Summary Comment Preview');
  console.log('-----------------------');
  console.log(buildSummaryComment(findings));
  console.log('');

  console.log('Inline Comment Preview (first 5)');
  console.log('--------------------------------');
  inline.slice(0, 5).forEach((comment, index) => {
    console.log(`[${index + 1}] ${comment.path}:${comment.line}`);
    console.log(comment.body);
    console.log('');
  });

  if (findings.length === 0) {
    process.exitCode = 1;
    console.error('No findings detected in demo fixture. Expected vulnerable patterns were not matched.');
  }
}

try {
  main();
} catch (error) {
  console.error(`Demo scan failed: ${error.message}`);
  process.exitCode = 1;
}
