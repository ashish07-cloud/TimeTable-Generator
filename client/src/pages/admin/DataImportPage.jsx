// client/src/pages/admin/DataImportPage.jsx

import React, { useState } from 'react';
import axios from 'axios';

// Assume you have a simple Button component
// import { Button } from '../../components/common/Button'; 

function DataImportPage() {
    const [file, setFile] = useState(null);
    const [dataType, setDataType] = useState('faculty'); // Default to faculty
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file first.');
            return;
        }
        setIsLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('dataType', dataType);

        try {
            // Your backend API endpoint for importing data
            const response = await axios.post('/api/v1/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data.message);
        } catch (error) {
            // Display server-side validation errors if available
            setMessage(error.response?.data?.message || 'An error occurred during import.');
            console.error('Import failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Import College Data</h2>
            <p>Select the type of data you want to import and upload the corresponding CSV file.</p>
            
            <select value={dataType} onChange={(e) => setDataType(e.target.value)} style={{ padding: '8px', marginRight: '10px' }}>
                <option value="faculty">Faculty Data (faculty.csv)</option>
                <option value="rooms">Rooms Data (rooms.csv)</option>
                <option value="sections">Sections Data (sections.csv)</option>
            </select>
            
            <input type="file" accept=".csv" onChange={handleFileChange} />
            
            <button onClick={handleUpload} disabled={isLoading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                {isLoading ? 'Uploading...' : 'Upload and Import'}
            </button>

            {message && <p style={{ marginTop: '15px' }}>{message}</p>}
        </div>
    );
}

export default DataImportPage;