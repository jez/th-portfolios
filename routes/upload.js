var fs = require('fs');
var qfs = require('q-io/fs');
var Promise = require('q');
var sponsors = ['a16z', 'aws', 'apple', 'bloomberg', 'dropbox', 'facebook', 'microsoft']

module.exports = function(db) {
  return function (req, res) {
    console.log('Incoming request from ' + req.connection.remoteAddress + '...');

    if(!(req.body.name && 
          req.body.email && 
          req.body.andrewid && 
          req.body.class && 
          req.body.major && 
          (!req.files || 
           (req.files.resume && 
            req.files.resume.size < 1048576 && 
            req.files.resume.type == 'application/pdf')))) 
    {
      res.render('script', {message: "Missing required fields. Try submitting again."});
    }

    try {
      var portfolios = db.get('portfolios');
      portfolios.find({'andrewid': req.body.andrewid}, {}, function(err, docs) {
        if (err) {
          console.trace(err);
          res.render('script', {message: 'Error querying database. Error: ' + err.toString()});
        } else if (docs.length !== 0){
          var old_resume = docs[0].resume;
          if(req.files) {
            qfs.read(req.files.resume.path, 'b')
            .then(function(data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              qfs.write(__dirname + '/uploads/' + req.body.resume, data, 'wb')
              .then(function() {
                if(old_resume) {
                  qfs.remove(__dirname + '/uploads/' + old_resume)
                  .then(null, function(err) {
                    console.trace(err);
                    res.render('script', {message: 'Error deleting old resume.'});
                  });
                }
                var checkExists = function (company) {
                  return fs.existsSync(__dirname + '/' + company + '/' + old_resume);
                }
                var removeOne = function(company) {
                  return qfs.remove(__dirname + '/' + company + '/' + old_resume);
                }
                var oldCompanies = sponsors.filter(checkExists).map(removeOne);
                Promise.all(oldCompanies).then(function () {
                  portfolios.update({'andrewid': req.body.andrewid}, 
                    {$set: req.body}, function(err) {
                      if (err) {
                        console.trace(err);
                        res.render('script', {message: 'Error updating user portfolio for ' + req.body.andrewid});
                      } else {
                        var addOne = function(company) {
                          return qfs.read(req.files.resume.path, 'b')
                        }
                        Promise.all(req.body.companies.map(addOne)).then(function(datas) {
                          var newResumes = datas.map(function(fileData, i, arr) {
                            return qfs.write(__dirname + '/' + req.body.companies[i] + '/' + req.body.resume, data, 'wb');
                          });
                          Promise.all(newResumes)
                          .then(function() {
                            res.render('script', {message: 'Success'});
                          }, function(err) {
                            console.trace(err);
                            res.render('script', {message: 'Error saving to directory ' + err});
                          });
                        }, function(err) {
                          console.trace(err);
                          res.render('script', {message: 'Error reading from company directory ' + error});
                        });
                      }
                  });
                });
              }, 
              function(err) {
                console.trace(err);
                res.render('script', {message: 'Error saving file to uploads folder.'});
              });
            }, function(err) {
              console.trace(err);
              res.render('script', {message: 'Error reading file from upload.'});
            });
          } else {
            req.body.resume = '';
            if(old_resume) {
              qfs.remove(old_resume)
              .then(null, function(err) {
                console.trace(err);
                res.render('script', {message: 'Error deleting old resume'});
              });
            }
            portfolios.update({'andrewid': req.body.andrewid}, 
              {$set: req.body}, function(err) {
                if (err) {
                  console.trace(err);
                  res.render('script', {message: 'Error updating user portfolio for ' + req.body.andrewid});
                } else {
                  res.render('script', {message: 'Success'});
                }
            });
          }
        } else {
          if(req.files) {
            qfs.read(req.files.resume.path, 'b')
            .then(function(data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              qfs.write(__dirname + '/uploads/' + req.body.resume, data, 'wb')
              .then(function() {
                portfolios.insert(req.body, {}, function(err) {
                  if (err) {
                    console.trace(err);
                    res.render('script', {message: 'Error creating user portfolio for ' + req.body.andrewid});
                  } else {
                    var addOne = function(company) {
                      return qfs.read(req.files.resume.path, 'b')
                    }
                    Promise.all(req.body.companies.map(addOne)).then(function(datas) {
                      var newResumes = datas.map(function(fileData, i, arr) {
                        return qfs.write(__dirname + '/' + req.body.companies[i] + '/' + req.body.resume, data, 'wb');
                      });
                      Promise.all(newResumes)
                      .then(function() {
                        res.render('script', {message: 'Success'});
                      }, function(err) {
                        console.trace(err);
                        res.render('script', {message: 'Error saving to directory ' + err});
                      });
                    }, function(err) {
                      console.trace(err);
                      res.render('script', {message: 'Error reading from company directory ' + error});
                    });
                  }
                });
              }, function(err) {
                console.trace(err);
                res.render('script', {message: 'Error saving file to uploads folder.'});
              });
            }, function(err) {
              console.trace(err);
              res.render('script', {message: 'Error reading uploaded file.'});
            })
          } else {
            portfolios.insert(req.body, {}, function(err) {
              if(err) {
                console.trace(err);
                res.render('script', {message: 'Error creating new user portfolio for ' + req.body.andrewid});
              } else {
                res.render('script', {message: 'Success'});
              }
            });
          }
        }
      }); 
    } catch (e) {
      res.render('script', {message: 'An unexpected error occurred: ' + e.toString()});
    }
  }
};
