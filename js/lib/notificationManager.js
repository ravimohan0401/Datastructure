/*!
 * Copyright 2013-2021 CommScope, Inc., All rights reserved.
 *
 * This program is confidential and proprietary to CommScope, Inc. (CommScope), and
 * may not be copied, reproduced, modified, disclosed to others, published or used, in
 * whole or in part, without the express prior written permission of CommScope.
 */

window.notificationManager = (function () {

  var _$htmlContainer = document.querySelector('#Notifications'),
    _containerVisible = false,
    _nc = 0,
    _stack = [];

  /*!
   * Softly extends a base object with another only
   * if the properties don't already exist.
   *
   * @method _extend
   * @param  {Object} context The base object.
   * @param  {Object} from    Object to extend from.
   */
  function _extend(context, from) {
    for (var k in from) {
      if (from.hasOwnProperty(k) && !context.hasOwnProperty(k)) {
        context[k] = from[k];
      }
    }
  }

  /*!
   * Internal method to manage the notification counter and stack.
   *
   * When the _stack is empty the notification counter will be reset.
   * This ensures the stack never gets confused with the array index's
   * and the notification index's returned from create.
   *
   * @method update
   * @private
   */
  function _update() {
    var exists = false;

    for (var i = 0; i < _stack.length; i++) {
      if (_stack[i]) {
        exists = true;
      }
    }

    if (!exists) {
      //reset the counter & clear stack of null objects and hide the outer container
      _nc = 0;
      _stack = [];
      _$htmlContainer.classList.add('show');
      _$htmlContainer.classList.remove('hide');
      _containerVisible = false;
    }

    //else - keep incrementing to keep the id's unique and save confusion
  }

  /*!
   * This functions adds HTML to the DOM.
   *
   * @method _domInsert
   * @private
   * @param {String} html The HTML to be injected into the DOM.
   */
  function _domInsert(html) {
    _$htmlContainer.innerHTML += html;
    if (!_containerVisible) {
      _$htmlContainer.classList.add('show');
      _$htmlContainer.classList.remove('hide');
      _containerVisible = true;
    }
  }

  /*!
   * This is the notification base class.
   *
   * @class _Notification
   * @constructor
   * @param {Object} config An object containing the notification configuration.
   *   @param {Number} [config.timeout] The timeout for the notification in milliseconds.
   *   @param {String} [config.text] The notification message, defaults to "This is a notification".
   *   @param {String} [config.className] Class to apply to the notification.
   * @param {Object} manager Manager to manage notification
   */
  function _Notification(config, manager) {
    var index = _nc++;

    this.id = index;
    this.name = config.name || 'Notifications-' + index;
    this.text = config.text || 'This is a notification';
    this.className = config.className || '';
    this.manager = manager;
    this._isVisible = false;
    this.timeout = config.timeout;
  }

  /*!
   * Internal method to handle the rendering of the dialog on screen.
   * It dynamically injects the div with the correct name and css class.
   *
   * All notifications are appended into the div #Notifications
   *
   * @method show
   * @param {Object} obj This is the reference to the returned notification from
   *   {{#crossLink "notificationManager/create:method"}}{{/crossLink}}
   * @return {Boolean} True if the notification was displayed, false otherwise.
   */
  _Notification.prototype.show = function (obj) {
    if (this._isVisible) {
      console.log('notificationManager : _Notification : show : ERROR : This notification has already been displayed');
      return false;
    }

    clearTimeout(this.timer);

    var html = '<div id="' + this.name + '" class="notification';

    if (this.className) {
      html += ' ' + this.className;
    }

    html += '">';

    html += this.render();
    html += '</div>';

    //call the appropriate insertion method
    _domInsert(html);

    if (typeof this.timeout === 'number' && !isNaN(this.timeout)) {
      this.timer = setTimeout(function () {
        this.manager.hide(obj);
      }.bind(this), this.timeout);
    }

    this._isVisible = true;

    return true;
  };

  /*!
   * This returns the string to render into the notification div.
   *
   * @method render
   * @return {String} The string to render into the notification
   */
  _Notification.prototype.render = function () {
    return this.text;
  };

  /*!
   * This function will return a boolean value indicating if the notification
   * is currently visible.
   *
   * @method isVisible
   * @return {Boolean} True if the notification is currently on screen, false if it has been hidden.
   */
  _Notification.prototype.hide = function () {
    var e;

    if (!this._isVisible) {
      return false;
    }

    this._isVisible = false;

    e = document.getElementById(this.name);
    e.parentNode.removeChild(e);

    clearTimeout(this.timer);
    delete this.timer;

    return true;
  };

  /*!
   * This function is used to handle the removal of a notification
   * from the screen.
   *
   * @method hide
   * @return {Boolean} True if the notification has been hidden, false otherwise
   */
  _Notification.prototype.isVisible = function () {
    return this._isVisible;
  };

  /**
   * notificationManager provides a base implementation to manage notifications.
   * This manager allows the developer to `create`, `show` and `hide` a notification.
   *
   * The notification manager allows allows for multiple notification to be on
   * screen at time, where they simply stack below one another.
   *
   * @class notificationManager
   */
  return {

    /**
     * The function creates and returns a 'notification' object.
     *
     * @method create
     * @param {Object} config The notification configuration options.
     *   @param {Number} [config.timeout] The timeout for the notification in milliseconds.
     *   @param {String} config.text The notification message, defaults to "This is a notification".
     *   @param {String} [config.className] CSS Class to apply to the notification.
     * @param {Object} [extend] Object to extend the notifications functionality.
     * @return {Object} The notification object if created successfully, or null if unable to create.
     *
     * @example
     *     var notification = notificationManager.create({ text: "Hello world", className: "red" });
     *
     * To show the notification we call the show function:
     *
     *     notificationManager.show(notification);
     *
     *     or
     *
     *     notification.show();
     *
     * Then the developer can hide the notification calling:
     *
     *     notificationManager.hide(notification);
     *
     *     or
     *
     *     notification.hide();
     */
    create: function (config, extend) {
      console.log(config)
      var notification = new _Notification(config, this),
        id = notification.id,
        returnObject = null;

      if (!_stack[id]) {
        if (extend) {
          notification = _extend(Object.create(notification), extend);
          if (notification.init) {
            notification.init(this);
          }
        }

        returnObject = {
          id: id,
          show: function () { return notification.manager.show(this); },
          hide: function () { return notification.manager.hide(this); },
          isVisible: function () { return notification.isVisible(); }
        };

        _stack[id] = notification;
        console.log('notificationManager.create: Notification created [' + id + ']');
      } else {
        console.log('notificationManager.create: A notification with the id [' + id + '] already exists within the stack.');
      }

      return returnObject;
    },

    /**
     * This function will show a notification.
     *
     * @method show
     * @param {Object} obj The notification to show as returned from create.
     * @return {Boolean} True if notification was shown, false otherwise.
     */
    show: function (obj) {
      var returnCode = false,
        index,
        notification;

      //Display a default notification with default properties
      if (typeof obj === 'string') {
        obj = this.create({
          text: obj
        });
      }

      index = obj.id;

      if (index !== null) {
        notification = _stack[index];
        if (notification) {
          console.log('notificationManager.show: Showing notification [' + obj.id + ']');
          return notification.show(obj);
        } else {
          console.log('notificationManager.show: The notification [' + obj.id + '] is not valid, it may have already been shown and removed');
        }
      }
      else {
        console.log('notificationManager.show: This notification has already been shown. It needs re-created!');
      }

      return returnCode;
    },

    /**
     * This function will hide a notification.
     *
     * @method hide
     * @param {Object} obj The notification to hide as returned from create.
     * @return {Boolean} True if notification was hidden, false otherwise.
     */
    hide: function (obj) {
      var notification = _stack[obj.id],
        returnCode = false;

      if (!notification) {
        console.log('notificationManager.hide: The notification [' + obj.id + '] is either invalid or has already been removed');
      } else {
        returnCode = notification.hide();
        _stack[obj.id] = null;
        obj.id = null;
        _update();
      }

      return returnCode;
    }
  };
})();
