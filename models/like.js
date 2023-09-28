'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User);
      Like.belongsTo(models.Post);
    }
  }
  Like.init(
    {
      UserId: DataTypes.INTEGER,
      PostId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Like',
    }
  );
  return Like;
};
