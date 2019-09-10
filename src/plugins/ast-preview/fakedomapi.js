/*\
title: $:/plugins/ento/ast-preview/fakedomapi.js
type: application/javascript
module-type: library

Wrapper for $:/core/modules/utils/fakedom.js to make it compatible with
snabbdom's DOMAPI interface.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
  "use strict";
  var TW_CommentNode = function(text) {
    this.textContent = text + "";
  };

  Object.defineProperty(TW_CommentNode.prototype, "nodeType", {
    get: function() {
      return 8;
    }
  });

  function FakeDomApi(document) {
    function createElement(tagName) {
      return document.createElement(tagName);
    }

    function createElementNS(namespaceURI, qualifiedName) {
      return document.createElementNS(namespaceURI, qualifiedName);
    }

    function createTextNode(text) {
      return document.createTextNode(text);
    }

    function createComment(text) {
      return new TW_CommentNode(text);
    }

    function insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    }

    function removeChild(node, child) {
      node.removeChild(child);
      child.parentNode = null;
    }

    function appendChild(node, child) {
      node.appendChild(child);
    }

    function parentNode(node) {
      return node.parentNode;
    }

    function nextSibling(node) {
      if (!node.parentNode) {
        return null;
      }
      if (node.parentNode.children.length < 2) {
        return null;
      }
      var siblings = node.parentNode.children,
          i;
      for(i=0; i<siblings.length; i++) {
        if(siblings[i] === node) {
          return siblings[i + 1];
        }
      }
    }

    function tagName(elm) {
      return elm.tag;
    }

    function setTextContent(node, text) {
      node.textContent = text;
    }

    function getTextContent(node) {
      return node.textContent;
    }

    function isElement(node) {
      return node.nodeType === 1;
    }

    function isText(node) {
      return node.nodeType === 3;
    }

    function isComment(node) {
      return node.nodeType === 8;
    }

    return {
      createElement: createElement,
      createElementNS: createElementNS,
      createTextNode: createTextNode,
      createComment: createComment,
      insertBefore: insertBefore,
      removeChild: removeChild,
      appendChild: appendChild,
      parentNode: parentNode,
      nextSibling: nextSibling,
      tagName: tagName,
      setTextContent: setTextContent,
      getTextContent: getTextContent,
      isElement: isElement,
      isText: isText,
      isComment: isComment,
    }
  }

  exports.FakeDomApi = FakeDomApi;
})();
