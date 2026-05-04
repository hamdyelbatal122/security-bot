// ⚠️ هذا ملف للاختبار فقط — يحتوي على ثغرات أمنية مقصودة
// يُستخدم لاختبار security-bot

const mysql = require('mysql');
const express = require('express');
const app = express();

// SEC001 - SQL Injection: استخدام مدخلات المستخدم مباشرة في query
app.get('/user', (req, res) => {
  const id = req.query.id;
  const query = "SELECT * FROM users WHERE id = '" + id + "'";
  connection.query(query, (err, results) => {
    res.json(results);
  });
});

// SEC002 - XSS: إدخال HTML مباشرة بدون sanitization
app.get('/hello', (req, res) => {
  const name = req.query.name;
  res.send('<h1>Hello ' + name + '</h1>');
});

// SEC003 - Hardcoded credentials
const DB_PASSWORD = "admin123";
const API_SECRET = "supersecret_api_key_12345";

// SEC004 - Command Injection
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec('ping -c 1 ' + host, (err, stdout) => {
    res.send(stdout);
  });
});

// SEC011 - Dangerous eval
app.post('/calculate', (req, res) => {
  const expression = req.body.expr;
  const result = eval(expression);
  res.json({ result });
});

// SEC008 - Path Traversal
const fs = require('fs');
app.get('/file', (req, res) => {
  const filename = req.query.name;
  const content = fs.readFileSync('/var/data/' + filename);
  res.send(content);
});
// trigger webhook
// re-trigger Mon May  4 09:46:42 AM EEST 2026
// final trigger Mon May  4 09:48:30 AM EEST 2026
