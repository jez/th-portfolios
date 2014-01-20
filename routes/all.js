downloader1 = '#!/bin/bash\nhost="https://tartanhacks2014-resumes.s3.amazonaws.com/"\nkeys="'
downloader2 = '"\n\nc_blue=$(tput setaf 33)\nc_reset=$(tput sgr0)\nc_green=$(tput setaf 2)\n\necho "${c_blue}TartanHacks Resume Downloader${c_reset}"\n\nrm -rf temp-files/\nmkdir temp-files/\n\n for key in $keys\ndo\n    andrewid=`echo $key | sed -e \'s/uploads\\\///\' | sed -e \'s/[-][0-9]*$//\'`\n    echo "Downloading $host$c_green$key$c_reset..."\n    curl -s -o "temp-files/$andrewid.pdf" $host$key\ndone\n\necho "${c_blue}Cleaning up...$c_reset"\n\nmkdir "TartanHacks Resumes"\ncp -r temp-files/* "TartanHacks Resumes/"\nrm -rf temp-files/\n\necho ""\necho "Done. See \'TartanHacks Resumes/\' for downloaded files."'

module.exports = function(db) {
    var portfolios = db.get('portfolios');
    return function(req, res) {
        if(!req.params.format) {
            res.send(400, 'No format specified.');
        }
        portfolios.find({}, {}, function(err, docs) {
            if (err) {
                res.send(500, 'Error querying database. Error: ' + err.toString());
            } else if (docs.length === 0) {
                res.send('No users in database.');
            } else {
                if(req.params.format == 'json') {
                    result = docs;
                    result.forEach(function(hacker, i, hackers) {
                        hacker.companies.forEach(function(company, j, companies) {
                            delete hacker[company];
                        });
                        delete hacker.companies;
                        delete hacker._id;
                    });
                    res.send(docs);
                } else if (req.params.format == 'csv') {
                    var result = 'Name,Email,Andrew ID,Class,Major,Minor/Additional Major,Portfolio,Additional link,GitHub,Resume\n'
                    docs.forEach(function(hacker, i, hackers) {
                        result += '"' + hacker.name.replace(/"/g, '') + '",';
                        result += '"' + hacker.email.replace(/"/g, '') + '",';
                        result += '"' + hacker.andrewid.replace(/"/g, '') + '",';
                        result += '"' + hacker.class.replace(/"/g, '') + '",';
                        result += '"' + hacker.major.replace(/"/g, '') + '",';
                        result += '"' + hacker.minor.replace(/"/g, '') + '",';
                        result += '"' + hacker.portfolio.replace(/"/g, '') + '",';
                        result += '"' + hacker.link.replace(/"/g, '') + '",';
                        result += '"' + hacker.github.replace(/"/g, '') + '",';
                        result += '"https://tartanhacks2014-resumes.s3.amazonaws.com/' + hacker.resume.replace(/"/g, '') + '"\n';
                    });
                    res.type('csv');
                    res.send(result);
                } else if (req.params.format == 'sh') {
                    var keys = '';
                    docs.forEach(function(elem, index, array) {
                        result += elem.resume + '\n';
                    });
                    keys = result.substring(0, result.length - 1);
                    res.type('application/x-sh');
                    res.send(downloader1 + result + downloader2);
                } else {
                    res.send(400, 'Invalid format type.');
                }
            }
        });
    }
}
