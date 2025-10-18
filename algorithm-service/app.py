# algorithm-service/app.py

from flask import Flask, request, jsonify
from core.solver import TimetableSolver
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    """Receives data, runs the solver, and returns the timetable."""
    if not request.json or 'data' not in request.json:
        return jsonify({'status': 'error', 'message': 'Invalid request format. Missing "data" key.'}), 400
    
    data = request.json.get('data')
    logging.info("Received data for timetabling.")
    
    try:
        # Step 1: Initialize the Solver with all the data
        solver = TimetableSolver(
            subjects=data.get('subjects', []),
            faculty=data.get('faculty', []),
            rooms=data.get('rooms', []),
            sections=data.get('sections', [])
            # You would also pass time slots here if they are dynamic
        )
        
        # Step 2: Run the main algorithm
        logging.info("Starting the solver...")
        solution = solver.solve()
        
        if solution:
            logging.info("Solution found successfully.")
            return jsonify({'status': 'success', 'timetable': solution})
        else:
            logging.warning("Solver finished but could not find a valid solution.")
            return jsonify({'status': 'failure', 'message': 'Could not find a conflict-free schedule with the given constraints.'}), 422 # Unprocessable Entity

    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Use a different port than your Node.js server
    app.run(port=5001, debug=True)