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
        $('#logicalSourcePre').append(convertForPre(logicalSources[0].toString));
        selectedLogicalSource = logicalSources[0];

    });



    //changelistener
    $('#logicalSourcesSelect').change(function() {

        $('#logicalSourcePre').empty();
        $('#logicalSourcePre').append(convertForPre(logicalSources[$('#logicalSourcesSelect').val()].toString));


        selectedLogicalSource = logicalSources[$('#logicalSourcesSelect').val()];

    });

    //refresh the pre tag
    var refreshDetails = function() {
        logicalSources=app.currentModel.attributes.parsedObject.logicalSources;
        $('#logicalSourcePre').empty();
        $('#logicalSourcePre').append(convertForPre(logicalSources[$('#logicalSourcesSelect').val()].toString));
    }



    //utility function
    var convertForPre = function(data) {
        return data.replace(/</g,'&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Edit modal
     */

    $('#editLogicalSourceBtn').click(function() {

        $('#editLogicalSourceBody').empty();

        for(var i = 0; i < selectedLogicalSource.triples.length; i++) {
            $('#editLogicalSourceBody').append('<label>'+stripUri(selectedLogicalSource.triples[i].predicate)+'</label>');
            $('#editLogicalSourceBody').append("<input type='text' id='object" + i + "' class='form-control' placeholder='"+selectedLogicalSource.triples[i].object+"'></input><br/>");
        }


    });



    $('#saveLogicalSourceBtn').click(function() {
        for(var i = 0; i < selectedLogicalSource.triples.length; i++) {
            if($('#object'+i).val() != '') {
                selectedLogicalSource.triples[i].object = $('#object'+i).val();
            }
        }
        $.post('/workbench/mapping/logical/update', {mappingObject:app.currentModel.attributes.parsedObject,mappingID:app.currentModel.attributes._id} , function(data) {
            app.currentModel.attributes.parsedObject = data;
            console.log(app.currentModel.attributes.parsedObject);
            //replace <> with lt& en gt&
            for(var i = 0; i < app.mappings.models.length; i++) {
                var attributes = app.mappings.models[i].attributes;
                attributes.convertedData = convertForPre(data.toString);
            }
            app.mappingsContentView.model = app.currentModel;
            $('#mappingContent').empty();
            $('#mappingContent').html(app.mappingsContentView.render().el);
            refreshDetails();
        });
    });



    var stripUri = function(string) {
        var output = string.replace(/.*\#/,'');
        output = output.charAt(0).toUpperCase() + output.substr(1);
        return output;
    }



});