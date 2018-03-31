/**
 * parasails.js
 * (lightweight structures for apps with more than one page)
 *
 * v0.7.1
 *
 * Copyright 2014-present, Mike McNeil (@mikermcneil)
 * MIT License
 *
 * - https://sailsjs.com/about
 * - https://sailsjs.com/support
 * - https://www.npmjs.com/package/parasails
 *
 * > Parasails is a tiny (but opinionated) and pipeline-agnostic wrapper
 * > around Vue.js and Lodash, with optional participation from jQuery, bowser,
 * > and VueRouter.
 */
(function(global, factory){
  var Vue;
  var _;
  var VueRouter;
  var $;
  var bowser;

  //˙°˚°·.
  //‡CJS  ˚°˚°·˛
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var _require = require;// eslint-disable-line no-undef
    var _module = module;// eslint-disable-line no-undef
    // required deps:
    Vue = _require('vue');
    _ = _require('lodash');
    // optional deps:
    try { VueRouter = _require('vue-router'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    try { $ = _require('jquery'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    try { bowser = _require('bowser'); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') {/* ok */} else { throw e; } }
    // export:
    _module.exports = factory(Vue, _, VueRouter, $, bowser);
  }
  //˙°˚°·
  //‡AMD ˚¸
  else if(typeof define === 'function' && define.amd) {// eslint-disable-line no-undef
    // Register as an anonymous module.
    define([], function () {// eslint-disable-line no-undef
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: maybe use optional dep. loading here instead?
      // e.g.  `function('vue', 'lodash', 'vue-router', 'jquery')`
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // required deps:
      if (!global.Vue) { throw new Error('`Vue` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Vue.js library is getting brought in before `parasails`.)'); }
      Vue = global.Vue;
      if (!global._) { throw new Error('`_` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Lodash library is getting brought in before `parasails`.)'); }
      _ = global._;
      // optional deps:
      VueRouter = global.VueRouter || undefined;
      $ = global.$ || global.jQuery || undefined;
      bowser = global.bowser || undefined;

      // So... there's not really a huge point to supporting AMD here--
      // except that if you're using it in your project, it makes this
      // module fit nicely with the others you're using.  And if you
      // really hate globals, I guess there's that.
      // ¯\_(ツ)_/¯
      return factory(Vue, _, VueRouter, $, bowser);
    });//ƒ
  }
  //˙°˚˙°·
  //‡NUDE ˚°·˛
  else {
    // required deps:
    if (!global.Vue) { throw new Error('`Vue` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Vue.js library is getting brought in before `parasails`.)'); }
    Vue = global.Vue;
    if (!global._) { throw new Error('`_` global does not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the Lodash library is getting brought in before `parasails`.)'); }
    _ = global._;
    // optional deps:
    VueRouter = global.VueRouter || undefined;
    $ = global.$ || global.jQuery || undefined;
    bowser = global.bowser || undefined;
    // export:
    if (global.parasails) { throw new Error('Conflicting global (`parasails`) already exists!'); }
    global.parasails = factory(Vue, _, VueRouter, $, bowser);
  }
})(this, function (Vue, _, VueRouter, $, bowser){


  //  ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
  //  ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
  //  ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
  //  ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
  //  ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
  //  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //
  //  ███████╗████████╗ █████╗ ████████╗███████╗
  //  ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
  //  ███████╗   ██║   ███████║   ██║   █████╗
  //  ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
  //  ███████║   ██║   ██║  ██║   ██║   ███████╗
  //  ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //

  /**
   * Module state
   */

  // Keep track of whether or not a page script has already been loaded in the DOM.
  var didAlreadyLoadPageScript;

  // The variable we'll be exporting.
  var parasails;


  //  ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
  //  ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
  //  ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
  //  ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
  //  ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
  //  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //
  //  ██╗   ██╗████████╗██╗██╗     ███████╗
  //  ██║   ██║╚══██╔══╝██║██║     ██╔════╝
  //  ██║   ██║   ██║   ██║██║     ███████╗
  //  ██║   ██║   ██║   ██║██║     ╚════██║
  //  ╚██████╔╝   ██║   ██║███████╗███████║
  //   ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
  //

  /**
   * Module utilities (private)
   */

  function _ensureGlobalCache(){
    parasails._cache = parasails._cache || {};
  }

  function _exportOnGlobalCache(moduleName, moduleDefinition){
    _ensureGlobalCache();
    if (parasails._cache[moduleName]) { throw new Error('Something else (e.g. a utility or constant) has already been registered under that name (`'+moduleName+'`)'); }
    parasails._cache[moduleName] = moduleDefinition;
  }

  function _exposeBonusMethods(def, currentModuleEntityNoun){
    if (!currentModuleEntityNoun) { throw new Error('Consistency violation: Bad internal usage. '); }
    if (def.methods && def.methods.$get) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$get` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.$find) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$find` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.$focus) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$focus` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.forceRender) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `forceRender` key, but you\'re not allowed to override that'); }
    if (def.methods && def.methods.$forceRender) { throw new Error('This '+currentModuleEntityNoun+' contains `methods` with a `$forceRender` key, but that\'s too confusing to let stand (did you mean "forceRender"?  Besides, that method cannot be overridden anyway)'); }
    def.methods = def.methods || {};

    // Attach misc. methods:
    def.methods.forceRender = function (){
      this.$forceUpdate();
      var promise = this.$nextTick();
      return promise;
    };//ƒ


    // Attach jQuery-powered methods:
    if ($) {
      def.methods.$get = function (){
        var $rootEl = $(this.$el);
        if ($rootEl.length !== 1) { throw new Error('Cannot use .$get() - something is wrong with this '+currentModuleEntityNoun+'\'s top-level DOM element.  (It probably has not mounted yet!)'); }
        return $rootEl;
      };
      def.methods.$find = function (subSelector){
        if (!subSelector) { throw new Error('Cannot use .$find() because no sub-selector was provided.\nExample usage:\n    var $emailFields = this.$find(\'[name="emailAddress"]\');'); }
        var $rootEl = $(this.$el);
        if ($rootEl.length !== 1) { throw new Error('Cannot use .$find() - something is wrong with this '+currentModuleEntityNoun+'\'s top-level DOM element.  (It probably has not mounted yet!)'); }
        return $rootEl.find(subSelector);
      };
      def.methods.$focus = function (subSelector){
        if (!subSelector) { throw new Error('Cannot use .$focus() because no sub-selector was provided.\nExample usage:\n    this.$focus(\'[name="emailAddress"]\');'); }
        var $rootEl = $(this.$el);
        if ($rootEl.length !== 1) { throw new Error('Cannot use .$focus() - something is wrong with this '+currentModuleEntityNoun+'\'s top-level DOM element.  (It probably has not mounted yet!)'); }
        var $fieldToAutoFocus = $rootEl.find(subSelector);
        if ($fieldToAutoFocus.length === 0) { throw new Error('Could not autofocus-- no such element exists within this '+currentModuleEntityNoun+'.'); }
        if ($fieldToAutoFocus.length > 1) { throw new Error('Could not autofocus `'+subSelector+'`-- too many elements matched!'); }
        $fieldToAutoFocus.focus();
      };
    }
    else {
      def.methods.$get = function (){ throw new Error('Cannot use .$get() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
      def.methods.$find = function (){ throw new Error('Cannot use .$find() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
      def.methods.$focus = function (){ throw new Error('Cannot use .$focus() method because, at the time when this '+currentModuleEntityNoun+' was registered, jQuery (`$`) did not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure jQuery is getting brought in before `parasails`.)'); };
    }
  }

  function _wrapMethodsAndVerifyNoArrowFunctions(def, currentModuleEntityNoun){
    if (!currentModuleEntityNoun) { throw new Error('Consistency violation: Bad internal usage. '); }

    // Preliminary sanity check:
    // Make sure top-level def doesn't have anything sketchy like "beforeMounted"
    // or "beforeDestroyed", because those definitely aren't real things.
    var RECOMMENDATIONS_BY_UNRECOGNIZED_KEY = {
      beforeMounted: 'beforeMount',
      beforeDestroyed: 'beforeDestroy',
      events: 'methods',
      functions: 'methods',
      state: 'data'
    };
    _.each(_.intersection(_.keys(RECOMMENDATIONS_BY_UNRECOGNIZED_KEY),_.keys(def)), function (propertyName) {
      if (def[propertyName] !== undefined) {
        throw new Error('Detected unrecognized and potentially confusing key "'+propertyName+'" on the top level of '+currentModuleEntityNoun+' definition.  Did you mean "'+RECOMMENDATIONS_BY_UNRECOGNIZED_KEY[propertyName]+'"?');
      }
    });//∞

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Maybe verify that neither beforeMount nor beforeDestroy are
    // `async function`s.  (These must be synchronous!  And it's easy to forget.)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // In fact, in some cases, we'll go so far as to fail if we see any other
    // unrecognized top-level keys too:
    // > This is particularly useful for catching loose top-level properties
    // > that were intended to be within `data` or `methods`, etc.)
    if (currentModuleEntityNoun === 'page script' || currentModuleEntityNoun === 'component') {
      var LEGAL_TOP_LVL_KEYS = [
        // Everyday page script stuff:
        'beforeMount',
        'mounted',
        'data',
        'methods',

        // Extra component stuff:
        'props',
        'template',
        'beforeDestroy',

        // Client-side router stuff:
        'router',
        'virtualPages',
        'html5HistoryMode',
        'beforeNavigate',
        'afterNavigate',
        'virtualPagesRegExp',

        // Misc. & relatively more uncommon Vue.js stuff
        'watch',
        'computed',
        'propsData',
        'components',
        'filters',
        'directives',
        'el',
        'render',
        'renderError',
        'comments',
        'inheritAttrs',
        'model',
        'functional',
        'delimiters',
        'name',
        'beforeCreate',
        'created',
        'beforeUpdate',
        'updated',
        'activated',
        'deactivated',
        'destroyed',
        'errorCaptured',
        'parent',
        'mixins',
        'extends',
        'provide',
        'inject'
      ];
      _.each(_.difference(_.keys(def), LEGAL_TOP_LVL_KEYS), function (propertyName) {
        if (def[propertyName] !== undefined) {
          throw new Error('Detected unrecognized key "'+propertyName+'" on the top level of '+currentModuleEntityNoun+' definition.  Did you perhaps intend for `'+propertyName+'` to be included as a nested key within `data` or `methods`?  Please check on that and try again.  If you\'re unsure, or you\'re deliberately attempting to use a Vue.js feature that relies on having a top-level property named `'+propertyName+'`, then please remove this check from the parasails.js library in your project, or drop by https://sailsjs.com/support for assistance.');
        }
      });//∞
    }//ﬁ

    // Wrap and verify methods:
    def.methods = def.methods || {};
    _.each(_.keys(def.methods), function (methodName) {
      if (!_.isFunction(def.methods[methodName])) {
        throw new Error('Unexpected definition for Vue method `'+methodName+'`.  Expecting a function, but got "'+def.methods[methodName]+'"');
      }

      var isArrowFunction;
      try {
        var asString = def.methods[methodName].toString();
        isArrowFunction = asString.match(/^\s*\(\s*/) || asString.match(/^\s*async\s*\(\s*/);
      } catch (err) {
        console.warn('Consistency violation: Encountered unexpected error when attempting to verify that Vue method `'+methodName+'` is not an arrow function.  (What browser is this?!)  Anyway, error details:', err);
      }

      if (isArrowFunction) {
        throw new Error('Unexpected definition for Vue method `'+methodName+'`.  Vue methods cannot be specified as arrow functions, because then you wouldn\'t have access to `this` (i.e. the Vue vm instance).  Please use a function like `function(){…}` or `async function(){…}` instead.');
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE:
      // Inject a wrapper function in order to provide more advanced / cleaner error handling.
      // (especially for AsyncFunctions)
      // ```
      // var _originalMethod = def.methods[methodName];
      // def.methods[methodName] = function(){
      //
      //   var rawResult;
      //   var originalCtx = this;
      //   (function(proceed){
      //     if (_originalMethod.constructor.name === 'AsyncFunction') {
      //       rawResult = _originalMethod.apply(originalCtx, arguments);
      //       // The result of an AsyncFunction is always a promise:
      //       rawResult.catch(function(err) {
      //         proceed(err);
      //       });//_∏_
      //       rawResult.then(function(actualResult){
      //         return proceed(undefined, actualResult);
      //       });
      //     }
      //     else {
      //       try {
      //         rawResult = _originalMethod.apply(originalCtx, arguments);
      //       } catch (err) { return proceed(err); }
      //       return proceed(undefined, rawResult);
      //     }
      //   })(function(err, actualResult){//eslint-disable-line no-unused-vars
      //     if (err) {
      //       // FUTURE: perform more advanced error handling here
      //       throw err;
      //     }
      //
      //     // Otherwise do nothing.
      //
      //   });//_∏_  (†)
      //
      //   // For compatibility, return the raw result.
      //   return rawResult;
      //
      // };//ƒ
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    });//∞
  }


  //  ███████╗██╗  ██╗██████╗  ██████╗ ██████╗ ████████╗███████╗
  //  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝
  //  █████╗   ╚███╔╝ ██████╔╝██║   ██║██████╔╝   ██║   ███████╗
  //  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║██╔══██╗   ██║   ╚════██║
  //  ███████╗██╔╝ ██╗██║     ╚██████╔╝██║  ██║   ██║   ███████║
  //  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
  //

  /**
   * Module exports
   */

  parasails = {};


  /**
   * parasails.util
   *
   * Direct references to all registered utility methods from userland.
   *
   * @type {Dictionary}
   */

  parasails.util = {};


  /**
   * registerUtility()
   *
   * Build a callable utility function, then attach it to the global namespace
   * so that it can be accessed later via `.require()`.
   *
   * @param {String} utilityName
   * @param {Function} def
   */

  parasails.registerUtility = function(utilityName, def){

    // Usage
    if (!utilityName) { throw new Error('1st argument (utility name) is required'); }
    if (!def) { throw new Error('2nd argument (utility function definition) is required'); }
    if (!_.isFunction(def)) { throw new Error('2nd argument (utility function definition) should be a function'); }

    // Build callable utility
    var callableUtility = def;
    callableUtility.name = utilityName;

    // Attach to global cache
    _exportOnGlobalCache(utilityName, callableUtility);

    // Also expose on `parasails.util`
    parasails.util[utilityName] = callableUtility;

  };


  /**
   * registerConstant()
   *
   * Attach a constant to the global namespace so that it can be accessed
   * later via `.require()`.
   *
   * @param {String} constantName
   * @param {Ref} value
   */

  parasails.registerConstant = function(constantName, value){

    // Usage
    if (!constantName) { throw new Error('1st argument (constant name) is required'); }
    if (value === undefined) { throw new Error('2nd argument (the constant value) is required'); }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: deep-freeze constant, if supported
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Attach to global cache
    _exportOnGlobalCache(constantName, value);

  };



  /**
   * registerComponent()
   *
   * Define a Vue component.
   *
   * @param {String} componentName   [In camelCase]
   * @param {Dictionary} def
   *
   * @returns {Ref}  [new vue component for this page]
   */

  parasails.registerComponent = function(componentName, def){

    // Expose extra methods on component def, if jQuery is available.
    _exposeBonusMethods(def, 'component');

    // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
    _wrapMethodsAndVerifyNoArrowFunctions(def, 'component');

    // Wrap the `mounted` LC in order to decorate the top-level element with
    // a sniffable marker that can be unambiguously styled via a global selector
    // in the corresponding stylesheet for the component.
    var customMountedLC;
    if (def.mounted) {
      customMountedLC = def.mounted;
    }//ﬁ
    def.mounted = function(){

      // Attach `parasails-component="…"` DOM attribute to allow for painless
      // selecting from an optional, corresponding per-component stylesheet.
      this.$el.setAttribute('parasails-component', _.kebabCase(componentName));

      // Then call the original, custom "mounted" function, if there was one.
      if (customMountedLC) {
        customMountedLC.apply(this, []);
      }
    };//ƒ

    // Finally, register as a global Vue component.
    Vue.component(componentName, def);

  };


  /**
   * require()
   *
   * Require a utility function or constant from the global namespace.
   *
   * @param {String} moduleName
   * @returns {Ref}  [e.g. the callable utility function, or the value of the constant]
   * @throws {Error} if no such module has been registered
   */

  parasails.require = function(moduleName) {

    // Usage
    if (!moduleName) { throw new Error('1st argument (module name -- i.e. the name of a utility or constant) is required'); }

    // Fetch from global cache
    _ensureGlobalCache();
    if (parasails._cache[moduleName] === undefined) {
      var err = new Error('No utility or constant is registered under that name (`'+moduleName+'`)');
      err.name = 'RequireError';
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    }
    return parasails._cache[moduleName];

  };


  /**
   * registerPage()
   *
   * Define a page script, if applicable for the current contents of the DOM.
   *
   * @param {String} pageName
   * @param {Dictionary} def
   *
   * @returns {Ref}  [new vue app thing for this page]
   */

  parasails.registerPage = function(pageName, def){

    // Usage
    if (!pageName) { throw new Error('1st argument (page name) is required'); }
    if (!def) { throw new Error('2nd argument (page script definition) is required'); }

    // Only actually build+load this page script if it is relevant for the current contents of the DOM.
    if (!document.getElementById(pageName)) { return; }//eslint-disable-line no-undef

    // Spinlock
    if (didAlreadyLoadPageScript) { throw new Error('Cannot load page script (`'+pageName+') because a page script has already been loaded on this page.'); }
    didAlreadyLoadPageScript = true;

    // Automatically set `el`
    if (def.el) { throw new Error('Page script definition contains `el`, but you\'re not allowed to override that'); }
    def.el = '#'+pageName;

    // Expose extra methods, if jQuery is available.
    _exposeBonusMethods(def, 'page script');

    // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
    _wrapMethodsAndVerifyNoArrowFunctions(def, 'page script');

    // If bowser and jQuery are both around, sniff the user agent and determine
    // some additional information about the user agent device accessing the DOM.
    var bowserSniffClasses = '';
    var SNIFFER_CSS_CLASS_PREFIX = 'detected-';
    if (bowser && $) {

      if (bowser.tablet||bowser.mobile) {
        bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'mobile';
        // ^^Note: "detected-mobile" means ANY mobile OS/device (handset or tablet)
        //  [?] https://github.com/lancedikson/bowser/tree/6bbdaf99f0b36cf3a7b8a14feb0aa60d86d7e0dd#device-flags
        if (bowser.ios) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'ios';
        } else if (bowser.android) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'android';
        } else if (bowser.windowsphone) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'windowsphone';
        }

        if (bowser.tablet) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'tablet';
        } else if (bowser.mobile) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'handset';
        }
      }
      else {
        // Otherwise we're not on a mobile OS/browser/device.
        // But we can at least get a bit more intell on what's up:
        if (bowser.mac) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'mac';
        } else if (bowser.windows) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'windows';
        } else if (bowser.linux) {
          bowserSniffClasses += ' '+SNIFFER_CSS_CLASS_PREFIX+'linux';
        }
      }
    }//ﬁ

    // If we have jQuery available, then as soon as the DOM is ready, and if
    // appropriate based on browser device sniffing, attach special classes to
    // the <body> element.
    if ($ && bowserSniffClasses) {
      $(function(){
        $('body').addClass(bowserSniffClasses);
      });//_∏_
    }//ﬁ

    // Wrap the `mounted` LC:
    var customMountedLC;
    if (def.mounted) {
      customMountedLC = def.mounted;
    }//ﬁ
    def.mounted = function(){

      // Similar to above, attach special classes to the page script's top-level
      // DOM element, now that it has been mounted (again, only if appropriate
      // based on browser device sniffing, and only if jQuery is available.)
      if ($ && bowserSniffClasses) {
        this.$get().addClass(bowserSniffClasses);
      }//ﬁ

      // Then call the original, custom "mounted" function, if there was one.
      if (customMountedLC) {
        customMountedLC.apply(this, []);
      }
    };//ƒ

    // Automatically attach `pageName` to `data`, for convenience.
    if (def.data && def.data.pageName) { throw new Error('Page script definition contains `data` with a `pageName` key, but you\'re not allowed to override that'); }
    def.data = _.extend({
      pageName: pageName
    }, def.data||{});

    // Attach `goto` method, for convenience.
    if (def.methods && def.methods.goto) { throw new Error('Page script definition contains `methods` with a `goto` key-- but you\'re not allowed to override that'); }
    def.methods = def.methods || {};
    if (VueRouter) {
      def.methods.goto = function (rootRelativeUrlOrOpts){
        return this.$router.push(rootRelativeUrlOrOpts);
      };
    }
    else {
      def.methods.goto = function (){ throw new Error('Cannot use .goto() method because, at the time when this page script was registered, VueRouter did not exist on the page yet. (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure VueRouter is getting brought in before `parasails`.)'); };
    }

    // If virtualPages was specified, check usage and then...
    if (def.virtualPages && def.router) { throw new Error('Cannot specify both `virtualPages` AND an actual Vue `router`!  Use one or the other.'); }
    if (def.router && !VueRouter) { throw new Error('Cannot use `router`, because that depends on the Vue Router.  But `VueRouter` does not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the VueRouter plugin is getting brought in before `parasails`.)'); }
    if (!def.virtualPages && def.html5HistoryMode !== undefined) { throw new Error('Cannot specify `html5HistoryMode` without also specifying `virtualPages`!'); }
    if (!def.virtualPages && def.beforeEach !== undefined) { throw new Error('Cannot specify `beforeEach` without also specifying `virtualPages`!'); }
    if ((def.beforeNavigate || def.afterNavigate) && def.virtualPages !== true) { throw new Error('Cannot specify `beforeNavigate` or `afterNavigate` unless you set `virtualPages: true`!'); }
    if (def.virtualPages !== undefined) {
      if (!VueRouter) { throw new Error('Cannot use `virtualPages`, because it depends on the Vue Router.  But `VueRouter` does not exist on the page yet.  (If you\'re using Sails, please check dependency loading order in pipeline.js and make sure the VueRouter plugin is getting brought in before `parasails`.)'); }

      // Now we'll replace `virtualPages` in our def with the thing that VueRouter actually expects:

      // If `virtualPages: true` was specified, then use reasonable defaults:
      //
      // > Note: This assumes that, somewhere within the parent page's template, there is:
      // > ```
      // > <router-view></router-view>
      // > ```
      if (def.virtualPages === true) {
        if (def.beforeEach !== undefined) { throw new Error('Cannot specify `virtualPages: true` AND `beforeEach` at the same time!'); }
        if (!def.virtualPagesRegExp && def.html5HistoryMode === 'history') { throw new Error('If `html5HistoryMode: \'history\'` is specified, then virtualPagesRegExp must also be specified!'); }
        if (def.virtualPagesRegExp && !_.isRegExp(def.virtualPagesRegExp)) { throw new Error('Invalid `virtualPagesRegExp`: If specified, this must be a regular expression -- e.g. `/^\/manage\/access\/?([^\/]+)?/`'); }

        // Check for <router-view> element
        // (to provide a better error msg if it was omitted)
        var customBeforeMountLC;
        if (def.beforeMount) {
          customBeforeMountLC = def.beforeMount;
        }//ﬁ
        def.beforeMount = function(){

          // Inject additional code to check for <router-view> element:
          // console.log('this.$find(\'router-view\').length', this.$find('router-view').length);
          if (this.$find('router-view').length === 0) {
            throw new Error(
              'Cannot mount this page with `virtualPages: true` because no '+
              '<router-view> element exists in this page\'s HTML.\n'+
              'Please be sure the HTML includes:\n'+
              '\n'+
              '```\n'+
              '<router-view></router-view>\n'+
              '```\n'
            );
          }//•

          // Then call the original, custom "beforeMount" function, if there was one.
          if (customBeforeMountLC) {
            customBeforeMountLC.apply(this, []);
          }
        };//ƒ

        if (def.methods._navigate) {
          throw new Error('Could not use `virtualPages: true`, because a conflicting `_navigate` method is defined.  Please remove it, or do something else.');
        }

        // Set up local variables to refer to things in `def`, since it will be changing below.
        var pathMatchingRegExp;
        if (def.html5HistoryMode === 'history') {
          pathMatchingRegExp = def.virtualPagesRegExp;
        } else {
          pathMatchingRegExp = /.*/;
        }

        var beforeNavigate = def.beforeNavigate;
        var afterNavigate = def.afterNavigate;

        // Now modify the definition's methods and remove all relevant top-level props understood
        // by parasails (but not by Vue.js) to avoid creating any weird additional dependence on
        // parasails features beyond the expected usage.

        def.methods = _.extend(def.methods||{}, {
          _navigate: function(virtualPageSlug){

            if (beforeNavigate) {
              var doCancelNavigate = beforeNavigate.apply(this, [ virtualPageSlug ]);
              if (doCancelNavigate === false) {
                return;
              }//•
            }

            this.virtualPageSlug = virtualPageSlug;

            // console.log('navigate!  Got:', arguments);
            // console.log('Navigated. (Set `this.virtualPageSlug=\''+virtualPageSlug+'\'`)');

            if (afterNavigate) {
              afterNavigate.apply(this, [ virtualPageSlug ]);
            }

          }
        });

        def = _.extend({
          router: new VueRouter({
            mode: def.html5HistoryMode || 'hash',
            routes: [
              {
                path: '*',
                component: (function(){
                  var vueComponentDef = {
                    render: function(){},
                    beforeRouteUpdate: function (to,from,next){
                      // this.$emit('navigate', to.path); <<old way
                      var path = to.path;
                      var matches = path.match(pathMatchingRegExp);
                      if (!matches) { throw new Error('Could not match current URL path (`'+path+'`) as a virtual page.  Please check the `virtualPagesRegExp` -- e.g. `/^\/foo\/bar\/?([^\/]+)?/`'); }
                      // console.log('this.$parent', this.$parent);
                      this.$parent._navigate(matches[1]||'');
                      // this.$emit('navigate', {
                      //   rawPath: path,
                      //   virtualPageSlug: matches[1]||''
                      // });
                      return next();
                    },
                    mounted: function(){
                      // this.$emit('navigate', this.$route.path); <<old way
                      var path = this.$route.path;
                      var matches = path.match(pathMatchingRegExp);
                      if (!matches) { throw new Error('Could not match current URL path (`'+path+'`) as a virtual page.  Please check the `virtualPagesRegExp` -- e.g. `/^\/foo\/bar\/?([^\/]+)?/`'); }
                      this.$parent._navigate(matches[1]||'');
                      // this.$emit('navigate', {
                      //   rawPath: path,
                      //   virtualPageSlug: matches[1]||''
                      // });
                    }
                  };
                  // Expose extra methods on virtual page script, if jQuery is available.
                  _exposeBonusMethods(vueComponentDef, 'virtual page');

                  // Make sure none of the specified Vue methods are defined with any naughty arrow functions.
                  _wrapMethodsAndVerifyNoArrowFunctions(vueComponentDef, 'virtual page');

                  return vueComponentDef;
                })()
              }
            ],
          })
        }, _.omit(def, ['virtualPages', 'virtualPagesRegExp', 'html5HistoryMode', 'beforeNavigate', 'afterNavigate']));
      } else if (_.isObject(def.virtualPages) && !_.isArray(def.virtualPages) && !_.isFunction(def.virtualPages)) {
        throw new Error('This usage of `virtualPages` (as a dictionary) is no longer supported.  Instead, please use `virtualPages: true`.  [?] https://sailsjs.com/support');
        // (old implementation removed in https://github.com/mikermcneil/parasails/commit/20af5992097de788b58ae2cb517675f235798879)
      } else {
        throw new Error('Cannot use `virtualPages` because the specified value doesn\'t match any recognized meaning.  Please specify either `true` (for the default handling) or a dictionary of client-side routing rules.');
      }
    }//ﬁ  </ def has `virtualPages` >

    // Construct Vue instance for this page script.
    var vm = new Vue(def);

    return vm;

  };//ƒ



  /**
   * parasails.util.isMobile()
   *
   * Detect whether this is being accessed from a mobile browser/OS, which might
   * be a handset device (iPhone, etc.) OR a tablet device (iPad, etc.)
   *
   * > This relies on `bowser.mobile||bowser.tablet`.
   *
   * @returns {Boolean}
   */
  parasails.util.isMobile = function(){

    // If `bowser` is not available, throw an error.
    if(!bowser) {
      throw new Error('Cannot detect mobile-ness, because `bowser` global does not exist on the page yet. '+
        '(If you\'re using Sails, please check dependency loading order in pipeline.js and make sure '+
        'the Bowser library is getting brought in before `parasails`. If you have not included Bowser '+
        'in your project, you can find it at https://github.com/lancedikson/bowser/releases)');
    }

    return (!!bowser.mobile) || (!!bowser.tablet);

  };//ƒ
  // An extra alias, for convenience:
  parasails.isMobile = parasails.util.isMobile;


  /**
   * parasails.util.isValidEmailAddress()
   *
   * Determine whether the given value is a valid email address.
   *
   * > This code is taken directly from validator.js / anchor.
   * > It is implemented as a built-in, organic utility that may be overwritten
   * > in userland if desired.
   *
   * @param {String} value
   *
   * @returns {Boolean}
   */

  parasails.util.isValidEmailAddress = function(value){
    if (!value || typeof value !== 'string') { return false; }
    /* eslint-disable */
    return (function(){function _isByteLength(str,min,max){var len=encodeURI(str).split(/%..|./).length-1;return len>=min&&(typeof max==='undefined'||len<=max)}
    var emailUserUtf8Part=/^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;var quotedEmailUserUtf8=/^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;function _isFQDN(str){var options={require_tld:!0,allow_underscores:!1,allow_trailing_dot:!1};if(options.allow_trailing_dot&&str[str.length-1]==='.'){str=str.substring(0,str.length-1)}
    var parts=str.split('.');if(options.require_tld){var tld=parts.pop();if(!parts.length||!/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)){return!1}}
    for(var part,i=0;i<parts.length;i++){part=parts[i];if(options.allow_underscores){if(part.indexOf('__')>=0){return!1}
    part=part.replace(/_/g,'')}
    if(!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)){return!1}
    if(/[\uff01-\uff5e]/.test(part)){return!1}
    if(part[0]==='-'||part[part.length-1]==='-'||part.indexOf('---')>=0){return!1}}
    return!0};return function(str){var parts=str.split('@'),domain=parts.pop(),user=parts.join('@');var lower_domain=domain.toLowerCase();if(lower_domain==='gmail.com'||lower_domain==='googlemail.com'){user=user.replace(/\./g,'').toLowerCase()}
    if(!_isByteLength(user,0,64)||!_isByteLength(domain,0,256)){return!1}
    if(!_isFQDN(domain)){return!1}
    if(user[0]==='"'){user=user.slice(1,user.length-1);return quotedEmailUserUtf8.test(user)}
    var pattern=emailUserUtf8Part;var user_parts=user.split('.');for(var i=0;i<user_parts.length;i++){if(!pattern.test(user_parts[i])){return!1}}
    return!0}})()(value);
    /* eslint-enable */
  };//ƒ


  /**
   * parasails.utils
   *
   * A permanent alias for `parasails.util`.
   *
   * (Everyone gets these mixed up.)
   *
   * @type {:Dictionary}
   */

  parasails.utils = parasails.util;



  return parasails;

});//…)
