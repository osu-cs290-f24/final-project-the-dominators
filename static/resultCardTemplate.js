(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['resultCard'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"result-card\">\r\n    <h3>"
    + alias4(((helper = (helper = lookupProperty(helpers,"prompt") || (depth0 != null ? lookupProperty(depth0,"prompt") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prompt","hash":{},"data":data,"loc":{"start":{"line":2,"column":8},"end":{"line":2,"column":18}}}) : helper)))
    + "</h3>\r\n    <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"imgURL") || (depth0 != null ? lookupProperty(depth0,"imgURL") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imgURL","hash":{},"data":data,"loc":{"start":{"line":3,"column":14},"end":{"line":3,"column":24}}}) : helper)))
    + "\">\r\n</div>";
},"useData":true});
})();