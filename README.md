# parasails

Lightweight structures for apps with more than one page.  Built on top of [Vue.js](https://vuejs.org).

While it can be used with any module system, this library does not rely on Webpack, Babel, Gulp, Grunt, Brunch, or any other build system or transpiler.  It is **2.96KB minified and gzipped** (or 27KB uncompressed).


## Usage

Out of the box, parasails supports:
 - pages
 - components
 - utilities
 - constants

As well as a few optional integrations:
 - Vue Router (for client-side routing / "virtual pages")
 - jQuery (for `this.$get()`, `this.$find()`, and `this.$focus()`)


```html
<div id="homepage" v-cloak>
  <h1>{{welcomeMessage}}</h1>
  <button autofocus @click="clickButton()">Click me</button>
</div>
```

```js
parasails.registerPage('homepage', {
  data: {
    welcomeMessage: ''
  },
  beforeMount: function(){
    this.welcomeMessage = 'Hello world!';
  },
  mounted: function(){
    this.$focus('[autofocus]');
  },
  methods: {
    clickButton: function(){
      this.welcomeMessage = 'Ow that hurt!';
    }
  }
});
```


## Jumping off

Have questions?  Need advice?  Want to contribute?  Come by and [say hello](https://sailsjs.com/support)!

> Parasails is developed by Mike McNeil, with help from other [Sails.js](https://sailsjs.com) core team members in Austin, TX.  If you're working on a commercial project and are interested in ways we can work together, [drop us a line](https://sailsjs.com/studio).


<!--
## More examples

#### Pages

Register a page:

```html
<div id="login" v-cloak>
  <div class="container">
    <h1 class="text-center">Sign in</h1>
    <div class="login-form-container">
      <hr/>
      <ajax-form action="login" :syncing.sync="syncing" :cloud-error.sync="cloudError" @after-submitting="afterSubmittingForm()" :handle-parsing="handleParsingForm">
        <div class="form-group">
          <input type="email" class="form-control" autofocus placeholder="Email Address" :class="[formErrors.emailAddress ? 'is-invalid' : '']" v-model.trim="formData.emailAddress">
          <div class="invalid-feedback" v-if="formErrors.emailAddress">Please provide a valid email address.</div>
        </div>
        <div class="form-group">
          <input type="password" class="form-control" placeholder="Password" :class="[formErrors.password ? 'is-invalid' : '']" v-model.trim="formData.password">
          <div class="invalid-feedback" v-if="formErrors.password">Please enter your password.</div>
        </div>
        <p class="text-danger" v-if="cloudError==='notFound'"><small>The credentials you entered are not associated with an account in our system. Please check your email and/or password and try again.</small></p>
        <p class="text-danger" v-else-if="cloudError"><small>An error occured while processing your request. Please check your information and try again, or <a href="/contact">contact support</a> if the error persists.</small></p>
        <div class="form-group">
          <ajax-button :syncing="syncing" class="btn-dark btn-lg btn-block">Sign in</ajax-button>
        </div>
      </ajax-form>
      <p class="text-center"><a href="/password/forgot">Forgot your password?</a></p>
    </div>
  </div>
</div>
<%- /* Expose locals as `window.SAILS_LOCALS` :: */ exposeLocalsToBrowser() %>
```


```js
parasails.registerPage('login', {

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    // Main syncing/loading state for this page.
    syncing: false,

    // Form data
    formData: { /* … */ },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Server error state for the form
    cloudError: '',

  },


  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function(){
    _.extend(this, window.SAILS_LOCALS);
  },
  mounted: function() {

    this.$focus('[autofocus]');

  },


  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {
    // …
  }
});
```


#### Components

Register a component:

```js
parasails.registerComponent('ajaxButton', {

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠╣ ╠═╣║  ║╣
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╚  ╩ ╩╚═╝╚═╝
  props: ['syncing'],

  //  ╔╦╗╔═╗╦═╗╦╔═╦ ╦╔═╗
  //  ║║║╠═╣╠╦╝╠╩╗║ ║╠═╝
  //  ╩ ╩╩ ╩╩╚═╩ ╩╚═╝╩
  template: `
  <button type="submit" class="btn ajax-button" :class="[syncing ? 'syncing' : '']">
    <span class="button-text" v-if="!syncing"><slot name="default">Submit</slot></span>
    <span class="button-loader clearfix" v-if="syncing">
      <slot name="syncing-state">
        <div class="loading-dot dot1"></div>
        <div class="loading-dot dot2"></div>
        <div class="loading-dot dot3"></div>
        <div class="loading-dot dot4"></div>
      </slot>
    </span>
  </button>
  `,

  //  ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
    };
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {

  },

  mounted: function (){

    // Log a warning if we're not inside of an <ajax-form>
    var $closestAncestralForm = this.$get().closest('form');
    if($closestAncestralForm.length === 0) {
      console.warn('Hmm... this <ajax-button> doesn\'t seem to be part of an <ajax-form>...');
    }

  },

  beforeDestroy: function() {

  },

  //  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  methods: {

  }

});
```



#### Constants and utilities

Register a constant:

```js
// assets/js/constants/HELLO_MESSAGE_PREFIX.js
parasails.registerConstant('HELLO_MESSAGE_PREFIX', 'Oh hi, ');
```

Or an arbitrary utility function:

```js
parasails.registerUtility('getHelloMessage', function(firstName) {
  return `Oh hi, ${firstName}!`;
});
```

Then use them wherever you like:

```js
var getHelloMessage = parasails.require('getHelloMessage');

// …

console.log(getHelloMessage('Joaquin'));
```

-->

## License

Copyright &copy; 2017-present [Mike McNeil](https://github.com/mikermcneil)
