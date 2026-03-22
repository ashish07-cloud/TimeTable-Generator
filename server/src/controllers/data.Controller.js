// server/src/controllers/dataController.js

const csv = require('csv-parser');
const fs = require('fs');
const Faculty = require('../models/Faculty'); // Your Mongoose/Sequelize model
const Room = require('../models/Room');
const Section = require('../models/Section');

exports.importData = async (req, res) => {
    if (!req.file || !req.body.dataType) {
        return res.status(400).json({ message: 'No file or data type specified.' });
    }

    const dataType = req.body.dataType;
    const records = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', async () => {
            try {
                // Use a switch to handle different data types
                switch (dataType) {
                    case 'faculty':
                        // 1. Validate and transform data before insertion
                        const facultyData = records.map(r => ({
                            faculty_id: r.faculty_id,
                            faculty_name: r.faculty_name,
                            department: r.department,
                            // CRITICAL: Split the comma-separated string into an array
                            subjects_can_teach: r.subjects_can_teach.split(',').map(s => s.trim()),
                        }));
                        // 2. Use bulk insert for efficiency. ordered: false attempts all inserts.
                        await Faculty.insertMany(facultyData, { ordered: false });
                        break;
                    
                    case 'rooms':
                        const roomData = records.map(r => ({
                            room_id: r.room_id,
                            room_name: r.room_name,
                            capacity: parseInt(r.capacity), // Ensure capacity is a number
                            room_type: r.room_type,
                        }));
                        await Room.insertMany(roomData, { ordered: false });
                        break;

                    case 'sections':
                        const sectionData = records.map(r => ({
                            section_id: r.section_id,
                            section_name: r.section_name,
                            course_id: r.course_id,
                            semester: parseInt(r.semester),
                            student_count: parseInt(r.student_count),
                        }));
                        await Section.insertMany(sectionData, { ordered: false });
                        break;

                    default:
                        // If dataType is unknown, send an error
                        fs.unlinkSync(filePath); // Clean up temp file
                        return res.status(400).json({ message: 'Invalid data type specified.' });
                }
                
                fs.unlinkSync(filePath); // 3. Clean up the temporary file
                res.status(200).json({ message: `${records.length} ${dataType} records imported successfully.` });

            } catch (error) {
                fs.unlinkSync(filePath); // Clean up temp file on error too
                console.error(`Error importing ${dataType}:`, error);
                res.status(500).json({ message: `Error importing ${dataType}. Check CSV format and data integrity.` });
            }
        });
};