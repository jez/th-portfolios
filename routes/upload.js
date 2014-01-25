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
          res.render('script', {message: 'Error querying database. Error: ' + err.toString()});
        } else if (docs.length !== 0){
          var old_resume = docs[0].resume;
          if(req.files) {
            qfs.read(req.files.resume.path, 'b')
            .then(function(data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              qfs.write(__dirname + '/uploads/' + req.body.resume, data, 'b')
              .then(function() {
                if(old_resume) {
                  qfs.remove(__dirname + '/uploads/' + old_resume)
                  .then(undefined, function(err) {
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
                        res.render('script', {message: 'Error updating user portfolio for ' + req.body.andrewid});
                      } else {
                        var addOne = function(company) {
                          return qfs.read(req.files.resume.path, 'b')
                        }
                        var newCompanies = req.body.companies.map(addOne);
                        Promise.all(newCompanies).then(function(datas) {
                          var writeData = function(data) {
                            // TODO elem?
                            return qfs.write(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, data, 'b');
                          }
                          Promise.all(datas.map(writeData))
                          .then(function() {
                            res.render('script', {message: 'Success'});
                          }, function(err) {
                            res.render('script', {message: 'Error saving to directory'});
                          });
                        }, function(err) {
                          res.render('script', {message: 'Error reading from directory'});
                        });
                      }
                  });
                });
              }, 
              function(err) {
                res.render('script', {message: 'Error saving file to uploads folder.'});
              });
            }, function(err) {
              res.render('script', {message: 'Error reading file from upload.'});
            });
          } else {
            req.body.resume = '';
            if(old_resume) {
              qfs.remove(old_resum)
              .then(undefined, function(err) {
                  res.render('script', {message: 'Error deleting old resume'});
              });
            }
            portfolios.update({'andrewid': req.body.andrewid}, 
              {$set: req.body}, function(err) {
                if (err) {
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
              console.log(req.body.resume);
              console.log(__dirname + '/uploads/' + req.body.resume);
              qfs.write(__dirname + '/uploads/' + req.body.resume, data, 'wb')
              .then(function() {
                console.trace();
                portfolios.insert(req.body, {}, function(err) {
                  if (err) {
                    res.render('script', {message: 'Error creating user portfolio for ' + req.body.andrewid});
                  } else {
                    console.trace();
                    var addOne = function(company) {
                      return qfs.read(req.files.resume.path, 'b')
                    }
                    var newResumes = req.body.companies.map(addOne);
                    Promise.all(newResumes).then(function(data) {
                      // TODO Alright, so now we've read every file. How do we write them all out?
                      console.trace();
                      qfs.write(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, data, 'b')
                      .then(function() {
                        console.trace();
                        res.render('script', {message: 'Success'});
                      }, function(err) {
                        res.render('script', {message: 'Error saving to directory ' + company.toLowerCase()});
                      });
                    }, function(err) {
                      res.render('script', {message: 'Error reading from directory ' + company.toLowerCase()});
                    });
                  }
                });
              }, function(err) {
                console.log('it actually was this one.');
                console.log(err);
                res.render('script', {message: 'Error saving file to uploads folder.'});
              });
            }, function(err) {
              res.render('script', {message: 'Error reading uploaded file.'});
            })
          } else {
            portfolios.insert(req.body, {}, function(err) {
              if(err) {
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
