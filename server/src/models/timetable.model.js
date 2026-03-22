module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Timetable', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    institutionId: { type: DataTypes.STRING, allowNull: false },
    academicYear: { type: DataTypes.INTEGER, allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    // Store the complete generated JSON from the Python engine
    scheduleData: { type: DataTypes.JSONB, allowNull: false },
    status: { 
      type: DataTypes.ENUM('DRAFT', 'APPROVED', 'PUBLISHED'), 
      defaultValue: 'DRAFT' 
    },
    createdBy: { type: DataTypes.STRING } // Admin ID
  });
};