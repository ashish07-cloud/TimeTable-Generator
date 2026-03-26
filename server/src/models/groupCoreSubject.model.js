module.exports = (sequelize, DataTypes) => {
  const GroupCoreSubject = sequelize.define('GroupCoreSubject', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },

    studentGroupId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    subjectId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    type: {
      type: DataTypes.ENUM('CORE', 'ELECTIVE'),
      allowNull: false
    },

    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }

  }, {
    tableName: 'group_core_subjects',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['student_group_id', 'subject_id'] }
    ],
    underscored: true
  });

  return GroupCoreSubject;
};