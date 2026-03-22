const axios = require('axios');
const logger = require('../utils/logger');

class SolverService {
    constructor() {
        this.client = axios.create({
            baseURL: process.env.SOLVER_SERVICE_URL || 'http://localhost:8001/api/v1',
            timeout: 60000, // Solver can take time
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async generateTimetable(payload) {
        try {
            const response = await this.client.post('/timetable/generate', payload);
            return response.data;
        } catch (error) {
            this._handleError(error, 'Generate Timetable');
        }
    }

    async validateMove(context, currentSchedule, proposedEntry) {
        try {
            const response = await this.client.post('/timetable/validate-move', {
                context,
                current_schedule: currentSchedule,
                proposed_entry: proposedEntry
            });
            return response.data;
        } catch (error) {
            this._handleError(error, 'Validate Move');
        }
    }

    async getAISuggestions(context, currentSchedule, selectedEntry) {
        try {
            const response = await this.client.post('/timetable/get-suggestions', {
                context,
                current_schedule: currentSchedule,
                selected_entry: selectedEntry
            });
            return response.data;
        } catch (error) {
            this._handleError(error, 'Get AI Suggestions');
        }
    }

    _handleError(error, action) {
        if (error.response) {
            logger.error(`${action} failed with status ${error.response.status}:`, error.response.data);
            throw new Error(error.response.data.detail || `${action} failed`);
        } else if (error.request) {
            logger.error(`${action} service is unreachable`);
            throw new Error('Algorithm service is offline');
        } else {
            logger.error(`Error in ${action}:`, error.message);
            throw new Error('Internal solver communication error');
        }
    }
}

module.exports = new SolverService();