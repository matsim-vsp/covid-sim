var B=Object.defineProperty;var N=(n,t,e)=>t in n?B(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var v=(n,t,e)=>N(n,typeof t!="symbol"?t+"":t,e);import{d as _,s as p,C as f,D as S,L as b,n as I,g as F}from"./index-DDqvQHsx.js";import{P as E}from"./papaparse.min-D_Jh_NJ5.js";import{B as R,F as k,C as y,S as H,W as G,L as D,a as l,b as M,E as u,V as L,c as V,d as O,N as q,P as U,e as W,M as j,f as Y,g as X,_ as J}from"./darkmode-BRVjAAxw.js";import{Z as K}from"./zip-loader.module-BRLILkva.js";class C extends R{constructor(e,i,s){super();v(this,"midX");v(this,"midY");v(this,"tripsPerAgent",{});this.midX=i,this.midY=s;const c=[],o=[],r=[],d=[];for(const m of Object.keys(e)){const a=e[m];this.buildWaypoints(a,c,o,r,d)}this.setAttribute("position",new k(c,3)),this.setAttribute("position2",new k(o,3)),this.setAttribute("infectionTime",new k(r,3)),this.setAttribute("infectionStatus",new k(d,3));const g=2*3*c.length+2*3*r.length;console.log("######## GPU RAM:",g)}updateInfections(e){const i=[],s=[];for(const c of Object.keys(e)){const o=e[c],r=this.tripsPerAgent[o.id];for(let d=0;d<r;d++)i.push(...o.dtime),s.push(...o.d)}this.setAttribute("infectionTime",new k(i,3)),this.setAttribute("infectionStatus",new k(s,3))}buildWaypoints(e,i,s,c,o){const r=e.time.length;if(r<2)return;const d=C.buildInfectionTimes(e),g=C.buildInfectionTypes(e);let m=0;if(e.time[0]!==0){const a=e.path[0][0]-this.midX,h=e.path[0][1]-this.midY,w=e.time[0];i.push(a,h,0),s.push(a,h,w),c.push(...d),o.push(...g),m++}for(let a=0;a<r-1;a++){const h=e.path[a][0]-this.midX,w=e.path[a][1]-this.midY,T=e.time[a];i.push(h,w,T);const P=e.path[a+1][0]-this.midX,z=e.path[a+1][1]-this.midY,A=e.time[a+1];s.push(P,z,A),c.push(...d),o.push(...g),m++}if(e.time[r-1]!==86400){const a=e.path[r-1][0]-this.midX,h=e.path[r-1][1]-this.midY,w=e.time[r-1];i.push(a,h,w),s.push(a,h,86400),c.push(...d),o.push(...g),m++}this.tripsPerAgent[e.id]=m}static buildInfectionTimes(e){switch(e.dtime.length){case 0:return[0,-1,-1];case 1:return[e.dtime[0],-1,-1];case 2:return[e.dtime[0],e.dtime[1],-1];case 3:default:return[e.dtime[0],e.dtime[1],e.dtime[2]]}}static buildInfectionTypes(e){switch(e.d.length){case 0:return[0,-1,-1];case 1:return[e.d[0],-1,-1];case 2:return[e.d[0],e.d[1],-1];case 3:default:return[e.d[0],e.d[1],e.d[2]]}}}const Z=`// vertex shader: agent positions

uniform float simulationTime;
uniform float showSusceptible;

attribute vec3 position2;  // x,y,t

/**
 * First, second, third infection statuses are in .xyz each
 */
attribute vec3 infectionTime;
attribute vec3 infectionStatus;

// this gets passed from vertex to fragment shader
varying float myInfectionStatus;
varying float skip;
varying float atRest;

float calculateStatus() {

    // are we before the first infection state?
    if (simulationTime < infectionTime.x) return 0.0;

    // is there only one infection state?
    if (infectionStatus.y == -1.0) return infectionStatus.x;

    // are we before the second infection state?
    if (simulationTime < infectionTime.y) return infectionStatus.x;

    // are there only two infection states?
    if (infectionTime.z == -1.0) return infectionStatus.y;

    // are we before the third infection state?
    if (simulationTime < infectionTime.z) return infectionStatus.y;

    // there can only be three infection states, and we are at the end
    return infectionStatus.z;
}


float calculateSize() {

    float small = 2.0;
    float med = 5.0;
    float big = 8.0;

    if (myInfectionStatus == 0.0) return small;
    else if (myInfectionStatus == 1.0) return big;
    else if (myInfectionStatus < 6.0) return med;
    return med;
}

float calculateTimestep(in vec3 point1, in vec3 point2) {

    atRest = 0.0;

    if (point1 == point2) {
        atRest = 1.0;
        return 0.0;
    }

    // position vars have time in the .z to save some space
    if (simulationTime < position.z) return 0.0;
    if (simulationTime > position2.z) return 1.0;

    float progress = simulationTime - position.z;
    float duration = position2.z - position.z;

    return progress / duration;
}


vec3 interpolate(in vec3 point1, in vec3 point2, in float timestepFraction) {

    if (timestepFraction == 0.0) {

        return point1;

    } else if (timestepFraction >= 1.0 ) {

        return point2;

    } else {

        vec3 direction = point2 - point1;

        return (direction * timestepFraction) + point1;
    }
}


void main() {

    // don't do anything if person is unaffected all day
    if (showSusceptible == 0.0 && infectionStatus.x == 0.0 && infectionStatus.y == -1.0) {
        gl_PointSize = 0.0;
        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
        skip = 1.0;
        return;
    }

    myInfectionStatus = calculateStatus();

    // don't do anything if this trip is currently out of time bounds
    if (simulationTime < position.z || simulationTime > position2.z) {
        gl_PointSize = 0.0;
        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
        skip = 1.0;
        return;

    } else {

        // figure out z-index based on infection status
        float zIndex = 0.2;
        if (myInfectionStatus == 0.0) zIndex = 0.1;
        else if (myInfectionStatus == 1.0) zIndex = 0.3;
        else if (myInfectionStatus == 2.0) zIndex = 0.4;

        // unpack coords from position buffers - x,y,time. Deal w/ z later
        vec3 point1 = vec3(position.xy, zIndex);
        vec3 point2 = vec3(position2.xy, zIndex);

        float timestepFraction = calculateTimestep(point1, point2);

        vec3 newPosition = interpolate(point1, point2, timestepFraction);

        gl_PointSize = calculateSize();
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

        skip = 0.0;
   }
}
`,Q=`// fragment shader: pixel colors

uniform float simulationTime;
uniform vec3 cSusceptible;
uniform vec3 cInfectedButNotContagious;
uniform vec3 cContagious;
uniform vec3 cSymptomatic;
uniform vec3 cSeriouslyIll;
uniform vec3 cCritical;
uniform vec3 cRecovered;

// passed in from vertex shader:
varying float myInfectionStatus;
varying float skip;
varying float atRest;


vec4 getColor() {

    if (myInfectionStatus == 0.0) {
        return vec4(cSusceptible, 1.0);  // susceptible; not moving

    } else if (myInfectionStatus == 1.0) {

        return vec4(cInfectedButNotContagious, 1.0);  // infected; cyan

    } else if (myInfectionStatus == 2.0) {

        return vec4(cContagious, 1.0);  // contagious; red

    } else if (myInfectionStatus == 3.0) {

        return vec4(cSymptomatic, 1.0);

    } else if (myInfectionStatus == 4.0) {

        return vec4(cSeriouslyIll, 1.0);

    } else if (myInfectionStatus == 5.0) {

        return vec4(cCritical, 1.0);
    }
    return vec4(cRecovered, 1.0);
}


void main() {
    // don't do anything if this trip is currently out of time bounds
    if (skip == 1.0) {

        gl_FragColor = vec4(0,0,0,0);

    } else {

        gl_FragColor = getColor();

    }
}

/******
uniform vec3 color;
uniform vec3 selectedColor;
uniform float timestepFraction;

uniform sampler2D triangle;
uniform sampler2D circle;

varying float vRotation;
varying float vShouldInterpolate;
varying float vIsSelected;

vec2 rotateCoordinates() {
    mat2 rotationMatrix = mat2(cos(vRotation), sin(vRotation), -sin(vRotation), cos(vRotation));

    vec2 centerBasedCoord = vec2(gl_PointCoord.x -0.5, gl_PointCoord.y - 0.5);
    vec2 centerBasedRotatedCoord = centerBasedCoord * rotationMatrix;
    return centerBasedRotatedCoord + 0.5;
}

vec4 getColor() {

    vec4 result;

    if (vIsSelected >= 1.0) {
        result = vec4(selectedColor, 1.0);
    }
    else {
        result = vec4(color, 1.0);
    }
    return result;
}

void main() {

    vec4 opaqueColor = getColor();

    if (vShouldInterpolate >= 1.0) {
        vec2 coord = rotateCoordinates();
        gl_FragColor = opaqueColor * texture2D(triangle, coord);
    } else {
        opaqueColor.a = 1.0 - timestepFraction;
        gl_FragColor = opaqueColor * texture2D(circle, gl_PointCoord);
    }

    if ( gl_FragColor.a < ALPHATEST ) discard;
}
******/
`,tt=_({name:"AnimationView",props:{speed:{type:Number,required:!0},day:{type:Number,required:!0},showSusceptible:{type:Boolean,required:!0}},data:()=>{const n=p.state.colorScheme==f.DarkMode?S:b;return{wasSimulationRunning:!0,networkLayers:[],agentMaterial:null,agentGeometry:null,tempStreamBuffer:"",timeFactor:600,timeDirection:1,vertexShader:Z,fragmentShader:Q,networkFilename:"network.zip",state:p.state,colors:n,isDarkMode:p.state.colorScheme===f.DarkMode,simulationTime:0,animationTimeSinceUnpaused:0,clock:new y(!1),nextClockUpdateTime:0,scene:new H,renderer:new G({antialias:!0}),camera:null,container:{},cameraControls:{},linkMaterial:new D({color:n.links}),xRange:[1e25,-1e25],yRange:[1e25,-1e25],midpointX:4595e3,midpointY:582e4,tripList:{},infectionList:{},allTripsHaveBegun:!1,publicPath:"/"}},watch:{speed(){this.$store.commit("setSimulation",!0);const n=this.speed<0?-1:1;n!==this.timeDirection&&(this.clock.stop(),this.clock=new y(!1),this.timeDirection=n,this.clock.start(),this.animationTimeSinceUnpaused=0,requestAnimationFrame(this.moveCameraWhilePaused),console.log("done flip"))},"state.isRunning"(){this.state.isRunning?(this.clock.start(),requestAnimationFrame(this.animate)):(this.clock.stop(),this.clock=new y(!1),this.animationTimeSinceUnpaused=0,requestAnimationFrame(this.moveCameraWhilePaused))},"state.colorScheme"(){this.colors=p.state.colorScheme==f.LightMode?b:S,this.isDarkMode=this.state.colorScheme===f.DarkMode,this.scene.background=new l(this.colors.background),this.agentMaterial&&(this.agentMaterial.uniforms.cSusceptible.value=new l(this.colors.susceptible),this.agentMaterial.uniforms.cInfectedButNotContagious.value=new l(this.colors.infectedButNotContagious),this.agentMaterial.uniforms.cContagious.value=new l(this.colors.contagious),this.agentMaterial.uniforms.cSymptomatic.value=new l(this.colors.symptomatic),this.agentMaterial.uniforms.cSeriouslyIll.value=new l(this.colors.seriouslyIll),this.agentMaterial.uniforms.cCritical.value=new l(this.colors.critical),this.agentMaterial.uniforms.cRecovered.value=new l(this.colors.recovered));const n=this.scene.getObjectByName("network");n&&this.scene.remove(n),this.linkMaterial.dispose(),this.linkMaterial=new D({color:this.colors.links});for(const t of this.networkLayers){const e=t.name,i=this.scene.getObjectByName(e);i&&this.scene.remove(i);const s=new M(t.geometry,this.linkMaterial);s.name=e,this.scene.add(s)}},async day(){console.log("------------------ DAY",this.day),this.clock.stop(),this.animationTimeSinceUnpaused=0,this.clock=new y(!1),this.updateAgentAttributesForDay(this.day)},showSusceptible(){if(!this.agentGeometry||!this.agentMaterial)return;const n=this.showSusceptible?1:0;this.agentMaterial.uniforms.showSusceptible.value=n,this.agentMaterial.uniformsNeedUpdate=!0}},mounted(){this.setInitialClockTime(),this.setupSimulation(),this.setupDragListener(),window.addEventListener("resize",this.onWindowResize,!1),document.addEventListener("visibilitychange",this.handleVisibilityChange,!1)},beforeDestroy(){this.exitSimulation(),window.removeEventListener("resize",this.onWindowResize),document.removeEventListener("visibilityChange",this.handleVisibilityChange),u.$off(u.DRAG),this.agentMaterial&&this.agentMaterial.dispose(),this.agentGeometry&&this.agentGeometry.dispose();for(const n of this.networkLayers)n.geometry.dispose();this.linkMaterial.dispose(),this.scene.dispose()},methods:{setInitialClockTime(){const n=""+this.$route.query.start;if(n&&!Number.isNaN(parseInt(n))){const t=parseInt(n);(t>=0||t<86400)&&(this.simulationTime=t,this.setVisibleClock(),this.$nextTick())}},handleVisibilityChange(){console.log("window visibility changed!! hidden:",document.hidden),this.$store.commit("setSimulation",!document.hidden)},setupDragListener(){const n=this;u.$on(u.DRAG,function(t){t===-1?(n.wasSimulationRunning=n.state.isRunning,n.$store.commit("setSimulation",!1)):t===-2?n.$store.commit("setSimulation",n.wasSimulationRunning):(n.simulationTime=n.nextClockUpdateTime=t,n.animate())})},exitSimulation(){for(this.clock=new y(!1),this.simulationTime=0,this.nextClockUpdateTime=0,this.timeDirection=1;this.scene.children.length;)this.scene.remove(this.scene.children[0])},onWindowResize(){this.container=document.getElementById("anim-container"),!(!this.container||!this.camera)&&(this.renderer.domElement,this.camera.aspect=this.container.clientWidth/this.container.clientHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight))},async setupSimulation(){this.$store.commit("setStatusMessage","loading agents"),await this.$nextTick(),await this.loadTrips(),this.initScene(),this.addNetworkToScene()},startSimulation(){this.$emit("loaded",!0),this.state.isShowingHelp||(this.clock.start(),this.animate(),this.$store.commit("setSimulation",!0))},async networkLayerAdder(n,t,e){if(e>t.length){this.$store.commit("setStatusMessage",""),this.startSimulation();return}const s=[],c=e,o=e+2e4>t.length?t.length:e+2e4;for(let m=c;m<o;m++){const a=t[m],h=new L(n[a.from_node].x,n[a.from_node].y,0),w=new L(n[a.to_node].x,n[a.to_node].y,0),T=new R().setFromPoints([h,w]);s.push(T)}const r=V.mergeBufferGeometries(s),d=new M(r,this.linkMaterial);d.name="network"+e,this.scene.add(d),this.camera&&this.renderer.render(this.scene,this.camera),this.networkLayers.push(d),r.dispose();const g=e+2e4;setTimeout(()=>{this.networkLayerAdder(n,t,g)},1)},async addNetworkToScene(){console.log("loading network",this.networkFilename),this.networkLayers=[];const n=new K(this.publicPath+this.networkFilename);await n.load();const t=n.extractAsJSON("network.json"),e={};for(const i of t.nodes)e[i.node_id]={x:i.x-this.midpointX,y:i.y-this.midpointY};console.log("network has links:",t.links.length),this.networkLayerAdder(e,t.links,0)},async loadTrips(){console.log("loading agent trips");const n=this.publicPath+"v3-anim/trips.json";console.log(n);const t=await fetch(n);if(!t.body)return;this.tripList={};const e=await t.text();for(const i of e.split(`
`))if(i){const s=JSON.parse(i);this.tripList[s.id]=s}console.log("--Done reading trips."),this.finishedLoadingTrips()},async updateAgentAttributesForDay(n){console.log("loading infections for day",n);const t=("00"+this.day).slice(-3),e=this.publicPath+"v3-anim/"+t+"-infections.json";console.log(e);const i=await fetch(e);if(!i.body)return;this.tempStreamBuffer="",this.infectionList={};const s=new TextDecoder("utf-8"),c=i.body.getReader();this.loopInfectionReader(c,s)},loopInfectionReader(n,t){n.read().then(({value:e,done:i})=>{i?(this.tempStreamBuffer&&this.processNewlyReadInfection(this.tempStreamBuffer),console.log("--Done reading infections."),this.finishedLoadingInfections()):(this.processNDJSONInfectionChunk(e,t),this.loopInfectionReader(n,t))})},processNewlyReadInfection(n){const t=JSON.parse(n);this.infectionList[t.id]=t},processNDJSONInfectionChunk(n,t,e=`
`){const i=t.decode(n);this.tempStreamBuffer+=i;const s=this.tempStreamBuffer.split(e);s.slice(0,-1).forEach(c=>{this.processNewlyReadInfection(c)}),this.tempStreamBuffer=s[s.length-1]},finishedLoadingInfections(){this.agentGeometry&&(this.agentGeometry.updateInfections(this.infectionList),this.clock.start())},finishedLoadingTrips(){this.agentGeometry&&this.agentGeometry.dispose(),this.agentGeometry=new C(this.tripList,this.midpointX,this.midpointY),Object.keys(this.infectionList).length>0&&this.agentGeometry.updateInfections(this.infectionList),this.agentMaterial||(this.agentMaterial=new O({uniforms:{simulationTime:{value:0},showSusceptible:{value:this.showSusceptible},colorLinks:{value:new l(this.colors.links)},cSusceptible:{value:new l(this.colors.susceptible)},cContagious:{value:new l(this.colors.contagious)},cInfectedButNotContagious:{value:new l(this.colors.infectedButNotContagious)},cSymptomatic:{value:new l(this.colors.symptomatic)},cSeriouslyIll:{value:new l(this.colors.seriouslyIll)},cCritical:{value:new l(this.colors.critical)},cRecovered:{value:new l(this.colors.recovered)}},vertexShader:this.vertexShader,fragmentShader:this.fragmentShader,blending:q,depthTest:!0,transparent:!0}));const n=new U(this.agentGeometry,this.agentMaterial);n.name="agents";const t=this.scene.getObjectByName("agents");t&&this.scene.remove(t),this.scene.add(n),this.camera&&this.renderer.render(this.scene,this.camera),this.$store.commit("setStatusMessage","loading network"),console.log("added points")},initScene(){if(console.log("hereee 5-----"),this.container=document.getElementById("anim-container"),!this.container)return;console.log("hereee 0-----"),this.scene.background=new l(this.colors.background),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.container.appendChild(this.renderer.domElement);const n=1,t=1e5;this.camera=new W(170,this.container.clientWidth/this.container.clientHeight,n,t),this.cameraControls=new j(this.camera,this.renderer.domElement),this.cameraControls.enablePan=!0,this.cameraControls.screenSpacePanning=!0,this.cameraControls.enableZoom=!0,this.cameraControls.enableRotate=!1,this.camera.position.set(0,0,1500),this.camera.lookAt(0,0,-1),this.cameraControls.update(),this.renderer.render(this.scene,this.camera),console.log("--init complete!")},moveCameraWhilePaused(){this.camera&&(this.state.isRunning||(this.renderer.render(this.scene,this.camera),this.cameraControls.update(),requestAnimationFrame(this.moveCameraWhilePaused)))},setVisibleClock(){const n=Math.floor(this.simulationTime/3600),t=Math.floor(this.simulationTime/60)%60;this.$store.commit("setClock",(n<10?"0":"")+n+(t<10?":0":":")+t)},animate(){const n=this.clock.getElapsedTime(),t=this.timeFactor*this.speed*(n-this.animationTimeSinceUnpaused);this.animationTimeSinceUnpaused=n,this.simulationTime=this.simulationTime+t,this.simulationTime<0?(this.$store.commit("setSimulation",!1),this.simulationTime=0):this.simulationTime>86400&&(this.$store.commit("setSimulation",!1),this.simulationTime=86399),this.agentMaterial&&(this.agentMaterial.uniforms.simulationTime.value=this.simulationTime),this.simulationTime*this.timeDirection>=this.nextClockUpdateTime*this.timeDirection&&(this.setVisibleClock(),this.nextClockUpdateTime+=60*this.timeDirection,u.$emit(u.SIMULATION_PERCENT,this.simulationTime/86400)),this.camera&&this.renderer.render(this.scene,this.camera),this.cameraControls.update(),this.state.isRunning&&requestAnimationFrame(this.animate)}}});var et=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{style:{backgroundColor:t.isDarkMode?"black":"#ccccc4"},attrs:{id:"anim-container"}})},nt=[],it=I(tt,et,nt,!1,null,"c5e10541");const st=it.exports;var ot=function(n){if(n=parseInt(n,10),isNaN(n))throw new TypeError("Invalid value sent to convert-seconds");var t={};return t.hours=Math.floor(n/60/60),t.minutes=Math.floor(n/60%60),t.seconds=Math.floor(n%60),t};const at=F(ot),x=1e5,$=n=>{let t=n/x*86400;return t===86400&&(t=86399),t},rt=n=>{const t=$(n);try{const e=at(t),i=("00"+e.minutes).slice(-2);return`${e.hours}:${i}`}catch{return"00:00"}},ct=_({name:"PlaybackControls",components:{},data:()=>({state:p.state,sliderValue:0,maxSliderVal:x,sliderOptions:{min:0,max:x-1,clickable:!1,dotSize:28,duration:0,lazy:!0,tooltip:!0,size:"is-large","tooltip-always":!0,"tooltip-placement":"top","custom-formatter":rt}}),methods:{onKeyPressed(n){n.code==="Space"&&this.toggleSimulation()},toggleSimulation(){this.$emit("click")},dragStart(){console.log("start"),u.$emit(u.DRAG,-1)},dragEnd(){console.log("end"),u.$emit(u.DRAG,-2)},dragging(n){u.$emit(u.DRAG,$(n))}},mounted(){u.$on(u.SIMULATION_PERCENT,n=>{this.sliderValue=Math.floor(this.maxSliderVal*n)}),window.addEventListener("keyup",this.onKeyPressed)},beforeDestroy(){u.$off(u.SIMULATION_PERCENT),window.removeEventListener("keyup",this.onKeyPressed)}});var lt=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{staticClass:"my-vue-component"},[e("b-slider",t._b({staticClass:"slider",on:{dragging:t.dragging,dragstart:t.dragStart,dragend:t.dragEnd},model:{value:t.sliderValue,callback:function(i){t.sliderValue=i},expression:"sliderValue"}},"b-slider",t.sliderOptions,!1)),e("div",{staticClass:"buttons"},[e("div",{staticClass:"playpause",on:{click:t.toggleSimulation}},[t.state.isRunning?e("i",{staticClass:"button-icon fa fa-1x fa-pause"}):e("i",{staticClass:"button-icon fa fa-1x fa-play"})])])],1)},ut=[],dt=I(ct,lt,ut,!1,null,"aa4a17b4");const mt=dt.exports,ht=`time	day	nSusceptible	nInfectedButNotContagious	nContagious	nShowingSymptoms	nSeriouslySick	nCritical	nTotalInfected	nInfectedCumulative	nRecovered	nInQuarantine	district\r
86400.0	1	4696700	1000	0	0	0	0	1000	1000	0	0	unknown\r
172800.0	2	4696700	1000	0	0	0	0	1000	1000	0	0	unknown\r
259200.0	3	4696700	1000	0	0	0	0	1000	1000	0	0	unknown\r
345600.0	4	4696700	0	1000	0	0	0	1000	1000	0	0	unknown\r
432000.0	5	4692400	4300	1000	0	0	0	5300	5300	0	0	unknown\r
518400.0	6	4692100	4600	100	900	0	0	5600	5600	0	900	unknown\r
604800.0	7	4692100	4600	100	900	0	0	5600	5600	0	900	unknown\r
691200.0	8	4692100	300	4400	900	0	0	5600	5600	0	900	unknown\r
777600.0	9	4673300	18800	4700	900	0	0	24400	24400	0	900	unknown\r
864000.0	10	4671100	21000	1000	4400	200	0	26600	26600	0	4600	unknown\r
950400.0	11	4671000	21100	700	4700	200	0	26700	26700	0	4900	unknown\r
1036800.0	12	4671000	2300	19500	4700	200	0	26700	26700	0	4900	unknown\r
1123200.0	13	4538600	132500	21700	4700	200	0	159100	159100	0	4900	unknown\r
1209600.0	14	4518700	152300	7000	19300	400	0	179000	179000	0	19700	unknown\r
1296000.0	15	4517600	153400	5100	21200	400	0	180100	180100	0	21600	unknown\r
1382400.0	16	4516600	22000	137400	20500	400	0	180300	181100	800	21600	unknown\r
1468800.0	17	3846800	671900	157300	20500	400	0	850100	850900	800	20900	unknown\r
1555200.0	18	3751300	766300	54100	124000	1200	0	945600	946400	800	125200	unknown\r
1641600.0	19	3740100	776500	39200	139800	1100	200	956800	957600	800	141100	unknown\r
1728000.0	20	3735700	111100	707700	137000	1100	200	957100	962000	4900	141800	unknown\r
1814400.0	21	2671600	1079700	802400	137500	1100	200	2020900	2026100	5200	139100	unknown\r
1900800.0	22	2560300	1179800	274000	670300	7900	200	2132200	2137400	5200	678400	unknown\r
1987200.0	23	2544200	1191500	199700	747900	6900	2100	2148100	2153500	5400	757100	unknown\r
2073600.0	24	2537100	134500	1251300	742300	6800	2300	2137200	2160600	23400	765400	unknown\r
2160000.0	25	1940100	620200	1358900	743900	6800	2300	2732100	2757600	25500	754800	unknown\r
2246400.0	26	1873000	671200	524300	1564800	36500	2300	2799100	2824700	25600	1603600	unknown\r
2332800.0	27	1863100	674000	441600	1649900	34000	9300	2808800	2834600	25800	1693400	unknown\r
2419200.0	28	1855200	84900	997300	1565300	33300	10300	2691100	2842500	151400	1706400	unknown\r
2505600.0	29	1600100	272900	1054700	1556200	33300	10300	2927400	3097600	170200	1614600	unknown\r
2592000.0	30	1551600	311500	589100	1985900	78100	10300	2974900	3146100	171200	2074900	unknown\r
2678400.0	31	1542900	312300	545200	2032500	69900	21900	2981800	3154800	173000	2125900	unknown\r
2764800.0	32	1536900	63200	661900	1530000	71000	21500	2347600	3160800	813200	2132500	unknown\r
2851200.0	33	1388500	163100	688400	1461000	71300	21400	2405200	3309200	904000	1627700	unknown\r
2937600.0	34	1343900	199000	490300	1633400	94800	21400	2438900	3353800	914900	1757800	unknown\r
3024000.0	35	1334700	202200	457700	1665000	83500	28500	2436900	3363000	926100	1787200	unknown\r
3110400.0	36	1330300	58200	385700	865400	89700	21900	1420900	3367400	1946500	1783900	unknown\r
3196800.0	37	1240800	103100	403600	784800	90600	21100	1403200	3456900	2053700	982200	unknown\r
3283200.0	38	1202700	132000	292100	879900	100700	21300	1426000	3495000	2069000	1014300	unknown\r
3369600.0	39	1196800	133500	260400	906600	71400	23400	1395300	3500900	2105600	1036600	unknown\r
3456000.0	40	1193400	47400	219800	463000	77900	12400	820500	3504300	2683800	1009600	unknown\r
3542400.0	41	1134100	68600	239000	417200	79300	10900	815000	3563600	2748600	556700	unknown\r
3628800.0	42	1110100	86700	170400	475900	86000	10800	829800	3587600	2757800	580200	unknown\r
3715200.0	43	1106400	87000	141200	498500	41700	12600	781000	3591300	2810300	602600	unknown\r
3801600.0	44	1104600	29500	145000	308500	44900	5900	533800	3593100	3059300	557300	unknown\r
3888000.0	45	1074400	35700	155700	275400	44700	5700	517200	3623300	3106100	361700	unknown\r
3974400.0	46	1064200	42200	111100	311600	48400	5400	518700	3633500	3114800	372300	unknown\r
4060800.0	47	1061800	42800	92700	323800	26500	6000	491800	3635900	3144100	384800	unknown\r
4147200.0	48	1061300	13100	89300	215200	25800	4500	347900	3636400	3288500	359300	unknown\r
4233600.0	49	1047300	16900	88200	184000	25900	3900	318900	3650400	3331500	246900	unknown\r
4320000.0	50	1042000	19800	64600	198100	29000	4000	315500	3655700	3340200	238800	unknown\r
4406400.0	51	1040100	21200	57100	200600	19100	5100	303100	3657600	3354500	238100	unknown\r
4492800.0	52	1039800	7500	52700	132900	18300	3600	215000	3657900	3442900	226500	unknown\r
4579200.0	53	1030700	11300	49400	105500	18500	3300	188000	3667000	3479000	155200	unknown\r
4665600.0	54	1028200	11900	38400	111100	20300	3100	184800	3669500	3484700	138800	unknown\r
4752000.0	55	1026900	12900	33700	112500	13700	3500	176300	3670800	3494500	138500	unknown\r
4838400.0	56	1026800	3900	28500	70700	12200	2900	118200	3670900	3552700	131200	unknown\r
4924800.0	57	1022700	5500	26200	53000	12100	2300	99100	3675000	3575900	86000	unknown\r
5011200.0	58	1022000	4900	19300	57200	12200	2300	95900	3675700	3579800	74900	unknown\r
5097600.0	59	1021800	5000	16800	57700	9100	2200	90800	3675900	3585100	73900	unknown\r
5184000.0	60	1021800	900	14800	35300	8100	1100	60200	3675900	3615700	69900	unknown\r
5270400.0	61	1020800	1200	12200	28800	8000	800	51000	3676900	3625900	44600	unknown\r
5356800.0	62	1020800	1000	8500	30000	8400	700	48600	3676900	3628300	40800	unknown\r
5443200.0	63	1020800	1000	7800	30200	4900	800	44700	3676900	3632200	39700	unknown\r
5529600.0	64	1020800	0	6200	19300	3900	300	29700	3676900	3647200	36000	unknown\r
5616000.0	65	1020100	700	4900	15700	3900	100	25300	3677600	3652300	23500	unknown\r
5702400.0	66	1020100	700	3600	15000	4000	100	23400	3677600	3654200	20600	unknown\r
5788800.0	67	1020100	700	3500	14800	2200	100	21300	3677600	3656300	19100	unknown\r
5875200.0	68	1020100	0	2600	7800	1800	100	12300	3677600	3665300	17100	unknown\r
5961600.0	69	1019700	400	2300	5600	1600	100	10000	3678000	3668000	9700	unknown\r
6048000.0	70	1019700	400	1400	5200	1600	100	8700	3678000	3669300	7800	unknown\r
6134400.0	71	1019700	400	1400	5100	1100	100	8100	3678000	3669900	6900	unknown\r
6220800.0	72	1019700	0	900	2100	800	0	3800	3678000	3674200	6300	unknown\r
6307200.0	73	1019600	100	800	1500	700	0	3100	3678100	3675000	2900	unknown\r
6393600.0	74	1019600	100	400	1600	800	0	2900	3678100	3675200	2500	unknown\r
6480000.0	75	1019600	100	400	1600	300	0	2400	3678100	3675700	2400	unknown\r
6566400.0	76	1019600	0	400	700	300	0	1400	3678100	3676700	1900	unknown\r
6652800.0	77	1019600	0	400	700	300	0	1400	3678100	3676700	1000	unknown\r
6739200.0	78	1019600	0	300	700	400	0	1400	3678100	3676700	1100	unknown\r
6825600.0	79	1019600	0	300	700	200	0	1200	3678100	3676900	1100	unknown\r
6912000.0	80	1019600	0	100	300	200	0	600	3678100	3677500	900	unknown\r
6998400.0	81	1019600	0	100	300	200	0	600	3678100	3677500	500	unknown\r
7084800.0	82	1019600	0	100	300	200	0	600	3678100	3677500	500	unknown\r
7171200.0	83	1019600	0	100	300	200	0	600	3678100	3677500	500	unknown\r
7257600.0	84	1019600	0	0	100	200	0	300	3678100	3677800	500	unknown\r
7344000.0	85	1019600	0	0	100	200	0	300	3678100	3677800	300	unknown\r
7430400.0	86	1019600	0	0	100	200	0	300	3678100	3677800	300	unknown\r
7516800.0	87	1019600	0	0	100	100	0	200	3678100	3677900	300	unknown\r
7603200.0	88	1019600	0	0	0	100	0	100	3678100	3678000	200	unknown\r
7689600.0	89	1019600	0	0	0	100	0	100	3678100	3678000	100	unknown\r
7776000.0	90	1019600	0	0	0	100	0	100	3678100	3678000	100	unknown\r
7862400.0	91	1019600	0	0	0	0	0	0	3678100	3678100	100	unknown\r
7948800.0	92	1019600	0	0	0	0	0	0	3678100	3678100	0	unknown\r
`,ft=_({name:"MultiDayViewer",components:{AnimationView:st,ModalMarkdownDialog:Y,PlaybackControls:mt,ToggleButton:X.ToggleButton},data:()=>({numDays:90,newDay:0,state:p.state,isDarkMode:p.state.colorScheme===f.DarkMode,isLoaded:!1,showHelp:!1,showSusceptible:!0,totalInfections:ht,speedStops:[-10,-5,-2,-1,-.5,-.25,0,.25,.5,1,2,5,10],speed:1,speedSlider:9,legendBits:[],dayColors:{}}),watch:{"state.colorScheme"(){this.isDarkMode=p.state.colorScheme===f.DarkMode,this.updateLegendColors(),this.setCubeColors()}},mounted(){this.$store.commit("setFullScreen",!0),this.showHelp=!this.state.sawAgentAnimationHelp,this.$store.commit("setShowingHelp",this.showHelp),this.$store.commit("setSimulation",!this.showHelp),this.setInitialDay(),this.setCubeColors(),this.updateLegendColors()},beforeDestroy(){this.$store.commit("setFullScreen",!1),this.$store.commit("setSimulation",!1)},computed:{textColor(){const n={text:"#3498db",bg:"#eeeef480"},t={text:"white",bg:"#181518aa"};return this.state.colorScheme===f.DarkMode?t:n}},methods:{updateLegendColors(){const n=this.state.colorScheme==f.LightMode?b:S;this.legendBits=[{label:"susceptible",color:n.susceptible},{label:"latently infected",color:n.infectedButNotContagious},{label:"contagious",color:n.contagious},{label:"symptomatic",color:n.symptomatic},{label:"seriously ill",color:n.seriouslyIll},{label:"critical",color:n.critical},{label:"recovered",color:n.recovered}]},setInitialDay(){const n=""+this.$route.query.day;if(n&&Number.isFinite(n)){const t=parseInt(n);(t>=1||t<this.numDays)&&(this.newDay=t-1,this.$nextTick())}},toggleSimulation(){this.$store.commit("setSimulation",!this.state.isRunning),this.state.isRunning&&this.speed===0&&(this.speed=1)},async setCubeColors(){const n=E.parse(this.totalInfections,{header:!0,dynamicTyping:!0,skipEmptyLines:!0}).data,t=["nInfectedButNotContagious","nContagious","nShowingSymptoms","nSeriouslySick","nCritical","nRecovered"],e=this.state.colorScheme==f.LightMode?b:S;this.dayColors[0]=e.infectedButNotContagious;for(const i of n){let s=0,c="nix";for(const r of t)i[r]>s&&(s=i[r],c=r);const o=i.day;switch(c){case"nSusceptible":this.dayColors[o]=e.susceptible;break;case"nInfectedButNotContagious":this.dayColors[o]=e.infectedButNotContagious;break;case"nContagious":this.dayColors[o]=e.contagious;break;case"nShowingSymptoms":this.dayColors[o]=e.symptomatic;break;case"nSeriouslySick":this.dayColors[o]=e.seriouslyIll;break;case"nCritical":this.dayColors[o]=e.critical;break;case"nRecovered":this.dayColors[o]=e.recovered;break;default:this.dayColors[o]="#dddddd";break}}},colorLookup(n){return this.dayColors[n]},clickedHelp(){console.log("HEEELP!"),this.$store.commit("setSimulation",!1),this.showHelp=!0,this.$store.commit("setShowingHelp",this.showHelp)},clickedCloseHelp(){this.showHelp=!1,this.$store.commit("setShowingHelp",this.showHelp),this.$store.commit("setSawAgentAnimationHelp",!0),this.$store.commit("setSimulation",!0)},toggleSusceptible(){this.showSusceptible=!this.showSusceptible},switchDay(n){const t=""+(n+1);this.$router.replace({query:{day:t}}),this.$nextTick(),this.newDay=n},dayStep(n){let t=this.newDay+n;t<0||t>=this.numDays||this.switchDay(t)},toggleLoaded(n){this.isLoaded=n},rotateColors(){this.$store.commit("rotateColors")}}});var pt=function(){var t=this,e=t._self._c;return t._self._setupProxy,e("div",{attrs:{id:"v3-app"}},[e("animation-view",{staticClass:"anim",attrs:{speed:t.speed,day:t.newDay,showSusceptible:t.showSusceptible},on:{loaded:t.toggleLoaded}}),e("modal-markdown-dialog",{class:{"is-active":t.showHelp},attrs:{id:"help-dialog",title:"COVID-19 virus spreading",md:"@/assets/animation-helptext.md",buttons:["Let's go!"]},on:{click:function(i){return t.clickedCloseHelp()}}}),e("div",{staticClass:"nav"},[t.state.statusMessage?t._e():e("p",{staticClass:"big time"},[t._v("Berlin: Outbreak Day "+t._s(t.newDay+1))]),e("p",{staticClass:"big day"},[t._v(t._s(t.state.statusMessage))]),e("p",{staticClass:"big time"},[t._v(t._s(t.state.clock))])]),e("div",{staticClass:"side-section"},[e("div",{staticClass:"day-switchers"},[e("div",{staticClass:"day-button switchers",class:{dark:t.isDarkMode},attrs:{title:"Previous day"},on:{click:function(i){return t.dayStep(-1)}}},[e("i",{staticClass:"fa fa-1x fa-arrow-left"})]),e("div",{staticClass:"day-button switchers",class:{dark:t.isDarkMode},attrs:{title:"Next day"},on:{click:function(i){return t.dayStep(1)}}},[e("i",{staticClass:"fa fa-1x fa-arrow-right"})])]),e("div",{staticClass:"day-button-grid"},t._l(Array.from(Array(t.numDays+1).keys()).slice(1),function(i){return e("div",{key:i,staticClass:"day-button",class:{currentday:t.newDay==i-1,dark:t.isDarkMode},style:{borderBottom:t.newDay==i-1?"none":"2px solid "+t.colorLookup(i-1)},attrs:{title:"Day "+i},on:{click:function(s){return t.switchDay(i-1)}}},[t._v(t._s(i))])}),0)]),e("div",{staticClass:"right-side"},[t.isLoaded?e("div",{staticClass:"morestuff"},[e("b-slider",{staticClass:"speed-slider",attrs:{min:0,max:t.speedStops.length-1,dotSize:20,tooltip:!0,"tooltip-placement":"bottom","custom-formatter":i=>t.speedStops[i]+"x"},on:{input:function(i){t.speed=t.speedStops[t.speedSlider]}},model:{value:t.speedSlider,callback:function(i){t.speedSlider=i},expression:"speedSlider"}},t._l(t.speedStops,function(i){return e("b-slider-tick",{key:i,attrs:{value:i}})}),1),e("p",{staticClass:"speed-label",style:{color:t.textColor.text}},[t._v(t._s(t.speed)+"x speed")]),e("toggle-button",{attrs:{value:t.showSusceptible,sync:!0,labels:!0,color:"#4b7cc4",speed:150},on:{change:t.toggleSusceptible}}),e("p",{staticClass:"speed-label",style:{color:t.textColor.text}},[t._v("Show susceptible")])],1):t._e()]),t.isLoaded?e("playback-controls",{staticClass:"playback-stuff",on:{click:t.toggleSimulation}}):t._e(),t.isLoaded?e("div",{staticClass:"extra-buttons"},[e("div",{staticClass:"help-button",attrs:{title:"info"},on:{click:t.clickedHelp}},[e("i",{staticClass:"help-button-text fa fa-1x fa-question"})]),e("img",{staticClass:"theme-button",attrs:{src:J,title:"dark/light theme"},on:{click:t.rotateColors}})]):t._e(),e("div",{staticClass:"legend",class:{dark:t.isDarkMode}},[e("p",{style:{color:t.isDarkMode?"#fff":"#000"}},[t._v("Legend:")]),e("div",{staticClass:"legend-items"},t._l(t.legendBits,function(i){return e("p",{key:i.label,staticClass:"legend-item",style:{color:i.color}},[t._v(t._s(i.label))])}),0)])],1)},gt=[],wt=I(ft,pt,gt,!1,null,"2954881d");const Ct=wt.exports;export{Ct as default};
//# sourceMappingURL=MultiDayViewer-DaQrvKWp.js.map
