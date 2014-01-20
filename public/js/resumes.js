;(function() {
$(document).ready(function() {
    $('button').each(function() {
        $(this).click(function(e) {
            e.preventDefault();
            var format = $(e.currentTarget).text();
            console.log(format);
            if(format === 'bash') {
                format = 'sh';
            }
            var company = $(e.currentTarget).parents('form').attr('id');
            console.log(company);
            var accesscode = $('#' + company).find('input').val().replace(/ /g, '-');
            console.log(accesscode);
            window.location.href = '/resumes/' + company + '/' + accesscode + '.' + format;
        });
    });
});
})();
