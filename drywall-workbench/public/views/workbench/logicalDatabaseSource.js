$(document).ready(function() {
    /***
     *
     * Logical sources
     *
     */
    var selectedIndex;
    var list = [];

    $('#openDatabaseLogical').click(function() {
        list.length =0 ;
        $.get('/workbench/fetch/description',function(data) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].type === 'd2rq') {
                    list.push(data[i]);
                }
            }
            for(var i = 0; i < list.length;i++) {
                $('#logicalDBSource').append('<option value="'+list[i]._id+'">'+list[i].name+'</option>');
            }
        });
    });


});