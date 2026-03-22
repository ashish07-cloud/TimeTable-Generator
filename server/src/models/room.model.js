module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    room_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    room_name: DataTypes.STRING,
    room_type: DataTypes.STRING,
    capacity: DataTypes.INTEGER
  });

  return Room;
};