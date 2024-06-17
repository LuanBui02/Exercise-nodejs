const express = require('express');
const morgan = require('morgan');

const toursRoute = require('./routes/tourRouters');
const usersRoute = require('./routes/userRouters');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next(); 
});
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`))
app.use('/api/v1/tours/', toursRoute);
app.use('/api/v1/users/', usersRoute);

module.exports = app;