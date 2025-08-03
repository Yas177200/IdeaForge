// backend/models/index.js
const fs        = require('fs');
const path      = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1) Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: console.log,   // or false to disable
});

// 2) Dynamically load all model definitions
const models = {};
fs
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const defineModel = require(path.join(__dirname, file));
    const model = defineModel(sequelize, DataTypes);
    models[model.name] = model;
  });

// 3) Run associations if defined
Object.values(models)
  .forEach(model => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

// 4) Sync the database (DEV ONLY)
sequelize
  .sync({ alter: true })
  .then(() => console.log('✅ Models synchronized (alter:true)'))
  .catch(err => console.error('❌ Sync error:', err));

module.exports = {
  sequelize,
  ...models
};
