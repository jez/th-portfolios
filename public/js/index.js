;var app = {};(function() {
app.prevent = true;

app.init = function() {
    $('#input-file').change(function(e) {
        var filename = $(this).val().split('\\').pop();
        var ext = $(this).val().split('.').pop();
        if(ext !== 'pdf') {
            $(this).val('');
        } else {
            $('#input-filename').html(' ' + filename);
        }
    });
    $('#input-file-button').click(function(e) {
        e.preventDefault();
        $('#input-file').click();
    });
    $('#submit').click(function(e) {
        e.preventDefault();
        var valid = true;
        var body = {};

        body.name = $('#input-name').val();
        if(!body.name) {
            valid = false;
            $('#input-name').parent().parent().addClass('has-error');
            $('#input-name').focus(function(e) {
                $(this).parent().parent().removeClass('has-error');
                $('#submit').removeClass('btn-danger').addClass('btn-primary');
            });
        }

        body.email = $('#input-email').val();
        if(!body.email) {
            valid = false;
            $('#input-email').parent().parent().addClass('has-error');
            $('#input-email').focus(function(e) {
                $(this).parent().parent().removeClass('has-error');
                $('#submit').removeClass('btn-danger').addClass('btn-primary');
            });
        }

        body.andrewid = $('#input-andrewid').val();
        if(!body.andrewid) {
            valid = false;
            $('#input-andrewid').parent().parent().addClass('has-error');
            $('#input-andrewid').focus(function(e) {
                $(this).parent().parent().removeClass('has-error');
                $('#submit').removeClass('btn-danger').addClass('btn-primary');
            });
        }

        // Needs special treatment
        body.class = $('#input-class .active').text().replace(/\s/g, '');
        if(!body.class) {
            valid = false;
            $('#input-class').parent().parent().addClass('has-error');
            $('#input-class label').click(function(e) {
                $(this).parents('.form-group').removeClass('has-error');
                $('#submit').removeClass('btn-danger').addClass('btn-primary');
            });
        }

        body.major = $('#input-major').val();
        if(!body.major) {
            valid = false;
            $('#input-major').parent().parent().addClass('has-error');
            $('#input-major').focus(function(e) {
                $(this).parent().parent().removeClass('has-error');
                $('#submit').removeClass('btn-danger').addClass('btn-primary');
            });
        }

        if (valid) {
            body.minor = $('#input-minor').val();
            body.portfolio = $('#input-portfolio').val();
            body.link = $('#input-link').val();
            body.github = $('#input-github').val();
            var resume = $('#input-file').val();
            body.companies = [];
            $('#input-companies .active').each(function() {
                var company = $(this).text().replace(/\s/g, '').toLowerCase();
                body.companies.push(company);
                body[company] = true;
            });
            if(resume) {
                // SUPER HACKY BECAUSE AWS SUCKS
                $('#input-class input').removeAttr('name');
                $('#form input[name="x-amz-meta-andrewid"]').attr('value', body.andrewid);
                body.resume = 'uploads/' + body.andrewid + '-' + Math.floor(new Date().getTime() / 1000);
                $('#form input[name="key"]').attr('value', body.resume);
                $.ajax('/upload', {
                    data: body,
                    error: function(jqXHR, textStatus, errorThrown) {
                        $('#input-class input').attr('name', 'options');
                        $('#error-text').html('Error: ' + errorThrown + ', ' + jqXHR.responseText);
                        $('#failure-message').modal('show');
                    },
                    success: function(data, textStatus, jqXHR) {
                        app.prevent = false;
                        // TODO remove the form stuff from the index.jade
                        // $('#form').submit();
                        var file = $('#input-file')[0].files[0];
                        var fd = new FormData();

                        fd.append('key', body.resume);
                        fd.append('acl', 'public-read'); 
                        fd.append('Content-Type', file.type);      
                        fd.append('AWSAccessKeyId', 'AKIAILDJW47JPUE4YXUQ');
                        fd.append('x-amz-meta-andrewid', body.andrewid);
                        fd.append('policy', 'eyJleHBpcmF0aW9uIjogIjIwMTQtMDItMDNUMDU6MDA6MDBaIiwgImNvbmRpdGlvbnMiOiBbIHsiYnVja2V0IjogInRhcnRhbmhhY2tzMjAxNC1yZXN1bWVzIn0sIFsic3RhcnRzLXdpdGgiLCAiJGtleSIsICJ1cGxvYWRzLyJdLCB7ImFjbCI6ICJwdWJsaWMtcmVhZCJ9LCBbInN0YXJ0cy13aXRoIiwgIiR4LWFtei1tZXRhLWFuZHJld2lkIiwgIiJdLCBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiYXBwbGljYXRpb24vcGRmIl0sIF0gfQ==')
                        fd.append('signature','+Ru1NxPLxM5q5iyQ56Q8Wr/PpdI=');

                        fd.append('file', file);

                        xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function() {
                            if(xhr.readyState === 4){
                                if(xhr.status === 200 || xhr.status === 201 || xhr.status === 204 ) {
                                    $('#succes-button').click(function(e) {
                                        location.reload();
                                    });
                                    $('#success-message').modal('show');
                                }
                                else {
                                    $('#error-text').html('Error: ' + xhr.status + '. ' + xhr.responseText);
                                    $('#failure-message').modal('show');
                                }
                            }
                        };

                        xhr.open('POST', 'https://tartanhacks2014-resumes.s3.amazonaws.com', true);
                        xhr.send(fd);
                    },
                    type: 'POST'
                });
            } else {
                console.log('TODO Redirect to /success/');
            }
        } else {
            $('#submit').removeClass('btn-primary').addClass('btn-danger');
        }
    });

}
$(document).ready(function() {
    app.init();
});
})();
