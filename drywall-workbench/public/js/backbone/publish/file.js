'use strict'


// File Model
var File = Backbone.Model.extend({
	defaults: {
		name: '',
		url: ''
	}
});

// A List of files
var FileCollection = Backbone.Collection.extend({
	model: File,
    url: '/publish/files'
});

// The View for a Person
var FileView = Backbone.View.extend({
	tagName: 'option',      
	render: function(){
        this.$el.attr( 'value', this.model.get('url'));
		this.$el.html( this.model.get('name'));
		return this;  // returning this from render method..
	}
});

// View for all files
var FilesView = Backbone.View.extend({
	tagName: 'select',
    className: 'form-control',    
	render: function(){
		this.collection.each(function(file){
			var fileView = new FileView({ model: file });
            this.$el.attr('id', 'publish_file');
			this.$el.append(fileView.render().el); // calling render method manually..
		}, this);
		return this; // returning this for chaining..
	}
});

//fetching files from nodejs server
var filesView = null;
var fileCollection = new FileCollection().fetch({
    success: function (fileCollection, response) {
        // fetch successful, lets iterate and update the values here
        fileCollection.each(function (item, index, all) {
            item.set("name", item.get("name")); 
            item.set("url", item.get('url'));                        
        });
        filesView = new FilesView({collection: fileCollection});
        $('#publish_fileSelector').append(filesView.render().el);
    }
});




