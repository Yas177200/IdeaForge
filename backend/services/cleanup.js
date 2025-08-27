const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { Op } = require('sequelize');
const { Card } = require('../models');

const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
const IMAGE_TTL_DAYS = Number(process.env.IMAGE_TTL_DAYS || 1);

async function pruneOldCardImages(sequelize) {
  const cutoff = new Date(Date.now() - IMAGE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const oldCards = await Card.findAll({
    where: {
      imagePath: { [Op.ne]: null },
      createdAt: { [Op.lt]: cutoff }
    },
    attributes: ['id','imagePath']
  });

  for (const c of oldCards) {
    try {
      if (c.imagePath && c.imagePath.startsWith('cards/')) {
        const abs = path.join(__dirname, '..', uploadsDir, c.imagePath);
        if (fs.existsSync(abs)) await fsp.unlink(abs).catch(()=>{});
      }
      c.imagePath = null;
      await c.save();
      console.info(`[CLEANUP] pruned image for card ${c.id}`);
    } catch (e) {
      console.error('[CLEANUP] failed to prune', c.id, e.message);
    }
  }
}

function scheduleDailyCleanup(sequelize) {
    // every 24 hours
  setTimeout(() => pruneOldCardImages(sequelize).catch(()=>{}), 15_000);
  setInterval(() => pruneOldCardImages(sequelize).catch(()=>{}), 24 * 60 * 60 * 1000);
}

module.exports = { scheduleDailyCleanup };
