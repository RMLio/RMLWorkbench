/**
 * Created by wmaroy on 18.05.16.
 */
$(document).ready(function() {
    /**
     *
     * Scheduling button
     */

    var mappingIndex;

    $('#openScheduleModalBtn').click(function() {
        app.currentScheduleMappings.length =0;
        $('#scheduleMappingList').empty();
        for(var i =0; i < app.mappings.models.length; i++) {
            var mapping = app.mappings.models[i];
            $('#scheduleMappingList').append('<option value="' + mapping.attributes._id +'">' + mapping.attributes.filename + '</option>');
        }
        app.currentScheduleMappings.push($('#scheduleMappingList').val());
        mappingIndex = $('#scheduleMappingList').prop('selectedIndex');
        var mapping = app.mappings.models[mappingIndex].attributes.parsedObject;
        $('#scheduleMappingWellList').empty();
        for(var i = 0; i < mapping.mappingDefinitions.length; i++) {
            $('#scheduleMappingWellList').append('<label>' +
                '<input class="radioTriple" id="scheduleTriple' + i + '"  type="checkbox">' +
                mapping.mappingDefinitions[i].uri.replace(/(.*)\#/,'') +
                '</label><br/>');
        }
    });

    $('#scheduleButton').click(function() {




        var fulldate = $('#scheduleDate').val();
        var description = $('#scheduleDescription').val();
        var title = $('#scheduleTitle').val();

        var month = fulldate.substring(0,2);
        var day = fulldate.substring(3,5);
        var year = fulldate.substring(6,10);
        var hour = fulldate.substring(11,13);
        if(hour.indexOf(':') > -1) {
            hour = fulldate.substring(11,12);
            var minute = fulldate.substring(13,15);
            if(fulldate.charAt(16) == 'P') {
                hour = parseInt(hour) + 12;
            }
        } else {
            var minute = fulldate.substring(14,16);
            if(fulldate.charAt(17) == 'P') {
                hour = parseInt(hour) + 12;
            }
        }
        var date = {
            year: year,
            month: month-1,
            day: day,
            hour: hour,
            minute: minute
        }

        var triples = [];

        for(var i = 0; i < $('#scheduleMappingWellList').children().length; i++) {
            if($('#scheduleTriple'+i).prop("checked")) {
                triples.push(app.mappings.models[mappingIndex].attributes.parsedObject.mappingDefinitions[i].uri);
            }
        };

        var toBePublished = $('#toBePublished').prop("checked");
        var publishTitle = $('#publishTitle').val();

        console.log(triples);

        var post = {
            name: title,
            description: description,
            date:date,
            mappingsFromFile : app.currentScheduleMappings,
            triples: triples,
            toBePublished: toBePublished,
            publishTitle: publishTitle
        }

        var newDate = new Date(year,month,day,hour,minute);
        var now = new Date();




        if(newDate > now) {




            $.post('/workbench/addToSchedule',post,function() {
                notify('Job added', 'information');
                app.render();
            }).fail(function() {
                notify('Scheduling failed', 'error');
            });

        } else {
            notify('Incorrect date', 'warning');
        }

        $('#scheduleForm')[0].reset();

    });



    $('#scheduleMappingList').on('change', function() {
        app.currentScheduleMappings.length = 0;
        app.currentScheduleMappings.push($('#scheduleMappingList').val());
        mappingIndex = $('#scheduleMappingList').prop('selectedIndex');
        var mapping = app.mappings.models[mappingIndex].attributes.parsedObject;
        $('#scheduleMappingWellList').empty();
        for(var i = 0; i < mapping.mappingDefinitions.length; i++) {
            $('#scheduleMappingWellList').append('<label>' +
                '<input class="radioTriple" id="scheduleTriple' + i + '"  type="checkbox">' +
                mapping.mappingDefinitions[i].uri.replace(/(.*)\#/,'') +
                '</label><br/>');
        }

    });

    $('#selectScheduleCheckbox').change(function() {
        if($('#selectScheduleCheckbox').prop( "checked" )) {
            for(var i = 0; i < mappingDefinitions.length; i++) {
                $('#tripleSchedule'+i).prop('checked', true);
            }
        } else {
            for(var i = 0; i < mappingDefinitions.length; i++) {
                $('#tripleSchedule'+i).prop('checked', false);
            }
        }

});

    var notify = function(text,type) {
        var n = noty({
            text: text, layout: 'bottomCenter',
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
            }
        });
        n.setTimeout(4500);
    };



});