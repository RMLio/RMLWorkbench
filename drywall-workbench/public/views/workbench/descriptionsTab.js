$(document).ready(function() {

    $('#clearDescriptionBtn').click(function() {
        $.post('/workbench/clear/description', { description_id:app.currentModel.attributes._id},function() {
            app.render();
            notify('Data description cleared','information');
        });
    });

    $('#clearDescriptionsBtn').click(function() {
        $.post('/workbench/clear/all/description',function() {
            app.render();
            notify('Data descriptions cleared','information');
        });
    });

    $('#prettyDataSource').click(function() {
        $('#descriptionpre').text(app.currentModel.attributes.data.replace(/password \".*\"/,'password ***'));
    });

    $('#uglyDataSource').click(function() {
        $('#descriptionpre').text(app.currentModel.attributes.ugly.replace(/password>.*\".*\"/,'password>  ***'));
    });

    var notify = function(text,type) {
        var n = noty({text: text,layout: 'bottomCenter',
            theme: 'relax', // or 'relax',
            maxVisible: 5,
            type: type,
            timeout: true,
            dismissQueue: true, // If you want to use queue feature set this true
            template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
            animation: {
                open: 'animated fadeIn', // or Animate.css class names like: 'animated bounceInLeft'
                close: 'animated fadeOut', // or Animate.css class names like: 'animated bounceOutLeft'
                easing: 'swing',
                speed: 500 // opening & closing animation speed
            }});
        n.setTimeout(2000);
    }

});




