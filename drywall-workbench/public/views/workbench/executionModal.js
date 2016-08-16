/**
 * Created by wmaroy on 16.05.16.
 */
/**
 * Created by wmaroy on 15.05.16.
 */
$(document).ready(function() {

    var mappingDefinitions;
    var mapping_id;

    $('#executeModalBtn').click(function() {
        mapping_id = app.currentModel.attributes._id;
        mappingDefinitions = app.currentModel.attributes.parsedObject.mappingDefinitions;

        $('#triplelistdiv').empty();
        for(var i = 0; i < mappingDefinitions.length; i++) {
            $('#triplelistdiv').append('<label>' +
                                            '<input class="radioTriple" id="triple' + i + '"  type="checkbox">' +
                                            mappingDefinitions[i].uri.replace(/(.*)\#/,'') +
                                        '</label><br/>');
        }

    });

    $('#selectAllCheckbox').change(function() {
        if($('#selectAllCheckbox').prop( "checked" )) {
            for(var i = 0; i < mappingDefinitions.length; i++) {
                $('#triple'+i).prop('checked', true);
            }
        } else {
            for(var i = 0; i < mappingDefinitions.length; i++) {
                $('#triple'+i).prop('checked', false);
            }
        }
    });
    
    $('#executeMappingBtn').click(function() {
        var triplesToBeExecuted = [];
        var selectedAll = true;
        for(var i = 0; i < mappingDefinitions.length; i++) {
            if($('#triple'+i).prop('checked')) {
                triplesToBeExecuted.push(mappingDefinitions[i]);
            } else {
                selectedAll = false;
            }
        }

        var name = $('#executionOutputName').val();

        var triples = {
            triples: triplesToBeExecuted,
            name: name
        }

        if(!selectedAll) {
            NProgress.start();
            $.post('/workbench/mapping/execute/'+mapping_id+'/triples', triples , function() {
                NProgress.done();
                app.render();
                notify('Mapping successful!', 'success');
            }).fail(function(err) {
                NProgress.done();
                notify(err.responseText, 'error');
            });
        } else {
            NProgress.start();
            $.post('/workbench/mapping/execute/' + mapping_id, {name:name}, function () {
                NProgress.done();
                app.render();
                notify('Mapping successful!', 'success');
            }).fail(function (err) {
                NProgress.done();
                notify(err.responseText, 'error');
            });
        }

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
        n.setTimeout(4500);
    }

    $('#editWithRMLEditorBtn').click(function() {
        var mapping_id = mapping_id = app.currentModel.attributes._id;
        console.log(mapping_id);

        window.location.href = '/editor/?idmappings=' + mapping_id;

        // $.get('/editor/', {idmappings:mapping_id}, function (mapping) {
        //     //console.log(mapping[0].data);
        // }).fail(function (err) {
        //     console.log(err);
        // });
    });
});