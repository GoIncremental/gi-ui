	
Polymer('gi-databind', {
      // initialize the element's model
      ready: function() {
      	this.user = 'James';
      },

      updateModel: function() {

      	this.user = ShadowRoot.getElementById("input").innerHTML;

      }	});

