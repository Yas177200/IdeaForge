const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email:          {type: DataTypes.STRING, allowNull: false, unique: true},
        passwordHash:   {type: DataTypes.STRING, allowNull: false},
        name:           {type: DataTypes.STRING, allowNull: false},
        avatarUrl:      DataTypes.STRING,
        bio:            DataTypes.TEXT
    });

User.associate = models => {
  User.hasMany(models.Project, { foreignKey: 'ownerId' });

  User.hasMany(models.ProjectMembership, {
    foreignKey: 'userId'
  });
};

    return User;
}