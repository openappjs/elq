/**
 * @title elq.js
 * @overview Parses CSS for element queries, supports them in JavaScript
 * @copyright (c) 2014
 * @license CC BY (http://creativecommons.org/licenses/by/4.0/)
 * @author Art Lawry
*/

/**
 * Parses CSS for element queries and implements them with JavaScript
 *
 * @class elq
 * @param  {Object} elq      The elq module for loose augmentation
 * @param  {Object} document document object for DOM manipulation
 * @return {Object}          The augmented elq module
 */
window.elq = (function (elq, document) {

  'use strict';

  var

    /**
     * Allows pre-processing after a window resize with less resources
     *
     * @property resizeTimeout
     * @private
     * @type Object
     * @default undefined
     */
    resizeTimeout,

    /**
     * The number of links remaining to be fetched and rendered locally
     *
     * @property remainingLinks
     * @private
     * @type Number
     * @default 0
     */
    remainingLinks = 0,

    /**
     * A hash of cached links to avoid re-fetching
     *
     * @property cachedLinks
     * @private
     * @type Object
     * @default {}
     */
    cachedLinks = {},

    /**
     * A hash of registered media queries to avoid duplication
     *
     * @property registeredSelectors
     * @private
     * @type Object
     * @default {}
     */
    registeredSelectors = {},

    /**
     * A regular expression for finding valid element queries
     *
     * @property validelq
     * @private
     * @type Object
     * @default {}
     */
    validelq = new RegExp(
      '\\s*([^,}])+' + // selector
      '\\:media\\(' + // :media(
        '(' + // capture
          '(?:' + // pattern or simple
            '(?:' + // one comma-separated (or) group
              '(?:\\s*not)?\\s*' + // optional or group negation
              '(?:\\([^)]+\\))' + // and-separated group
              '(?:\\s*and\\s*(?:\\([^)]+\\)))*' + // multiple ands
            ')' +
            '(?:' + // multiple ors
              '\\s*,' + // or
              '(?:\\s*not)\\s*' + // optional or group negation
              '(?:\\([^)]+\\))' + // and-separated group
              '(?:\\s*and\\s*(?:\\([^)]+\\)))*' + // multiple ands
            ')*' +
          '|' +
            '[^())]+' +
          ')' +
        ')' +
      '\\)', // )
      'g'
    ),

    /**
     * The number of pixels corresponding to one rem at context change time
     *
     * @property pixelsPerREM
     * @private
     * @type Number
     * @default undefined
     */
    pixelsPerREM,

    /**
     * An object to store private methods
     *
     * @property privateMethods
     * @private
     * @type Object
     * @default {}
     */
    privateMethods = {};

  /* FLASH */ elq._revealed = privateMethods; /* UNFLASH */

  /**
   * Fetch an external CSS link and render it as an inline style element
   *
   * @method fetchExternalCSS
   * @private
   * @param  {DOM Object} link The link to fetch
   * @return {Boolean}         True if link was fetched
   */
  privateMethods.fetchExternalCSS = function (link) {
    var
      success = false,
      href    = link.getAttribute('href'),
      media   = link.getAttribute('media') || '',
      style,
      request;

    if (!cachedLinks[href + media]) {
      success = true;
      style   = document.createElement('style');
      request = new XMLHttpRequest();

      if (media) {
        style.setAttribute('media', media);
      }
      style.setAttribute('href', href);
      style.className = 'elq-fetched';

      link.parentNode.insertBefore(style, link.nextSibling);
      cachedLinks[href + media] = true;

      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            style.innerHTML += request.responseText;
          } else {
            privateMethods.unfetchExternalCSS(link);
          }
          remainingLinks -= 1;
          if (!remainingLinks) {
            privateMethods.parseCSS();
          }
        }
      };

      request.open('GET', href, true);
      request.send();
    } else {
      remainingLinks -= 1;
    }

    return success;
  };

  /**
   * Removes generated style and fetched css from internal cache
   *
   * @method unfetchExternalCSS
   * @private
   * @param  {DOM Object} link The link that was fetched
   * @return {Boolean}         True if style was deleted
   */
  privateMethods.unfetchExternalCSS = function(link) {
    var
      success = false,
      href    = link.getAttribute('href'),
      media   = link.getAttribute('media') || '',
      style   = link.nextSibling;

    if (style && (style.tagName.toLowerCase() === 'style') &&
      (link.getAttribute('href') === style.getAttribute('href')) &&
      (link.getAttribute('media') === style.getAttribute('media')) &&
      (style.className === 'elq-fetched')) {
      style.parentNode.removeChild(style);
      delete(cachedLinks[href + media]);
      success = true;
    }

    return success;
  };

  /**
   * Loop through each selector and process matching elements
   *
   * @method applyContext
   * @private
   * @return {Boolean} True if any selectors were found
   */
  privateMethods.applyContext = function () {
    var
      selectors = Object.keys(registeredSelectors),
      length    = selectors.length,
      index,
      processElements,
      processContexts;

    processContexts = function (
      selector,
      pixelsPerEM,
      element,
      parentWidth,
      parentHeight
    ) {
      var
        registeredSelector = registeredSelectors[selector],
        conditions         = Object.keys(registeredSelector),
        length             = conditions.length,
        index;

      for (index = 0; index < length; index += 1) {

        registeredSelector[conditions[index]](
          parentWidth,
          parentHeight,
          element,
          pixelsPerEM,
          pixelsPerREM
        );
      }
    };

    processElements = function (selector) {
      var
        elements = document.querySelectorAll(selector),
        length = elements.length,
        index,
        element,
        parent,
        pixelsPerEM,
        parentWidth,
        parentHeight;

      for (index = 0; index < length; index += 1) {
        element     = elements[index];
        parent      = element.parentNode;
        pixelsPerEM = document.defaultView.getComputedStyle(
          parent,
          null
        ).getPropertyValue('fontSize');

        parentWidth  = parent.clientWidth;
        parentWidth  += (2 * (parseInt(parent.style.padding, 10) || 0));
        parentWidth  += parseInt(parent.style.paddingLeft, 10) || 0;
        parentWidth  += parseInt(parent.style.paddingRight, 10) || 0;
        parentHeight = parent.clientHeigparentHeightt;
        parentHeight += (2 * (parseInt(parent.style.padding, 10) || 0));
        parentHeight += parseInt(parent.style.paddingTop, 10) || 0;
        parentHeight += parseInt(parent.style.paddingBottom, 10) || 0;

        processContexts(
          selector,
          pixelsPerEM,
          element,
          parentWidth,
          parentHeight
        );
      }
    };

    for (index = 0; index < length; index += 1) {
      processElements(selectors[index]);
    }

    return length ? true : false;
  };

  /**
   * Listen for context change and modify all selectors
   *
   * @method respondToContext
   * @private
   * @return {Boolean} True if any selectors were found
   */
  privateMethods.respondToContext = function () {
    var
      respondAfterTimeout = function respondAfterTimeout() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(privateMethods.respondToContext, 300);
      };

    pixelsPerREM = document.defaultView.getComputedStyle(
      document.querySelector('html'),
      null
    ).getPropertyValue('fontSize');

    window.removeEventListener('resize', respondAfterTimeout);
    window.removeEventListener('orientationchange', respondAfterTimeout);
    window.addEventListener('resize', respondAfterTimeout);
    window.addEventListener('orientationchange', respondAfterTimeout);

    return privateMethods.applyContext();
  };

  /**
   * Parses all CSS and registers found element queries
   *
   * @method parseCSS
   * @private
   * @return {Boolean} True if any element queries were found
   */
  privateMethods.parseCSS = function () {
    var
      success = false,
      styles  = document.querySelectorAll('style'),
      length  = styles.length,
      index,
      style,
      css,
      replaceCSS = function (unused, selector, media) {
        return selector + '.' + elq.register(selector, media);
      };

    for (index = 0; index < length; index += 1) {
      style = styles[index];
      css   = style.innerHTML;
      css   = css.replace(/\s+/g, ' ');
      css   = css.replace(/(^|\})\s*/g, '$1\n');

      while (validelq.test(css)) {
        success = true;
        css = css.replace(validelq, replaceCSS);
      }

      style.innerHTML = css;
    }

    privateMethods.respondToContext();

    return success;
  };

  /**
   * Converts the media query portion of an element query into a condition
   *
   * @method mediaToCondition
   * @private
   * @param  {String} media The media query portion of the element query
   * @return {String}       The modified condition
   */
  privateMethods.mediaToCondition = function (media) {
    media = '(' + media + ')';
    media = media.replace(/\s*,\s*/g, ')||(');
    media = media.replace(/\s*not\s*([^|]+)\s*/g, '!($1)');
    media = media.replace(/\s+and\s+/g, '&&');
    media = media.replace(
      /\s*(?:(min|max)-)?(width|height)\s*:\s*(\d+)(px|em|rem)\s*/g,
      function (unused, mm, hw, val, units) {
        var operator, left, right;

        operator = mm === 'min' ? '>=' : mm === 'max' ? '<=' : '==';
        left = hw === 'width' ? 'elw' : 'elh';
        right = val;

        if (units === 'em') {
          left = '(' + left + '/pxpem)';
        } else if (units === 'rem') {
          left = '(' + left + '/pxprem)';
        }

        return left + operator + right;
      }
    );
    media = media.replace(
      /\s*(?:(min|max)-)?aspect-ratio\s*:\s*(\S+)\s*/g,
      function (unused, mm, val) {
        var operator, left, right;

        operator = mm === 'min' ? '>=' : mm === 'max' ? '<=' : '==';
        left = '(elw/elh)';
        right = val;

        return left + operator + right;
      }
    );

    while (/\(\(([^)]+)\)\)/.test(media)) {
      media = media.replace(/\(\(([^)]+)\)\)/g, '($1)');
    }

    return media;
  };

  /**
   * Registers an element query
   *
   * @method register
   * @param  {String} selector The selector matching this element query
   * @param  {String} media    The media matching this element query
   * @param  {String} elqClass Optional predetermined class to apply
   * @return {String}          The class associated with this element query
   */
  elq.register = function register(selector, media, elqClass) {

    if (selector && media) {
      if (!elqClass) {
        elqClass = media.replace(
          /^\W*(\w.*\w)\W*$/,
          function (unused, media) {
            media = media.replace(/\W+/g, '-');
            return 'elq-' + media;
          }
        );
      }
      if (!registeredSelectors[selector]) {
        registeredSelectors[selector] = {};
      }
      registeredSelectors[selector][media] =
        new Function( // jshint ignore:line
          'elw', 'elh', 'el', 'pxpem', 'pxprem', // params
          'el.className = el.className.replace(' +
            '/(^|\\s)' + elqClass + '($|\\s)/g,' +
            '\'$2\'' +
          ');' +
          'if (' + privateMethods.mediaToCondition(media) + ') {' +
            'el.className += el.className ? \' \' : \'\';' +
            'el.className += \'' + elqClass + '\';' +
          '}'
        );
    }

    privateMethods.respondToContext();

    return elqClass;
  };

  /**
   * Unregisters an element query
   *
   * @method unregister
   * @param  {String} selector The selector matching this element query
   * @param  {String} media    The media matching this element query
   * @return {Boolean}         True if selector existed
   */
  elq.unregister = function unregister(selector, media) {
    var
      success = false;

    if (selector && media) {
      success = registeredSelectors[selector][media] ? true : false;
      delete(registeredSelectors[selector][media]);
    } else {
      success = Object.keys(registeredSelectors).length ?
        true :
        false;
      registeredSelectors = {};
    }

    return success;
  };

  /**
   * Processes the entire page for element queries
   *
   * @method process
   * @param {Array} Option array of DOM links to process
   */
  elq.process = function process(links) {
    var
      length,
      index;

    links          = links || document.querySelectorAll('link[href*=".css"]');
    length         = links.length;
    remainingLinks = length;

    if (!length) {
      privateMethods.parseCSS();
    } else {
      for (index = 0; index < length; index += 1) {
        privateMethods.fetchExternalCSS(links[index]);
      }
    }

    return true;
  };

  return elq;
}(window.elq || {}, document));
