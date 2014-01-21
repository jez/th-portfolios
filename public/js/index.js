;var app = {};(function() {
  app.prevent = true;

  app.init = function() {
    $('#input-file').change(function(e) {
      $('#input-filename').html(' ' + $(this).val().split('\\').pop());
    });
    $('#input-file-button').click(function(e) {
      e.preventDefault();
      $('#input-file').click();
    });
    $('#form-result').load(function(e) {
      var response = $(this).text();
      console.log(response);
      if(reponse === 'Success') {
        $('#success-message').modal('show');
      } else {
        $('#error-text').text(response);
        $('#failure-message').modal('show');
      }
    });
    $('#submit').click(function(e) {
      console.log('Uploading...');
      var valid = true;
      var requireds = ['name', 'email', 'andrewid', 'major'];
      requireds.forEach(function(elem, i, arr) {
        var selector = '#input-' + elem;
        if(!$(selector).val()) {
          valid = false;
          $(selector).parents('.form-group').addClass('has-error');
          $(selector).focus(function(e) {
            $(this).parents('.form-group').removeClass('has-error');
            $('#submit').removeClass('btn-danger').addClass('btn-primary');
          });
        }
      });
      var selector = '#input-class input';
      if(!$(selector).val()) {
        valid = false;
        $(selector).parents('.form-group').addClass('has-error');
        $(selector).focus(function(e) {
          $(this).parents('.form-group').removeClass('has-error');
          $('#submit').removeClass('btn-danger').addClass('btn-primary');
        });
      }

      if(!valid) {
        $('#submit').removeClass('btn-primary').addClass('btn-danger');
        e.preventDefault();
      }
    });
  }
  $(document).ready(function() {
    app.init();
  });
})();
