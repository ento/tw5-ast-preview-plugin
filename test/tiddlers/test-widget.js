/*\
title: test-wikitext.js
type: application/javascript
tags: [[$:/tags/test-spec]]

Tests the ast-widget end-to-end.
\*/

(function(){
  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  /* helper functions taken from TiddlyWiki5/editions/test/tiddlers/tests/test-widget.js */
  var widget = require("$:/core/modules/widgets/widget.js");
  function createWidgetNode(parseTreeNode,wiki) {
    return new widget.widget(parseTreeNode,{
      wiki: wiki,
      document: $tw.fakeDocument
    });
  }

  function parseText(text, wiki, options) {
    var parser = wiki.parseText("text/vnd.tiddlywiki", text, options);
    return parser ? {type: "widget", children: parser.tree} : undefined;
  }

  function renderWidgetNode(widgetNode) {
    $tw.fakeDocument.setSequenceNumber(0);
    var wrapper = $tw.fakeDocument.createElement("div");
    widgetNode.render(wrapper, null);
    return wrapper;
  }

  function refreshWidgetNode(widgetNode,wrapper,changes) {
    var changedTiddlers = {};
    if(changes) {
      $tw.utils.each(changes,function(title) {
        changedTiddlers[title] = true;
      });
    }
    widgetNode.refresh(changedTiddlers,wrapper,null);
  }

  describe("AST view", function() {
    it("should render a simple wikitext tiddler", function() {
      var wiki = new $tw.Wiki();
      wiki.addTiddler({title: "H1", text: "! heading", type: "text/vnd.tiddlywiki"});
      var text = "<$ast tiddler=H1/>";
      var widgetNode = createWidgetNode(parseText(text, wiki, {parseAsInline: true}), wiki);
      var wrapper = renderWidgetNode(widgetNode);
      expect(wrapper.sequenceNumber).toBe(0);
      var root = wrapper.children[0].children[0];
      expect(root.tag).toBe("details");
      expect(root.sequenceNumber).toBe(2);
      expect(root.children[0].tag).toBe("summary");
      expect(root.children[0].sequenceNumber).toBe(3);
      expect(root.children[0].children[0].textContent).toBe("element");
      expect(root.children[0].children[1].textContent).toBe("h1");
      expect(root.children[1].tag).toBe("ul");
      expect(root.children[1].sequenceNumber).toBe(8);
      expect(root.children[1].children[0].tag).toBe("li");
      expect(root.children[1].children[0].sequenceNumber).toBe(9);
      expect(root.children[1].children[1].tag).toBe("li");
      expect(root.children[1].children[1].sequenceNumber).toBe(37);
      expect(root.children[1].children[2].tag).toBe("li");
      expect(root.children[1].children[2].sequenceNumber).toBe(69);
      expect(root.children[1].children[2].textContent).toBe('tag:"h1"');
      expect(root.children[1].children[3].tag).toBe("li");
      expect(root.children[1].children[3].sequenceNumber).toBe(77);
      expect(root.children[1].children[3].textContent).toBe('type:"element"');
    });

    it("renders inner content if tiddler is not found", function() {
      var wiki = new $tw.Wiki();
      var text = "<$ast tiddler=H1>not found</$ast>";
      var widgetNode = createWidgetNode(parseText(text, wiki, {parseAsInline: true}), wiki);
      var wrapper = renderWidgetNode(widgetNode);
      expect(wrapper.sequenceNumber).toBe(0);
      expect(wrapper.outerHTML).toBe("<div>not found</div>");
    });

    it("should refresh only what's needed", function() {
      var wiki = new $tw.Wiki();
      wiki.addTiddler({title: "H1", text: "! heading", type: "text/vnd.tiddlywiki"});
      var text = "<$ast tiddler=H1/>";
      var widgetNode = createWidgetNode(parseText(text, wiki, {parseAsInline: true}), wiki);
      var wrapper = renderWidgetNode(widgetNode);
      expect(wrapper.sequenceNumber).toBe(0);
      var root = wrapper.children[0].children[0];
      expect(root.tag).toBe("details");
      expect(root.sequenceNumber).toBe(2);
      expect(root.children[0].tag).toBe("summary");
      expect(root.children[0].sequenceNumber).toBe(3);
      expect(root.children[0].children[0].textContent).toBe("element");
      expect(root.children[0].children[1].textContent).toBe("h1");
      expect(root.children[1].tag).toBe("ul");
      expect(root.children[1].sequenceNumber).toBe(8);
      expect(root.children[1].children[0].tag).toBe("li");
      expect(root.children[1].children[0].sequenceNumber).toBe(9);
      expect(root.children[1].children[0].textContent).toBe('attributesclasstype:"string"value:""');
      expect(root.children[1].children[1].tag).toBe("li");
      expect(root.children[1].children[1].sequenceNumber).toBe(37);
      expect(root.children[1].children[2].tag).toBe("li");
      expect(root.children[1].children[2].sequenceNumber).toBe(69);
      expect(root.children[1].children[2].textContent).toBe('tag:"h1"');
      expect(root.children[1].children[3].tag).toBe("li");
      expect(root.children[1].children[3].sequenceNumber).toBe(77);
      expect(root.children[1].children[3].textContent).toBe('type:"element"');
      wiki.addTiddler({title: "H1", text: "!.my-heading heading"});
      refreshWidgetNode(widgetNode, wrapper, ["H1"]);
      var baseSequence = 0;
      root = wrapper.children[0].children[0];
      expect(wrapper.sequenceNumber).toBe(0);
      expect(root.tag).toBe("details");
      expect(root.sequenceNumber).toBe(baseSequence + 2);
      expect(root.children[0].tag).toBe("summary");
      expect(root.children[0].sequenceNumber).toBe(baseSequence + 3);
      expect(root.children[0].children[0].textContent).toBe("element");
      expect(root.children[0].children[1].textContent).toBe("h1");
      expect(root.children[1].tag).toBe("ul");
      expect(root.children[1].sequenceNumber).toBe(baseSequence + 8);
      expect(root.children[1].children[0].tag).toBe("li");
      expect(root.children[1].children[0].sequenceNumber).toBe(baseSequence + 9);
      expect(root.children[1].children[0].textContent).toBe('attributesclasstype:"string"value:"my-heading"');
      expect(root.children[1].children[1].tag).toBe("li");
      expect(root.children[1].children[1].sequenceNumber).toBe(baseSequence + 37);
      expect(root.children[1].children[2].tag).toBe("li");
      expect(root.children[1].children[2].sequenceNumber).toBe(baseSequence + 69);
      expect(root.children[1].children[2].textContent).toBe('tag:"h1"');
      expect(root.children[1].children[3].tag).toBe("li");
      expect(root.children[1].children[3].sequenceNumber).toBe(baseSequence + 77);
      expect(root.children[1].children[3].textContent).toBe('type:"element"');
    });
  });
})();
