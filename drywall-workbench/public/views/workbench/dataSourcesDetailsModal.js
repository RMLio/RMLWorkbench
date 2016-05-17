/**
 * Created by wmaroy on 15.05.16.
 */
$(document).ready(function() {

    var dataSources;
    var selectedDataSource;

    /**
     * Details modal
     */

    //opening modal
    $('#dataSourcesDetailsBtn').click(function() {

        dataSources = app.currentModel.attributes.parsedObject.inputSources;

        $('#dataSourcesSelect').empty();

        for(var i = 0; i < dataSources.length; i++) {
            $('#dataSourcesSelect').append('<option value="' + i + '">' + dataSources[i].uri + '</option>');
        }

        //initial value
        $('#dataSourcePre').empty();
        $('#dataSourcePre').append(convertForPre(dataSources[$('#dataSourcesSelect').val()].toString));
        selectedDataSource = dataSources[0];

    });



    //changelistener
    $('#dataSourcesSelect').change(function() {

        $('#dataSourcePre').empty();
        $('#dataSourcePre').append(convertForPre(dataSources[$('#dataSourcesSelect').val()].toString));


        selectedDataSource = dataSources[$('#dataSourcesSelect').val()];

    });

    //refresh the pre tag
    var refreshDetails = function() {
        dataSources=app.currentModel.attributes.parsedObject.inputSources;
        $('#dataSourcePre').empty();
        $('#dataSourcePre').append(convertForPre(dataSources[$('#dataSourcesSelect').val()].toString));
    }



    //utility function
    var convertForPre = function(data) {
        return data.replace(/</g,'&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Edit modal
     */

    $('#editDataSourceBtn').click(function() {

        $('#editDataSourceBody').empty();

        for(var i = 0; i < selectedDataSource.triples.length; i++) {
            $('#editDataSourceBody').append('<label>'+stripUri(selectedDataSource.triples[i].predicate)+'</label>');
            $('#editDataSourceBody').append("<input type='text' id='object" + i + "' class='form-control' placeholder='"+selectedDataSource.triples[i].object+"'></input><br/>");
        }


    });

    $('#removeDataSourceBtn').click(function() {
        var triples = app.currentModel.attributes.parsedObject.triples;
        for(var i = 0; i < triples.length; i++) {
            for(var j = 0; j < selectedDataSource.triples.length; j++) {
                if(selectedDataSource.triples[j].subject === triples[i].subject &&
                    selectedDataSource.triples[j].predicate === triples[i].predicate &&
                    selectedDataSource.triples[j].object === triples[i].object) {
                    triples.splice(i,1);
                }
            }

        }
        $.post('/workbench/mapping/data/update', {mappingObject:app.currentModel.attributes.parsedObject,mappingID:app.currentModel.attributes._id} , function(data) {
            app.currentModel.attributes.parsedObject = data;
            //replace <> with lt& en gt&
            for(var i = 0; i < app.mappings.models.length; i++) {
                var attributes = app.mappings.models[i].attributes;
                attributes.convertedData = convertForPre(data.toString);
            }
            app.mappingsContentView.model = app.currentModel;
            $('#mappingContent').empty();
            $('#mappingContent').html(app.mappingsContentView.render().el);
            notify('Data source removed.', 'information');
            refreshDetails();
        }).fail(function(err) {
            notify(err.responseText, 'error');
        });
    });



    $('#saveDataSourceBtn').click(function() {
        for(var i = 0; i < selectedDataSource.triples.length; i++) {
            if($('#object'+i).val() != '' && $('#object'+i).val() != undefined) {
                selectedDataSource.triples[i].object = $('#object'+i).val();
            }
        }
        $.post('/workbench/mapping/data/update', {mappingObject:app.currentModel.attributes.parsedObject,mappingID:app.currentModel.attributes._id} , function(data) {
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
            notify('Data source edited.', 'information');
        }).fail(function() {
                notify('Something bad happened...', 'error');
            }
        );
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