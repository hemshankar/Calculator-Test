// Calculator UI with backend server integration
(() => {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');
  let expr = '';
  const API_URL = 'http://localhost:3000/api/calculate';

  const isOperator = (ch) => /^[+\-*/%]$/.test(ch);

  function updateDisplay(text) {
    display.textContent = text === '' ? '0' : text;
  }

  function appendValue(val) {
    if (isOperator(val)) {
      if (expr === '') {
        // allow leading minus
        if (val === '-') expr += val;
        return;
      }
      // avoid duplicate operators
      if (isOperator(expr.slice(-1))) {
        expr = expr.slice(0, -1) + val;
      } else {
        expr += val;
      }
    } else if (val === '.') {
      // prevent multiple decimals in current number
      const parts = expr.split(/[\+\-\*\/\%]/);
      const last = parts[parts.length - 1] || '';
      if (last.includes('.')) return;
      if (last === '') expr += '0.';
      else expr += '.';
    } else {
      expr += val;
    }
    updateDisplay(expr);
  }

  function clearAll() {
    expr = '';
    updateDisplay(expr);
  }

  function deleteLast() {
    expr = expr.slice(0, -1);
    updateDisplay(expr);
  }

  async function evaluateExpr() {
    if (expr === '') return;

    // Rudimentary sanitization: allow digits, operators, parentheses, dot, whitespace
    if (!/^[0-9+\-*/%().\s]+$/.test(expr)) {
      updateDisplay('Error');
      return;
    }

    try {
      // Send the expression to the backend server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expression: expr })
      });

      const data = await response.json();

      if (response.ok) {
        // Success: display the result
        expr = String(data.result);
        updateDisplay(expr);
      } else {
        // Error response from server
        console.error('Server error:', data.message);
        updateDisplay('Error');
        expr = '';
      }
    } catch (error) {
      // Network or other error
      console.error('Calculation error:', error);
      updateDisplay('Error');
      expr = '';
    }
  }

  // Button clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');
      if (action === 'clear') clearAll();
      else if (action === 'delete') deleteLast();
      else if (action === 'equals') evaluateExpr();
      else if (val) appendValue(val);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === '.') {
      appendValue(key);
      e.preventDefault();
      return;
    }
    if (key === 'Enter' || key === '=') {
      evaluateExpr();
      e.preventDefault();
      return;
    }
    if (key === 'Backspace') {
      deleteLast();
      e.preventDefault();
      return;
    }
    if (key === 'Delete' || key === 'Escape') {
      clearAll();
      e.preventDefault();
      return;
    }
    if (['+','-','*','/','%','(',')'].includes(key)) {
      appendValue(key);
      e.preventDefault();
      return;
    }
  });

  // Initialize and check server connection
  updateDisplay('');
  
  // Check if server is running
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression: '0' })
  }).catch(error => {
    console.warn('Calculator server is not running. Make sure to run "npm start" in the project directory.');
    console.warn('Fallback to local calculation mode.');
  });
})();
