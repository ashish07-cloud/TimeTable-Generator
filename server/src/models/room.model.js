module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    // Foreign Key linking to the College
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'college_configs', // Table name for CollegeConfig
        key: 'id'
      }
    },
    roomNumber: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    capacity: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        min: 1 // Production check: Room must hold at least 1 person
      }
    },
    // Enum ensures the solver only sees valid room types
    roomType: {
      type: DataTypes.ENUM(
        'LECTURE_HALL', 
        'COMPUTER_LAB', 
        'PHYSICS_LAB', 
        'CHEMISTRY_LAB', 
        'BIOLOGY_LAB', 
        'SEMINAR_HALL'
      ),
      defaultValue: 'LECTURE_HALL',
      allowNull: false
    },
    building: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    floor: { 
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    // Metadata for specific room features (e.g., Projector: true, AC: false)
    features: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    tableName: 'rooms',
    indexes: [
      {
        // Performance optimization: Fast lookup for all rooms in a specific college
        fields: ['college_id']
      },
      {
        // Data Integrity: Room numbers must be unique within a single college
        unique: true,
        fields: ['college_id', 'room_number']
      }
    ],
    underscored: true // database column names like college_id instead of collegeId
  });

  return Room;
};