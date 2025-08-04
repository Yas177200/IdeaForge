const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const ProjectMembership = sequelize.define('ProjectMembership', {
    role: {
      type: DataTypes.ENUM('OWNER','MEMBER','PUBLIC_GUEST'),
      allowNull: false,
      defaultValue: 'MEMBER'
    }
  });

ProjectMembership.associate = models => {
  ProjectMembership.belongsTo(models.User, {
    foreignKey: 'userId'
  });
  ProjectMembership.belongsTo(models.Project, {
    foreignKey: 'projectId'
  });
};


  return ProjectMembership;
};
