(function($) {
"use strict";
$(document).ready(function() {

    status('Choose a file :)');

    // Check to see when a user has selected a file, this means we don't need a submit button
    var timerId;
    timerId = setInterval(function() {
        if($('#mapping-upload-input').val() !== '') {
            clearInterval(timerId);

            $('#mapping-upload-form').submit();
        }
    }, 500);

    $('#mapping-upload-form').submit(function() {
        status('uploading the file ...');
        
        $(this).ajaxSubmit({
            // Note: can't use JSON otherwise IE8 will pop open a dialog
            // window trying to download the JSON as a file
            dataType: 'text',
	    beforeSend: function (xhr) {
                 xhr.setRequestHeader('x-csrf-token', $.cookie('_csrfToken'));
            },
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
            
            success: function(response) {
		status('Got something');
                try {
                    response = $.parseJSON(response);
                }
                catch(e) {
                    status('Bad response from server');
                    return;
                }

                if(response.error) {
                    status('Oops, something bad happened');
                    return;
                }

                var urlOnServer = response.path;
                
                status('Success, file uploaded to:' + response.content);
                var textarea = $('#mapping-rules-text');                
                textarea.val(textarea.val() + response.content);
                textarea.removeClass('hidden');
            }
        });
        
        // Have to stop the form from submitting and causing
        // a page refresh - don't forget this
        return false;
    });

    function status(message) {
        //$('#status').text(message);
    }
    
    
     
    
});
})(jQuery);
