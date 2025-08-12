const models = require(".");

module.exports = (sequelize, DataTypes) => {
    const Card = sequelize.define('Card', {
        type:           { type: DataTypes.ENUM('Feature', 'BUG', 'IDEA', 'SKETCH'), allowNull: false },
        title:          { type: DataTypes.STRING, allowNull: false },
        description:    DataTypes.TEXT,
        imageUrl:       DataTypes.STRING,
        completed:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    });

    Card.associate = models => {
        Card.belongsTo(models.User, { foreignKey: 'authorId' });
        Card.belongsTo(models.Project, { foreignKey: 'projectId' })
    };
    
    return Card;
}