module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name:            { type: DataTypes.STRING, allowNull: false },
    shortSummary:    { type: DataTypes.STRING, allowNull: false },
    fullDescription: DataTypes.TEXT,
    tags:            { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    joinLink:        { type: DataTypes.STRING, allowNull: false, unique: true }
  });

Project.associate = models => {
  // owner of the project
  Project.belongsTo(models.User, {
    foreignKey: 'ownerId'
  });

  // membership records for this project
  Project.hasMany(models.ProjectMembership, {
    foreignKey: 'projectId'
  });
};


  return Project;
};
