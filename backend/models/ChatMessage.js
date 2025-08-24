module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    content: { type: DataTypes.TEXT, allowNull: false }
  });

  ChatMessage.associate = models => {
    ChatMessage.belongsTo(models.User,    { foreignKey: 'senderId' });
    ChatMessage.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return ChatMessage;
};
