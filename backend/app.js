const express = require('express');
const cors = require('cors');

const coreRoutes = require('./routes/core.routes');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const homeRoutes = require('./routes/home.routes');
const detailsRoutes = require('./routes/details.routes');
const searchRoutes = require('./routes/search.routes');
const moderationRoutes = require('./routes/moderation.routes');
const reviewRoutes = require('./routes/review.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const deezerRoutes = require('./routes/deezer.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

app.use(coreRoutes);
app.use(authRoutes);
app.use(profileRoutes);
app.use(homeRoutes);
app.use(detailsRoutes);
app.use(searchRoutes);
app.use(moderationRoutes);
app.use(reviewRoutes);
app.use(favoriteRoutes);
app.use(deezerRoutes);

module.exports = app;