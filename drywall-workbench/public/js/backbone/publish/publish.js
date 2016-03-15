//configure backbone
    var oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options){
            options.beforeSend = function(xhr){
                xhr.setRequestHeader('X-CSRFToken', $.cookie('_csrfToken'));
            };
        return oldSync(method, model, options);
    };
  
    var PublishLdfModel = Backbone.Model.extend({
        urlRoot: '/publish/ldf',
        defaults: {
            title: '',
            type: '',
            description: '',
            settings: {}
        }
    });    
    
    var PublishLdfView = Backbone.View.extend({   
        //initialize     
        initialize: function(){          
            
        },
        //listen to events
        events: {
            "click button[id='publish_submit']": "publish"
        },
        //execute this when publish button is clicked 
        publish: function(event){            
            //details to save in the backbone model           
            var publishDetails = {
                //TO DO: correct backbone usage
                title: $("#publish_title").val(),
                type: $("#publish_type").val(),
                description: $("#publish_description").val(),
                settings: {file:$('#publish_file').val()}
            };
            //save
            var publishModel = new PublishLdfModel();            
            publishModel.save(publishDetails, {                
                success: function (publishModel) {
                    alert(JSON.stringify(publishModel));
                }
            })            
        }
    });
    //bind view to DOM
    var publishView = new PublishLdfView({ el: $("#publish") });