/* global app:true */

(function() {

    'use strict';    


    app = app || {};
    
    app.currentModel;
    
    app.currentTriples = [];
    
    
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
     * MODELS TRIPLES
     * 
     ***/
    
    app.Triple = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {}
    });
    
    app.Triples = Backbone.Collection.extend({
        model: app.Triple 
    });
    
    
    /***
     * 
     * MODELS SOURCES
     * 
     ***/
    
    app.Triple = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {}
    });
    
    app.Triples = Backbone.Collection.extend({
        model: app.Triple 
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
    
    
    
    
    app.ExecuteButtonView = Backbone.View.extend({
        
        template: _.template($('#executeMappingButton').html()),        
        
        events: {
           'click button' : 'execute'
        }, 
        
        execute: function() {
          
          var selections = $('#triplelistdiv').children().children();
          var triplesToBeExecuted = [];
          for(var i = 0; i < selections.length; i++) {
              if(selections.eq(i).find('input').prop('checked')) {
                  triplesToBeExecuted.push(this.model.attributes.triples[i]._id);
              }
          }           
          
          var triples = {
              triples: triplesToBeExecuted
          }
            
          $.post('/workbench/mapping/execute/'+this.model.attributes._id+'/triples', triples , function() {              
              app.render();
          });  
        },          
        
        
        initialize: function() {
               
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });    
    
    
    

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
            $(this.el).html(this.template(this.model.toJSON()));
            return this;  
       }
    });
    
    app.TripleListView = Backbone.View.extend({
        
        events: {
          'click .executeMappingButton' : 'execute'  
        },
        
        execute: function() {
  
        },

        initialize: function() {
                
        },     
        render: function() {
            $(this.el).empty();
            _.each(this.model.models, function(triple) {
                $(this.el).append(new app.TripleItemView({ model: triple }).render().el);
            }, this);
             
            return this;
        }       
    });
    
    app.TripleItemView = Backbone.View.extend({
        template: _.template($('#triplelist').html()),
        initialize: function() {
            
        },
        
        events: {
        },

        render: function() {            
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
                app.executeMappingView.model = this.model;
                app.executeButtonView.model = this.model;
                app.currentModel = this.model;
                
                var triples = [];
                for(var i = 0; i < this.model.attributes.triples.length; i++) {
                    triples.push(new app.Triple(this.model.attributes.triples[i]));
                }              
                
                app.tripleListView.model = {models : triples};
                
                app.tripleListView.render();
                app.executeButtonView.render();               
                app.mappingsContentView.render();
                $('#mappingTitle').text('Filename: ' + app.currentModel.attributes.filename); 
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
                $('#publishingTitle').text('Filename: ' + app.currentModel.attributes.filename);
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },


    });
    
    
    
    
    /***
     * 
     * VIEWS DATA ACCESS
     * 
     ***/
    
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

        initialize: function() {
            
        },
        
        events: {
	        'click h6' : 'viewDescription'
        },

        viewDescription: function(ev){
                app.currentModel = this.model;
                app.descriptionContentView.model = this.model; 
                app.descriptionContentView.render(); 
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },


    });
    
    app.ClearDescriptionView = Backbone.View.extend({
        
        template: _.template($('#cleardescription').html()),
        
        events: {
          'click .cleardescription' : 'cleardescription'  
        },
        
        cleardescription: function() {
          $.post('/workbench/clear/description',{description: [app.currentModel.attributes._id]},function() {
              app.render();
              });  
        },
        
        initialize: function() {
            this.model = app.descriptions.models[0];    
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });
    
    app.ClearAllDescriptionsView = Backbone.View.extend({
        
        template: _.template($('#clearalldescriptions').html()),
        
        events: {
          'click .clearalldescriptions' : 'clearalldescriptions'  
        },
        
        clearalldescriptions: function() {
 
          $.post('/workbench/clear/all/description',function() {
              app.render();
              });  
        },
        
        initialize: function() {
            this.model = app.descriptions.models[0];    
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });
       
    /***
     * 
     * VIEWS SCHEDULING
     * 
     ***/
    /*
    app.scheduleesView = Backbone.View.extend({
        tagName: 'div',
        className: 'list-group scheduleView',
        
        initialize: function() {
                    
        },

        render: function(eventName) {
            _.each(this.model.models, function(schedule) {
                $(this.el).append(new app.scheduleItemView({ model: schedule }).render().el);
            }, this);
            return this;
        }
    });
    
    app.scheduleContentView = Backbone.View.extend({
       tagName: 'pre', 
       template: _.template($('#schedule-content').html()),
       
       initialize: function(){
		    this.model.on('change', this.render, this);
       },     
                    
       
       render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;  
       }
    });

    app.ScheduleItemView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item viewschedule',

        template: _.template($('#schedule-list-item').html()),

        initialize: function() {
            
        },
        
        events: {
	        'click h6' : 'viewschedule'
        },

        viewschedule: function(ev){
                app.currentModel = this.model;
                app.scheduleContentView.model = this.model; 
                app.scheduleContentView.render(); 
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },


    });
    */
    app.ClearScheduleingView = Backbone.View.extend({
        /*
        template: _.template($('#clearscheduleing').html()),
        
        events: {
          'click .clearscheduleing' : 'clearscheduleing'  
        },
        
        clearscheduleing: function() {
          $.post('/workbench/clear/schedule',{rdf: [app.currentModel.attributes._id]},function() {
              app.render();
              });  
        },
        
        initialize: function() {
            this.model = app.schedules.models[0];    
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }   */ 
    });
    
    app.ClearAllscheduleingsView = Backbone.View.extend({
        /*
        template: _.template($('#clearallscheduleings').html()),
        
        events: {
          'click .clearallscheduleings' : 'clearallscheduleings'  
        },
        
        clearallscheduleings: function() {
 
          $.post('/workbench/clear/all/rdf',function() {
              app.render();
              });  
        },
        
        initialize: function() {
            this.model = app.schedulees.models[0];    
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    */
    });
    
     
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
        
        //app.schedules = new app.Schedules();
        
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
                        attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                    }       
                    
                    //creating views
                    app.currentModel = app.mappings.models[0];


                    app.mappingsView = new app.MappingsView({model:app.mappings});
                    app.mappingsContentView = new app.MappingsContentView({model: app.currentModel});
                    //app.executeMappingView = new app.ExecuteMappingView({model: app.currentModel});
                    app.executeButtonView = new app.ExecuteButtonView({model: app.currentModel});                    
                    
                    var triples = [];
                    for(var i = 0; i < app.currentModel.attributes.triples.length; i++) {
                        triples.push(new app.Triple(app.currentModel.attributes.triples[i]));
                    }
                    
                    app.tripleListView = new app.TripleListView({model: { models:triples}});                    
                    
                    //rendering with jquery
                    $('#mappingMain').html(app.mappingsView.render().el);    
                    $('#mappingContent').html(app.mappingsContentView.render().el);
                    //$('#mappingmenu').html(app.executeMappingView.render().el);
                    $('#triplelistdiv').html(app.tripleListView.render().el);
                    $('#executeMappingButtonDiv').html(app.executeButtonView.render().el);
                    
                    //settint text
                    $('#mappingTitle').text('Filename: ' + app.currentModel.attributes.filename);
                    
                    //setting button actions
                    $('#clearMapping').click(function() {
                        $.post('/workbench/clear/mapping/',{mappings: [app.currentModel.attributes._id]},function() {
                            app.render();
                        });
                    });
                    
                    $('#clearAllMappings').click(function() {
                        $.post('/workbench/clear/all/mapping',function() {
                            app.render();
                        });
                    })
                    
                    $('#selectAllCheckbox').change(function() {
                        var selections = $('#triplelistdiv').children().children();
                        if($('#selectAllCheckbox').prop( "checked" )) {                    
                                for(var i = 0; i < selections.length; i++) {
                                    var selection = selections.eq(i).find('input');
                                    selections.eq(i).find('input').prop('checked', true);
                                    
                                }    
                        } else {
                                for(var i = 0; i < selections.length; i++) {
                                    selections.eq(i).find('input').prop('checked', false);
                                }   
                        }
                    });
                    
                    //setting css   
                    $('#mappingMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#mappingContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#mappingContent').css('max-height',$(window).height()*0.75 + 'px');                                     
                    $('#mappingBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#mappingBody').css('max-height',$(window).height()*0.82 + 'px');
                    $('pre').css('min-height',$(window).height()*0.75 + 'px');
                    $('pre').css('max-height',$(window).height()*0.75 + 'px');
                    
                    
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
                    $('pre').css('min-height',$(window).height()*0.75 + 'px');
                    $('pre').css('max-height',$(window).height()*0.75 + 'px');
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
                    $('#publishingTitle').text('Filename: ' + app.currentModel.attributes.filename);    
                        
                    //Setting css
                    $('#publishMain').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishMain').css('max-height',$(window).height()*0.82 + 'px');
                    $('#publishContent').css('min-height',$(window).height()*0.75 + 'px');
                    $('#publishContent').css('max-height',$(window).height()*0.75 + 'px');    
                    $('#publishBody').css('min-height',$(window).height()*0.82 + 'px');
                    $('#publishBody').css('max-height',$(window).height()*0.82 + 'px');    
                    $('pre').css('min-height',$(window).height()*0.75 + 'px');
                    $('pre').css('max-height',$(window).height()*0.75 + 'px');                  
                
                    //setting button actions
                    $('#clearPublishing').click(function() {
                        $.post('/workbench/clear/rdf/',{rdf: [app.currentModel.attributes._id]},function() {
                            app.render();
                        });
                    });
                    
                    $('#clearAllPublishings').click(function() {
                        $.post('/workbench/clear/all/rdf',function() {
                            app.render();
                        });
                    })
                        
    
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
                    $('pre').css('min-height',$(window).height()*0.75 + 'px');
                    $('pre').css('max-height',$(window).height()*0.75 + 'px');  
                }
            }}); 
            
            
            /***
             *              
             * JQUERY SCHEDULING             
             * 
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
               var mappings = [];
               var mappings2 = [];
               mappings.push($('#scheduleMappingList').val());
               var post = {
                   name: title,
                   description: description,
                   date:date,
                   mappingsFromFile : mappings,
                   mappingsFromTriples: mappings2 
               }
               
               $.post('/workbench/addToSchedule',post,function() {
                    app.render();                    
               }); 
               
            });           
            
            
            $.get('/workbench/schedules',function(schedules) {
                $('#scheduleTable').empty();
                $('#scheduleTable').append('<tr><th>Name</th><th>Date</th><th>#Mappings</th><th>Description</th><th>Executed</th></tr>');
                for(var i = 0; i < schedules.length; i++) {
                    $('#scheduleTable').append(function() {                 
                        
                        
                        
                        return '<tr data-toggle="modal" data-target="#jobmodal" id='+schedules[i]._id+'><td>'+schedules[i].name+'</td><td>'+schedules[i].date+'</td><td></td><td>'+schedules[i].description+'</td><td></td><td></td></tr>'   
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
 /*$('#csvw_input_Form').on("submit", function(event){
        event.preventDefault(); 
        var form_url = $("form[id='csvw_input_Form']").attr("action");
        var CSRF_TOKEN = $('input[name="_csrf"]').val();                    
        var inputs = $('#csvw_input_Form .form-control');
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
   });  */      


   
    /*
    * Uploading mapping file
    */
    $("#uploadMapping_Form").on("submit", function(event){
        event.preventDefault();

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
                    app.render();
                }   
            }            
        });              
    });
    
    /**
     * Uploading RDF file
     */
    
    $("#uploadPublishing_Form").on("submit", function(event){
        event.preventDefault();                     

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
                    app.render();
                }   
            }            
        }); 
        
                           
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

        }
        });   
     }); 
 
       
    
    
    
    
        app.firstLoad = true;
        app.router = new app.Router();
        Backbone.history.start();
    

}());