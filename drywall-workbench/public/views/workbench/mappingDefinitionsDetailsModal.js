/**
 * Created by wmaroy on 15.05.16.
 */

$(document).ready(function() {


    var mappingDefinitions;
    var selectedMappingDefinition;

    /**
     * Details modal
     */

    //opening modal
    $('#mappingDefinitionsDetailsBtn').click(function() {

        mappingDefinitions = app.currentModel.attributes.parsedObject.mappingDefinitions;

        $('#mappingDefinitionsSelect').empty();

        for(var i = 0; i < mappingDefinitions.length; i++) {
            $('#mappingDefinitionsSelect').append('<option value="' + i + '">' + mappingDefinitions[i].uri + '</option>');
        }

        //initial value
        $('#mappingDefinitionsPre').empty();
        $('#mappingDefinitionsPre').append(convertForPre(mappingDefinitions[0].toString));
        selectedMappingDefinition = mappingDefinitions[0];

    });

    //changelistener
    $('#mappingDefinitionsSelect').change(function() {

        $('#mappingDefinitionsPre').empty();
        $('#mappingDefinitionsPre').append(convertForPre(mappingDefinitions[$('#mappingDefinitionsSelect').val()].toString));


        selectedMappingDefinition = mappingDefinitions[$('#mappingDefinitionsSelect').val()];

    });





    /**
     * Edit modal
     */

    $('#editMappingDefinitionBtn').click(function() {

        $('#editMappingDefinitionBody').empty();

        for(var i = 0; i < selectedMappingDefinition.triples.length; i++) {
            if(selectedMappingDefinition.triples[i].predicate == "http://semweb.mmlab.be/ns/rml#logicalSource") {
                $('#editMappingDefinitionBody').append('<label>' + stripUri(selectedMappingDefinition.triples[i].predicate) + '</label>');
                $('#editMappingDefinitionBody').append("<input type='text' id='object" + i + "' class='form-control' placeholder='" + selectedMappingDefinition.triples[i].object + "'></input><br/>");
            }
        }


    });



    $('#saveMappingDefinitionBtn').click(function() {

        for(var i = 0; i < selectedMappingDefinition.triples.length; i++) {
            if($('#object'+i).val() != '') {
                selectedMappingDefinition.triples[i].object = $('#object'+i).val();
            }
        }

        refreshDetails();



        $.post('/workbench/mapping/definition/update', {mappingObject:app.currentModel.attributes.parsedObject,mappingID:app.currentModel.attributes._id} , function(data) {

            app.currentModel.attributes.parsedObject = data;

            //replace <> with lt& en gt&
            for(var i = 0; i < app.mappings.models.length; i++) {
                var attributes = app.mappings.models[i].attributes;
                attributes.convertedData = convertForPre(data.toString);
            }
            app.mappingsContentView.model = app.currentModel;
            $('#mappingContent').empty();
            $('#mappingContent').html(app.mappingsContentView.render().el);
            refreshDetails();
            notify('Mapping definition edited.', 'information');
        }).fail(function() {
            notify('Something bad happened...', 'error');
        });

    });


    /**
     * Utility
     */


    //utility function
    var convertForPre = function(data) {
        return data.replace(/</g,'&lt;').replace(/>/g, '&gt;');
    }

    //refresh the pre tag
    var refreshDetails = function() {
        mappingDefinitions=app.currentModel.attributes.parsedObject.mappingDefinitions;
        console.log(convertForPre(mappingDefinitions[$('#mappingDefinitionsSelect').val()].toString));
        $('#mappingDefinitionsPre').empty();
        $('#mappingDefinitionsPre').append(convertForPre(mappingDefinitions[$('#mappingDefinitionsSelect').val()].toString));
    }


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


})
