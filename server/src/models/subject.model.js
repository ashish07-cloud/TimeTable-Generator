module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      collegeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "college_configs", key: "id" },
      },

      masterSubjectId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "master_subjects", key: "id" },
      },

      courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "courses", key: "id" },
      },

      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      code: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },

      category: {
        type: DataTypes.ENUM("CORE", "GE", "SEC", "AEC", "VAC"),
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
      tableName: "subjects",
      timestamps: true,
      indexes: [
        { fields: ["college_id"] },
        { unique: true, fields: ["college_id", "code"] },
      ],
      underscored: true,
    },
  );

  return Subject;
};
