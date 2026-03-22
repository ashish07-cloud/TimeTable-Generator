module.exports = (sequelize, DataTypes) => {
  return sequelize.define('StudentChoice', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentRollNo: { type: DataTypes.STRING, allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.INTEGER, allowNull: false },
    // Foreign keys for GE, SEC, AEC, VAC are handled in index.js associations
  });
};