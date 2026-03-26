module.exports = (sequelize, DataTypes) => {
  const CollegeConfig = sequelize.define('CollegeConfig', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    // Links this config to the Admin who created it
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    collegeName: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // Array of days: ["Monday", "Tuesday", etc.]
    workingDays: { 
      type: DataTypes.JSON, 
      allowNull: false 
    },
    setupStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    // Global college timing
    startTime: { 
      type: DataTypes.TIME, 
      allowNull: false 
    }, 
    endTime: { 
      type: DataTypes.TIME, 
      allowNull: false 
    },
    periodDuration: { 
      type: DataTypes.INTEGER, 
      defaultValue: 60 // minutes
    },
    // NEP Slot Blocking: Stored as JSON
    // Format: { "GE": { "start": "08:00", "end": "10:00" }, "SEC": { "start": "15:00", "end": "16:00" } }
    slotWindows: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'college_configs'
  });

  return CollegeConfig;
};