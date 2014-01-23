# Backbone.trackit

A small, opinionated [Backbone.js](http://documentcloud.github.com/backbone) plugin that manages model changes that accrue between saves, giving a Model the ability to undo previous changes, trigger events when there are unsaved changes, and opt in to before unload route handling.

## Introduction

At the heart of every JavaScript application is the model, and no frontend framework matches the extensible, well-featured model that Backbone provides. To stay unopinionated, Backbone's model only has a basic set of functionality for managing changes, where the current and previous change values are preserved until the next change. For example:

```js
var model = new Backbone.Model({id:1, artist:'John Cage', 'work':'4\'33"'});

model.set('work', 'Amores');
console.log(model.changedAttributes());  // >> Object {work: "Amores"}
console.log(model.previous('work'));  // >> 4'33"

model.set('advisor', 'Arnold Schoenberg');
console.log(model.changedAttributes());  // >> Object {advisor: "Arnold Schoenberg"}

```

Backbone's change management handles well for most models, but the ability to manage multiple changes between successful save events is a common pattern, and that's what Backbone.trackit aims to provide. For example, the following demonstrates how to use the api to `startTracking` unsaved changes, get the accrued `unsavedAttributes`, and how a call to `save` the model resets the internal tracking:

```js
var model = new Backbone.Model({id:1, artist:'Samuel Beckett', 'work':'Molloy'});
model.startTracking();

model.set('work', 'Malone Dies');
console.log(model.unsavedAttributes());  // >> Object {work: "Malone Dies"}

model.set('period', 'Modernism');
console.log(model.unsavedAttributes());  // >> Object {work: "Malone Dies", period: "Modernism"}

model.save({}, {
    success: function() {
        console.log(model.unsavedAttributes());  // >> false
    }
});

```

In addition, the library adds functionality to `resetAttributes` to their original state since the last save, triggers an event when the state of `unsavedChanges` is updated, and has options to opt into prompting to confirm before routing to a new context.


## Download

[0.1.0 min](https://raw.github.com/NYTimes/backbone.trackit/master/dist/0.1.0/backbone.trackit.min.js) - 2.6k

[0.1.0 gz](https://raw.github.com/NYTimes/backbone.trackit/master/dist/0.1.0/backbone.trackit.min.js.gz) - 1k

[edge](https://raw.github.com/NYTimes/backbone.trackit/master/backbone.trackit.js)


## API

### startTracking - *model.startTracking()*

Start tracking attribute changes between saves.

### restartTracking - *model.restartTracking()*

Restart the current internal tracking of attribute changes and state since tracking was started.

### stopTracking - *model.stopTracking()*

Stop tracking attribute changes between saves.

If an `unsaved` configuration was defined, it is important to call this when a model goes unused/should be destroyed (see the `unsaved` configuration for more information).

### unsavedAttributes - *model.unsavedAttributes([attributes])*

Symmetric to Backbone's `model.changedAttributes()`, except that this returns a hash of the model's attributes that have changed since the last save, or `false` if there are none. Like `changedAttributes`, an external attributes hash can be passed in, returning the attributes in that hash which differ from the model.

### resetAttributes - *model.resetAttributes()*

Restores this model's attributes to their original values since the last call to `startTracking`, `restartTracking`, `resetAttributes`, or `save`.

### unsavedChanges (event)

Triggered after any changes have been made to the state of unsaved attributes. Passed into the event callback is the boolean value for whether or not the model has unsaved changes, and a cloned hash of the unsaved changes. This event is only triggered after unsaved attribute tracking is started (`startTracking`) and will stop triggering after tracking is turned off (`stopTracking`).

```js
model.on('unsavedChanges', function(hasChanges, unsavedAttrs, model) {
    ...
});
```

### trackit_silent (option)

When passed as an option and set to `true`, trackit will not track changes when setting the model.

```js
model.fetch({ ..., trackit_silent:true});
model.set({artist:'John Cage'}, {trackit_silent:true});
console.log(model.unsavedAttributes()); // false
```

### unsaved (configuration) - *model.unsaved*

The `unsaved` configuration is optional, and is used to opt into and configure unload handling when route/browser navigation changes and the model has unsaved changes. Unload handling warns the user with a dialog prompt, where the user can choose to continue or stop navigation. Unfortunately, both handlers (browser and in-app; `unloadWindowPrompt` and `unloadRouterPrompt`) are needed  becuase they are triggered in different scenarios.

Note: Any model that defines an `unsaved` configuration and uses `startTracking` should call `stopTracking` (when done and if there are unsaved changes) to remove any internal references used by the library so that it can be garbage collected.

#### prompt - default: *"You have unsaved changes!"*

When navigation is blocked because of unsaved changes, the given `prompt` message will be displayed to the user in a confirmation dialog. Note, Firefox (only) will not display customized prompt messages; instead, Firefox will prompt the user with a generic confirmation dialog.

#### unloadWindowPrompt - default: *false*

When `true` prompts the user on browser navigation (back, forward, refresh buttons) when there are unsaved changes. This property can be defined with a function callback that should return `true` or `false` depending on whether or not navigation should be blocked. Like most Backbone configuration, the callback may be either the name of a method on the model, or a direct function body.

#### unloadRouterPrompt - default: *false*

When `true` prompts the user on in-app navigation (`router.navigate('/path')`) when there are unsaved changes. This property can be defined with a function callback that should return `true` or `false` depending on whether or not navigation should be blocked. Like most Backbone configuration, the callback may be either the name of a method on the model, or a direct function body.


```js
var model = Backbone.Model.extend({
    unsaved: {
        prompt: 'Changes exist!',
        unloadWindowPrompt: true,
        unloadRouterPrompt: 'unloadRouter'
    },
    
    unloadRouter: function(fragment, options) {
        if (fragment == '/article/edit-body') return false;
        return true;
    }
});
```

## FAQ

- **Not an undo/redo plugin**  
  If you are looking for an undo/redo plugin, check out [backbone.memento](https://github.com/derickbailey/backbone.memento)

- **Why are there two unload handlers (`unloadWindowPrompt`, `unloadRouterPrompt`)?**  
  Since navigation can be triggered by the browser (forward, back, refresh buttons) or through pushstate/hashchange in the app (by Backbone), a handler needs to be created for both methods.

- **Why doesn't Firefox display my unload `prompt`?**  
  You can find out their reasoning and leave a message for Mozilla [here](https://bugzilla.mozilla.org/show_bug.cgi?id=588292).

## Change log

### Master

- Added `trackit_silent` option that can be passed in `options` hashes so that attriubutes can be set into a model without being tracked.

- Added ability for new models (without ids) to be notified of unsaved changes after a successful call to `model.save()`.

- Added `model` as third parameter to `unsavedChanges` event callback.

- Added support for the `patch` method on `model#save`.

### 0.1.0

- Initial version; extracted from an internal project (Blackbeard) that powers our News Services at The New York Times.

## License

MIT