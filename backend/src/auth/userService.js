const User = require('../db/models/User');

async function findOrCreateUser({ provider, providerId, email, name, avatar }) {
  const user = await User.findOneAndUpdate(
    { provider, providerId },
    { email, name, avatar },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  return user;
}

async function getUserById(id) {
  return User.findById(id).lean();
}

module.exports = { findOrCreateUser, getUserById };