module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'college_configs', key: 'id' }
    },
    // e.g., "B.Sc Computer Science"
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // e.g., "CS", "PHY", "ENG"
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // NEP duration (e.g., 3 years/6 sems or 4 years/8 sems)
    totalSemesters: {
      type: DataTypes.INTEGER,
      defaultValue: 6
    },
    // e.g., "Undergraduate", "Postgraduate"
    level: {
      type: DataTypes.ENUM('UG', 'PG', 'DIPLOMA', 'PHD'),
      defaultValue: 'UG'
    }
  }, {
    timestamps: true,
    tableName: 'courses',
    indexes: [
      { fields: ['college_id'] },
      { 
        unique: true, 
        fields: ['college_id', 'name'] 
      }
    ],
    underscored: true
  });

  return Course;
};