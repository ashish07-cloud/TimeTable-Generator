const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const db = {};
db.sequelize = sequelize;

// Import Models
db.User = require('./user.model')(sequelize, DataTypes);
db.Subject = require('./subject.model')(sequelize, DataTypes);
db.Faculty = require('./faculty.model')(sequelize, DataTypes);
db.Room = require('./room.model')(sequelize, DataTypes);
db.Course = require('./course.model')(sequelize, DataTypes);
db.StudentChoice = require('./studentChoice.model')(sequelize, DataTypes);
db.Timetable = require('./timetable.model')(sequelize, DataTypes);

// --- ASSOCIATIONS (RELATIONS) ---

// Faculty - Subject (Many-to-Many: Faculty can teach many subjects, Subject taught by many faculty)
db.Faculty.belongsToMany(db.Subject, { through: 'FacultyQualifications', as: 'QualifiedSubjects' });
db.Subject.belongsToMany(db.Faculty, { through: 'FacultyQualifications' });

// Course - Core Subjects (Many-to-Many)
db.Course.belongsToMany(db.Subject, { through: 'CourseCoreSubjects', as: 'CoreSubjects' });
db.Subject.belongsToMany(db.Course, { through: 'CourseCoreSubjects' });

// Student Choices (Mapping students to NEP Electives)
db.StudentChoice.belongsTo(db.Course, { foreignKey: 'courseId' });
db.StudentChoice.belongsTo(db.Subject, { as: 'GE_Subject', foreignKey: 'geSubjectId' });
db.StudentChoice.belongsTo(db.Subject, { as: 'SEC_Subject', foreignKey: 'secSubjectId' });
db.StudentChoice.belongsTo(db.Subject, { as: 'VAC_Subject', foreignKey: 'vacSubjectId' });
db.StudentChoice.belongsTo(db.Subject, { as: 'AEC_Subject', foreignKey: 'aecSubjectId' });

// Timetable Persistence
// db.Timetable.belongsTo(db.User, { as: 'Creator', foreignKey: 'createdBy' });

module.exports = db;