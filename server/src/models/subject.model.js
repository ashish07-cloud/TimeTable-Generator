module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Subject', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { 
      type: DataTypes.ENUM('CORE', 'GE', 'SEC', 'AEC', 'VAC'), 
      allowNull: false 
    },
    department: { type: DataTypes.STRING, allowNull: false },
    credits: { type: DataTypes.INTEGER, defaultValue: 4 },
    hoursPerWeek: { type: DataTypes.INTEGER, allowNull: false },
    requiredRoomType: { 
      type: DataTypes.ENUM('CLASSROOM', 'LAB_PHYSICS', 'LAB_CS', 'LAB_CHEM'), 
      defaultValue: 'CLASSROOM' 
    }
  });
};