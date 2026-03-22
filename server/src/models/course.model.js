module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    course_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    course_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    academic_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    student_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    core_subject_ids: {
      type: DataTypes.JSONB,   // array of subject IDs
      allowNull: false,
      defaultValue: []
    }
  }, {
    tableName: 'courses',
    timestamps: true
  });

  return Course;
};