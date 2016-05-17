/* global app:true */

(function() {

    'use strict';    


    app = app || {};
    
    app.currentModel;

    //hacky fix
    $.fn.modal.Constructor.prototype.enforceFocus = function () {};



    /***
     * 
     * MODELS PUBLISH
     * 
     ***/

    app.Publish = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            _id: undefined,
            filename: ''
        }
    });

    app.Publishes = Backbone.Collection.extend({
        model: app.Publish,
        url: '/workbench/fetch/rdf'
    });
    
    /***
     * 
     * MODELS MAPPING
     * 
     ***/
    
    app.Mapping = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: { 
            _id: undefined,
            filename: ''
        },
        url: '/workbench/mapping/execute/'
    });

    app.Mappings = Backbone.Collection.extend({
        model: app.Mapping,
        url: '/workbench/fetch/mapping'
    });
     /***
     * 
     * MODELS Descrptions
     * 
     ***/
    
    app.Description = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {}
    });
    
    app.Descriptions = Backbone.Collection.extend({
        model: app.Description,
        url: '/workbench/fetch/description'
    });
    
    
    
     /***
     * 
     * MODELS SCHEDULES
     * 
     ***/
    
    app.Schedule = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {}
    });
    
    app.Schedule = Backbone.Collection.extend({
        model: app.Schedule,
        url: '/workbench/fetch/schedule'
    });
    
    
    /***
     * 
     * VIEWS MAPPING
     * 
     ***/
    
    
    
    
   
    
    

    app.MappingsView = Backbone.View.extend({
        tagName: 'div',
        className: 'list-group mappingsView',
        
        initialize: function() {

        },

        render: function(eventName) {
            _.each(this.model.models, function(mapping) {
                $(this.el).append(new app.MappingItemView({ model: mapping }).render().el);
            }, this);
            return this;
        }
    });
    
    app.MappingsContentView = Backbone.View.extend({
       tagName: 'pre',
       template: _.template($('#mapping-content').html()),
       
       initialize: function(){
		    this.model.on('change', this.render, this);
       },                
       
       render: function() {
           $(this.el).attr('id', 'bigpre');
            $(this.el).html(this.template(this.model.toJSON()));
            return this;  
       }
    });

    


    app.MappingItemView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item viewMapping',

        template: _.template($('#mapping-list-item').html()),

        initialize: function() {
            
        },
        
        events: {
	        'click h6' : 'viewMapping'
        },

        viewMapping: function(ev){
              
               
                app.mappingsContentView.model = this.model; 
                //app.executeMappingView.model = this.model;
                app.currentModel = this.model;
                app.mappingsContentView.render();
                $('#mappingTitle').text('File name: ' + app.currentModel.attributes.filename); 
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    
    /***
     * 
     * VIEWS PUBLISHING
     * 
     ***/
    
    app.PublishesView = Backbone.View.extend({
        tagName: 'div',
        className: 'list-group publishView',
        
        initialize: function() {
                    
        },

        render: function(eventName) {
            _.each(this.model.models, function(publish) {
                $(this.el).append(new app.PublishItemView({ model: publish }).render().el);
            }, this);
            return this;
        }
    });
    
    app.PublishContentView = Backbone.View.extend({
       tagName: 'pre', 
       template: _.template($('#publish-content').html()),
       
       initialize: function(){
		    this.model.on('change', this.render, this);
       },     
                    
       
       render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;  
       }
    });

    app.PublishItemView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item viewPublish',

        template: _.template($('#publish-list-item').html()),

        initialize: function() {
            
        },
        
        events: {
	        'click h6' : 'viewPublish'
        },

        viewPublish: function(ev){
                app.currentModel = this.model;
                app.publishContentView.model = this.model; 
                app.publishContentView.render(); 
                $('#publishingTitle').text('File name: ' + app.currentModel.attributes.filename);
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },


    });
    
    
    
    /**
    /***
     * 
     * VIEWS DATA ACCESS
     * 
     ***/
    /***
    app.DescriptionsView = Backbone.View.extend({
        tagName: 'div',
        className: 'list-group descriptionView',
        
        initialize: function() {
                    
        },

        render: function(eventName) {
            _.each(this.model.models, function(description) {
                $(this.el).append(new app.DescriptionItemView({ model: description }).render().el);
            }, this);
            return this;
        }
    });
    
    app.DescriptionContentView = Backbone.View.extend({
       tagName: 'pre', 
       template: _.template($('#description-content').html()),
       
       initialize: function(){
		    this.model.on('change', this.render, this);
       },     
                    
       
       render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;  
       }
    });

    app.DescriptionItemView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item viewDescription',

        template: _.template($('#description-list-item').html()),

        initialize: function () {

        },

        events: {
            'click h6': 'viewDescription'
        },

        viewDescription: function (ev) {
            app.currentModel = this.model;
            app.descriptionContentView.model = this.model;
            app.descriptionContentView.render();
            //$('#mappingContent').html(app.mappingsContentView.render().el)
        },

        render: function (eventName) {
            $(this.el).attr('href', '#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });


     **/

     /***
     * 
     * APP CONFIG
     * 
     ***/
    

    app.Router = Backbone.Router.extend({
        routes: {
            '': 'default',
        },
        initialize: function() {            
            app.render();          
        },
        default: function() {                    
                            
        }
    });
    
    
    /***
     * 
     * APP RENDERING
     * 
     ***/
    
    
    app.render = function() {
        
        app.mappings = new app.Mappings();                
            
        app.publishes = new app.Publishes();
        
        app.descriptions = new app.Descriptions();
        
        app.currentScheduleMappings = [];


        /***
         *
         *
         * RENDERING DATA DESCRIPTIONS
         *
         */

        $('#descriptionMain').empty();

        $('#descriptionTitle').text('Select a description');
        $.get('/workbench/fetch/description', function(data) {
            for(var i = 0; i < data.length; i++) {
                $('#descriptionMain').append('<a href="#"  class="descriptionItem list-group-item">'+data[i].type+'</a>');
            }
            $('.descriptionItem').click(function() {
                $('#descriptionpre').text(data[$('.descriptionItem').index(this)].data);
                app.currentModel = {};
                app.currentModel.attributes = data[$('.descriptionItem').index(this)];
                $('#localTitle').text('File name: ' + data[$('.descriptionItem').index(this)].data);
            })
        });


        /***
         *
         * RENDERING LOCAL
         *
         */

        $('#localMain').empty();

        $('#localTitle').text('Select a file');
        $.get('/workbench/fetch/input',function(files) {
            for(var i = 0; i < files.length; i++) {
                $('#localMain').append('<a href="#"  class="localFileItem list-group-item">'+files[i].filename+'</a>');
            }

            $('.localFileItem').click(function() {
                console.log(files[$('.localFileItem').index(this)].data);
                $('#localpre').text(files[$('.localFileItem').index(this)].data);
                app.currentModel = {};
                app.currentModel.attributes = files[$('.localFileItem').index(this)];
                $('#localTitle').text('File name: ' + files[$('.localFileItem').index(this)].filename);
            })


        });



        //setting css
        $('#localMain').css('min-height',$(window).height()*0.82 + 'px');
        $('#localMain').css('max-height',$(window).height()*0.82 + 'px');
        $('#localContent').css('min-height',$(window).height()*0.75 + 'px');
        $('#localContent').css('max-height',$(window).height()*0.75 + 'px');
        $('#localBody').css('min-height',$(window).height()*0.82 + 'px');
        $('#localBody').css('max-height',$(window).height()*0.82 + 'px');
        $('#localpre').css('min-height',$(window).height()*0.75 + 'px');
        $('#localpre').css('max-height',$(window).height()*0.75 + 'px');




        /***
        *
        * RENDERING MAPPINGS
        *
        ***/
        
        app.mappings.fetch({success: function() {    
                            
                if(app.mappings.models.length != 0) {
                
                    //replace <> with lt& en gt&    
                    for(var i = 0; i < app.mappings.models.length; i++) {
                        var attributes = app.mappings.models[i].attributes;
                        attributes.convertedData = attributes.parsedObject.toString.replace(/</g,'&lt;').replace(/>/g, '&gt;');
                    }       
                    
                    //creating views
                    app.currentModel = app.mappings.models[0];


                    app.mappingsView = new app.MappingsView({model:app.mappings});
                    app.mappingsContentView = new app.MappingsContentView({model: app.currentModel});
                    //app.executeMappingView = new app.ExecuteMappingView({model: app.currentModel});


                    
                    //rendering with jquery
                    $('#mappingMain').html(app.mappingsView.render().el);    
                    $('#mappingContent').html(app.mappingsContentView.render().el);

                    //settint text
                    $('#mappingTitle').text('File name: ' + app.currentModel.attributes.filename);
                    
                    
                    

                    
                    //setting css   
                    $('#mappingMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#mappingContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#mappingContent').css('max-height',$(window).height()*0.75 + 'px');                                     
                    $('#mappingBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingBody').css('max-height',$(window).height()*0.82 + 'px');
                    $('#bigpre').css('min-height',$(window).height()*0.75 + 'px');
                    $('#bigpre').css('max-height',$(window).height()*0.75 + 'px');
                    
                    
                    //Setting mapping list scheduling
                    $('#scheduleMappingList').empty();
                    $('#scheduleMappingList').append('<option>CHOOSE MAPPING</option>')
                    for(var i =0; i < app.mappings.models.length; i++) {
                        var mapping = app.mappings.models[i];
                        $('#scheduleMappingList').append('<option value="' + mapping.attributes._id +'">' + mapping.attributes.filename + '</option>');
                    }
                    
                    
                } else {
                    //clearing workbench
                    $('.workbenchElement').empty();
                    $('#mappingTitle').text('No files...');
                    //setting css   
                    $('#mappingMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#mappingContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#mappingContent').css('max-height',$(window).height()*0.75 + 'px');                                     
                    $('#mappingBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingBody').css('max-height',$(window).height()*0.82 + 'px');
                    $('#bigpre').css('min-height',$(window).height()*0.75 + 'px');
                    $('#bigpre').css('max-height',$(window).height()*0.75 + 'px');
                }
                
            }}); 
            
            
            /***
            *
            * RENDERING PUBLISHINGS
            *
            ***/ 
             
                       
            app.publishes.fetch({success: function() {
                
                if(app.publishes.models.length != 0) {
                
                    //replace <> with lt& en gt&    
                    for(var i = 0; i < app.publishes.models.length; i++) {
                        var attributes = app.publishes.models[i].attributes;
                        attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                    }
                    //creating views
                    app.publishesView = new app.PublishesView({model:app.publishes});
                    app.publishContentView = new app.PublishContentView({model: app.publishes.models[0]});
                    
                    
                    //rendering with jquery
                    $('#publishMain').html(app.publishesView.render().el);    
                    $('#publishContent').html(app.publishContentView.render().el);    
                     
                    app.currentModel = app.publishes.models[0];   
                     
                        
                    //setting text
                    $('#publishingTitle').text('File name: ' + app.currentModel.attributes.filename);    
                        
                    //Setting css
                    $('#publishMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#publishContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#publishContent').css('max-height',$(window).height()*0.75 + 'px');    
                    $('#publishBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishBody').css('max-height',$(window).height()*0.82 + 'px');    
                    $('bigpre').css('min-height',$(window).height()*0.75 + 'px');
                    $('bigpre').css('max-height',$(window).height()*0.75 + 'px');
                
                    
                        
    
            } else {
                    $('.publishElement').empty(); 
                    $('#publishingTitle').text('No files...');
                    //Setting css
                    $('#publishMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#publishContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#publishContent').css('max-height',$(window).height()*0.75 + 'px');    
                    $('#publishBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishBody').css('max-height',$(window).height()*0.82 + 'px');    
                    $('bigpre').css('min-height',$(window).height()*0.75 + 'px');
                    $('bigpre').css('max-height',$(window).height()*0.75 + 'px');
                }
            }}); 
            
            
            /***
             *              
             * JQUERY SCHEDULING             
             * 
             */
            
                       
            
            
            $.get('/workbench/schedules',function(schedules) {
                $('#scheduleTable').empty();
                $('#scheduleTable').append('<tr><th>Name</th><th>Date</th><th>#Mappings</th><th>#Triples</th><th>#Publishings</th><th>Description</th><th>Executed</th></tr>');
                for(var i = 0; i < schedules.length; i++) {
                    $('#scheduleTable').append(function() {                 
                        
                        var executed = 'No';
                        
                        if(schedules[i].executed == true) {
                            executed = 'Yes';
                        }
                        
                        return '<tr data-toggle="modal" data-target="#jobmodal" id='+schedules[i]._id+'><td>'+schedules[i].title+'</td><td>'+schedules[i].date+'</td><td>'+schedules[i].amountMapping+'</td><td>'+schedules[i].amountTriples+'</td><td>'+schedules[i].amountPublishing+'</td><td>'+schedules[i].description+'</td><td>'+executed+'</td></tr>'   
                    });
                    var t = i;
                    $('#'+schedules[t]._id).click(function() {
                        app.currentSchedule = schedules[t];
                        $('#cancel_job').click(function() {
                            console.log('?');
                            $.post('/workbench/schedules/cancel', {schedule_id: app.currentSchedule._id},function() {
                                app.render();                    
                            });    
                        }); 
                    });
                       
                }   
                $('#scheduleBody').css('min-height',$(window).height()*0.82 + 'px');
                $('#scheduleBody').css('max-height',$(window).height()*0.82 + 'px');                                 
            });
            
            
            /***
            *
            * RENDERING Descriptions
            *
            ***/ 
             /**
                       
            app.descriptions.fetch({success: function() {
                
                if(app.descriptions.models.length != 0) {
                
                    //replace <> with lt& en gt&    
                    for(var i = 0; i < app.descriptions.models.length; i++) {
                        var attributes = app.descriptions.models[i].attributes;
                        attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                    }
                    //creating views
                    app.descriptionsView = new app.DescriptionsView({model:app.descriptions});
                    app.descriptionContentView = new app.DescriptionContentView({model: app.descriptions.models[0]});
                    app.clearDescriptionView = new app.ClearDescriptionView();
                    app.clearAllDescriptionsView = new app.ClearAllDescriptionsView();
                    
                    //rendering with jquery
                    $('#descriptionMain').html(app.descriptionsView.render().el);    
                    $('#descriptionContent').html(app.descriptionContentView.render().el);    
                    $('#clearDescriptionbutton').html(app.clearDescriptionView.render().el);
                    $('#clearallDescriptionsbutton').html(app.clearAllDescriptionsView.render().el);  
                                      
                } else {
                    $('.descriptionElement').empty();   
                }
            }});
            */
            /***
            *
            * RENDERING Schedule
            *
            ***/ 
             
            /*           
            app.schedules.fetch({success: function() {
                
                if(app.schedules.models.length != 0) {
                
                    //replace <> with lt& en gt&    
                    for(var i = 0; i < app.schedules.models.length; i++) {
                        var attributes = app.schedules.models[i].attributes;
                        attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                    }
                    //creating views
                    app.schedulesView = new app.SchedulesView({model:app.schedules});
                    app.scheduleContentView = new app.ScheduleContentView({model: app.schedules.models[0]});
                    app.clearscheduleingView = new app.ClearScheduleingView();
                    app.clearAllScheduleingsView = new app.ClearAllScheduleingsView();
                    
                    //rendering with jquery
                    $('#scheduleMain').html(app.schedulesView.render().el);    
                    $('#scheduleContent').html(app.scheduleContentView.render().el);    
                    $('#clearscheduleingbutton').html(app.clearScheduleingView.render().el);
                    $('#clearallscheduleingsbutton').html(app.clearAllScheduleingsView.render().el);  
                                      
                } else {
                    $('.workbenchElement').empty();   
                }

            }});
            */

    };
  
 
    
    
    
    /*
    *   ##########
    *   # JQuery #
    *   ##########
    */
    
    
    /***
     * 
     * UPLOADING FILES
     * 
     ***/

    function AddButtonNoFile(formId) {
        console.log(formId);
       $(formId).on("submit", function(event){
            event.preventDefault();
            console.log(formId);
            var form_url = $(formId).attr("action");
            var inputs = $(formId + ' .form-control');
            var values = {};
            inputs.each(function() {
                values[ $(this).attr("id")] = $(this).val();
                console.log( $(this).attr("id") + " " + $(this).val());
            });

            $.ajax({
                url:  form_url,
                type: 'POST',
                headers: {
                    'X-CSRF-Token': $.cookie("_csrfToken")
                },
                data: values,
                dataType: 'JSON',
                statusCode: {
                    200: function() {
                        app.render();
                    }
                }
            });

        });
    }

    AddButtonNoFile("#api_input_Form");
    AddButtonNoFile("#db_input_Form");
    AddButtonNoFile("#sparql_input_Form");
    AddButtonNoFile("#dcat_input_Form");
    AddButtonNoFile("#csvw_input_Form");
    AddButtonNoFile("#db_logical_Form");
    AddButtonNoFile("#api_logical_Form");
    AddButtonNoFile("#sparql_logical_Form");
    AddButtonNoFile("#dcat_logical_Form");



   /**
    * 
    * Scheduling button
    */
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
               var post = {
                   name: title,
                   description: description,
                   date:date,
                   mappingsFromFile : app.currentScheduleMappings,
                   mappingsFromTriples: triples 
               }
               
               var newDate = new Date(year,month,day,hour,minute);
               var now = new Date();
               
               if(newDate > now) {
                   
                   
                        $.post('/workbench/addToSchedule',post,function() {
                            app.render();               
                        });
                                               
               } else {
                   $("#scheduleContainer").prepend('<div style="margin-top:15px" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Date has already passed..</strong></div>');
            
               }
               
            });
            
            
    /***
     * 
     * 
     * Actions
     * 
     * 
     */

    //setting button actions
    $('#clearLocalFile').click(function() {

        $.post('/workbench/clear/source/',{sources: [app.currentModel.attributes._id]},function() {
            notify('Local file deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;
    });

    $('#clearAllLocalFiles').click(function() {
        $.post('/workbench/clear/all/source',function() {
            notify('Local files deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;;
    })

    
    //setting button actions
    $('#clearMapping').click(function() {

        $.post('/workbench/clear/mapping/',{mappings: [app.currentModel.attributes._id]},function() {
            notify('Mapping deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;
    });
    
    $('#clearAllMappings').click(function() {
        $.post('/workbench/clear/all/mapping',function() {
            notify('Mappings deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;;
    })


    
    //setting button actions
    $('#clearPublishing').click(function() {
        $.post('/workbench/clear/rdf/',{rdf: [app.currentModel.attributes._id]},function() {
            notify('File deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;;
    });
    
    $('#clearAllPublishings').click(function() {
        $.post('/workbench/clear/all/rdf',function() {
            notify('Files deleted!','information');
            app.render();
        }).fail(function(err) {
            notify(err.message,'error');
        })
        ;;
    })

            
    /**
     * 
     * Rendering on tab click
     * 
     */
    
    $('.menuTab').click(function() {
        app.render();
    });
    
    
    /**
     * 
     * Adding mapping to well (schedule modal)
     * 
     */
    
    $('#addScheduleMappingButton').click(function() {
        if($('#scheduleMappingList').find("option:selected").text() !== 'CHOOSE MAPPING') {
            $('#scheduleMappingWellList').append('<li>'+$('#scheduleMappingList').find("option:selected").text()+'</li>');
            app.currentScheduleMappings.push($('#scheduleMappingList').val());
        } else {
            $("#scheduleModalFooter").append('<div style="margin-top:15px" class="alert alert-info alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Don'+"'"+'t add that one ;)</strong></div>');
        }
    });

   
    /*
    * Uploading mapping file
    */
    $("#uploadMapping_Form").on("submit", function(event){
        event.preventDefault();
        var ext = $('input[id=mappingFile]')[0].files[0].name.replace(/^[^\.]*\./, '');
        //if(ext == 'rml' || ext == 'rml.ttl' ) {
            
            var form_url = $("form[id='uploadMapping_Form']").attr("action");
        var CSRF_TOKEN = $('input[name="_csrf"]').val();                    

        var form = new FormData();
        form.append('mappingUpload', $('input[id=mappingFile]')[0].files[0]);        


        $.ajax({
            url:  form_url,
            type: 'POST',
            headers: {
                'X-CSRF-Token': $.cookie("_csrfToken")
            },
            "mimeType": "multipart/form-data",
            data: form,
            contentType: false, 
            processData: false,
            
            dataType: 'JSON',
            statusCode: {
                200: function() {
                    notify('Upload successful!', 'success');
                    app.render();
                },
                409: function() {
                    notify('Wrong file type!', 'warning');
                }
            }
        });
            
        //} else {
            //notify('Wrong file type!', 'warning');
        //}
                      
    });
    
    /**
     * Uploading RDF file
     */
    
    $("#uploadPublishing_Form").on("submit", function(event){
        event.preventDefault();                     
        var ext = $('input[id=publishingFile]')[0].files[0].name.replace(/^.*\./, '');
        if(ext=='ttl' || ext=='rdf') {
            var form_url = $("form[id='uploadPublishing_Form']").attr("action");
            var CSRF_TOKEN = $('input[name="_csrf"]').val();                    

            var form = new FormData();
            form.append('rdfUpload', $('input[id=publishingFile]')[0].files[0]);       

            $.ajax({
                url:  form_url,
                type: 'POST',
                headers: {
                    'X-CSRF-Token': $.cookie("_csrfToken")
                },
                "mimeType": "multipart/form-data",
                data: form,
                contentType: false, 
                processData: false,
                
                dataType: 'JSON',
                statusCode: {
                    200: function() {
                        notify('Upload successful!', 'success');
                        app.render();
                    },
                    409: function() {
                        notify('Wrong file type!', 'warning');
                    }
                }            
            }); 
        } else {
           $("#uploadPublishing_Form").append('<div style="margin-top:15px" class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Wrong file type!</strong></div>')
         
        }
        
                           
    });
    
    /**
     * 
     * Uploading sourcefile
     * 
     */
    
    $("#uploadSource_Form").on("submit", function(event){
        event.preventDefault();                     

        var form_url = $("form[id='uploadSource_Form']").attr("action");
        var CSRF_TOKEN = $('input[name="_csrf"]').val();                    

        var form = new FormData();
        form.append('sourceUpload', $('input[id=sourceFile]')[0].files[0]);        


        $.ajax({
            url:  form_url,
            type: 'POST',
            headers: {
                'X-CSRF-Token': $.cookie("_csrfToken")
            },
            "mimeType": "multipart/form-data",
            data: form,
            contentType: false, 
            processData: false,
            
            dataType: 'JSON',
            statusCode: {
                200: function() {
                    notify('Upload successful!', 'success');
                    app.render();
                }   
            }            
        }); 
        
                           
    });
    
    /***
     * 
     * Publishing a file
     * 
     ***/
     
     $('#publishToLDFForm').on('submit', function(event) {        
        event.preventDefault();
        
        var rdf = app.currentModel.attributes;
        var dataset = { 
            title: rdf.filename,
            type: 'TurtleDatasource',
            description: 'default',
            settings: {
                file: './' + rdf.filename
            }
        };
        
        var data = {
            dataset: dataset,
            data: rdf.data,
            filename: rdf.filename
        }
        
         
        $.ajax({
            url : "/workbench/publish/ldf",
            type: "POST", 
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify(data),
            success    : function(){
                notify('Publishing successful!', 'success');
        }
        });   
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
    
    
    
        app.firstLoad = true;
        app.router = new app.Router();
        Backbone.history.start();
    

}());
