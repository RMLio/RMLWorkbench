$(document).ready(function() {
    /***
     *
     * Logical sources
     *
     */
    var selectedIndex;
    var sparqlList = [];

    $('#openSparqlLogical').click(function() {
        sparqlList.length =0 ;
        $.get('/workbench/fetch/description',function(data) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].type === 'sd') {
                    sparqlList.push(data[i]);
                }
            }
            for(var i = 0; i < sparqlList.length;i++) {
                $('#logicalSparqlSource').append('<option value="'+sparqlList[i]._id+'">'+sparqlList[i].name+'</option>');
            }
        });
    });


});