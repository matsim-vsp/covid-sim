(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["risk-calcs"],{"07ac":function(e,t,s){var a=s("23e7"),i=s("6f53").values;a({target:"Object",stat:!0},{values:function(e){return i(e)}})},"24df":function(e,t,s){},"2e61":function(e,t,s){"use strict";var a=s("3521"),i=s.n(a);i.a},3521:function(e,t,s){},"3d5a":function(e,t,s){"use strict";s.r(t);var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{attrs:{id:"home"}},[e._m(0),e.yaml.multipliers?s("div",{staticClass:"center-area"},[s("h2",[e._v(e._s(e.$t("risk-calculator")))]),s("h5",{style:{marginBottom:"1rem",color:"#596"}},[e._v(e._s(e.$t("released"))+" "+e._s(this.calcId))]),e.badPage?s("h3",{staticClass:"badpage"},[e._v(e._s(e.$t("badpage")))]):s("div",{staticClass:"goodpage"},[e.yaml.description?s("p",[e._v(e._s(e.yaml.description))]):e._e(),s("h3",[s("b",[e._v(e._s(e.$t("explore-scenarios"))+":")])]),s("div",{staticClass:"measures"},e._l(Object.keys(e.yaml.scenarios),(function(t){return s("div",{key:t,staticClass:"measure"},[s("button",{staticClass:"button is-danger is-outlined is-small",on:{click:function(s){return e.handleScenario(t)}}},[e._v(e._s(t))])])})),0),s("p",[e._v(e._s(e.selectedScenario?e.selectedScenario.description:e.$t("try-combos")))])])]):e._e(),s("h3",{staticClass:"center-area sticky"},[s("b",[e._v(e._s(e.$t("estimated-risk"))+": "),s("span",{staticClass:"greenbig",style:{fontSize:"2.5rem",fontWeight:"bold",color:"#596"}},[e._v(e._s(e.adjustedR.toFixed(1))+"%")])])]),e.yaml.multipliers?s("div",{staticClass:"center-area"},[s("div",{staticClass:"option-groups"},[e._l(e.multipliers,(function(t){return s("div",{key:"add+"+t,staticClass:"option-group"},[s("h4",[e._v(e._s(t))]),s("div",{staticClass:"description"},[e._v(e._s(e.yaml.multipliers[t].description))]),s("vue-slider",{staticClass:"slider",attrs:{data:e.lookup[t],"data-value":"value","data-label":"title",tooltip:"none",adsorb:!0,dotSize:20},on:{change:function(s){return e.handleFactorButton(t)}},model:{value:e.sliders[t],callback:function(s){e.$set(e.sliders,t,s)},expression:"sliders[group]"}}),s("p",{staticClass:"slider-label"},[e._v(e._s(e.sliders[t].title))])],1)})),e._l(e.divisors,(function(t){return s("div",{key:t,staticClass:"option-group"},[s("h4",[e._v(e._s(t))]),s("div",{staticClass:"description"},[e._v(e._s(e.yaml.divisors[t].description))]),s("vue-slider",{staticClass:"slider",attrs:{data:e.lookup[t],"data-value":"value","data-label":"title",tooltip:"none",adsorb:!0,dotSize:20},on:{change:function(s){return e.handleDivFactorButton(t)}},model:{value:e.sliders[t],callback:function(s){e.$set(e.sliders,t,s)},expression:"sliders[group]"}}),s("p",{staticClass:"slider-label"},[e._v(e._s(e.sliders[t].title))])],1)})),s("br"),e.yaml.notes?s("h3",[s("b",[e._v(e._s(e.$t("remarks"))+":")])]):e._e(),e.yaml.notes?s("ul",e._l(e.yaml.notes,(function(t){return s("li",{staticClass:"notes-item",domProps:{innerHTML:e._s(e.parseMarkdown(t))}})})),0):e._e()],2)]):e._e()])},i=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"banner"},[s("h2",[e._v("VSP / Technische Universität Berlin")]),s("h3",[e._v("COVID-19 Analysis Portal")])])}],r=(s("99af"),s("7db0"),s("c975"),s("b64b"),s("d3b7"),s("07ac"),s("ac1f"),s("5319"),s("54f8")),n=(s("96cf"),s("c964")),o=s("276c"),l=s("e954"),c=s("920b"),u=s("92a6"),d=s("9ab4"),h=s("60a3"),p=s("8f3c"),v=s.n(p),f=s("d4cd"),m=s.n(f),b=s("4971"),k=s.n(b),y=(s("24df"),s("10a0")),g=function(e){Object(c["a"])(s,e);var t=Object(u["a"])(s);function s(){var e;return Object(o["a"])(this,s),e=t.apply(this,arguments),e.calcId="",e.yaml={description:"",calibrationParam:.075,multipliers:{},divisors:{},scenarios:{},notes:[]},e.badPage=!1,e.markdownParser=new m.a,e.sliders={},e.selectedScenario="",e.finalR=0,e.adjustedR=0,e.lookup={},e.factors={},e.divFactors={},e}return Object(l["a"])(s,[{key:"routeChanged",value:function(e,t){this.buildPageForURL()}},{key:"mounted",value:function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:this.buildPageForURL();case 1:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"parseMarkdown",value:function(e){return this.markdownParser.render(e)}},{key:"buildPageForURL",value:function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(){var t,s,a,i,r,n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return this.badPage=!1,this.calcId=this.$route.params.rcalc,t=this.$i18n.locale,s=y["d"]+"risk-calculator/".concat(this.calcId,".").concat(t,".yaml"),a="",e.prev=5,e.next=8,fetch(s);case 8:return i=e.sent,e.next=11,i.text();case 11:a=e.sent,e.next=17;break;case 14:e.prev=14,e.t0=e["catch"](5),console.error(e.t0);case 17:if(a||!(s.indexOf(".de.")>-1)){e.next=33;break}return console.warn("no",s,"falling back to .en."),r=s.replace(".de.",".en."),console.log(r),e.prev=21,e.next=24,fetch(r);case 24:return n=e.sent,e.next=27,n.text();case 27:a=e.sent,e.next=33;break;case 30:e.prev=30,e.t1=e["catch"](21),console.error(e.t1);case 33:if(a){e.next=36;break}return this.badPage=!0,e.abrupt("return");case 36:this.yaml=v.a.parse(a),this.buildUI(),this.updateR();case 39:case"end":return e.stop()}}),e,this,[[5,14],[21,30]])})));function t(){return e.apply(this,arguments)}return t}()},{key:"handleDivFactorButton",value:function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(t){var s;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:s=this.sliders[t],this.divFactors[t]=s.value,this.updateR(),this.$forceUpdate();case 4:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"handleFactorButton",value:function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(t){var s;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:s=this.sliders[t],this.factors[t]=s.value,this.updateR(),this.$forceUpdate();case 4:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"handleScenario",value:function(){var e=Object(n["a"])(regeneratorRuntime.mark((function e(t){var s,a,i,n=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:for(this.selectedScenario=this.yaml.scenarios[t],s=function(){var e=i[a],t=n.selectedScenario.presets[e],s=n.lookup[e].find((function(e){return e.title===t})).value;console.log(e,t,s),n.multipliers.indexOf(e)>-1&&(n.factors[e]=s),n.divisors.indexOf(e)>-1&&(n.divFactors[e]=s);var o,l=Object(r["a"])(n.lookup[e]);try{for(l.s();!(o=l.n()).done;){var c=o.value;if(c.title===t){n.sliders[e]=c;break}}}catch(u){l.e(u)}finally{l.f()}},a=0,i=Object.keys(this.selectedScenario.presets);a<i.length;a++)s();this.updateR(),this.$forceUpdate();case 5:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"updateR",value:function(){for(var e=this.yaml.calibrationParam,t=0,s=Object.values(this.factors);t<s.length;t++){var a=s[t];e*=a}for(var i=0,r=Object.values(this.divFactors);i<r.length;i++){var n=r[i];e*=n}e=1-Math.exp(-1*e),this.finalR=Math.min(99,100*e),this.animateTowardNewRValue()}},{key:"animateTowardNewRValue",value:function(){var e=this.finalR-this.adjustedR,t=this.adjustedR+.2*e;this.adjustedR=t,Math.abs(this.adjustedR-this.finalR)<.01?this.adjustedR=this.finalR:setTimeout(this.animateTowardNewRValue,16)}},{key:"buildUI",value:function(){for(var e=0,t=Object.keys(this.yaml.multipliers);e<t.length;e++){var s=t[e],a=this.yaml.multipliers[s];this.lookup[s]=[];var i,n=Object(r["a"])(a.options);try{for(n.s();!(i=n.n()).done;){var o=i.value,l=Object.keys(o)[0],c=o[l];if(isNaN(c)){var u=parseFloat(c.substring(0,c.length-1)),d={title:l,value:u};this.lookup[s].push(d),this.sliders[s]=d,this.factors[s]=u}else this.lookup[s].push({title:l,value:c}),void 0===this.yaml.multipliers[s].options&&(this.factors[s]=c,this.sliders[s]=this.lookup[s][0])}}catch(j){n.e(j)}finally{n.f()}}for(var h=0,p=Object.keys(this.yaml.divisors);h<p.length;h++){var v=p[h],f=this.yaml.divisors[v];this.lookup[v]=[];var m,b=Object(r["a"])(f.options);try{for(b.s();!(m=b.n()).done;){var k=m.value,y=Object.keys(k)[0],g=k[y];if(isNaN(g)){var _=1/parseFloat(g.substring(0,g.length-1)),R={title:y,value:_};this.lookup[v].push(R),this.sliders[v]=R,this.divFactors[v]=_}else this.lookup[v].push({title:y,value:1/g}),void 0===this.yaml.divisors[v].options&&(this.divFactors[v]=g,this.sliders[v]=this.lookup[v][0])}}catch(j){b.e(j)}finally{b.f()}}}},{key:"multipliers",get:function(){return Object.keys(this.yaml.multipliers)}},{key:"divisors",get:function(){return Object.keys(this.yaml.divisors)}}]),s}(h["c"]);Object(d["b"])([Object(h["d"])("$route")],g.prototype,"routeChanged",null),g=Object(d["b"])([Object(h["a"])({components:{VueSlider:k.a},props:{}})],g);var _=g,R=_,j=(s("2e61"),s("2877")),w=s("de51"),O=Object(j["a"])(R,a,i,!1,null,"396cd913",null);"function"===typeof w["default"]&&Object(w["default"])(O);t["default"]=O.exports},"59f9":function(e,t){e.exports=function(e){e.options.__i18n=e.options.__i18n||[],e.options.__i18n.push('{"en":{"risk-calculator":"Personal Risk Calculator","badpage":"That page not found, sorry!","released":"Released","estimated-risk":"Estimated Infection Risk","explore-scenarios":"Explore typical scenarios","try-combos":"...or try different combinations below.","remarks":"Remarks"},"de":{"risk-calculator":"Personalrisiko Rechner","badpage":"Seite wurde nicht gefunden.","released":"Veröffentlicht","explore-scenarios":"Typische Szenarien erforschen","try-combos":"...oder versuchen Sie verschiedene Kombinationen unten.","estimated-risk":"Geschätztes Infektionsrisiko","remarks":"Bemerkungen"}}'),delete e.options._Ctor}},"7db0":function(e,t,s){"use strict";var a=s("23e7"),i=s("b727").find,r=s("44d2"),n=s("ae40"),o="find",l=!0,c=n(o);o in[]&&Array(1)[o]((function(){l=!1})),a({target:"Array",proto:!0,forced:l||!c},{find:function(e){return i(this,e,arguments.length>1?arguments[1]:void 0)}}),r(o)},de51:function(e,t,s){"use strict";var a=s("59f9"),i=s.n(a);t["default"]=i.a}}]);