const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email:          {type: DataTypes.STRING, allowNull: false, unique: true},
        passwordHash:   {type: DataTypes.STRING, allowNull: false},
        name:           {type: DataTypes.STRING, allowNull: false},
        avatarUrl:      DataTypes.STRING,
        bio:            DataTypes.TEXT
    });
    return User;
}