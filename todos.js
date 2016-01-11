Todos = new Mongo.Collection("todos");
Todos.allow({
  insert: function(userId, todo){
    return todo.createdBy === userId;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});


if (Meteor.isClient) {
  Meteor.subscribe('todos');

  // Template Helpers
  Template.main.helpers({
    todos: function(){
      return Todos.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.main.events({
    "submit .new-todo": function(event){
      event.preventDefault();

      var text = event.target.text.value;

      Meteor.call('addTodo', text);

      // Clear form
      event.target.text.value='';

      //Prevent submit
      return false;
    },
    "click .toggle-checked": function(){
      Meteor.call('setChecked', this._id, !this.checked);
    },
    "click .delete-todo": function(){
      if(confirm('Are you sure you want to remove this Todo?')){
        Meteor.call('deleteTodo', this._id);
      }
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if(Meteor.isServer){
  Meteor.publish('todos', function(){
    return Todos.find({userId: this.userId});
  });
}

// Meteor Methods
Meteor.methods({
  addTodo: function (text) {
    if(! Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    if (_.isEmpty(text)) {
      throw new Meteor.Error("empty-text");
    }
    Todos.insert({
      text: text,
      createdAt: new Date(),
      userId: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTodo: function(todoId){
    var todo = Todos.findOne(todoId);
    if(todo.userId !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.remove(todoId);
  },
  setChecked: function(todoId, setChecked){
    var todo = Todos.findOne(todoId);
    if(todo.userId !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.update(todoId, {$set:{checked: setChecked}});
  }
});
