$(document).ready(function() {

  module("model");

  test('startTracking', 20, function() {

    // Test both with and without an ID assigned to test both new object
    // creation and existing object modification.
    startTracking(new Backbone.Model({name:'John Cage'}));
    startTracking(new Backbone.Model({id:1, name:'John Cage'}));

    function startTracking(m) {
      equal(m._trackingChanges, false);
      equal(_.keys(m._originalAttrs), 0);
      m.set('friend', 'Schoenberg');
      equal(m.unsavedAttributes(), false);
    
      m.startTracking();
      m.on('unsavedChanges', function(b, ch) {
        equal(b, true);
        equal(_.keys(ch).length, 1);
      });
      m.set('work', '4\'33"');

      equal(m._trackingChanges, true);
      equal(m._originalAttrs.name, 'John Cage');
      equal(m.unsavedAttributes().work, '4\'33"');

      // Test model.save(), which should reset the unsaved changes.

      // Stubbing without a fancy test framework (I'm so uncool).
      var oldAjax = Backbone.$.ajax;
      Backbone.$.ajax = function(options) {
        var data = JSON.parse(options.data);
        if ("POST" == options.type) {
            // Spoof object creation by assigning the new model an ID.
            data.id = 1;
        }
        options.success(data, 'aok');
      };

      m.off('unsavedChanges');
      m.save(null, {url:'none'});

      equal(m.unsavedAttributes(), false);
      equal(m._originalAttrs.work, '4\'33"');
      Backbone.$.ajax = oldAjax;
      m.stopTracking();

    }
  });

  test('stopTracking', 2, function() {

    var m = new Backbone.Model({id:2, name:'Marcel Duchamp'});
    
    m.startTracking();
    m.set('work', 'fountain');
    m.on('unsavedChanges', function(b, ch) {
      equal(b, false);
      equal(_.keys(ch).length, 0);
    });
    m.stopTracking();

  });

  test('restartTracking', 4, function() {

    var m = new Backbone.Model({id:2, name:'Marcel Duchamp'});
    
    m.startTracking();
    m.set('work', 'fountain');
    equal(_.keys(m.unsavedAttributes()).length, 1);
    m.on('unsavedChanges', function(b, ch) {
      equal(b, false);
      equal(_.keys(ch).length, 0);
    });
    m.restartTracking();
    equal(m.unsavedAttributes(), false);
    m.off().stopTracking();

  });

  test('resetAttributes', 3, function() {

    var m = new Backbone.Model({id:3, name:'Harmony Korine', work:'Spring Breakers'});
    
    m.startTracking();
    m.set('work', 'Gummo');
    m.on('unsavedChanges', function(b, ch) {
      equal(b, false);
      equal(_.keys(ch).length, 0);
    });
    m.resetAttributes();
    equal(m.get('work'), 'Spring Breakers');
    m.off().stopTracking();

  });

  test('unsavedAttributes', 7, function() {

    var m = new Backbone.Model({id:4, name:'Autechre'});
    
    m.startTracking();
    equal(m.unsavedAttributes(), false);

    m.set('work', 'Quartice');
    equal(m.unsavedAttributes().work, 'Quartice');
    m.set({'label':'Warp', 'instrument':'computer'});
    equal(m.unsavedAttributes().label, 'Warp');
    equal(m.unsavedAttributes().instrument, 'computer');

    equal(_.keys(m.unsavedAttributes({work:'Amber', label:'plus8', instrument:'computer'})).length, 2);
    equal(m.unsavedAttributes({work:'Amber', label:'plus8', instrument:'computer'}).work, 'Amber');
    equal(m.unsavedAttributes({work:'Amber', label:'plus8', instrument:'computer'}).label, 'plus8');
    m.stopTracking();

  });

  test('unsavedChanges', 3, function() {

    var m = new Backbone.Model({id:3, name:'Harmony Korine', work:'Spring Breakers'});
    
    m.startTracking();
    m.set('work', 'Gummo');
    m.on('unsavedChanges', function(b, ch, model) {
      equal(b, false);
      equal(_.keys(ch).length, 0);
      equal(model, m);
    });
    m.resetAttributes();
    m.off().stopTracking();

  });

  module('unload handler');

  test('window', 1, function() {
    var m = new Backbone.Model({id:5, name:'Samuel Beckett'});
    m.unsaved = {
      unloadWindowPrompt: true
    };

    // Spying/Stubbing without a fancy test framework (sue me).
    var oldUnload = window.onbeforeunload;
    window.onbeforeunload = function() {
      equal(oldUnload(), 'You have unsaved changes!');
    };

    m.startTracking();
    m.set('work', 'Molloy');
    window.onbeforeunload();
    window.onbeforeunload = oldUnload;
    m.stopTracking();

  });

  test('prompt', 1, function() {
    var m = new Backbone.Model({id:5, name:'Samuel Beckett'});
    m.unsaved = {
      prompt: 'Yes, there were times when I forgot not only who I was but that I was, forgot to be.',
      unloadWindowPrompt: true
    };

    // Spying/Stubbing without a fancy test framework ("look ma, no hands").
    var oldUnload = window.onbeforeunload;
    window.onbeforeunload = function() {
      equal(oldUnload(), 'Yes, there were times when I forgot not only who I was but that I was, forgot to be.');
    };

    m.startTracking();
    m.set('work', 'Molloy');
    window.onbeforeunload();
    window.onbeforeunload = oldUnload;
    m.stopTracking();

  });

  test('unloadWindowPrompt callback', 1, function() {
    var m = new Backbone.Model({id:5, name:'Samuel Beckett'});
    m.unsaved = {
      unloadWindowPrompt: function() { return true; }
    };

    // Spying/Stubbing without a fancy test framework (old fashioned).
    var oldUnload = window.onbeforeunload;
    window.onbeforeunload = function() {
      equal(oldUnload(), 'You have unsaved changes!');
    };

    m.startTracking();
    m.set('work', 'Molloy');
    window.onbeforeunload();
    window.onbeforeunload = oldUnload;
    m.stopTracking();

  });

  test('unloadWindowPrompt callback (function ref)', 1, function() {
    var m = new Backbone.Model({id:5, name:'Samuel Beckett'});
    m.unsaved = {
      unloadWindowPrompt: 'unload'
    };
    m.unload = function() {return true};

    // Spying/Stubbing without a fancy test framework ("you can do that?").
    var oldUnload = window.onbeforeunload;
    window.onbeforeunload = function() {
      equal(oldUnload(), 'You have unsaved changes!');
    };

    m.startTracking();
    m.set('work', 'Molloy');
    window.onbeforeunload();
    window.onbeforeunload = oldUnload;
    m.stopTracking();

  });

  test('Backbone.History.navigate', 1, function() {

    var m = new Backbone.Model({id:6, name:'Issey Miyake'});
    m.unsaved = {
      unloadRouterPrompt: true
    };
    var r = new Backbone.Router();
    Backbone.history.start();

    // Spying/Stubbing without a fancy test framework ("nice!").
    var oldConfirm = window.confirm;
    window.confirm = function(message) {
      equal(message.indexOf('You have unsaved changes!'), 0);
    };

    m.startTracking('prompt for unsaved changes!');
    
    m.set('work', 'Final Home');
    r.navigate('#test')
    m.stopTracking();
    r.navigate('#')

    window.confirm = oldConfirm;
    Backbone.history.stop();

    });

  test('unloadRouterPrompt callback (function return true)', 1, function() {

    var m = new Backbone.Model({id:6, name:'Issey Miyake'});
    m.unsaved = {
      unloadRouterPrompt: function() { return true; }
    };
    var r = new Backbone.Router();
    Backbone.history.start();

    // Spying/Stubbing without a fancy test framework (don't have a cow, man).
    var oldConfirm = window.confirm;
    window.confirm = function(message) {
      equal(message.indexOf('You have unsaved changes!'), 0);
    };

    m.startTracking('prompt for unsaved changes!');
    
    m.set('work', 'Final Home');
    r.navigate('#test')
    m.stopTracking();
    r.navigate('#')

    window.confirm = oldConfirm;
    Backbone.history.stop();

  });

  test('unloadRouterPrompt callback (function return false)', 0, function() {

    var m = new Backbone.Model({id:6, name:'Issey Miyake'});
    m.unsaved = {
      unloadRouterPrompt: function() { return false; }
    };
    var r = new Backbone.Router();
    Backbone.history.start();

    // Spying/Stubbing without a fancy test framework (bite me).
    var oldConfirm = window.confirm;
    window.confirm = function(message) {
      // It's expected that we don't get in here...
      equal(message.indexOf('You have unsaved changes!'), 0);
    };

    m.startTracking('prompt for unsaved changes!');
    
    m.set('work', 'Final Home');
    r.navigate('#test')
    m.stopTracking();
    r.navigate('#')

    window.confirm = oldConfirm;
    Backbone.history.stop();

  });

  test('trackit_silent option', 3, function() {

    var m = new Backbone.Model({id:2, name:'Burial'});
    
    m.startTracking();
    m.set('EP', 'Rival Dealer');

    var oldAjax = Backbone.$.ajax;
    Backbone.$.ajax = function(options) {
      var data = {};
      data.album = 'Untrue'
      options.success({album:'Untrue'});
    };

    m.fetch({url:'none', trackit_silent:true});
    m.set({song:'Truant'}, {trackit_silent:true});
    
    equal(m.get('album'), 'Untrue');
    equal(m.get('song'), 'Truant');
    equal(_.keys(m.unsavedAttributes()).length, 1);

    Backbone.$.ajax = oldAjax;
    m.off().stopTracking();
  });

});
