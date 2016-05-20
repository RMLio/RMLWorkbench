/**
 * Created by wmaroy on 15.05.16.
 */
$(document).ready(function() {

    var logicalSources;
    var selectedLogicalSource;

    /**
     * Details modal
     */

    //opening modal
    $('#logicalSourcesDetailsBtn').click(function() {

        logicalSources = app.currentModel.attributes.parsedObject.logicalSources;

        $('#logicalSourcesSelect').empty();

        for(var i = 0; i < logicalSources.length; i++) {
            $('#logicalSourcesSelect').append('<option value="' + i + '">' + logicalSources[i].uri + '</option>');
        }

        //initial value
        $('#logicalSourcePre').empty();

        $('#logicalSourcePre').append(convertForPre(logicalSources[$('#logicalSourcesSelect').val()].ugly));
        selectedLogicalSource = logicalSources[0];

    });



    //changelistener
    $('#logicalSourcesSelect').change(function() {

        $('#logicalSourcePre').empty();
        console.log(logicalSources[$('#logicalSourcesSelect').val()].ugly);
        $('#logicalSourcePre').append(convertForPre(logicalSources[$('#logicalSourcesSelect').val()].ugly));


        selectedLogicalSource = logicalSources[$('#logicalSourcesSelect').val()];

    });

    //refresh the pre tag
    var refreshDetails = function() {
        logicalSources=app.currentModel.attributes.parsedObject.logicalSources;
        $('#logicalSourcePre').empty();
        $('#logicalSourcePre').append(convertForPre(logicalSources[$('#logicalSourcesSelect').val()].ugly));
    }



    //utility function
    var convertForPre = function(data) {
        return data.replace(/</g,'&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Edit modal
     */

    $('#editLogicalSourceBtn').click(function() {

        var attributes = [];

        $('#editLogicalSourceBody').empty();

        for(var i = 0; i < selectedLogicalSource.triples.length; i++) {
            if(selectedLogicalSource.triples[i].predicate.replace(/\#(.*)/g,'') == 'http://semweb.mmlab.be/ns/rml') {
                $('#editLogicalSourceBody').append('<label>' + stripUri(selectedLogicalSource.triples[i].predicate) + '</label>');
                $('#editLogicalSourceBody').append("<input type='text' id='logicalSourceEditor" + i + "' class='form-control' placeholder='" + selectedLogicalSource.triples[i].object + "'></input><br/>");
            }
        }


    });

    $('#removeLogicalSourceBtn').click(function() {
        var triples = app.currentModel.attributes.parsedObject.triples;
        for(var i = 0; i < triples.length; i++) {
            for(var j = 0; j < selectedLogicalSource.triples.length; j++) {
                if(selectedLogicalSource.triples[j].subject === triples[i].subject &&
                    selectedLogicalSource.triples[j].predicate === triples[i].predicate &&
                    selectedLogicalSource.triples[j].object === triples[i].object) {
                        triples.splice(i,1);
                }
            }

        }
        $.post('/workbench/mapping/logical/update', {mappingObject:app.currentModel.attributes.parsedObject,mappingID:app.currentModel.attributes._id} , function(data) {
            app.currentModel.attributes.parsedObject = data;
            //replace <> with lt& en gt&
            for(var i = 0; i < app.mappings.models.length; i++) {
                var attributes = app.mappings.models[i].attributes;
                attributes.convertedData = convertForPre(data.toString);
            }
            app.mappingsContentView.model = app.currentModel;
            $('#mappingContent').empty();
            $('#mappingContent').html(app.mappingsContentView.render().el);
            notify('Logical source removed.', 'information');
            refreshDetails();
        }).fail(function(err) {
            notify(err.responseText, 'error');
        });
    });



    $('#saveLogicalSourceBtn').click(function() {
        var triples = [];
        for(var i = 0; i < selectedLogicalSource.triples.length; i++) {
            if($('#logicalSourceEditor'+i).val() != '' && $('#logicalSourceEditor'+i).val() != undefined) {
                selectedLogicalSource.triples[i].object = $('#logicalSourceEditor'+i).val();
                triples.push(selectedLogicalSource.triples[i]);
            }
        }
        $.post('/workbench/mapping/update', {triples:triples,mapping_id:app.currentModel.attributes._id} , function(data) {
            app.currentModel.attributes.parsedObject = data;
            //replace <> with lt& en gt&
            for(var i = 0; i < app.mappings.models.length; i++) {
                var attributes = app.mappings.models[i].attributes;
                console.log(data.toString);
                attributes.convertedData = convertForPre(data.toString);
            }
            app.mappingsContentView.model = app.currentModel;
            $('#mappingContent').empty();
            $('#mappingContent').html(app.mappingsContentView.render().el);
            refreshDetails(attributes.convertedData);
            notify('Logical source edited.', 'information');
        });
    });



    var stripUri = function(string) {
        var output = string.replace(/.*\#/,'');
        output = output.charAt(0).toUpperCase() + output.substr(1);
        return output;
    }

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