import{P as l}from"./papaparse.min-pxEmrU2H.js";import{V as f}from"./VuePlotly-Bg4odOYM.js";import{Z as v}from"./zip-loader.module-BRLILkva.js";import{h as y}from"./moment-C5S46NFB.js";import{d as u,n as d,M as b,P as _}from"./index-BSPVUhcA.js";import{H as C,R as S}from"./RValuePlot-BbmOXvkS.js";const k=u({name:"SelectWidget",components:{},props:{state:{type:Object,required:!0},measure:{type:String,required:!0}},data(){return{value:0,stops:[0,1e3],showButtons:!1,interventions:{remainingFractionLeisure1:"Leisure activities",remainingFractionWork:"Work activities",remainingFractionLeisure2:"Leisure activities",remainingFractionShoppingBusinessErrands:"All other activities",remainingFractionKiga:"Going to kindergarten",remainingFractionPrima:"Going to primary school",remainingFractionSecon:"Going to secondary/univ."}}},mounted(){this.updateOptions()},computed:{measureTitle(){return this.interventions[this.measure]}},watch:{value(){let s=this.value.substring(0,this.value.length-1);s=parseFloat(s)/100,this.$emit("changed",this.measure,s)}},methods:{choseButton(s){console.log(s),this.value=s},updateOptions(){const s=[];for(const t of this.state.measures[this.measure]){let e=""+t*100+"%";this.value=e,this.showButtons=!0,s.push(e)}this.stops=s}}});var w=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{staticClass:"slector-widget"},[t.showButtons?e("div",{staticClass:"button-choices"},t._l(t.stops,function(i){return e("button",{key:i,staticClass:"button is-small",class:{"is-link":i===t.value},on:{click:function(a){return t.choseButton(i)}}},[t._v(t._s(i))])}),0):t._e(),e("p",[t._v(t._s(t.measureTitle))])])},I=[],P=d(k,w,I,!1,null,"d61ccc49");const B=P.exports,x=u({name:"ChartSelector",components:{HospitalizationPlot:C,MySlider:B,RValuePlot:S,VuePlotly:f},props:{state:{type:Object,required:!0},city:{type:String,required:!0}},data:()=>({dayZero:{berlin:"2020-02-20",munich:"2020-02-20",heinsberg:"2020-02-15"},MAX_DAYS:200,plusminus:"0",logScale:!0,isBase:!1,currentRun:{},data:[],currentSituation:{},loadedSeriesData:{},zipLoader:{},zipCache:{},labels:{nSusceptible:"Susceptible",nInfectedButNotContagious:"Infected, not contagious",nContagious:"Contagious",nShowingSymptoms:"Showing Symptoms",nSeriouslySick:"Seriously Sick",nCritical:"Critical",nTotalInfected:"Total Infected",nInfectedCumulative:"Infected Cumulative",nRecovered:"Recovered",nInQuarantine:"In Quarantine"},layout:{autosize:!0,showlegend:!0,legend:{orientation:"h"},font:{family:"Roboto,Arial,Helvetica,sans-serif",size:12,color:"#000"},margin:{t:5,r:10,b:0,l:60},xaxis:{range:["2020-02-09","2020-08-31"],type:"date"},yaxis:{type:"log",autorange:!0,title:"Population (log scale)"},plot_bgcolor:"#f8f8f8",paper_bgcolor:"#f8f8f8"},options:{displaylogo:!1,responsive:!0,modeBarButtonsToRemove:["pan2d","zoom2d","select2d","lasso2d","zoomIn2d","zoomOut2d","autoScale2d","hoverClosestCartesian","hoverCompareCartesian","resetScale2d","toggleSpikelines","resetViewMapbox"],toImageButtonOptions:{format:"svg",filename:"custom_image",width:800,height:600,scale:1}},fillcolors:{Susceptible:"#0000ff","Seriously Sick":"#cc2211","Showing Symptoms":"#00ffff","Infected Cumulative":"#f791cf","Infected, not contagious":"#ee8800",Critical:"#882299",Recovered:"#eedd44",Contagious:"#00aa00","Total Infected":"#a65628"}}),mounted(){this.loadZipData()},computed:{cityCap(){return this.city.slice(0,1).toUpperCase()+this.city.slice(1)},prettyInfected(){if(!this.state.cumulativeInfected)return"";const s=100*Math.round(this.state.cumulativeInfected*.01);return Number(s).toLocaleString()}},watch:{city(){this.city!=="berlin"&&parseInt(this.plusminus)>0&&(this.plusminus="0"),this.loadedSeriesData={},this.loadZipData()},plusminus(){this.showPlotForCurrentSituation()},logScale(){this.layout.yaxis.type=this.logScale?"log":"linear",this.layout={...this.layout}}},methods:{setBase(s){this.isBase=s,this.showPlotForCurrentSituation()},setPlusMinus(s){this.plusminus=s},async loadZipData(){if(console.log("loadZipData:",this.city),this.zipCache[this.city])console.log("using cached zip for!",this.city),this.zipLoader=this.zipCache[this.city];else{const s=this.state.publicPath+"v7-data-"+this.city+".zip";console.log("---loading",s),this.zipLoader=new v(s),await this.zipLoader.load(),console.log("zip loaded!")}this.zipCache[this.city]=this.zipLoader,this.runChanged(),console.log({measure:this.state.measures})},async runChanged(){if(this.loadedSeriesData[this.currentRun.RunId]){this.data=this.loadedSeriesData[this.currentRun.RunId],this.updateTotalInfected();return}const s=await this.loadCSV(this.currentRun),t=this.generateSeriesFromCSVData(s);this.loadedSeriesData[this.currentRun.RunId]=t,this.data=t,this.updateTotalInfected()},updateTotalInfected(){const s=this.data.filter(t=>t.name==="Infected Cumulative")[0];this.state.cumulativeInfected=Math.max(...s.y)},sliderChanged(s,t){console.log(s,t),this.currentSituation[s]=t,this.showPlotForCurrentSituation()},showPlotForCurrentSituation(){if(this.isBase){this.currentRun={RunId:"sz0"},this.runChanged();return}let s="";for(const i of Object.keys(this.state.measures))s+=this.currentSituation[i]+"-";const t=this.plusminus,e=s.replace("undefined",t);console.log(e),this.currentRun=this.state.runLookup[e],this.currentRun&&this.runChanged()},unpack(s,t){let e=s.map(function(i){return i[t]});return e=e.slice(0,this.MAX_DAYS),e.length<this.MAX_DAYS&&e.push(t==="day"?this.MAX_DAYS:e[e.length-1]),e},async loadCSV(s){if(!s.RunId)return[];const t=s.RunId+".infections.csv";console.log("Extracting",t);let e=this.zipLoader.extractAsText(t);return l.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data},calculateDatefromSimulationDay(s){const t=parseInt(this.plusminus);return y(this.dayZero[this.city]).subtract(t,"days").add(s,"days").format("YYYY-MM-DD")},generateSeriesFromCSVData(s){const t=[],i=this.unpack(s,"day").map(a=>this.calculateDatefromSimulationDay(a));for(const a of Object.keys(this.labels)){const o=this.labels[a];if(o==="In Quarantine")continue;const n=this.unpack(s,a);t.push({x:i,y:n,name:o})}return t.push(this.state.berlinCases),t}}});var R=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{staticClass:"charts-selector"},[t._m(0),e("div",{attrs:{id:"main-section"}},[e("div",{staticClass:"pieces"},[e("div",{staticClass:"sliders"},[e("div",{staticClass:"button-choices buttons has-addons"},[e("button",{key:"do-something",staticClass:"button is-small",class:{"is-link":!t.isBase,"is-selected":!t.isBase},on:{click:function(i){return t.setBase(!1)}}},[t._v("Alternatives")]),e("button",{key:"base",staticClass:"button is-small",class:{"is-link":t.isBase,"is-selected":t.isBase},on:{click:function(i){return t.setBase(!0)}}},[t._v("What would have happened w/o restrictions")])]),e("div",{staticClass:"selection-widgets",class:{"totally-disabled":t.isBase}},[t.city==="heinsberg"?e("div",{staticClass:"heinsberg"},[e("div",{staticClass:"g1"},[t._m(1),e("p",{staticClass:"subhead"},[t._v("Percent still occurring (%)")]),t._l(["remainingFractionWork","remainingFractionLeisure1","remainingFractionShoppingBusinessErrands"],function(i){return Object.keys(t.state.measures).length?e("div",{key:"h"+i,staticClass:"myslider"},[e("my-slider",{attrs:{measure:i,state:t.state},on:{changed:t.sliderChanged}})],1):t._e()})],2),e("div",{staticClass:"g1"},[t._m(2),e("p",{staticClass:"subhead"},[t._v("Students returning (%):")]),t._l(["remainingFractionKiga","remainingFractionPrima","remainingFractionSecon"],function(i){return Object.keys(t.state.measures).length?e("div",{key:"h"+i,staticClass:"myslider"},[e("my-slider",{attrs:{measure:i,state:t.state},on:{changed:t.sliderChanged}})],1):t._e()})],2)]):e("div",{staticClass:"berlin-munich"},[e("div",{staticClass:"g1"},[t._m(3),e("p",{staticClass:"subhead"},[t._v("Percent still occurring (%)")]),t._l(["remainingFractionLeisure1"],function(i){return Object.keys(t.state.measures).length?e("div",{key:i,staticClass:"myslider"},[e("my-slider",{attrs:{measure:i,state:t.state},on:{changed:t.sliderChanged}})],1):t._e()})],2),e("div",{staticClass:"g1"},[t._m(4),e("p",{staticClass:"subhead"},[t._v("By type and percent (%)")]),t._l(["remainingFractionWork","remainingFractionLeisure2","remainingFractionShoppingBusinessErrands"],function(i){return Object.keys(t.state.measures).length?e("div",{key:i,staticClass:"myslider"},[e("my-slider",{attrs:{measure:i,state:t.state},on:{changed:t.sliderChanged}})],1):t._e()})],2),e("div",{staticClass:"g1"},[t._m(5),e("p",{staticClass:"subhead"},[t._v("Students returning (%):")]),t._l(["remainingFractionKiga","remainingFractionPrima","remainingFractionSecon"],function(i){return Object.keys(t.state.measures).length?e("div",{key:i,staticClass:"myslider"},[e("my-slider",{attrs:{measure:i,state:t.state},on:{changed:t.sliderChanged}})],1):t._e()})],2)])]),e("h5",{staticClass:"cumulative"},[t._v("Cumulative Infected by September 2020")]),e("p",{staticClass:"infected"},[t._v(t._s(t.prettyInfected))])]),e("div",{staticClass:"all-plots"},[e("div",{staticClass:"plot-options"},[e("div",{staticClass:"scale-options"},[e("b",[t._v("Scale")]),e("div",{staticClass:"variation-choices buttons has-addons"},[e("button",{staticClass:"button is-small",class:{"is-link":!t.logScale,"is-selected":!t.logScale},on:{click:function(i){t.logScale=!t.logScale}}},[t._v("Linear")]),e("button",{staticClass:"button is-small",class:{"is-link":t.logScale,"is-selected":t.logScale},on:{click:function(i){t.logScale=!t.logScale}}},[t._v("Log")])])]),e("div",{staticClass:"variation"},[e("b",[t._v("Shift Start Date")]),e("div",{staticClass:"variation-choices buttons has-addons"},[t.city!=="munich"?e("button",{staticClass:"button is-small",class:{"is-link":t.plusminus==="6","is-selected":t.plusminus==="6"},on:{click:function(i){return t.setPlusMinus("6")}}},[t._v("-6")]):t._e(),t.city!=="munich"?e("button",{staticClass:"button is-small",class:{"is-link":t.plusminus==="3","is-selected":t.plusminus==="3"},on:{click:function(i){return t.setPlusMinus("3")}}},[t._v("-3")]):t._e(),e("button",{staticClass:"button is-small",class:{"is-link":t.plusminus==="0","is-selected":t.plusminus==="0"},on:{click:function(i){return t.setPlusMinus("0")}}},[t._v("+0")]),e("button",{staticClass:"button is-small",class:{"is-link":t.plusminus==="-3","is-selected":t.plusminus==="-3"},on:{click:function(i){return t.setPlusMinus("-3")}}},[t._v("+3")]),e("button",{staticClass:"button is-small",class:{"is-link":t.plusminus==="-6","is-selected":t.plusminus==="-6"},on:{click:function(i){return t.setPlusMinus("-6")}}},[t._v("+6")])])])]),e("div",{staticClass:"linear-plot"},[e("h5",[t._v(t._s(t.cityCap)+" Simulated Health Outcomes Over Time")]),e("p",[t._v(t._s(this.logScale?"Log scale":"Linear scale"))]),e("vue-plotly",{staticClass:"plotsize",attrs:{data:t.data,layout:t.layout,options:t.options}})],1),t.city==="berlin"?e("div",{staticClass:"linear-plot"},[e("h5",[t._v(t._s(t.cityCap)+" Hospitalization Rate Comparison")]),e("p",[t._v(t._s(this.logScale?"Log scale":"Linear scale"))]),e("hospitalization-plot",{staticClass:"plotsize compact",attrs:{data:t.data,logScale:t.logScale,city:t.city,endDate:"2020-08-31"}})],1):t._e(),e("div",{staticClass:"linear-plot"},[e("h5",[t._v(t._s(t.cityCap)+" Estimated Multipliers")]),e("p",[t._v("Based on four-day new infections")]),e("r-value-plot",{staticClass:"plotsize compact",attrs:{data:t.data,logScale:!1,endDate:"2020-08-31"}})],1)])])])])},L=[function(){var s=this,t=s._self._c;return s._self._setupProxy,t("div",{staticClass:"preamble"},[t("h3",{staticClass:"select-scenario"},[s._v("Select Scenario:")])])},function(){var s=this,t=s._self._c;return s._self._setupProxy,t("h6",{staticClass:"title"},[s._v("February 26:"),t("br"),s._v("Activities limited")])},function(){var s=this,t=s._self._c;return s._self._setupProxy,t("h6",{staticClass:"title"},[s._v("April 20:"),t("br"),s._v("Reopening of educational facilities")])},function(){var s=this,t=s._self._c;return s._self._setupProxy,t("h6",{staticClass:"title"},[s._v("March 14:"),t("br"),s._v("Leisure activities limited")])},function(){var s=this,t=s._self._c;return s._self._setupProxy,t("h6",{staticClass:"title"},[s._v("March 23:"),t("br"),s._v("Out-of-home activities limited")])},function(){var s=this,t=s._self._c;return s._self._setupProxy,t("h6",{staticClass:"title"},[s._v("April 20:"),t("br"),s._v("Reopening of educational facilities")])}],F=d(x,R,L,!1,null,"3311e5bf");const M=F.exports,m=`## v7: Re-opening Scenarios

_Published 22 April 2020_

Here we depict the effects of reopening society at various levels for work, school, leisure and other activities.

- Simulations are for **Berlin**, **Munich**, and **Heinsberg** regions (each city plus some surroundings).
- Real-world infections are from [Robert Koch Institute (RKI)](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0). For many cases, a delay between infection and reporting may occur.
- For Berlin and Munich, the following activity restrictions are included:
  - After **March 13**, 10% of leisure acts are banned (corresponding to the closure of theaters, etc.). Also, schools / kindergarten / universities are closed. 10 percent of kita and primary-aged children still go to kita / primary schools (Notbetrieb).
  - On **March 23**, work, shopping, errands and business are reduced, corresponding to the currently valid "Kontaktsperre"; the percentage of work, leisure, shopping, errands and business activities still occuring after **March 23** can be set.
  - Educational facilities can be reopened on **April 20**.

{{PLOTS}}

[Google COVID-19 Mobility report](https://google.com/covid19/mobility) shows for Berlin after March 23:

- retail & recreation down by about 70% (i.e. at about **30%**)
- grocery & pharmacy down by about 20% (i.e. at about **80%**)
- parks down by about 20% (i.e. at about **80%**)
- workplace down by about 40% (i.e. at about **60%**)
  Other than google, we do not take the last day, but take visual averages over about a week.

The best approximation to this with our options below would be:

- **leisure** at **20%** (with the assumption that parks do not contribute that much to infections)
- **work** at **60%**
- **shopping** at **40%**
- **errands & business** at **40%**

If one assumes that the capacity of the Berlin system for critical COVID cases is about 1000, then one finds that there is scant little room to relax restrictions.

Or alternatively: The currently "blunt" restrictions would need to be replaced by something smarter.

What has changed comparing to v6/v5?

- Age-dependent disease progression model
- we now only display results for people living in the corresponding city. Before, results included people travelling to/from the corresponding city.
`,O=`## v7: Re-opening Scenarios

_Published 22 April 2020_

Here we depict the effects of reopening society at various levels for work, school, leisure and other activities.

- Simulations are for **Berlin**, **Munich**, and **Heinsberg** regions (each city plus some surroundings).
- Real-world infections are from [Robert Koch Institute (RKI)](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0). For many cases, a delay between infection and reporting may occur.
- For Heinsberg, the following activity restrictions are included:
  - On **February 26**, schools are closed and other activities restricted.
  - Educational facilities can be reopened on **April 20**.

{{PLOTS}}

[Google COVID-19 Mobility report](https://google.com/covid19/mobility) shows for Berlin after March 23:

- retail & recreation down by about 70% (i.e. at about **30%**)
- grocery & pharmacy down by about 20% (i.e. at about **80%**)
- parks down by about 20% (i.e. at about **80%**)
- workplace down by about 40% (i.e. at about **60%**)
  Other than google, we do not take the last day, but take visual averages over about a week.

The best approximation to this with our options below would be:

- **leisure** at **20%** (with the assumption that parks do not contribute that much to infections)
- **work** at **60%**
- **shopping** at **40%**
- **errands & business** at **40%**

If one assumes that the capacity of the Berlin system for critical COVID cases is about 1000, then one finds that there is scant little room to relax restrictions.

Or alternatively: The currently "blunt" restrictions would need to be replaced by something smarter.
`,h=new b({html:!0,linkify:!0,typographer:!0}),D=h.render(m),z=h.render(m),T=h.render(O),c=_+"original-data/Fallzahlen/RKI/",A=u({name:"V7",components:{SectionViewer:M},props:{},data(){return{state:{measures:{},runLookup:{},cumulativeInfected:0,berlinCases:{},publicPath:"/"},city:"",plusminus:"0",readme:{berlin:D,munich:z,heinsberg:T},plotTag:"{{PLOTS}}",capitalizeCity:{berlin:"Berlin",munich:"Munich",heinsberg:"Heinsberg"},cityCSV:{berlin:c+"berlin-cases.csv",munich:c+"munich-cases.csv",heinsberg:c+"heinsberg-cases.csv"}}},async mounted(){console.log({route:this.$route}),this.city=this.$route.params.city,await this.loadDataInBackground(this.city)},computed:{cities(){return["Berlin","Munich","Heinsberg"]},topNotes(){if(!this.city)return"";const s=this.readme[this.city];if(!s)return"";const t=s.indexOf(this.plotTag);return t<0?s:s.substring(0,t)},bottomNotes(){if(!this.city)return"";const s=this.readme[this.city];if(!s)return"";const t=s.indexOf(this.plotTag);return t<0?"":s.substring(t+this.plotTag.length)}},watch:{async $route(s,t){console.log(s);const e=s.params.city;await this.loadDataInBackground(e),this.city=e}},methods:{async loadDataInBackground(s){this.state.berlinCases=await this.prepareBerlinData(s);const t=this.state.publicPath+"v7-info-"+s+".txt",e=await this.loadCSVData(t);await this.generateScenarioMatrix(e)},async prepareBerlinData(s){const e=await(await fetch(this.cityCSV[s])).text(),i=l.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data;console.log({data:i});const a=[],o=[];let n=0;console.log("fetched city data:",i.length);for(const r of i){const g=r.year+"-"+r.month+"-"+r.day;a.push(g),n+=r.cases,o.push(n)}const p={name:this.capitalizeCity[s]+" Infections (RKI)",x:a,y:o,line:{dash:"dot",width:3,color:"rgb(0,200,150)"}};return console.log({berlinSeries:p}),p},async loadCSVData(s){console.log("fetching data");const e=await(await fetch(s)).text(),i=l.parse(e,{header:!0,dynamicTyping:!0});return console.log({parsed:i.data}),i.data},async generateScenarioMatrix(s){console.log("generating lookups");const t={},e={},i=["Config","Output","RunId","RunScript"];for(const a of Object.keys(s[0]))i.indexOf(a)>-1||(t[a]=new Set);for(const a of s){if(!a.RunId)continue;for(const n of Object.keys(t))(a[n]===0||a[n])&&t[n].add(a[n]);let o="";for(const n of Object.keys(t))o+=a[n]+"-";e[o]=a}for(const a of Object.keys(t))t[a]=Array.from(t[a].keys()).sort((o,n)=>o-n);console.log({measures:t,runLookup:e}),this.state.measures=t,this.state.runLookup=e}}});var $=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{staticClass:"v7app"},[e("div",{staticClass:"city-picker"},t._l(t.cities,function(i){return e("router-link",{key:i,staticClass:"which-city",class:{selected:i.toLowerCase()===t.city.toLowerCase()},attrs:{to:"/v7/"+i.toLowerCase()}},[e("h1",[t._v(t._s(i))])])}),1),e("div",{staticClass:"content"},[e("div",{staticClass:"readme",domProps:{innerHTML:t._s(t.topNotes)}})]),e("div",{staticClass:"view-section"},[t.city?e("section-viewer",{staticClass:"viewer",attrs:{state:t.state,city:t.city}}):t._e()],1),e("div",{staticClass:"content"},[t.bottomNotes?e("div",{staticClass:"bottom"},[e("h3",[t._v("Further Notes")]),e("div",{staticClass:"readme",domProps:{innerHTML:t._s(t.bottomNotes)}})]):t._e()])])},V=[],H=d(A,$,V,!1,null,"d30548ee");const W=H.exports;export{W as default};
//# sourceMappingURL=V7-DmWC6b6P.js.map