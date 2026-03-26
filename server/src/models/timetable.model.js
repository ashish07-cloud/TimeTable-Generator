module.exports = (sequelize, DataTypes) => {
  const Timetable = sequelize.define('Timetable', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'New Draft Timetable'
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Tracking the state of the Algorithm Service
    status: {
      type: DataTypes.ENUM('QUEUED', 'GENERATING', 'COMPLETED', 'FAILED', 'PUBLISHED'),
      defaultValue: 'QUEUED'
    },
    
    /**
     * THE CORE DATA
     * Stored as a JSONB Array of Objects.
     * Each object: { 
     *   day, startTime, endTime, subjectId, facultyId, roomId, groupId, 
     *   type: 'CORE'|'GE'|'SEC', isManualEdit: boolean 
     * }
     */
    scheduleData: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false
    },

    // To store solver errors or "Soft Constraint" warnings
    logs: {
      type: DataTypes.JSONB,
      defaultValue: { errors: [], warnings: [], generationTime: null }
    },

    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },

    // Only one timetable can be "Active" (Published) per semester
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'timetables',
    indexes: [
      {
        fields: ['college_id']
      },
      {
        fields: ['status']
      },
      {
        // Index for finding the currently active timetable quickly
        fields: ['college_id', 'is_active']
      }
    ],
    underscored: true
  });

  return Timetable;
};

indexes: [
  { fields: ['college_id'] },
  { fields: ['status'] },
  { fields: ['college_id', 'is_active'] },
  {
    unique: true,
    fields: ['college_id', 'semester', 'academic_year', 'is_active'],
    where: { is_active: true }
  }
]