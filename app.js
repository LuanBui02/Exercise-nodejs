const express = require('express');
const morgan = require('morgan');

const HandleException = require('./utils/handleException');
const errorController = require('./controllers/errorController');
const toursRoute = require('./routes/tourRouters');
const usersRoute = require('./routes/userRouters');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
if (
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'production'
) {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

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
