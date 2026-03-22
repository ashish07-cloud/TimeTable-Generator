module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    role: { type: DataTypes.ENUM('ADMIN', 'FACULTY', 'VIEWER'), defaultValue: 'ADMIN' },
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpires: { type: DataTypes.DATE, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastLogin: { type: DataTypes.DATE }
  });
};