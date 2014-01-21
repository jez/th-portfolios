var fs = require('fs');
var qfs = require('q-io/fs');
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
      res.render('script', {message: "Don't screw with me. Format your data correctly."});
    }

    try {
      var portfolios = db.get('portfolios');
      portfolios.find({'andrewid': req.body.andrewid}, {}, function(err, docs) {
        if (err) {
          res.render('script', {message: 'Error querying database. Error: ' + err.toString()});
        } else if (docs.length !== 0){
          var old_resume = docs[0].resume;
          if(req.files) {
            fs.readFile(req.files.resume.path, function(err, data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              fs.writeFile(__dirname + '/uploads/' + req.body.resume, data, function(err) {
                if(err) {
                  res.render('script', {message: 'Error saving file to uploads folder.'});
                } else {
                  if(old_resume) {
                    fs.unlink(__dirname + '/uploads/' + old_resume, function(err) {
                      if(err) {
                        res.render('script', {message: 'Error deleting old resume'});
                      }
                    });
                    sponsors.forEach(function(elem, index, arr) {
                      if(fs.existsSync(__dirname + '/' + elem + '/' + old_resume)) {
                        fs.unlinkSync(__dirname + '/' + elem + '/' + old_resume);
                      }
                    });
                  }
                  portfolios.update({'andrewid': req.body.andrewid}, 
                    {$set: req.body}, function(err) {
                      if (err) {
                        res.render('script', {message: 'Error updating user portfolio for ' + req.body.andrewid});
                      } else {
                        req.body.companies.forEach(function(elem, i, arr) {
                          var otherdata = fs.readFileSync(req.files.resume.path);
                          try {
                            fs.writeFileSync(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, otherdata);
                          } catch (e) {
                                res.render('script', {message: 'Error saving to directory ' + elem.toLowerCase()});
                          }
                        });
                        res.render('script', {message: 'Success'});
                      }
                  });
                }
              })
            });
          } else {
            req.body.resume = '';
            if(old_resume) {
              fs.unlink(old_resume, function(err) {
                if(err) {
                  res.render('script', {message: 'Error deleting old resume'});
                }
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
            fs.readFile(req.files.resume.path, function(err, data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              fs.writeFile(__dirname + '/uploads/' + req.body.resume, data, function(err) {
                if(err) {
                  res.render('script', {message: 'Error saving file to uploads folder.'});
                } else {
                  portfolios.insert(req.body, {}, function(err) {
                    if (err) {
                      res.render('script', {message: 'Error creating user portfolio for ' + req.body.andrewid});
                    } else {
                      req.body.companies.forEach(function(elem, i, arr) {
                        fs.readFile(req.files.resume.path, function(err, otherdata) {
                          fs.writeFile(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, otherdata, function(err) {
                            if(err) {
                              res.render('script', {message: 'Error saving to directory ' + elem.toLowerCase()});
                            }
                          });
                        });
                      });
                      res.render('script', {message: 'Success'});
                    }
                  });
                }
              })
            });
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
