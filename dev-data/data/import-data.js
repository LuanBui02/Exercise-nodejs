const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const { Double } = require('mongodb');
const Tour = require('../../models/tourModel');
const { json } = require('express');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => {
    console.log('Connect to DB successful!');
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
const createData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully created!')
    } catch (err) {
        console.log(err);
    }
    process.exit();
}
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted')
    } catch(err) {
        console.log(err);
    }
    process.exit();
}
if(process.argv[2] == '--import') {
    createData();
} else if (process.argv[2] == '--delete') {
    deleteData();
}
