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
            body.file = $('#input-file')[0].files[0];
            var fd = new FormData();

            fd.append('name', body.name);
            fd.append('email', body.email);
            fd.append('andrewid', body.name);
            fd.append('class', body.name);
            fd.append('major', body.name);
            fd.append('minor', body.name);
            fd.append('portfolio', body.name);
            fd.append('link', body.name);
            fd.append('github', body.name);
            fd.append('companies', body.companies);

            if(resume) {
                body.resume = body.andrewid + '-' + Math.floor(new Date().getTime() / 1000);
                fd.append('resume', body.name);
                fd.append('file', body.file);
            } 

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4){
                    if(xhr.status === 200 || xhr.status === 201 || xhr.status === 204 ) {
                        $('#success-button').click(function(e) {
                            // location.reload();
                        });
                        $('#success-message').modal('show');
                    }
                    else {
                        $('#error-text').html('Error: ' + xhr.status + '. ' + xhr.responseText);
                        $('#failure-message').modal('show');
                    }
                }
            };

            xhr.open('POST', '/upload/', true);
            xhr.send(fd);
        } else {
            $('#submit').removeClass('btn-primary').addClass('btn-danger');
        }
    });

}
$(document).ready(function() {
    app.init();
});
})();
