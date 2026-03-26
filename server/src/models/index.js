const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const db = {};
db.sequelize = sequelize;
db.Sequelize = sequelize;

// 🔥 GLOBAL FIX (VERY IMPORTANT)
sequelize.options.define = {
  freezeTableName: true, // no plural
};

// --- MODEL IMPORTS ---
db.User = require("./user.model")(sequelize, DataTypes);
db.CollegeConfig = require("./collegeConfig.model")(sequelize, DataTypes);
db.Course = require("./course.model")(sequelize, DataTypes);
db.Room = require("./room.model")(sequelize, DataTypes);
db.Subject = require("./subject.model")(sequelize, DataTypes);
db.Faculty = require("./faculty.model")(sequelize, DataTypes);
db.StudentGroup = require("./studentGroup.model")(sequelize, DataTypes);
db.Timetable = require("./timetable.model")(sequelize, DataTypes);
db.MasterSubject = require("./masterSubject.model")(sequelize, DataTypes);
db.FacultySubject = require("./facultySubject.model")(sequelize, DataTypes);
db.GroupCoreSubject = require("./groupCoreSubject.model")(sequelize, DataTypes);

// --- ASSOCIATIONS ---
db.User.hasOne(db.CollegeConfig, { foreignKey: "adminId", as: "College" });
db.CollegeConfig.belongsTo(db.User, { foreignKey: "adminId" });

const entities = [
  "Course",
  "Room",
  "Subject",
  "Faculty",
  "StudentGroup",
  "Timetable",
];

entities.forEach((modelName) => {
  db.CollegeConfig.hasMany(db[modelName], {
    foreignKey: "collegeId",
    onDelete: "CASCADE",
    hooks: true,
  });
  db[modelName].belongsTo(db.CollegeConfig, { foreignKey: "collegeId" });
});

// Academic hierarchy
db.Course.hasMany(db.StudentGroup, { foreignKey: "courseId", as: "Batches" });
db.StudentGroup.belongsTo(db.Course, { foreignKey: "courseId" });

db.Course.hasMany(db.Subject, { foreignKey: "courseId", as: "CourseSubjects" });
db.Subject.belongsTo(db.Course, { foreignKey: "courseId" });

db.MasterSubject.hasMany(db.Subject, { foreignKey: "masterSubjectId" });
db.Subject.belongsTo(db.MasterSubject, { foreignKey: "masterSubjectId" });

// M2M
db.Faculty.belongsToMany(db.Subject, {
  through: db.FacultySubject,
  foreignKey: "facultyId",
  otherKey: "subjectId",
  as: "QualifiedSubjects",
});

db.Subject.belongsToMany(db.Faculty, {
  through: db.FacultySubject,
  foreignKey: "subjectId",
  otherKey: "facultyId",
});

db.StudentGroup.belongsToMany(db.Subject, {
  through: db.GroupCoreSubject,
  foreignKey: "studentGroupId",
  otherKey: "subjectId",
  as: "CoreSubjects",
});

db.Subject.belongsToMany(db.StudentGroup, {
  through: db.GroupCoreSubject,
  foreignKey: "subjectId",
  otherKey: "studentGroupId",
});

module.exports = db;