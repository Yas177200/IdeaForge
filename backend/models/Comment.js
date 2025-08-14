module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        content: { type: DataTypes.TEXT, allowNull: false }
    });

    Comment.associate = models => {
        Comment.belongsTo(models.User, { foreignKey: 'authorId' });
        Comment.belongsTo(models.Card, { foreignKey: 'cardId'   });
    };

    return Comment;
}