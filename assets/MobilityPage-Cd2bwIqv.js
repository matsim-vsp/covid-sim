import{M as d,d as h,a as c,P as r,n as u}from"./index-CmQEb_Gh.js";import{P as o}from"./papaparse.min-KgtAHxPT.js";import{Y as m}from"./index-D51KqIDj.js";import{M as y,a as p}from"./MobilityMap-EuHCjf5f.js";import"./VuePlotly-DtQuqQ5C.js";const g={messages:{en:{badpage:"That page not found, sorry!","mobility-trends":"Mobility Dashboard",remarks:"Remarks",type:"Select Type:",duration:"Duration",distance:"Travel Distances",proportion:"Proportion of Mobile Persons","duration-heading":"Amount of Time Spent Outside the Home","distance-heading":"Average distance traveled","proportion-heading":"Proportion of mobile persons","duration-heading-percent":"Percent Change in Duration of out of home Activities Compared to Pre-COVID-19",week:"Week",weekday:"Weekday",weekend:"Weekend","y-axis-one":"Zeit pro Tag [h]","y-axis-two":"Distanz pro Person [km/h]","y-axis-percent":"Prozent [%]"},de:{badpage:"Seite wurde nicht gefunden.","mobility-trends":"Mobility Dashboard",remarks:"Bemerkungen",type:"Art auswählen:",duration:"Dauer",distance:"Distanz",proportion:"Anteil mobiler Personen","duration-heading":"Zeit, die außerhalb des Hauses verbracht wurde","distance-heading":"Durchschnittlich zurückgelegte Distanz","proportion-heading":"Anteil mobiler Personen","duration-heading-percent":"Prozentuale Veränderung der Dauer außhäusiger Aktivitäten im Vergleich zu vor COVID-19",week:"Woche",weekday:"Wochentag",weekend:"Wochenende","y-axis-one":"Time per Day [h]","y-axis-two":"Distance per Person [km/h]","y-axis-percent":"Percent [%]"}}},k="https://svn.vsp.tu-berlin.de/repos/public-svn/matsim/scenarios/countries/de/episim/",l=new d({html:!0,linkify:!0,typographer:!0}),b=h({name:"MobilityPage",i18n:g,components:{Colophon:c,MobilityPlot:y,MobilityMap:p},props:{},data(){return{badPage:!1,bundeslaender:k+"mobilityData/bundeslaender",mobility:"/mobilityData_OverviewBL_",range:"/range_OverviewBL_",weekdays:"weekdays.csv",weekends:"weekends.csv",weekly:"weekly.csv",mobilityWeekdays:[],mobilityWeekends:[],mobilityWeekly:[],timelineyWeekdays:[],timelineWeekends:[],timelineWeekly:[],allBundeslaenderNew:[],yaml:{description:"",notes:[]},allData:[],loadPage:"Start Loading",minWeekMobility:1e4,maxWeekMobility:0,data:[],rangeData:[],dataLoadingFail:!1,formattedData:[],allBundeslaender:[],status:1,activity:"outOfHomeDuration",yAxisNAme:"Time per Day [h]",plotHeading:"Amount of Time Spent Outside the Home",bundeslandHoliday:{"Baden-Württemberg":"BW",Hessen:"HE",Berlin:"BE",Brandenburg:"BB",Sachsen:"SN",Bayern:"BY","Nordrhein-Westfalen":"NW",Hamburg:"HH","Mecklenburg-Vorpommern":"MV",Niedersachsen:"NI",Deutschland:"BUND",Bremen:"HB",Thüringen:"TH",Saarland:"SL","Sachsen-Anhalt":"ST","Rheinland-Pfalz":"RP","Schleswig-Holstein":"SH"}}},mounted(){this.buildPageForURL()},computed:{topDescription(){return this.yaml.description?l.render(this.yaml.description):""}},watch:{$route(){this.buildPageForURL()}},methods:{async buildUI(){this.openPage(window.location.href),this.mobilityWeekends=await this.loadLandkreisData(this.bundeslaender+this.mobility+this.weekends),this.mobilityWeekly=await this.loadLandkreisData(this.bundeslaender+this.mobility+this.weekly),this.mobilityWeekdays=await this.loadLandkreisData(this.bundeslaender+this.mobility+this.weekdays),this.timelineWeekends=await this.loadLandkreiseTimeline(this.bundeslaender+this.range+this.weekends),this.timelineyWeekdays=await this.loadLandkreiseTimeline(this.bundeslaender+this.range+this.weekdays),this.timelineWeekly=await this.loadLandkreiseTimeline(this.bundeslaender+this.range+this.weekly),this.loadAllLandkreise(),this.combineData(),this.loadPage="Loaded"},async loadLandkreisData(a){try{const e=await fetch(a).then(i=>i.text());return o.parse(e,{delimiter:";",header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data.map(i=>{const n=i.date.toString();return i.date=`${n.substring(0,4)}-${n.substring(4,6)}-${n.substring(6,8)}`,i})}catch(e){this.dataLoadingFail=!0,console.error(e)}return[]},async combineData(){for(var a=0;a<this.allBundeslaenderNew.length;a++)this.allData[this.allBundeslaenderNew[a]]=[],this.allData[this.allBundeslaenderNew[a]].week=[],this.allData[this.allBundeslaenderNew[a]].weekend=[],this.allData[this.allBundeslaenderNew[a]].weekday=[];for(var a=0;a<this.mobilityWeekends.length;a++){var e=this.mobilityWeekends[a].BundeslandID,t=this.mobilityWeekends[a].date,s=this.mobilityWeekends[a].outOfHomeDuration,i=this.timelineWeekends[a].dailyRangePerPerson,n=this.timelineWeekends[a].sharePersonLeavingHome;this.allData[e]!==void 0&&(this.allData[e].weekend[t]={outOfHomeDuration:s,percentageChangeComparedToBeforeCorona:this.mobilityWeekends[a].percentageChangeComparedToBeforeCorona,sharePersonLeavingHome:n,dailyRangePerPerson:i,endHomeActs:0})}for(var a=0;a<this.mobilityWeekdays.length;a++){var e=this.mobilityWeekdays[a].BundeslandID,t=this.mobilityWeekdays[a].date,i=this.timelineyWeekdays[a].dailyRangePerPerson,n=this.timelineyWeekdays[a].sharePersonLeavingHome,s=this.mobilityWeekdays[a].outOfHomeDuration;this.allData[e]!==void 0&&(this.allData[e].weekday[t]={outOfHomeDuration:this.mobilityWeekdays[a].outOfHomeDuration,percentageChangeComparedToBeforeCorona:this.mobilityWeekdays[a].percentageChangeComparedToBeforeCorona,sharePersonLeavingHome:n,dailyRangePerPerson:i,endHomeActs:0})}for(var a=0;a<this.mobilityWeekly.length;a++){var e=this.mobilityWeekly[a].BundeslandID,t=this.mobilityWeekly[a].date,i=this.timelineWeekly[a].dailyRangePerPerson,n=this.timelineWeekly[a].sharePersonLeavingHome,s=this.mobilityWeekly[a].outOfHomeDuration;typeof s=="string"&&(s=parseFloat(s.replace(",","."))),this.allData[e]!==void 0&&(this.allData[e].week[t]={outOfHomeDuration:s,percentageChangeComparedToBeforeCorona:this.mobilityWeekly[a].percentageChangeComparedToBeforeCorona,sharePersonLeavingHome:n,dailyRangePerPerson:i,endHomeActs:0})}},async openPage(a){var e=a.split("/"),t=e[e.length-1];t=="duration"?this.clickButton(1):t=="distance"?this.clickButton(2):t=="proportion-mobile-persons"?this.clickButton(3):t=="mobility"&&this.clickButton(1)},async clickButton(a){this.status=a,a==1?(this.activity="outOfHomeDuration",this.yAxisNAme="Time per Day [h]",this.plotHeading="Amount of Time Spent Outside the Home",window.history.pushState("duration","Title","/mobility/duration")):a==2?(this.activity="dailyRangePerPerson",this.yAxisNAme="Distance per Person [km]",this.plotHeading="Average distance traveled ",window.history.pushState("distance","Title","/mobility/distance")):a==3&&(this.activity="sharePersonLeavingHome",this.yAxisNAme="Percent [%]",this.plotHeading="Proportion of mobile persons",window.history.pushState("proportion-mobile-persons","Title","/mobility/proportion-mobile-persons"))},async loadAllLandkreise(){for(var a=0;a<402;a++){var e=this.mobilityWeekends[a].BundeslandID;this.allBundeslaenderNew.push(e)}this.allBundeslaenderNew.sort()},async loadLandkreiseTimeline(a){try{const e=await fetch(a).then(i=>i.text());return o.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data.map(i=>{const n=i.date.toString();return i.date=`20${n.substring(6,8)}-${n.substring(3,5)}-${n.substring(0,2)}`,i})}catch(e){this.dataLoadingFail=!0,console.error(e)}return[]},async loadRange(){const a=r+"mobilityData/bundeslaender/range_OverviewBL.csv";try{const e=await fetch(a).then(i=>i.text());return o.parse(e,{header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data.map(i=>{const n=i.date.toString();return i.date=`${n.substring(0,4)}-${n.substring(4,6)}-${n.substring(6,8)}`,i})}catch(e){this.dataLoadingFail=!0,console.error(e)}return[]},parseMarkdown(a){return l.render(a)},async buildPageForURL(){this.badPage=!1;const a=this.$i18n.locale,e=r+`mobilityData/bundeslaender/config.${a}.yaml`;let t="";try{t=await(await fetch(e)).text()}catch(s){console.error(s)}if(!t&&e.indexOf(".de.")>-1){console.warn("no",e,"falling back to .en.");const s=e.replace(".de.",".en.");console.log(s);try{t=await(await fetch(s)).text()}catch(i){console.error(i)}}if(!t){this.badPage=!0;return}this.yaml=m.parse(t),this.buildUI()}}});var v=function(){var e=this,t=e._self._c;return e._self._setupProxy,t("div",{staticClass:"mobility-page"},[e._m(0),t("div",{staticClass:"page-area"},[t("colophon",{staticClass:"colophon"}),t("div",{staticClass:"left-area"},[t("div",{staticClass:"button-area"},[t("h3",[e._v(e._s(e.$t("type")))]),t("div",{staticClass:"buttons button-choices"},[t("button",{staticClass:"button",class:{"is-link":e.status==1},on:{click:function(s){return e.clickButton(1)}}},[e._v(e._s(e.$t("duration")))]),t("button",{staticClass:"button",class:{"is-link":e.status==2},on:{click:function(s){return e.clickButton(2)}}},[e._v(e._s(e.$t("distance")))]),t("button",{staticClass:"button",class:{"is-link":e.status==3},on:{click:function(s){return e.clickButton(3)}}},[e._v(e._s(e.$t("proportion")))])])]),t("div",{staticClass:"plot-area"},[t("h2",[e._v(e._s(e.$t("mobility-trends")))]),e.badPage?t("h3",{staticClass:"badpage"},[e._v(e._s(e.$t("badpage")))]):t("div",{staticClass:"goodpage"},[e.yaml.description?t("p",{domProps:{innerHTML:e._s(e.topDescription)}}):e._e(),t("div",{staticClass:"all-plots"},[t("div",{staticClass:"linear-plot"},[e.status==1?t("h5",[e._v(e._s(e.$t("duration-heading"))+" ("+e._s(e.$t("week"))+")")]):e.status==2?t("h5",[e._v(e._s(e.$t("distance-heading"))+" ("+e._s(e.$t("week"))+")")]):e.status==3?t("h5",[e._v(e._s(e.$t("proportion-heading"))+" ("+e._s(e.$t("week"))+")")]):e._e(),t("div",{staticClass:"plotarea tall"},[e.dataLoadingFail?t("p",{staticClass:"plotsize"},[e._v("Data not found...")]):t("mobility-plot",{staticClass:"plotsize",attrs:{data:e.allData,outOfHomeDurationPlot:!0,yAxisName:e.yAxisNAme,plotInterval:[-1,3,3],activity:e.activity,time:"week",loadPage:e.loadPage}})],1),t("br"),e.status==1?t("h5",[e._v(e._s(e.$t("duration-heading"))+" ("+e._s(e.$t("weekday"))+")")]):e.status==2?t("h5",[e._v(e._s(e.$t("distance-heading"))+" ("+e._s(e.$t("weekday"))+")")]):e.status==3?t("h5",[e._v(e._s(e.$t("proportion-heading"))+" ("+e._s(e.$t("weekday"))+")")]):e._e(),t("div",{staticClass:"plotarea tall"},[e.dataLoadingFail?t("p",{staticClass:"plotsize"},[e._v("Data not found...")]):t("mobility-plot",{staticClass:"plotsize",attrs:{data:e.allData,outOfHomeDurationPlot:!0,yAxisName:e.yAxisNAme,plotInterval:[-2,2,2],activity:e.activity,time:"weekday",loadPage:e.loadPage}})],1),t("br"),e.status==1?t("h5",[e._v(e._s(e.$t("duration-heading"))+" ("+e._s(e.$t("weekend"))+")")]):e.status==2?t("h5",[e._v(e._s(e.$t("distance-heading"))+" ("+e._s(e.$t("weekend"))+")")]):e.status==3?t("h5",[e._v(e._s(e.$t("proportion-heading"))+" ("+e._s(e.$t("weekend"))+")")]):e._e(),t("div",{staticClass:"plotarea tall"},[e.dataLoadingFail?t("p",{staticClass:"plotsize"},[e._v("Data not found...")]):t("mobility-plot",{staticClass:"plotsize",attrs:{data:e.allData,outOfHomeDurationPlot:!0,yAxisName:e.yAxisNAme,plotInterval:[2,1,0],activity:e.activity,time:"weekend",loadPage:e.loadPage}})],1),t("br"),e.status==1?t("h5",[e._v(e._s(e.$t("duration-heading-percent")))]):e._e(),e.status==1?t("div",{staticClass:"plotarea tall"},[e.dataLoadingFail?t("p",{staticClass:"plotsize"},[e._v("Data not found...")]):t("mobility-plot",{staticClass:"plotsize",attrs:{data:e.allData,outOfHomeDurationPlot:!1,yAxisName:"Percent [%]",plotInterval:[-1,3,3],activity:e.activity,time:"week",loadPage:e.loadPage}})],1):e._e()])]),e.yaml.notes?t("h3",[t("b",[e._v(e._s(e.$t("remarks"))+":")])]):e._e(),e.yaml.notes?t("ul",e._l(e.yaml.notes,function(s){return t("li",{staticClass:"notes-item",domProps:{innerHTML:e._s(e.parseMarkdown(s))}})}),0):e._e()])])])],1)])},f=[function(){var a=this,e=a._self._c;return a._self._setupProxy,e("div",{staticClass:"banner"},[e("h2",[a._v("VSP / Technische Universität Berlin")]),e("h3",[a._v("COVID-19 Analysis Portal")])])}],_=u(b,v,f,!1,null,"d3562007");const B=_.exports;export{B as default};
//# sourceMappingURL=MobilityPage-Cd2bwIqv.js.map