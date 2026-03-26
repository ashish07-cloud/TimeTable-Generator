module.exports = (sequelize, DataTypes) => {
  const FacultySubject = sequelize.define('FacultySubject', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    facultyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'faculties',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    // Production Feature: Is this the main teacher or an assistant?
    role: {
      type: DataTypes.ENUM('PRIMARY', 'ASSISTANT', 'LAB_INSTRUCTOR'),
      defaultValue: 'PRIMARY'
    }
  }, {
    timestamps: true,
    tableName: 'faculty_subjects',
    indexes: [
      {
        // Unique constraint: Don't assign the same teacher to the same subject twice
        unique: true,
        fields: ['faculty_id', 'subject_id']
      }
    ],
    underscored: true
  });

  return FacultySubject;
};