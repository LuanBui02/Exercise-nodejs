
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');
const { Double } = require('mongodb');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => {
    console.log('Connect to DB successful!');
})
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App running on port ${port}`);
})