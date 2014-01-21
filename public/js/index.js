;var app = {};(function() {
  app.prevent = true;

  app.alert = function(response) {
    if(response === 'Success') {
      console.log($('#success-message'));
      $('#success-message').modal('show');
    } else {
      $('#error-text').text(response);
      $('#failure-message').modal('show');
    }
  }
  app.init = function() {
    $('#input-file').change(function(e) {
      $('#input-filename').html(' ' + $(this).val().split('\\').pop());
    });
    $('#input-file-button').click(function(e) {
      e.preventDefault();
      $('#input-file').click();
    });
    $('#success-button').click(function(e) {
      location.reload();
    });
    var classClicked = false;
    $('#input-class input').focus(function(e) {
      classClicked = true;
    });
    $('#submit').click(function(e) {
      var valid = true;
      var requireds = ['name', 'email', 'andrewid', 'major'];
      requireds.forEach(function(elem, i, arr) {
        var selector = '#input-' + elem;
        if(!$(selector).val()) {
          console.log(selector);
          valid = false;
          $(selector).parents('.form-group').addClass('has-error');
          $(selector).focus(function(e) {
            $(this).parents('.form-group').removeClass('has-error');
            $('#submit').removeClass('btn-danger').addClass('btn-primary');
          });
        }
      });
      console.log(classClicked);
      if(!classClicked) {
        valid = false;
        selector = '#input-class';
        $(selector).parents('.form-group').addClass('has-error');
        $(selector + ' input').focus(function(e) {
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
