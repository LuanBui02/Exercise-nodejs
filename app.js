const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const HandleException = require('./utils/handleException');
const errorController = require('./controllers/errorController');
const toursRoute = require('./routes/tourRouters');
const usersRoute = require('./routes/userRouters');
const { whitelist } = require('validator');
const app = express();
// set security http header
app.use(helmet());
//development logging
if (
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'production'
) {
  app.use(morgan('dev'));
}
// limitRequest
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: '....',
});
app.use('/api', limiter);
//reading data from req.body
app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({ whitelist: [('duration', 'price', 'maxGroupSize', 'ratingsAverage')] }),
);
// Serving static file
app.use(express.static(`${__dirname}/public`));
//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes
app.use('/api/v1/tours/', toursRoute);
app.use('/api/v1/users/', usersRoute);
//Handle exception routes
app.all('*', (req, res, next) => {
  next(
    new HandleException(
      `Can't not find ${req.originalUrl} on this server`,
      404,
    ),
  );
});
app.use(errorController);

module.exports = app;
