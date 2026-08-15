const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Calculator server is running' });
});

/**
 * Calculate endpoint
 * POST /api/calculate
 * Body: { expression: "2+2" }
 * Response: { result: 4 } or { error: "message" }
 */
app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;

  // Validate input
  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Expression must be a non-empty string'
    });
  }

  try {
    // Sanitize: allow digits, operators, parentheses, dot, and whitespace
    if (!/^[0-9+\-*/%().\s]+$/.test(expression)) {
      return res.status(400).json({
        error: 'Invalid expression',
        message: 'Expression contains invalid characters'
      });
    }

    // Evaluate the expression safely
    const result = Function('"use strict"; return (' + expression + ')')();

    // Validate result
    if (typeof result !== 'number' || !isFinite(result)) {
      return res.status(400).json({
        error: 'Invalid result',
        message: 'Expression resulted in an invalid number'
      });
    }

    res.status(200).json({
      expression,
      result
    });
  } catch (error) {
    res.status(400).json({
      error: 'Calculation error',
      message: error.message || 'Failed to evaluate expression'
    });
  }
});

/**
 * Serve OpenAPI specification
 */
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});

/**
 * API documentation endpoint
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Calculator API',
    version: '1.0.0',
    description: 'REST API for calculator operations',
    baseUrl: `http://localhost:${PORT}`,
    endpoints: {
      health: '/health',
      calculate: '/api/calculate (POST)',
      docs: '/api/docs',
      openapi: '/openapi.yaml'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.path} not found`
  });
});

app.listen(PORT, () => {
  console.log(`Calculator server is running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`OpenAPI Spec: http://localhost:${PORT}/openapi.yaml`);
});

module.exports = app;