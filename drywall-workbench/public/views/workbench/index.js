/* global app:true */

(function() {

    'use strict';
    
    console.log('executed...');

    app = app || {};

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
    
    app.ExecuteMappingView = Backbone.View.extend({
        
        template: _.template($('#execute').html()),
        
        events: {
          'click .executemapping' : 'execute'  
        },
        
        execute: function() {
          //this.model.fetch({data:{'mapping_id':this.model.attributes._id},type:'POST' })  
          $.post('/workbench/mapping/execute/' + this.model.attributes._id,{},function() {console.log('succes')});
          console.log('waw');  
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

    app.MappingItemView = Backbone.View.extend({
        tagName: 'a',
        className: 'list-group-item viewMapping',

        template: _.template($('#mapping-list-item').html()),

        initialize: function() {
            
        },
        
        events: {
	        'click h5' : 'viewMapping'
        },

        viewMapping: function(ev){
                console.log('test');
                console.log(this.model);
                app.mappingsContentView.model = this.model; 
                app.mappingsContentView.render(); 
                //$('#mappingContent').html(app.mappingsContentView.render().el)  
        },

        render: function(eventName) {
            $(this.el).attr('href','#');
            $(this.el).attr('data-index', this.model.collection.indexOf(this.model));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

    });
    
    app.PublishesView = Backbone.View.extend({
        tagName: 'div',
        className: 'list-group',
        
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
                console.log('test');
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
                
                app.mappingsView = new app.MappingsView({model:app.mappings});
                app.mappingsContentView = new app.MappingsContentView({model: app.mappings.models[0]});
                app.executeMappingView = new app.ExecuteMappingView({model: app.mappings.models[16]});
                $('#mappingMain').html(app.mappingsView.render().el);    
                $('#mappingContent').html(app.mappingsContentView.render().el);
                $('#mappingmenu').html(app.executeMappingView.render().el);
            }});            
            app.publishes.fetch({success: function() {
                app.publishesView = new app.PublishesView({model:app.publishes});
                app.publishesContentView = new app.PublishesContentView({model: app.publishes.models[0]});
                $('#publishMain').html(app.publishesView.render().el);    
                $('#publishContent').html(app.publishesContentView.render().el)         
            }});           
        },
        default: function() {                    
                            
        }
    });

    
        app.firstLoad = true;
        app.router = new app.Router();
        Backbone.history.start();
    

}());