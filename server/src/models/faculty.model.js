module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'college_configs',
        key: 'id'
      }
    },
    employeeId: { 
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "Official College Employee ID"
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    department: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true // e.g., Professor, Asst. Professor, HOD
    },
    
    // Workload Constraints
    maxWeeklyLoad: { 
      type: DataTypes.INTEGER, 
      defaultValue: 16,
      comment: "Maximum teaching hours allowed per week"
    },
    
    /**
     * Availability Constraints (Critical for Solver)
     * Format: [
     *   { "day": "Monday", "startTime": "08:00", "endTime": "10:00", "reason": "Admin Work" }
     * ]
     */
    unavailableSlots: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false
    },

    // Soft preferences (e.g., prefers morning slots)
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'faculties',
    indexes: [
      {
        fields: ['college_id']
      },
      {
        fields: ['department']
      },
      {
        // Unique employee ID per college
        unique: true,
        fields: ['college_id', 'employee_id']
      },
      {
        // Unique email per college
        unique: true,
        fields: ['college_id', 'email']
      }
    ],
    underscored: true
  });

  return Faculty;
};