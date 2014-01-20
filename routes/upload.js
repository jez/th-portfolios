module.exports = function(db) {
    return function (req, res) {
        if(!(req.body.name && req.body.email && req.body.andrewid && req.body.class && req.body.major)) {
            res.send(400, 'Missing required fields.');
        }

        var portfolios = db.get('portfolios');
        console.log(req.body);
        portfolios.find({'andrewid': req.body.andrewid}, {}, function(err, docs) {
            if (err) {
                res.send(500, 'Error querying database. Error: ' + err.toString());
            } else if (docs.length !== 0){
                portfolios.update({'andrewid': req.body.andrewid}, 
                    {$set: req.body}, function(err) {
                    if(err) {
                        res.send(500, 'Error updating user portfolio for ' + req.body.andrewid);
                    }
                    console.log('Updated portfolio.');
                    res.send('Success');
                });
            } else {
                portfolios.insert(req.body, {}, function(err) {
                    if (err) {
                        res.send(500, 'Error creating new portfolio for ' + req.body.andrewid);
                    }
                    console.log('Created new portfolio.');
                    res.send('Success');
                });
            }
        });
    }
};
