module.exports = (sequelize, DataTypes) => {
  const StudentGroup = sequelize.define(
    "StudentGroup",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      collegeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "college_configs",
          key: "id",
        },
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "courses", key: "id" },
      },
      // e.g., "B.Sc Physics - Sem 2 - Sec A"
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // e.g., "B.Sc Physics"
      programName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      academicYear: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., "2024-25"
      },
      // Total students in this specific section/batch
      batchSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      /**
       * Elective Enrollment Logic (NEP)
       * This JSONB field stores how many students from THIS group
       * are enrolled in which elective subject.
       * Format: { "subject_uuid_1": 25, "subject_uuid_2": 15 }
       * Total sum of enrolledCount should ideally not exceed batchSize.
       */
      electiveChoices: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: false,
      },

      // Metadata for specialized tracking
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      timestamps: true,
      tableName: "student_groups",
      indexes: [
        {
          fields: ["college_id"],
        },
        {
          // Unique group name per college per year
          unique: true,
          fields: ["college_id", "name", "academic_year"],
        },
        {
          // Performance: Filtering by semester is common
          fields: ["college_id", "semester"],
        },
      ],
      underscored: true,
    },
  );

  return StudentGroup;
};
