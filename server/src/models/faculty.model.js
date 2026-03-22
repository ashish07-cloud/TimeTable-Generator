module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Faculty", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    department: { type: DataTypes.STRING },
    maxHoursPerDay: { type: DataTypes.INTEGER, defaultValue: 6 },
    // Availability stored as JSONB for PostgreSQL efficiency
    // Format: [{ day: "Mon", slots: [0, 1, 2, 3] }]
    availability: { type: DataTypes.JSONB, defaultValue: [] },
    preferredSlots: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  });
};
