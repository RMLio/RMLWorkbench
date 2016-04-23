/* global app:true */

(function() {

    'use strict';
    
    console.log('executed...');

    app = app || {};
    
    app.currentModel;

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
    
    app.Triple = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {}
    });
    
    app.Triples = Backbone.Collection.extend({
        model: app.Triple 
    });
    
    
    
    
    app.ExecuteMappingView = Backbone.View.extend({
        
        template: _.template($('#execute').html()),        
        
        
        execute: function() {
          //this.model.fetch({data:{'mapping_id':this.model.attributes._id},type:'POST' })  
          
           
        },
        
        initialize: function() {
               
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });
    
    app.ExecuteButtonView = Backbone.View.extend({
        
        template: _.template($('#executeMappingButton').html()),        
        
        events: {
           'click button' : 'execute'
        }, 
        
        execute: function() {
            console.log('click');
          //this.model.fetch({data:{'mapping_id':this.model.attributes._id},type:'POST' })  
          $.post('/workbench/mapping/execute/' + this.model.attributes._id, function() {
              app.render();
              console.log('succes')});  
        },          
        
        
        initialize: function() {
               
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });
    
    app.ClearMappingView = Backbone.View.extend({
        
        template: _.template($('#clearmapping').html()),
        
        events: {
          'click .clearmapping' : 'clearmapping'  
        },
        
        clearmapping: function() {
          //this.model.fetch({data:{'mapping_id':this.model.attributes._id},type:'POST' })  
          $.post('/workbench/clear/mapping/',{mappings: [app.currentModel.attributes._id]},function() {
              app.render();
              console.log('succes')});  
        },
        
        initialize: function() {
            this.model = app.currentModel;    
        },
        
        render: function() {
           $(this.el).html(this.template(this.model.toJSON()));      
           return this;            
        }    
    });
    
    app.ClearAllMappingsView = Backbone.View.extend({
        
        template: _.template($('#clearallmappings').html()),
        
        events: {
          'click .clearallmappings' : 'clearallmappings'  
        },
        
        clearallmappings: function() {
          //this.model.fetch({data:{'mapping_id':this.model.attributes._id},type:'POST' })  
          $.post('/workbench/clear/all/mapping',function() {
              app.render();
              console.log('succes')});  
        },
        
        initialize: function() {
            this.model = app.currentModel;    
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
            console.log('ac marche');  
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
            $(this.el).change(function() {
                console.log($(this.el).find('input'));
            });
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
                
                console.log(this.model);
                app.mappingsContentView.model = this.model; 
                app.executeMappingView.model = this.model;
                app.executeButtonView.model = this.model;
                
                var triples = [];
                for(var i = 0; i < this.model.attributes.triples.length; i++) {
                    triples.push(new app.Triple(this.model.attributes.triples[i]));
                }              
                
                app.tripleListView.model = {models : triples};
                
                app.tripleListView.render();
                app.executeButtonView.render();               
                app.mappingsContentView.render(); 
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    
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
	        'click h5' : 'viewPublish'
        },

        viewPublish: function(ev){
                console.log(this.model);
                app.publishContentView.model = this.model; 
                app.publishContentView.render(); 
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

    });

    app.Router = Backbone.Router.extend({
        routes: {
            '': 'default',
        },
        initialize: function() {
            app.mappings = new app.Mappings();
            
            
            
            app.publishes = new app.Publishes();
            app.mappings.fetch({success: function() {   
                
                //replace <> with lt& en gt&    
                for(var i = 0; i < app.mappings.models.length; i++) {
                    var attributes = app.mappings.models[i].attributes;
                    attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                }         
                app.currentModel = app.mappings.models[0];
                if(app.currentModel == undefined) {
                    //app.currentModel = new app.Mapping();
                }
                
                var triples = [];
                for(var i = 0; i < app.currentModel.attributes.triples.length; i++) {
                    triples.push(new app.Triple(app.currentModel.attributes.triples[i]));
                }
                
                app.tripleListView = new app.TripleListView({model: { models:triples}});
                
                app.mappingsView = new app.MappingsView({model:app.mappings});
                app.mappingsContentView = new app.MappingsContentView({model: app.currentModel});
                app.executeMappingView = new app.ExecuteMappingView({model: app.currentModel});
                app.executeButtonView = new app.ExecuteButtonView({model: app.currentModel});
                app.clearMappingView = new app.ClearMappingView();
                app.clearAllMappingsView = new app.ClearAllMappingsView();
                $('#mappingMain').html(app.mappingsView.render().el);    
                $('#mappingContent').html(app.mappingsContentView.render().el);
                $('#mappingmenu').html(app.executeMappingView.render().el);
                $('#clearmappingbutton').html(app.clearMappingView.render().el);
                $('#clearallmappingsbutton').html(app.clearAllMappingsView.render().el);
                $('#triplelistdiv').html(app.tripleListView.render().el);
                $('#executeMappingButtonDiv').html(app.executeButtonView.render().el);
            }});            
            app.publishes.fetch({success: function() {
                //replace <> with lt& en gt&    
                for(var i = 0; i < app.publishes.models.length; i++) {
                    var attributes = app.publishes.models[i].attributes;
                    attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                }
                app.publishesView = new app.PublishesView({model:app.publishes});
                app.publishContentView = new app.PublishContentView({model: app.publishes.models[0]});
                $('#publishMain').html(app.publishesView.render().el);    
                $('#publishContent').html(app.publishContentView.render().el);                         
            }});           
        },
        default: function() {                    
                            
        }
    });
    
    app.render = function() {
        app.mappings.fetch({success: function() {   
                
                //replace <> with lt& en gt&    
                for(var i = 0; i < app.mappings.models.length; i++) {
                    var attributes = app.mappings.models[i].attributes;
                    attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                }         
                app.currentModel = app.mappings.models[0];
                //app.currentModel = app.mappings.models[0].attributes._id;
                if(app.currentModel == undefined) {
                    //app.currentModel = new app.Mapping();
                }
                app.mappingsView = new app.MappingsView({model:app.mappings});
                app.mappingsContentView = new app.MappingsContentView({model: app.currentModel});
                app.executeMappingView = new app.ExecuteMappingView({model: app.currentModel});
                app.executeButtonView = new app.ExecuteButtonView({model: app.currentModel});
                app.clearMappingView = new app.ClearMappingView();
                app.clearAllMappingsView = new app.ClearAllMappingsView();
                
                var triples = [];
                for(var i = 0; i < app.currentModel.attributes.triples.length; i++) {
                    triples.push(new app.Triple(app.currentModel.attributes.triples[i]));
                }
                
                
                app.tripleListView = new app.TripleListView({model: { models:triples}});
                $('#mappingMain').html(app.mappingsView.render().el);    
                $('#mappingContent').html(app.mappingsContentView.render().el);
                $('#mappingmenu').html(app.executeMappingView.render().el);
                $('#clearmappingbutton').html(app.clearMappingView.render().el);
                $('#clearallmappingsbutton').html(app.clearAllMappingsView.render().el);
                $('#triplelistdiv').html(app.tripleListView.render().el);
                $('#executeMappingButtonDiv').html(app.executeButtonView.render().el);
            }});            
            app.publishes.fetch({success: function() {
                //replace <> with lt& en gt&    
                for(var i = 0; i < app.publishes.models.length; i++) {
                    var attributes = app.publishes.models[i].attributes;
                    attributes.convertedData = attributes.data.replace(/</g,'&lt;').replace(/>/g, '&gt;');                                      
                }
                app.publishesView = new app.PublishesView({model:app.publishes});
                app.publishContentView = new app.PublishContentView({model: app.publishes.models[0]});
                $('#publishMain').html(app.publishesView.render().el);    
                $('#publishContent').html(app.publishContentView.render().el);                         
            }});   
    };
    
    
    
        app.firstLoad = true;
        app.router = new app.Router();
        Backbone.history.start();
    

}());