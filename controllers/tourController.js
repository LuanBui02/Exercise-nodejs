const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
exports.checkID = (req, res, next, val ) => {
        if(req.params.id * 1 > tours.length - 1) {
        return res.status(404).json({
            err: 'Fail',
            message: 'Can not find tour'
        });
    }
    next();
}

exports.checkBody = (req,res, next) => {
    if(!req.body.name || !req.body.price) {
        return res.status(404).json({
            status: 'Fail',
            message: 'There is wrong name or price'
        })
    }
    next();
}
exports.findAllTours = (req, res) => {
    console.log(req.requestTime);

    res.status(200).json({
        status: 'success!',
        Time: req.requestTime,
        length: tours.length,
        data: {
            tours
        }
    });
}
exports.findTour =  (req, res) => {
    const id = req.params.id * 1;

    const tourId = tours.find(el => el.id === id);

    if(!tourId) {
        return res.status(404).json({
            err : "Not Found",
            message : "Not found id!!"
        });
    }
    res.status(200).json({
        status: 'success!',
        data: {
            tourId
        }
    });
}
exports.addTour = (req, res) => {
    console.log(req.body.price);
    // res.send('Done');
    const newId = tours[tours.length - 1].id + 1;

    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success!!!', 
            data: {
                newTour
            }
        });
    })
}
exports.updateTour =  (req, res) => {
    const updateData = req.body;

    tours.push(updateData);
    res.status(200).json({
        status: 'success',
        data: {
            tour: updateData
        }
    })
}
exports.deleteTour = (req, res) => {

    res.status(200).json({
        status: 'success',
        data: null
    })
}