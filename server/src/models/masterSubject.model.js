module.exports = (sequelize, DataTypes) => {
  const MasterSubject = sequelize.define(
    "MasterSubject",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      code: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },

      department: { type: DataTypes.STRING, allowNull: false },

      defaultCategory: {
        type: DataTypes.ENUM("CORE", "GE", "SEC", "AEC", "VAC"),
        allowNull: false,
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      lectureHours: { type: DataTypes.INTEGER, defaultValue: 0 },
      tutorialHours: { type: DataTypes.INTEGER, defaultValue: 0 },
      practicalHours: { type: DataTypes.INTEGER, defaultValue: 0 },

      preferredRoomType: {
        type: DataTypes.ENUM(
          "LECTURE_HALL",
          "COMPUTER_LAB",
          "PHYSICS_LAB",
          "CHEMISTRY_LAB",
          "BIOLOGY_LAB",
        ),
        allowNull: false,
      },
    },
    {
      tableName: "master_subjects",
      timestamps: true,
      indexes: [{ unique: true, fields: ["code"] }],
      underscored: true,
    },
  );

  return MasterSubject;
};
