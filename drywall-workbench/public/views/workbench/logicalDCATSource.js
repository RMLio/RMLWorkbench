$(document).ready(function() {
    /***
     *
     * Logical sources
     *
     */
    var selectedIndex;
    var dcatList = [];

    $('#openDcatLogical').click(function() {
        dcatList.length =0 ;
        $.get('/workbench/fetch/description',function(data) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].type === 'dcat') {
                    dcatList.push(data[i]);
                }
            }
            for(var i = 0; i < dcatList.length;i++) {
                $('#logicalDCATSource').append('<option value="'+dcatList[i]._id+'">'+dcatList[i].name+'</option>');
            }
        });
    });


});