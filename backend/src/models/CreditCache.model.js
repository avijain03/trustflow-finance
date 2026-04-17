// Purpose: CreditCache model — caches credit bureau responses by hashed PAN for 24h
'use strict';

const mongoose = require('mongoose');

const creditCacheSchema = new mongoose.Schema(
  {
    panHash:    { type: String, required: true, unique: true, index: true },
    creditScore:{ type: Number, required: true },
    reportData: { type: mongoose.Schema.Types.Mixed },
    cachedAt:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// TTL index: automatically expire cache entries after 24 hours
creditCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 86400 });

const CreditCache = mongoose.model('CreditCache', creditCacheSchema);
module.exports = CreditCache;
