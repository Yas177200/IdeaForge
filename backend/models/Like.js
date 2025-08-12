module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define('Like', {

    }, {
        indexes: [{ unique: true, fields: ['userId', 'cardId'] }]
    });

    Like.associate = models => {
        Like.belongsTo(models.User, { foreignKey: 'userId' });
        Like.belongsTo(models.Card, { foreignKey: 'cardId' });
    };

    return Like;
}