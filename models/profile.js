'use strict';
const { Model, STRING } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User);
    }

    get formattedDate() {
      let date = new Date(this.dateOfBirth);
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0');
      let day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }
  Profile.init(
    {
      firstName: {
        type: STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'First Name must be filled',
          },
        },
      },
      lastName: DataTypes.STRING,
      dateOfBirth: DataTypes.DATE,
      gender: DataTypes.STRING,
      phone: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      bio: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Profile',
    }
  );
  return Profile;
};
