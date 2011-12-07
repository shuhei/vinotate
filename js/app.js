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
    initialize: function() {
      this.bind('reset', function() {
        
      });
    },
    comparator: function(wine) {
      return wine.get('vintage');
    },
    search: function(query) {
      query = query.trim();
      if (query === '') return this.models;
      
      var pattern = new RegExp(query, 'gi');
      return this.filter(function(wine) {
        return pattern.test(wine.get('name')) ||
          pattern.test(wine.get('color')) ||
          pattern.test(wine.get('variety')) ||
          pattern.test(wine.get('region')) ||
          pattern.test(wine.get('country')) ||
          pattern.test(wine.get('vintage').toString());
      });
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
      'keyup #wine-search': 'search',
      'click #new-wine': 'showForm'
    },
    searching: false,
    initialize: function() {
      wines.bind('add', this.reset, this);
      wines.bind('reset', this.reset, this);
      wines.bind('selected:true', this.showInfo, this);
      
      wines.fetch();
    },
    addOne: function(wine) {
      var view = new WineItemView({ model: wine });
      this.$('#wine-list').append(view.render().el);
    },
    reset: function() {
      this.$('#wine-search').val('');
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
    },
    search: function() {
      var query = this.$('#wine-search').val();
           
      this.$('#wine-list').html('');
      _(wines.search(query)).each(function(wine) {
        var view = new WineItemView({ model: wine });
        this.$('#wine-list').append(view.render().el);
      });
    }
  });
  
  var app = new AppView();
});