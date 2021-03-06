require('dotenv').config();
const express = require('express'),
  cors = require('cors'),
  helmet = require('helmet'),
  logger = require('morgan'),
  path = require('path'),
  passport = require('passport'),
  JWTStrategy = require('passport-jwt').Strategy,
  helpers = require('./db/helpers');

const app = express();
const jwtOptions = require('./config/jwtOptions');
const routes = require('./routes');

app.use(cors());
app.use(helmet());
app.use(logger('short'));
app.use(express.json());

// auth config
passport.use(
  new JWTStrategy(jwtOptions, async function(payload, done) {
    try {
      let user = await helpers
        .getUser(payload.id)
        .select('first_name', 'last_name', 'email', 'id')
        .first();

      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }),
);
app.use(passport.initialize());

app.use('/api', routes);

app.use(express.static(path.resolve(path.join(__dirname, 'public'))));

app.get('*', (_, res) => res.sendFile('/index.html'));

// catch-all error handler
app.use(function(err, _, res, _) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`
=== Server listening on port ${PORT} ===
`),
);
