jQuery.fn.insertAt = function(item, index) {
  var numberOfChildren = this.children().size();
  if (index == 0) {
    this.prepend(item);
  } else if (numberOfChildren <= index) {
    this.append(item);
  } else {
    this.children().eq(index).before(item);
  }
}

jQuery(function($) {  
  /* Model */
  var Wine = Backbone.Model.extend({
  });
  
  /* Collection */
  var WineList = Backbone.Collection.extend({
    model: Wine,
    localStorage: new Store('wines'),
    comparator: function(wine) {
      return wine.get('vintage');
    }
  });
  
  var wines = new WineList;
  
  /* View */
  var WineItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    events: {
      'click': 'show'
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).addClass(this.model.get('color'));
      return this;
    },
    remove: function() {
      $(this.el).remove();
    },
    show: function() {
      this.model.trigger('selected:true', this.model);
    }
  });
  
  var InfoView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($('#info-template').html()),
    events: {
      'click #remove-wine': 'remove'
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    remove: function() {
      this.model.destroy();
      wines.remove(this.model);
      $(this.el).remove();
    }
  });
  
  var FormView = Backbone.View.extend({
    tagName: 'section',
    template: _.template($('#form-template').html()),
    events: {
      'click #add-wine': 'add'
    },
    render: function() {
      $(this.el).html(this.template());
      return this;
    },
    add: function() {
      wines.create({
        color: this.$('#color').val(),
        name: this.$('#name').val(),
        vintage: parseInt(this.$('#vintage').val()),
        region: this.$('#region').val(),
        country: this.$('#country').val()
      });
    }
  });
  
  var AppView = Backbone.View.extend({
    el: $('#container'),
    events: {
      'click #new-wine': 'showForm'
    },
    initialize: function() {
      wines.bind('add', this.addOne, this);
      wines.bind('reset', this.reset, this);
      wines.bind('selected:true', this.showInfo, this);
      
      wines.fetch();
    },
    addOne: function(wine) {
      var view = new WineItemView({ model: wine });
      this.$('#wine-list').insertAt(view.render().el, wines.indexOf(wine));
    },
    reset: function() {
      this.$('#wine-list').html('');
      wines.each(this.addOne);
    },
    showInfo: function(wine) {
      var infoView = new InfoView({ model: wine });
      this.$('#main').html(infoView.render().el);
    },
    showForm: function() {
      var formView = new FormView();
      this.$('#main').html(formView.render().el);
    }
  });
  
  var app = new AppView;
});