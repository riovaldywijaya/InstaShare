'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // define association here
      Post.belongsTo(models.User);
      Post.hasMany(models.Like);
      // Post.belongsToMany(models.User, {
      //   through: models.Like,
      // });
    }

    showTimePost() {
      let dateCreated = new Date(this.createdAt);
      let nowDate = new Date();

      let hoursCreated = dateCreated.getHours();
      let hoursNow = nowDate.getHours();
      let minutesCreated = dateCreated.getMinutes();
      let minutesNow = nowDate.getMinutes();

      if (hoursCreated == hoursNow) {
        return `${minutesNow - minutesCreated} minutes ago`;
      } else {
        return `${hoursNow - hoursCreated} hours ago`;
      }
    }
  }
  Post.init(
    {
      caption: DataTypes.STRING,
      imgUrl: DataTypes.STRING,
      likes: {
        type: DataTypes.STRING,
        defaultValue: 0,
      },
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Post',
    }
  );
  return Post;
};
