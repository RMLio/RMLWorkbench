/* global app:true */

(function() {

    'use strict';
    
    console.log('executed...');

    app = app || {};

    app.Mapping = Backbone.Model.extend({
        idAttribute: '_id',
        defaults: {
            _id: undefined,
            filename: ''
        }
    });

    app.Mappings = Backbone.Collection.extend({
        model: app.Mapping,
        url: '/workbench/fetch/mapping'
    });

    app.MappingsView = Backbone.View.extend({
        tagName: 'ul',

        initialize: function() {

        },

        render: function(eventName) {
            //console.log(this);
            _.each(this.model.models, function(mapping) {
                console.log('iterate' + mapping);
                $(this.el).append(new app.MappingItemView({ model: mapping }).render().el);
            }, this);
            return this;
        }
    });

    app.MappingItemView = Backbone.View.extend({
        tagName: "li",

        template: _.template($('#mapping-list-item').html()),

        initialize: function() {

        },

        render: function(eventName) {
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
            app.mappings.fetch({success: function() {
                app.mappingsView = new app.MappingsView({model:app.mappings});
                $('#mappingMain').html(app.mappingsView.render().el);    
            }});          
            
            
            
        },
        default: function() {                    
                            
        }
    });

    
        app.firstLoad = true;
        app.router = new app.Router();
        Backbone.history.start();
    

}());