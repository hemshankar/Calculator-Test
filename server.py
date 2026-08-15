"""
Calculator REST API Server using Flask
Provides endpoints for mathematical calculations
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import re
import os

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get('PORT', 3000))


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Calculator server is running'
    }), 200


@app.route('/api/calculate', methods=['POST'])
def calculate():
    """
    Calculate endpoint
    POST /api/calculate
    Body: { "expression": "2+2" }
    Response: { "result": 4 } or { "error": "message" }
    """
    data = request.get_json()
    
    # Validate input
    if not data or 'expression' not in data:
        return jsonify({
            'error': 'Invalid input',
            'message': 'Expression field is required'
        }), 400
    
    expression = data.get('expression')
    
    if not isinstance(expression, str) or not expression:
        return jsonify({
            'error': 'Invalid input',
            'message': 'Expression must be a non-empty string'
        }), 400
    
    try:
        # Sanitize: allow digits, operators, parentheses, dot, and whitespace
        if not re.match(r'^[0-9+\-*/%().\s]+$', expression):
            return jsonify({
                'error': 'Invalid expression',
                'message': 'Expression contains invalid characters'
            }), 400
        
        # Evaluate the expression safely
        result = eval(expression)
        
        # Validate result
        if not isinstance(result, (int, float)) or (isinstance(result, float) and not (-float('inf') < result < float('inf'))):
            return jsonify({
                'error': 'Invalid result',
                'message': 'Expression resulted in an invalid number'
            }), 400
        
        return jsonify({
            'expression': expression,
            'result': result
        }), 200
        
    except ZeroDivisionError:
        return jsonify({
            'error': 'Calculation error',
            'message': 'Division by zero'
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Calculation error',
            'message': str(e)
        }), 400


@app.route('/api/docs', methods=['GET'])
def docs():
    """API documentation endpoint"""
    return jsonify({
        'title': 'Calculator API',
        'version': '1.0.0',
        'description': 'REST API for calculator operations',
        'baseUrl': f'http://localhost:{PORT}',
        'endpoints': {
            'health': '/health',
            'calculate': '/api/calculate (POST)',
            'docs': '/api/docs',
            'openapi': '/openapi.yaml'
        }
    }), 200


@app.route('/openapi.yaml', methods=['GET'])
def openapi_spec():
    """Serve OpenAPI specification"""
    # Read the openapi.yaml file from the same directory
    try:
        with open('openapi.yaml', 'r') as f:
            return f.read(), 200, {'Content-Type': 'application/yaml'}
    except FileNotFoundError:
        return jsonify({
            'error': 'Not found',
            'message': 'OpenAPI specification not found'
        }), 404


@app.errorhandler(404)
def not_found(error):
    """404 handler"""
    return jsonify({
        'error': 'Not found',
        'message': f'Endpoint {request.path} not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """500 handler"""
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500


if __name__ == '__main__':
    print(f'Calculator server is running on http://localhost:{PORT}')
    print(f'API Documentation: http://localhost:{PORT}/api/docs')
    print(f'OpenAPI Spec: http://localhost:{PORT}/openapi.yaml')
    app.run(host='0.0.0.0', port=PORT, debug=True)
