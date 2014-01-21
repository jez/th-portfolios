// var fs = require('fs');
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
      res.send(400, "Don't screw with me. Format your data correctly.");
    }

      var portfolios = db.get('portfolios');
      portfolios.find({'andrewid': req.body.andrewid}, {}, function(err, docs) {
        if (err) {
          res.send(500, 'Error querying database. Error: ' + err.toString());
        } else if (docs.length !== 0){
          var old_resume = docs[0].resume;
          if(old_resume) {
            sponsors.concat('uploads').forEach(function(folder, i, dels) {
              qfs.exists(__dirname + '/' + folder + '/' + old_resume)
              .then(function() {
                qfs.remove(__dirname + '/' + folder + '/' + old_resume)
                .catch(function() {
                  res.send(500, 'Error deleting old resume');
                });
              });
            });
          }
          if(req.files) {
            req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
            var resumePromise = qfs.read(req.files.resume.path, 'b');
            resumePromise.then(function(resumeData) {
              qfs.write(__dirname + '../uploads/' + req.body.resume, resumeData)
              .catch(function(error) {
                res.send(500, 'Error saving file to uploads folder.');
              });
            });
            portfolios.update({'andrewid': req.body.andrewid}, 
              {$set: req.body}, function(err) {
                if (err) {
                  res.send(500, 'Error updating user portfolio for ' + req.body.andrewid);
                } else {
                  req.body.companies.forEach(function(elem, i, arr) {
                  qfs.read(req.files.resume.path);
                      fs.writeFileSync(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, otherdata);
                          res.send(500, 'Error saving to directory ' + elem.toLowerCase());
                  });
                  res.send('Success');
                }
            });
          } else {
            req.body.resume = '';
            if(old_resume) {
              fs.unlink(old_resume, function(err) {
                if(err) {
                  res.send(500, 'Error deleting old resume');
                }
              });
            }
            portfolios.update({'andrewid': req.body.andrewid}, 
              {$set: req.body}, function(err) {
                if (err) {
                  res.send(500, 'Error updating user portfolio for ' + req.body.andrewid);
                } else {
                  res.send('Success');
                }
            });
          }
        } else {
          if(req.files) {
            fs.readFile(req.files.resume.path, function(err, data) {
              req.body.resume = req.body.andrewid + '-' + Math.floor(new Date().getTime());
              fs.writeFile(__dirname + '/uploads/' + req.body.resume, data, function(err) {
                if(err) {
                  res.send(500, 'Error saving file to uploads folder.');
                } else {
                  portfolios.insert(req.body, {}, function(err) {
                    if (err) {
                      res.send(500, 'Error creating user portfolio for ' + req.body.andrewid);
                    } else {
                      req.body.companies.forEach(function(elem, i, arr) {
                        fs.readFile(req.files.resume.path, function(err, otherdata) {
                          fs.writeFile(__dirname + '/' + elem.toLowerCase() + '/' + req.body.resume, otherdata, function(err) {
                            if(err) {
                              res.send(500, 'Error saving to directory ' + elem.toLowerCase());
                            }
                          });
                        });
                      });
                      res.send('Success');
                    }
                  });
                }
              })
            });
          } else {
            portfolios.insert(req.body, {}, function(err) {
              if(err) {
                res.send(500, 'Error creating new user portfolio for ' + req.body.andrewid);
              } else {
                res.send('Success');
              }
            });
          }
        }
      }); 
  }
};
