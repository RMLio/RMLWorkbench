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

/*
function fileUpload(form, action_url, div_id) {
    // Create the iframe...
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", "upload_iframe");
    iframe.setAttribute("name", "upload_iframe");
    iframe.setAttribute("width", "0");
    iframe.setAttribute("height", "0");
    iframe.setAttribute("border", "0");
    iframe.setAttribute("style", "width: 0; height: 0; border: none;");
 
    // Add to document...
    jQuery('#mapping-rules').prepend(iframe);
    window.frames['upload_iframe'].name = "upload_iframe";
 
    iframeId = document.getElementById("upload_iframe");
 
    // Add event...
    var eventHandler = function () {
 
            if (iframeId.detachEvent) iframeId.detachEvent("onload", eventHandler);
            else iframeId.removeEventListener("load", eventHandler, false);
 
            // Message from server...
            if (iframeId.contentDocument) {
                content = iframeId.contentDocument.body.innerHTML;
            } else if (iframeId.contentWindow) {
                content = iframeId.contentWindow.document.body.innerHTML;
            } else if (iframeId.document) {
                content = iframeId.document.body.innerHTML;
            }
 
            document.getElementById(div_id).innerHTML = content;
 
            // Del the iframe...
            setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
        }
 
    if (iframeId.addEventListener) iframeId.addEventListener("load", eventHandler, true);
    if (iframeId.attachEvent) iframeId.attachEvent("onload", eventHandler);
 
    // Set properties of form...
    form.setAttribute("target", "upload_iframe");
    form.setAttribute("action", action_url);
    form.setAttribute("method", "post");
    form.setAttribute("enctype", "multipart/form-data");
    form.setAttribute("encoding", "multipart/form-data");
    // Submit the form...
    form.submit();
 
    document.getElementById(div_id).innerHTML = "Uploading...";
} */
