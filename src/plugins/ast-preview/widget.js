/*\
title: $:/plugins/ento/ast-preview/widget.js
type: application/javascript
module-type: widget

Widget to display the parsed tree node of the specified tiddler.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

  var Widget = require("$:/core/modules/widgets/widget.js").widget;

  var AstWidget = function(parseTreeNode,options) {
    this.initialise(parseTreeNode,options);
  };

  /*
    Inherit from the base widget class
  */
  AstWidget.prototype = new Widget();

  /*
    Render this widget into the DOM
  */
  AstWidget.prototype.render = function(parent,nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    this.renderChildren(parent,nextSibling);
  };

  /*
    Compute the internal state of the widget
  */
  AstWidget.prototype.execute = function() {
    // Get our parameters
    this.tiddlerTitle = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
    var parser = this.wiki.parseTiddler(this.tiddlerTitle),
        parseTreeNodes = this.parseTreeNode.children;
    if (parser) {
      parseTreeNodes = transformParseTreeNodes(parser.tree);
    }
    // Construct the child widgets
    this.makeChildWidgets(parseTreeNodes);
  };

  function WrappedParsedTreeNodes(value) {
    this.value = value;
  }

  WrappedParsedTreeNodes.prototype.map = function() {
    return this.value.map.apply(this.value, arguments);
  }

  Object.defineProperty(WrappedParsedTreeNodes.prototype, "length", {
    get: function() { return this.value.length; },
  });

  function ensureListItemElement(node) {
    if (node.tag === "li") {
      return node;
    } else {
      return Html.li([], [node]);
    }
  }

  function makeSimpleListItemElement(prop, summary) {
    return Html.li([], [
      summary,
      Html.attrSep(),
      Html.attrValue(JSON.stringify(prop))
    ]);
  }

  function transformParseTreeNodeProperty(prop, propName, summary) {
    if ($tw.utils.isArray(prop) || prop instanceof WrappedParsedTreeNodes) {
      if (prop.length === 0) return makeSimpleListItemElement(prop, summary);
      var propContent = [];
      if (propName === "children" || prop instanceof WrappedParsedTreeNodes) {
        $tw.utils.each(transformParseTreeNodes(prop), function(child) {
          propContent.push(Html.li([], [child]));
        });
      } else {
        $tw.utils.each(prop, function(child, i) {
          propContent.push(ensureListItemElement(transformParseTreeNodeProperty(child, typeof child, Html.nodeType(typeof child))));
        })
      }
      return Html.details([Html.class("ast-widget-details")], [
        Html.summary([], [
          summary,
          Html.nodePreview("(" + prop.length + ")")
        ]),
        Html.ol([Html.class("ast-widget-list")], propContent)
      ]);
    } else if (typeof prop === "object") {
      if (Object.keys(prop).length === 0) return makeSimpleListItemElement(prop, summary);
      var propContent = [];
      $tw.utils.each(Object.keys(prop).sort(), function(key) {
        var value = prop[key];
        if (propName === "attributes" && key === "filter") {
          value = $tw.wiki.parseFilter(value.value);
        }
        var transformedValue = transformParseTreeNodeProperty(value, key, Html.attrName(key));
        if (transformedValue) {
          propContent.push(ensureListItemElement(transformedValue));
        }
      });
      return Html.details([Html.class("ast-widget-details")], [
        Html.summary([], [summary]),
        Html.ul([Html.class("ast-widget-list")], propContent)
      ]);
    } else {
      return makeSimpleListItemElement(prop, summary);
    }
  }

  function transformParseTreeNodes(parseTreeNodes) {
    if (!parseTreeNodes) return [];
    return parseTreeNodes.map(function(node) {
      var nodeContent = [];
      if (node.type === "set" && node.isMacroDefinition) {
        var parsed = $tw.wiki.parseText(
          "text/vnd.tiddlywiki", node.attributes.value.value, {parseAsInline: true});
        if (parsed) {
          node.attributes.value = new WrappedParsedTreeNodes(parsed.tree);
        }
      }
      $tw.utils.each(Object.keys(node).sort(), function(key) {
        var prop = node[key];
        var propContent = transformParseTreeNodeProperty(prop, key, Html.attrName(key));
        if (propContent) {
          nodeContent.push(ensureListItemElement(propContent));
        }
      });
      var nodeSummary;
      if ("$" + node.type === node.tag) {
        nodeSummary = [Html.nodeType(node.tag)];
      } else if (node.type === "text") {
        nodeSummary = [Html.nodeType(node.type), Html.nodePreview(node.text)];
      } else if (node.type === "set") {
        nodeSummary = [Html.nodeType(node.type), Html.nodePreview(node.attributes.name.value)];
      } else {
        nodeSummary = [Html.nodeType(node.type)];
        if (node.tag) {
          nodeSummary.push(Html.nodePreview(node.tag));
        }
      }
      return Html.details([Html.class("ast-widget-details")], [
        Html.summary([], nodeSummary),
        Html.ul([Html.class("ast-widget-list")], nodeContent)
      ])
    });
  }

  var Html = {};

  function htmlElement(tag) {
    return function(attrs, content) {
      var attributes = {};
      $tw.utils.each(attrs, function(attr) {
        attributes[attr.name] = attr;
      });
      return {
        type: "element",
        tag: tag,
        attributes: attributes,
        children: content
      };
    }
  }
  Html.ul = htmlElement("ul");
  Html.ol = htmlElement("ol");
  Html.details = htmlElement("details");
  Html.summary = htmlElement("summary");
  Html.li = htmlElement("li");
  Html.span = htmlElement("span");
  Html.text = function(text) {
    return {type: "text", text: text};
  };
  Html["class"] = function(name) {
    return {name: "class", type: "string", value: name};
  };
  Html.nodeType = function(name) {
    return Html.span([Html.class("ast-widget-node-type")], [Html.text(name)]);
  };
  Html.nodePreview = function(name) {
    return Html.span([Html.class("ast-widget-node-preview")], [Html.text(name)]);
  };
  Html.attrName = function(name) {
    return Html.span([Html.class("ast-widget-attr-name")], [Html.text(name)]);
  };
  Html.attrSep = function() {
    return Html.span([Html.class("ast-widget-attr-separator")], [Html.text(":")]);
  };
  Html.attrValue = function(value) {
    return Html.span([Html.class("ast-widget-attr-value")], [Html.text(value)]);
  };

  /*
    Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
  */
  AstWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(changedAttributes.tiddler || changedTiddlers[this.tiddlerTitle]) {
      this.refreshSelf();
      return true;
    } else {
      return this.refreshChildren(changedTiddlers);
    }
  };

  exports.ast = AstWidget;
})();
