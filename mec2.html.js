"use strict";
/**
 * g2.core (c) 2013-19 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @link https://github.com/goessner/g2
 * @typedef {g2}
 * @param {object} [opts] Custom options object. It is simply copied into the 'g2' instance, but not used from the g2 kernel.
 * @description Create a 2D graphics command queue object. Call without using 'new'.
 * @returns {g2}
 * @example
 * const ctx = document.getElementById("c").getContext("2d");
 * g2()                                   // Create 'g2' instance.
 *     .lin({x1:50,y1:50,x2:100,y2:100})  // Append ...
 *     .lin({x1:100,y1:100,x2:200,y2:50}) // ... commands.
 *     .exe(ctx);                         // Execute commands addressing canvas context.
 */function g2(opts){let o=Object.create(g2.prototype);o.commands=[];if(opts)Object.assign(o,opts);return o}g2.prototype={clr(){return this.addCommand({c:"clr"})},view({scl:scl,x:x,y:y,cartesian:cartesian}){return this.addCommand({c:"view",a:arguments[0]})},grid({color:color,size:size}={}){return this.addCommand({c:"grid",a:arguments[0]})},cir({x:x,y:y,r:r,w:w}){return this.addCommand({c:"cir",a:arguments[0]})},ell({x:x,y:y,rx:rx,ry:ry,w:w,dw:dw,rot:rot}){return this.addCommand({c:"ell",a:arguments[0]})},arc({x:x,y:y,r:r,w:w,dw:dw}){return this.addCommand({c:"arc",a:arguments[0]})},rec({x:x,y:y,b:b,h:h}){return this.addCommand({c:"rec",a:arguments[0]})},lin({x1:x1,y1:y1,x2:x2,y2:y2}){return this.addCommand({c:"lin",a:arguments[0]})},ply({pts:pts,format:format,closed:closed,x:x,y:y,w:w}){arguments[0]._itr=format&&g2.pntIterator[format](pts)||g2.pntItrOf(pts);return this.addCommand({c:"ply",a:arguments[0]})},txt({str:str,x:x,y:y,w:w}){return this.addCommand({c:"txt",a:arguments[0]})},use({grp:grp,x:x,y:y,w:w,scl:scl}){if(typeof grp==="string")arguments[0].grp=grp=g2.symbol[grp];if(grp&&grp!==this)this.addCommand({c:"use",a:arguments[0]});return this},img({uri:uri,x:x,y:y,b:b,h:h,sx:sx,sy:sy,sb:sb,sh:sh,xoff:xoff,yoff:yoff,w:w,scl:scl}){return this.addCommand({c:"img",a:arguments[0]})},beg({x:x,y:y,w:w,scl:scl,matrix:matrix}={}){return this.addCommand({c:"beg",a:arguments[0]})},end(){let myBeg=1,findMyBeg=cmd=>{if(cmd.c==="beg")myBeg--;else if(cmd.c==="end")myBeg++;return myBeg===0};return g2.getCmdIdx(this.commands,findMyBeg)!==false?this.addCommand({c:"end"}):this},p(){return this.addCommand({c:"p"})},z(){return this.addCommand({c:"z"})},m({x:x,y:y}){return this.addCommand({c:"m",a:arguments[0]})},l({x:x,y:y}){return this.addCommand({c:"l",a:arguments[0]})},q({x1:x1,y1:y1,x:x,y:y}){return this.addCommand({c:"q",a:arguments[0]})},c({x1:x1,y1:y1,x2:x2,y2:y2,x:x,y:y}){return this.addCommand({c:"c",a:arguments[0]})},a({dw:dw,x:x,y:y}){let prvcmd=this.commands[this.commands.length-1];g2.cpyProp(prvcmd.a,"x",arguments[0],"_xp");g2.cpyProp(prvcmd.a,"y",arguments[0],"_yp");return this.addCommand({c:"a",a:arguments[0]})},stroke({d:d}={}){return this.addCommand({c:"stroke",a:arguments[0]})},fill({d:d}={}){return this.addCommand({c:"fill",a:arguments[0]})},drw({d:d,lsh:lsh}={}){return this.addCommand({c:"drw",a:arguments[0]})},del(idx){this.commands.length=idx||0;return this},ins(fn){return typeof fn==="function"?fn(this)||this:typeof fn==="object"?(this.commands.push({c:"ins",a:fn}),this):this},exe(ctx){let handler=g2.handler(ctx);if(handler&&handler.init(this))handler.exe(this.commands);return this},addCommand({c:c,a:a}){if(a&&Object.getPrototypeOf(a)===Object.prototype){for(const key in a)if(!Object.getOwnPropertyDescriptor(a,key).get&&key[0]!=="_"&&typeof a[key]==="function"){Object.defineProperty(a,key,{get:a[key],enumerable:true,configurable:true,writabel:false})}if(g2.prototype[c].prototype)Object.setPrototypeOf(a,g2.prototype[c].prototype)}this.commands.push(arguments[0]);return this}};g2.defaultStyle={fs:"transparent",ls:"#000",lw:1,lc:"butt",lj:"miter",ld:[],ml:10,sh:[0,0],lsh:false,font:"14px serif",thal:"start",tval:"alphabetic"};g2.symbol={};g2.handler=function(ctx){let hdl;for(let h of g2.handler.factory)if((hdl=h(ctx))!==false)return hdl;return false};g2.handler.factory=[];g2.pntIterator={"x,y":function(pts){function pitr(i){return{x:pts[2*i],y:pts[2*i+1]}}Object.defineProperty(pitr,"len",{get:()=>pts.length/2,enumerable:true,configurable:true,writabel:false});return pitr},"[x,y]":function(pts){function pitr(i){return pts[i]?{x:pts[i][0],y:pts[i][1]}:undefined}Object.defineProperty(pitr,"len",{get:()=>pts.length,enumerable:true,configurable:true,writabel:false});return pitr},"{x,y}":function(pts){function pitr(i){return pts[i]}Object.defineProperty(pitr,"len",{get:()=>pts.length,enumerable:true,configurable:true,writabel:false});return pitr}};g2.pntItrOf=function(pts){return!(pts&&pts.length)?undefined:typeof pts[0]==="number"?g2.pntIterator["x,y"](pts):Array.isArray(pts[0])&&pts[0].length>=2?g2.pntIterator["[x,y]"](pts):typeof pts[0]==="object"&&"x"in pts[0]&&"y"in pts[0]?g2.pntIterator["{x,y}"](pts):undefined};g2.getCmdIdx=function(cmds,callbk){for(let i=cmds.length-1;i>=0;i--)if(callbk(cmds[i],i,cmds))return i;return false};g2.mixin=function mixin(obj,...protos){protos.forEach(p=>{Object.keys(p).forEach(k=>{Object.defineProperty(obj,k,Object.getOwnPropertyDescriptor(p,k))})});return obj};g2.cpyProp=function(from,fromKey,to,toKey){Object.defineProperty(to,toKey,Object.getOwnPropertyDescriptor(from,fromKey))};g2.canvasHdl=function(ctx){if(this instanceof g2.canvasHdl){if(ctx instanceof CanvasRenderingContext2D){this.ctx=ctx;this.cur=g2.defaultStyle;this.stack=[this.cur];this.matrix=[[1,0,0,1,.5,.5]];this.gridBase=2;this.gridExp=1;return this}else return null}return g2.canvasHdl.apply(Object.create(g2.canvasHdl.prototype),arguments)};g2.handler.factory.push(ctx=>ctx instanceof g2.canvasHdl?ctx:ctx instanceof CanvasRenderingContext2D?g2.canvasHdl(ctx):false);g2.canvasHdl.prototype={init(grp,style){this.stack.length=1;this.matrix.length=1;this.initStyle(style?Object.assign({},this.cur,style):this.cur);return true},async exe(commands){for(let cmd of commands){if(cmd.c&&this[cmd.c]){const rx=this[cmd.c](cmd.a);if(rx&&rx instanceof Promise){await rx}}else if(cmd.a&&"g2"in cmd.a)this.exe(cmd.a.g2().commands)}},view({x:x=0,y:y=0,scl:scl=1,cartesian:cartesian=false}){this.pushTrf(cartesian?[scl,0,0,-scl,x,this.ctx.canvas.height-1-y]:[scl,0,0,scl,x,y])},grid({color:color="#ccc",size:size}={}){let ctx=this.ctx,b=ctx.canvas.width,h=ctx.canvas.height,{x:x,y:y,scl:scl}=this.uniTrf,sz=size||this.gridSize(scl),xoff=x%sz,yoff=y%sz;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();for(let x=xoff,nx=b+1;x<nx;x+=sz){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(let y=yoff,ny=h+1;y<ny;y+=sz){ctx.moveTo(0,y);ctx.lineTo(b,y)}ctx.stroke();ctx.restore()},clr({b:b,h:h}={}){let ctx=this.ctx;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,b||ctx.canvas.width,h||ctx.canvas.height);ctx.restore()},cir({x:x=0,y:y=0,r:r}){this.ctx.beginPath();this.ctx.arc(x||0,y||0,Math.abs(r),0,2*Math.PI,true);this.drw(arguments[0])},arc({x:x=0,y:y=0,r:r,w:w=0,dw:dw=2*Math.PI}){if(Math.abs(dw)>Number.EPSILON&&Math.abs(r)>Number.EPSILON){this.ctx.beginPath();this.ctx.arc(x,y,Math.abs(r),w,w+dw,dw<0);this.drw(arguments[0])}else if(Math.abs(dw)<Number.EPSILON&&Math.abs(r)>Number.EPSILON){const cw=Math.cos(w),sw=Math.sin(w);this.ctx.beginPath();this.ctx.moveTo(x-r*cw,y-r*sw);this.ctx.lineTo(x+r*cw,y+r*sw)}},ell({x:x=0,y:y=0,rx:rx,ry:ry,w:w=0,dw:dw=2*Math.PI,rot:rot=0}){this.ctx.beginPath();this.ctx.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,w,w+dw,dw<0);this.drw(arguments[0])},rec({x:x=0,y:y=0,b:b,h:h}){let tmp=this.setStyle(arguments[0]);this.ctx.fillRect(x,y,b,h);this.ctx.strokeRect(x,y,b,h);this.resetStyle(tmp)},lin({x1:x1=0,y1:y1=0,x2:x2,y2:y2}){let ctx=this.ctx;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);this.stroke(arguments[0])},ply:function({pts:pts,closed:closed,x:x=0,y:y=0,w:w=0,_itr:_itr}){if(_itr&&_itr.len){let p,i,len=_itr.len,istrf=!!(x||y||w),cw,sw;if(istrf)this.setTrf([cw=w?Math.cos(w):1,sw=w?Math.sin(w):0,-sw,cw,x||0,y||0]);this.ctx.beginPath();this.ctx.moveTo((p=_itr(0)).x,p.y);for(i=1;i<len;i++)this.ctx.lineTo((p=_itr(i)).x,p.y);if(closed)this.ctx.closePath();this.drw(arguments[0]);if(istrf)this.resetTrf();return i-1}return 0},txt({str:str,x:x=0,y:y=0,w:w=0,unsizable:unsizable}){let tmp=this.setStyle(arguments[0]),sw=w?Math.sin(w):0,cw=w?Math.cos(w):1,trf=this.isCartesian?[cw,sw,sw,-cw,x,y]:[cw,sw,-sw,cw,x,y];this.setTrf(unsizable?this.concatTrf(this.unscaleTrf({x:x,y:y}),trf):trf);if(this.ctx.fillStyle==="rgba(0, 0, 0, 0)"){this.ctx.fillStyle=this.ctx.strokeStyle;tmp.fs="transparent"}this.ctx.fillText(str,0,0);this.resetTrf();this.resetStyle(tmp)},errorImageStr:"data:image/gif;base64,R0lGODlhHgAeAKIAAAAAmWZmmZnM/////8zMzGZmZgAAAAAAACwAAAAAHgAeAEADimi63P5ryAmEqHfqPRWfRQF+nEeeqImum0oJQxUThGaQ7hSs95ezvB4Q+BvihBSAclk6fgKiAkE0kE6RNqwkUBtMa1OpVlI0lsbmFjrdWbMH5Tdcu6wbf7J8YM9H4y0YAE0+dHVKIV0Efm5VGiEpY1A0UVMSBYtPGl1eNZhnEBGEck6jZ6WfoKmgCQA7",images:Object.create(null),async loadImage(uri){const download=async xuri=>{const pimg=new Promise((resolve,reject)=>{let img=new Image;img.src=xuri;function error(err){img.removeEventListener("load",load);img=undefined;reject(err)}function load(){img.removeEventListener("error",error);resolve(img);img=undefined}img.addEventListener("error",error,{once:true});img.addEventListener("load",load,{once:true})});try{return await pimg}catch(err){if(xuri===this.errorImageStr){throw err}else{return await download(this.errorImageStr)}}};let img=this.images[uri];if(img!==undefined){return img instanceof Promise?await img:img}img=download(uri);this.images[uri]=img;try{img=await img}finally{this.images[uri]=img}return img},async img({uri:uri,x:x=0,y:y=0,b:b,h:h,sx:sx=0,sy:sy=0,sb:sb,sh:sh,xoff:xoff=0,yoff:yoff=0,w:w=0,scl:scl=1}){const img_=await this.loadImage(uri);this.ctx.save();const cart=this.isCartesian?-1:1;sb=sb||img_.width;b=b||img_.width;sh=sh||img_.height;h=(h||img_.height)*cart;yoff*=cart;w*=cart;y=this.isCartesian?-(y/scl)+sy:y/scl;const[cw,sw]=[Math.cos(w),Math.sin(w)];this.ctx.scale(scl,scl*cart);this.ctx.transform(cw,sw,-sw,cw,x/scl,y);this.ctx.drawImage(img_,sx,sy,sb,sh,xoff,yoff,b,h);this.ctx.restore()},use({grp:grp}){this.beg(arguments[0]);this.exe(grp.commands);this.end()},beg({x:x=0,y:y=0,w:w=0,scl:scl=1,matrix:matrix,unsizable:unsizable}={}){let trf=matrix;if(!trf){let ssw,scw;ssw=w?Math.sin(w)*scl:0;scw=w?Math.cos(w)*scl:scl;trf=[scw,ssw,-ssw,scw,x,y]}this.pushStyle(arguments[0]);this.pushTrf(unsizable?this.concatTrf(this.unscaleTrf({x:x,y:y}),trf):trf)},end(){this.popTrf();this.popStyle()},p(){this.ctx.beginPath()},z(){this.ctx.closePath()},m({x:x,y:y}){this.ctx.moveTo(x,y)},l({x:x,y:y}){this.ctx.lineTo(x,y)},q({x:x,y:y,x1:x1,y1:y1}){this.ctx.quadraticCurveTo(x1,y1,x,y)},c({x:x,y:y,x1:x1,y1:y1,x2:x2,y2:y2}){this.ctx.bezierCurveTo(x1,y1,x2,y2,x,y)},a({x:x,y:y,dw:dw,k:k,phi:phi,_xp:_xp,_yp:_yp}){if(k===undefined)k=1;if(Math.abs(dw)>Number.EPSILON){if(k===1){let x12=x-_xp,y12=y-_yp;let tdw_2=Math.tan(dw/2),rx=(x12-y12/tdw_2)/2,ry=(y12+x12/tdw_2)/2,R=Math.hypot(rx,ry),w=Math.atan2(-ry,-rx);this.ctx.ellipse(_xp+rx,_yp+ry,R,R,0,w,w+dw,this.cartesian?dw>0:dw<0)}else{if(phi===undefined)phi=0;let x1=dw>0?_xp:x,y1=dw>0?_yp:y,x2=dw>0?x:_xp,y2=dw>0?y:_yp;let x12=x2-x1,y12=y2-y1,_dw=dw<0?dw:-dw;let cp=phi?Math.cos(phi):1,sp=phi?Math.sin(phi):0,dx=-x12*cp-y12*sp,dy=-x12*sp-y12*cp,sdw_2=Math.sin(_dw/2),R=Math.sqrt((dx*dx+dy*dy/(k*k))/(4*sdw_2*sdw_2)),w=Math.atan2(k*dx,dy)-_dw/2,x0=x1-R*Math.cos(w),y0=y1-R*k*Math.sin(w);this.ctx.ellipse(x0,y0,R,R*k,phi,w,w+dw,this.cartesian?dw>0:dw<0)}}else this.ctx.lineTo(x,y)},stroke({d:d}={}){let tmp=this.setStyle(arguments[0]);d?this.ctx.stroke(new Path2D(d)):this.ctx.stroke();this.resetStyle(tmp)},fill({d:d}={}){let tmp=this.setStyle(arguments[0]);d?this.ctx.fill(new Path2D(d)):this.ctx.fill();this.resetStyle(tmp)},drw({d:d,lsh:lsh}={}){let ctx=this.ctx,tmp=this.setStyle(arguments[0]),p=d&&new Path2D(d);d?ctx.fill(p):ctx.fill();if(ctx.shadowColor!=="rgba(0, 0, 0, 0)"&&ctx.fillStyle!=="rgba(0, 0, 0, 0)"&&!lsh){let shc=ctx.shadowColor;ctx.shadowColor="rgba(0, 0, 0, 0)";d?ctx.stroke(p):ctx.stroke();ctx.shadowColor=shc}else d?ctx.stroke(p):ctx.stroke();this.resetStyle(tmp)},get:{fs:ctx=>ctx.fillStyle,ls:ctx=>ctx.strokeStyle,lw:ctx=>ctx.lineWidth,lc:ctx=>ctx.lineCap,lj:ctx=>ctx.lineJoin,ld:ctx=>ctx.getLineDash(),ml:ctx=>ctx.miterLimit,sh:ctx=>[ctx.shadowOffsetX||0,ctx.shadowOffsetY||0,ctx.shadowBlur||0,ctx.shadowColor||"black"],font:ctx=>ctx.font,thal:ctx=>ctx.textAlign,tval:ctx=>ctx.textBaseline},set:{fs:(ctx,q)=>{ctx.fillStyle=q},ls:(ctx,q)=>{ctx.strokeStyle=q},lw:(ctx,q)=>{ctx.lineWidth=q},lc:(ctx,q)=>{ctx.lineCap=q},lj:(ctx,q)=>{ctx.lineJoin=q},ld:(ctx,q)=>{ctx.setLineDash(q)},ml:(ctx,q)=>{ctx.miterLimit=q},sh:(ctx,q)=>{if(q){ctx.shadowOffsetX=q[0]||0;ctx.shadowOffsetY=q[1]||0;ctx.shadowBlur=q[2]||0;ctx.shadowColor=q[3]||"black"}},font:(ctx,q)=>{ctx.font=q},thal:(ctx,q)=>{ctx.textAlign=q},tval:(ctx,q)=>{ctx.textBaseline=q}},initStyle(style){for(const key in style)if(this.get[key]&&this.get[key](this.ctx)!==style[key])this.set[key](this.ctx,style[key])},setStyle(style){let q,prv={};for(const key in style){if(this.get[key]){if(typeof style[key]==="string"&&style[key][0]==="@"){let ref=style[key].substr(1);style[key]=g2.symbol[ref]||this.get[ref]&&this.get[ref](this.ctx)}if((q=this.get[key](this.ctx))!==style[key]){prv[key]=q;this.set[key](this.ctx,style[key])}}}return prv},resetStyle(style){for(const key in style)this.set[key](this.ctx,style[key])},pushStyle(style){let cur={};for(const key in style)if(this.get[key]){if(typeof style[key]==="string"&&style[key][0]==="@"){let ref=style[key].substr(1);style[key]=g2.symbol[ref]||this.get[ref]&&this.get[ref](this.ctx)}if(this.cur[key]!==style[key])this.set[key](this.ctx,cur[key]=style[key])}this.stack.push(this.cur=Object.assign({},this.cur,cur))},popStyle(){let cur=this.stack.pop();this.cur=this.stack[this.stack.length-1];for(const key in this.cur)if(this.get[key]&&this.cur[key]!==cur[key])this.set[key](this.ctx,this.cur[key])},concatTrf(q,t){return[q[0]*t[0]+q[2]*t[1],q[1]*t[0]+q[3]*t[1],q[0]*t[2]+q[2]*t[3],q[1]*t[2]+q[3]*t[3],q[0]*t[4]+q[2]*t[5]+q[4],q[1]*t[4]+q[3]*t[5]+q[5]]},initTrf(){this.ctx.setTransform(...this.matrix[0])},setTrf(t){this.ctx.setTransform(...this.concatTrf(this.matrix[this.matrix.length-1],t))},resetTrf(){this.ctx.setTransform(...this.matrix[this.matrix.length-1])},pushTrf(t){let q_t=this.concatTrf(this.matrix[this.matrix.length-1],t);this.matrix.push(q_t);this.ctx.setTransform(...q_t)},popTrf(){this.matrix.pop();this.ctx.setTransform(...this.matrix[this.matrix.length-1])},get isCartesian(){let m=this.matrix[this.matrix.length-1];return m[0]*m[3]-m[1]*m[2]<0},get uniTrf(){let m=this.matrix[this.matrix.length-1];return{x:m[4],y:m[5],scl:Math.hypot(m[0],m[1]),cartesian:m[0]*m[3]-m[1]*m[2]<0}},unscaleTrf({x:x,y:y}){let m=this.matrix[this.matrix.length-1],invscl=1/Math.hypot(m[0],m[1]);return[invscl,0,0,invscl,(1-invscl)*x,(1-invscl)*y]},gridSize(scl){let base=this.gridBase,exp=this.gridExp,sz;while((sz=scl*base*Math.pow(10,exp))<14||sz>35){if(sz<14){if(base==1)base=2;else if(base==2)base=5;else if(base==5){base=1;exp++}}else{if(base==1){base=5;exp--}else if(base==2)base=1;else if(base==5)base=2}}this.gridBase=base;this.gridExp=exp;return sz}};g2.zoomView=function({scl:scl,x:x,y:y}){return{scl:scl,x:(1-scl)*x,y:(1-scl)*y}};g2.render=function render(fn){function animate(t){if(fn(t))requestAnimationFrame(animate)}animate(performance.now())};if(typeof module!=="undefined")module.exports=g2;
/**
 * g2.lib (c) 2013-17 Stefan Goessner
 * geometric constants and higher functions
 * @license MIT License
 * @link https://github.com/goessner/g2
 */
"use strict";var g2=g2||{};g2=Object.assign(g2,{EPS:Number.EPSILON,PI:Math.PI,PI2:2*Math.PI,SQRT2:Math.SQRT2,SQRT2_2:Math.SQRT2/2,toPi2(w){return(w%g2.PI2+g2.PI2)%g2.PI2},toPi(w){return(w=(w%g2.PI2+g2.PI2)%g2.PI2)>g2.PI?w-g2.PI2:w},toArc:function(w,w0,dw){if(dw>g2.EPS||dw<-g2.EPS){if(w0>w&&w0+dw>g2.PI2)w0-=g2.PI2;else if(w0<w&&w0+dw<0)w0+=g2.PI2;return(w-w0)/dw}return 0},isPntOnLin({x:x,y:y},p1,p2,eps=Number.EPSILON){let dx=p2.x-p1.x,dy=p2.y-p1.y,dx2=x-p1.x,dy2=y-p1.y,dot=dx*dx2+dy*dy2,perp=dx*dy2-dy*dx2,len=Math.hypot(dx,dy),epslen=eps*len;return-epslen<perp&&perp<epslen&&-epslen<dot&&dot<len*(len+eps)},isPntOnCir({x:xp,y:yp},{x:x,y:y,r:r},eps=Number.EPSILON){let dx=xp-x,dy=yp-y,ddis=dx*dx+dy*dy-r*r,reps=eps*r;return-reps<ddis&&ddis<reps},isPntOnArc({x:xp,y:yp},{x:x,y:y,r:r,w:w,dw:dw},eps=Number.EPSILON){var dx=xp-x,dy=yp-y,dist=Math.hypot(dx,dy),mu=g2.toArc(g2.toPi2(Math.atan2(dy,dx)),g2.toPi2(w),dw);return r*Math.abs(dw)>eps&&Math.abs(dist-r)<eps&&mu>=0&&mu<=1},isPntOnPly({x:x,y:y},{pts:pts,closed:closed},eps=Number.EPSILON){for(var i=0,n=pts.length;i<(closed?n:n-1);i++)if(g2.isPntOnLin({x:x,y:y},pts[i],pts[(i+1)%n],eps))return true;return false},isPntOnBox({x:xp,y:yp},{x:x,y:y,b:b,h:h},eps=Number.EPSILON){var dx=x.p-x,dy=yp-y;return dx>=b-eps&&dx<=b+eps&&dy<=h+eps&&dy>=-h-eps||dx>=-b-eps&&dx<=b+eps&&dy<=h+eps&&dy>=h-eps||dx>=-b-eps&&dx<=-b+eps&&dy<=h+eps&&dy>=-h-eps||dx>=-b-eps&&dx<=b+eps&&dy<=-h+eps&&dy>=-h-eps},isPntInCir({x:xp,y:yp},{x:x,y:y,r:r}){return(x-xp)**2+(y-yp)**2<r*r},isPntInPly({x:x,y:y},{pts:pts,closed:closed},eps=Number.EPSILON){let match=0;for(let n=pts.length,i=0,pi=pts[i],pj=pts[n-1];i<n;pj=pi,pi=pts[++i])if((y>pi.y||y>pj.y)&&(y<=pi.y||y<=pj.y)&&(x<=pi.x||x<=pj.x)&&pi.y!==pj.y&&(pi.x===pj.x||x<=pj.x+(y-pj.y)*(pi.x-pj.x)/(pi.y-pj.y)))match++;return match%2!=0},isPntInBox({x:xp,y:yp},{x:x,y:y,b:b,h:h}){var dx=xp-x,dy=yp-y;return dx>=-b&&dx<=b&&dy>=-h&&dy<=h},arc3pts(x1,y1,x2,y2,x3,y3){const dx1=x2-x1,dy1=y2-y1;const dx2=x3-x2,dy2=y3-y2;const den=dx1*dy2-dy1*dx2;const lam=Math.abs(den)>Number.EPSILON?.5*((dx1+dx2)*dx2+(dy1+dy2)*dy2)/den:0;const x0=lam?x1+.5*dx1-lam*dy1:x1+.5*(dx1+dx2);const y0=lam?y1+.5*dy1+lam*dx1:y1+.5*(dy1+dy2);const dx01=x1-x0,dy01=y1-y0;const dx03=x3-x0,dy03=y3-y0;const dw=lam?Math.atan2(dx01*dy03-dy01*dx03,dx01*dx03+dy01*dy03):0;const r=dw?Math.hypot(dy01,dx01):.5*Math.hypot(dy1+dy2,dx1+dx2);return{x:x0,y:y0,r:r,w:Math.atan2(dy01,dx01),dw:dw}}});"use strict";
/**
 * g2.ext (c) 2015-18 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @typedef {g2}
 * @description Additional methods for g2.
 * @returns {g2}
 */var g2=g2||{prototype:{}};g2.NONE=0;g2.OVER=1;g2.DRAG=2;g2.EDIT=4;g2.prototype.lin.prototype={isSolid:false,get len(){return Math.hypot(this.x2-this.x1,this.y2-this.y1)},get sh(){return this.state&g2.OVER?[0,0,5,"black"]:false},pointAt(loc){let t=loc==="beg"?0:loc==="end"?1:loc+0===loc?loc:.5,dx=this.x2-this.x1,dy=this.y2-this.y1,len=Math.hypot(dx,dy);return{x:this.x1+dx*t,y:this.y1+dy*t,dx:len?dx/len:1,dy:len?dy/len:0}},hitContour({x:x,y:y,eps:eps}){return g2.isPntOnLin({x:x,y:y},{x:this.x1,y:this.y1},{x:this.x2,y:this.y2},eps)},drag({dx:dx,dy:dy}){this.x1+=dx;this.x2+=dx;this.y1+=dy;this.y2+=dy},handles(grp){grp.handle({x:this.x1,y:this.y1,_update:({dx:dx,dy:dy})=>{this.x1+=dx;this.y1+=dy}}).handle({x:this.x2,y:this.y2,_update:({dx:dx,dy:dy})=>{this.x2+=dx;this.y2+=dy}})}};g2.prototype.rec.prototype={_dir:{c:[0,0],e:[1,0],ne:[1,1],n:[0,1],nw:[-1,1],w:[-1,0],sw:[-1,-1],s:[0,-1],se:[1,-1]},get len(){return 2*(this.b+this.h)},get isSolid(){return this.fs&&this.fs!=="transparent"},get len(){return 2*Math.PI*this.r},get lsh(){return this.state&g2.OVER},get sh(){return this.state&g2.OVER?[0,0,5,"black"]:false},pointAt(loc){const q=this._dir[loc||"c"]||this._dir["c"],nx=q[0],ny=q[1];return{x:this.x+(1+nx)*this.b/2,y:this.y+(1+ny)*this.h/2,dx:-ny,dy:nx}},hitContour({x:x,y:y,eps:eps}){return g2.isPntOnBox({x:x,y:y},{x:this.x+this.b/2,y:this.y+this.h/2,b:this.b/2,h:this.h/2},eps)},hitInner({x:x,y:y,eps:eps}){return g2.isPntInBox({x:x,y:y},{x:this.x+this.b/2,y:this.y+this.h/2,b:this.b/2,h:this.h/2},eps)},drag({dx:dx,dy:dy}){this.x+=dx;this.y+=dy}};g2.prototype.cir.prototype={w:0,_dir:{c:[0,0],e:[1,0],ne:[Math.SQRT2/2,Math.SQRT2/2],n:[0,1],nw:[-Math.SQRT2/2,Math.SQRT2/2],w:[-1,0],sw:[-Math.SQRT2/2,-Math.SQRT2/2],s:[0,-1],se:[Math.SQRT2/2,-Math.SQRT2/2]},get isSolid(){return this.fs&&this.fs!=="transparent"},get len(){return 2*Math.PI*this.r},get lsh(){return this.state&g2.OVER},get sh(){return this.state&g2.OVER?[0,0,5,"black"]:false},pointAt(loc){let q=loc+0===loc?[Math.cos(loc*2*Math.PI),Math.sin(loc*2*Math.PI)]:this._dir[loc||"c"]||[0,0],nx=q[0],ny=q[1];return{x:this.x+nx*this.r,y:this.y+ny*this.r,dx:-ny,dy:nx}},hitContour({x:x,y:y,eps:eps}){return g2.isPntOnCir({x:x,y:y},this,eps)},hitInner({x:x,y:y,eps:eps}){return g2.isPntInCir({x:x,y:y},this,eps)},drag({dx:dx,dy:dy}){this.x+=dx;this.y+=dy},handles(grp){const p0={x:this.x,y:this.y,_update:({dx:dx,dy:dy})=>{this.x+=dx;this.y+=dy;p1.x+=dx;p1.y+=dy}};const p1={x:this.x+this.r*Math.cos(this.w||0),y:this.y+this.r*Math.sin(this.w||0),_info:()=>`r:${this.r.toFixed(1)}<br>w:${(this.w/Math.PI*180).toFixed(1)}°`,_update:({x:x,y:y})=>{this.r=Math.hypot(y-this.y,x-this.x);this.w=Math.atan2(y-this.y,x-this.x)}};grp.lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p1.x,y2:()=>p1.y,ld:[4,3],ls:"#666"}).handle(p0).handle(p1)}};g2.prototype.arc.prototype={get len(){return Math.abs(this.r*this.dw)},get angle(){return this.dw/Math.PI*180},pointAt(loc){let t=loc==="beg"?0:loc==="end"?1:loc==="mid"?.5:loc+0===loc?loc:.5,ang=this.w+t*this.dw,cang=Math.cos(ang),sang=Math.sin(ang),r=loc==="c"?0:this.r;return{x:this.x+r*cang,y:this.y+r*sang,dx:-sang,dy:cang}},isSolid:false,get sh(){return this.state&g2.OVER?[0,0,5,"black"]:false},hitContour({x:x,y:y,eps:eps}){return g2.isPntOnArc({x:x,y:y},this,eps)},drag({dx:dx,dy:dy}){this.x+=dx;this.y+=dy},handles(grp){const p0={x:this.x,y:this.y,_update:({dx:dx,dy:dy})=>{this.x+=dx;this.y+=dy;p1.x+=dx;p1.y+=dy;p2.x+=dx;p2.y+=dy}},p1={x:this.x+this.r*Math.cos(this.w),y:this.y+this.r*Math.sin(this.w),_info:()=>`r:${this.r.toFixed(1)}<br>w:${(this.w/Math.PI*180).toFixed(1)}°`,_update:({x:x,y:y})=>{this.r=Math.hypot(y-this.y,x-this.x);this.w=Math.atan2(y-this.y,x-this.x);p2.x=this.x+this.r*Math.cos(this.w+this.dw);p2.y=this.y+this.r*Math.sin(this.w+this.dw)}},dw=this.dw,p2={x:this.x+this.r*Math.cos(this.w+this.dw),y:this.y+this.r*Math.sin(this.w+this.dw),_info:()=>`dw:${(this.dw/Math.PI*180).toFixed(1)}°`,_update:({x:x,y:y})=>{let lam=g2.toArc(g2.toPi2(Math.atan2(y-this.y,x-this.x)),g2.toPi2(this.w),dw);this.dw=lam*dw}};if(this.w===undefined)this.w=0;grp.lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p1.x,y2:()=>p1.y,ld:[4,3],ls:"#666"}).lin({x1:()=>this.x,y1:()=>this.y,x2:()=>p2.x,y2:()=>p2.y,ld:[4,3],ls:"#666"}).handle(p0).handle(p1).handle(p2)}};g2.prototype.ply.prototype={get isSolid(){return this.closed&&this.fs&&this.fs!=="transparent"},get sh(){return this.state&g2.OVER?[0,0,5,"black"]:false},pointAt(loc){const t=loc==="beg"?0:loc==="end"?1:loc+0===loc?loc:.5,pitr=g2.pntItrOf(this.pts),pts=[],len=[];for(let itr=0;itr<pitr.len;itr++){const next=pitr(itr+1)?pitr(itr+1):pitr(0);if(itr===pitr.len-1&&this.closed||itr<pitr.len-1){pts.push(pitr(itr));len.push(Math.hypot(next.x-pitr(itr).x,next.y-pitr(itr).y))}}const{t2:t2,x:x,y:y,dx:dx,dy:dy}=(()=>{const target=t*len.reduce((a,b)=>a+b);let tmp=0;for(let itr=0;itr<pts.length;itr++){tmp+=len[itr];const next=pitr(itr+1).x?pitr(itr+1):pitr(0);if(tmp>=target){return{t2:1-(tmp-target)/len[itr],x:pts[itr].x,y:pts[itr].y,dx:next.x-pts[itr].x,dy:next.y-pts[itr].y}}}})();const len2=Math.hypot(dx,dy);return{x:x+dx*t2,y:y+dy*t2,dx:len2?dx/len2:1,dy:len2?dy/len2:0}},x:0,y:0,hitContour({x:x,y:y,eps:eps}){let p={x:x-this.x,y:y-this.y};return g2.isPntOnPly(p,this,eps)},hitInner({x:x,y:y,eps:eps}){let p={x:x-this.x,y:y-this.y};return g2.isPntInPly(p,this,eps)},drag({dx:dx,dy:dy}){this.x+=dx;this.y+=dy},handles(grp){let p,slf=this;for(let n=this._itr.len,i=0;i<n;i++)grp.handle({x:(p=this._itr(i)).x+this.x,y:p.y+this.y,i:i,_update({dx:dx,dy:dy}){let p=slf._itr(this.i);p.x+=dx;p.y+=dy}})}};g2.prototype.use.prototype={_dir:g2.prototype.cir.prototype._dir,r:5,pointAt:g2.prototype.cir.prototype.pointAt};g2.prototype.spline=function spline({pts:pts,closed:closed,x:x,y:y,w:w}){arguments[0]._itr=g2.pntItrOf(pts);return this.addCommand({c:"spline",a:arguments[0]})};g2.prototype.spline.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2:function(){let{pts:pts,closed:closed,x:x,y:y,w:w,ls:ls,lw:lw,fs:fs,sh:sh}=this,itr=this._itr,gbez;if(itr){let b=[],i,n=itr.len,p1,p2,p3,p4,d1,d2,d3,d1d2,d2d3,scl2,scl3,den2,den3,istrf=x||y||w;gbez=g2();if(istrf)gbez.beg({x:x,y:y,w:w});gbez.p().m(itr(0));for(let i=0;i<(closed?n:n-1);i++){if(i===0){p1=closed?itr(n-1):{x:2*itr(0).x-itr(1).x,y:2*itr(0).y-itr(1).y};p2=itr(0);p3=itr(1);p4=n===2?closed?itr(0):{x:2*itr(1).x-itr(0).x,y:2*itr(1).y-itr(0).y}:itr(2);d1=Math.max(Math.hypot(p2.x-p1.x,p2.y-p1.y),Number.EPSILON);d2=Math.max(Math.hypot(p3.x-p2.x,p3.y-p2.y),Number.EPSILON)}else{p1=p2;p2=p3;p3=p4;p4=i===n-2?closed?itr(0):{x:2*itr(n-1).x-itr(n-2).x,y:2*itr(n-1).y-itr(n-2).y}:i===n-1?itr(1):itr(i+2);d1=d2;d2=d3}d3=Math.max(Math.hypot(p4.x-p3.x,p4.y-p3.y),Number.EPSILON);d1d2=Math.sqrt(d1*d2),d2d3=Math.sqrt(d2*d3),scl2=2*d1+3*d1d2+d2,scl3=2*d3+3*d2d3+d2,den2=3*(d1+d1d2),den3=3*(d3+d2d3);gbez.c({x:p3.x,y:p3.y,x1:(-d2*p1.x+scl2*p2.x+d1*p3.x)/den2,y1:(-d2*p1.y+scl2*p2.y+d1*p3.y)/den2,x2:(-d2*p4.x+scl3*p3.x+d3*p2.x)/den3,y2:(-d2*p4.y+scl3*p3.y+d3*p2.y)/den3})}gbez.c(closed?{x:itr(0).x,y:itr(0).y}:{x:itr(n-1).x,y:itr(n-1).y});if(closed)gbez.z();gbez.drw({ls:ls,lw:lw,fs:fs,sh:sh});if(istrf)gbez.end()}return gbez}});g2.prototype.label=function label({str:str,loc:loc,off:off,fs:fs,font:font,fs2:fs2}){let idx=g2.getCmdIdx(this.commands,cmd=>{return cmd.a&&"pointAt"in cmd.a});if(idx!==undefined){arguments[0]["_refelem"]=this.commands[idx];this.addCommand({c:"label",a:arguments[0]})}return this};g2.prototype.label.prototype={g2(){let label=g2();if(this._refelem){let{str:str,loc:loc,off:off,fs:fs,font:font,border:border,fs2:fs2}=this,p=this._refelem.a.pointAt(loc),tanlen=p.dx*p.dx||p.dy*p.dy;let h=parseInt(font||g2.defaultStyle.font),diag,phi,n;if(str[0]==="@"&&(s=this._refelem.a[str.substr(1)])!==undefined)str=""+(Number.isInteger(+s)?+s:Number(s).toFixed(Math.max(g2.symbol.labelSignificantDigits-Math.log10(s),0)))+(str.substr(1)==="angle"?"°":"");n=str.length;if(tanlen>Number.EPSILON){diag=Math.hypot(p.dx,n*p.dy);off=off===undefined?1:off;p.x+=tanlen*p.dy*(off+n*n*.8*h/2/diag*Math.sign(off));p.y+=tanlen*p.dx*(-off-h/2/diag*Math.sign(off))}fs=fs||"black";if(border)label.ell({x:p.x,y:p.y,rx:n*.8*h/2+2,ry:h/2+2,ls:fs||"black",fs:fs2||"#ffc"});label.txt({str:str,x:p.x,y:p.y,thal:"center",tval:"middle",fs:fs||"black",font:font})}return label}};g2.prototype.mark=function mark({mrk:mrk,loc:loc,dir:dir,fs:fs,ls:ls}){let idx=g2.getCmdIdx(this.commands,cmd=>{return cmd.a&&"pointAt"in cmd.a});if(idx!==undefined){arguments[0]["_refelem"]=this.commands[idx];this.addCommand({c:"mark",a:arguments[0]})}return this};g2.prototype.mark.prototype={markAt(elem,loc,mrk,dir,ls,fs){const p=elem.pointAt(loc),w=dir<0?Math.atan2(-p.dy,-p.dx):dir>0||dir===undefined?Math.atan2(p.dy,p.dx):0;return{grp:mrk,x:p.x,y:p.y,w:w,scl:elem.lw||1,ls:ls||elem.ls||"black",fs:fs||ls||elem.ls||"black"}},g2(){let{mrk:mrk,loc:loc,dir:dir,fs:fs,ls:ls}=this,elem=this._refelem.a,marks=g2();if(Array.isArray(loc))for(let l of loc)marks.use(this.markAt(elem,l,mrk,dir,ls,fs));else marks.use(this.markAt(elem,loc,mrk,dir,ls,fs));return marks}};g2.symbol=g2.symbol||{};g2.symbol.tick=g2().p().m({x:0,y:-2}).l({x:0,y:2}).stroke({lc:"round",lwnosc:true});g2.symbol.dot=g2().cir({x:0,y:0,r:2,ls:"transparent"});g2.symbol.sqr=g2().rec({x:-1.5,y:-1.5,b:3,h:3,ls:"transparent"});g2.symbol.nodcolor="#333";g2.symbol.nodfill="#dedede";g2.symbol.nodfill2="#aeaeae";g2.symbol.linkcolor="#666";g2.symbol.linkfill="rgba(225,225,225,0.75)";g2.symbol.dimcolor="darkslategray";g2.symbol.solid=[];g2.symbol.dash=[15,10];g2.symbol.dot=[4,4];g2.symbol.dashdot=[25,6.5,2,6.5];g2.symbol.labelSignificantDigits=3;"use strict";
/**
 * g2.mec (c) 2013-18 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @requires g2.ext.js
 * @typedef {g2}
 * @description Mechanical extensions. (Requires cartesian coordinates)
 * @returns {g2}
 */var g2=g2||{prototype:{}};g2.prototype.skip=function skip(tag){if(this.cmds.length)this.cmds[this.cmds.length-1].skip=tag;return this};g2.prototype.dim=function dim({}){return this.addCommand({c:"dim",a:arguments[0]})};g2.prototype.dim.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({lw:1,w:0,lc:"round",lj:"round",off:0,over:0,inside:true,fs:"#000"},this);const dx=args.x2-args.x1,dy=args.y2-args.y1,len=Math.hypot(dx,dy);args.fixed=args.fixed||len/2;const over=args.off>0?Math.abs(args.over):-Math.abs(args.over);const w=Math.atan2(dy,dx);return g2().beg({x:args.x1-args.off*Math.sin(w),y:args.y1+args.off*Math.cos(w),w:w}).vec({x1:args.inside?1:-25,y1:0,x2:0,y2:0,fixed:args.fixed,fs:args.fs,ls:args.ls,lw:args.lw}).vec({x1:args.inside?0:len+25,y1:0,x2:args.inside?len:len,y2:0,fixed:args.fixed,fs:args.fs,ls:args.ls,lw:args.lw}).ins(g=>{if(!args.inside){g.lin({x1:0,y1:0,x2:len,y2:0,fs:args.fs,ls:args.ls,lw:args.lw})}}).end().ins(g=>{if(!!args.off)g.lin({x1:args.x1,y1:args.y1,x2:args.x1-(over+args.off)*Math.sin(w),y2:args.y1+(over+args.off)*Math.cos(w),lw:args.lw/2,lw:args.lw/2,ls:args.ls,fs:args.fs}).lin({x1:args.x1+Math.cos(w)*len,y1:args.y1+Math.sin(w)*len,x2:args.x1+Math.cos(w)*len-(over+args.off)*Math.sin(w),y2:args.y1+Math.sin(w)*len+(over+args.off)*Math.cos(w),lw:args.lw/2,ls:args.ls,fs:args.fs})})}});g2.prototype.adim=function adim({}){return this.addCommand({c:"adim",a:arguments[0]})};g2.prototype.adim.prototype=g2.mixin({},g2.prototype.arc.prototype,{g2(){const args=Object.assign({lw:1,w:0,lc:"round",lj:"round",inside:true,fs:"#000"},this);return g2().beg({x:args.x,y:args.y,w:args.w}).arc({x:0,y:0,r:args.r,w:0,dw:args.dw,ls:args.ls,lw:args.lw}).vec({x1:args.inside?args.r-.15:args.r-3.708,y1:args.inside?1:24.723,x2:args.r,y2:0,fs:args.fs,ls:args.ls,lw:args.lw,fixed:30}).lin({x1:args.r-3.5,y1:0,x2:args.r+3.5,y2:0,fs:args.fs,ls:args.ls,lw:args.lw}).end().beg({x:args.x,y:args.y,w:args.w+args.dw}).vec({x1:args.inside?args.r-.15:args.r-3.708,y1:args.inside?-1:-24.723,x2:args.r,y2:0,fs:args.fs,ls:args.ls,lw:args.lw,fixed:30}).lin({x1:args.r-3.5,y1:0,x2:args.r+3.5,y2:0,fs:args.fs,ls:args.ls,lw:args.lw}).end()}});g2.prototype.vec=function vec({}){return this.addCommand({c:"vec",a:arguments[0]})};g2.prototype.vec.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({ls:"#000",fs:"@ls",lc:"round",lj:"round",lw:1,fixed:undefined},this);const dx=args.x2-args.x1,dy=args.y2-args.y1,r=Math.hypot(dx,dy);let z=args.head||2+args.lw;const z2=(args.fixed||r)/10;z=z>z2?z2:z;return g2().beg(Object.assign({},args,{x:args.x1,y:args.y1,w:Math.atan2(dy,dx)})).p().m({x:0,y:0}).l({x:r,y:0}).stroke({ls:args.ls}).p().m({x:r,y:0}).l({x:r-5*z,y:z}).a({dw:-Math.PI/3,x:r-5*z,y:-z}).z().drw({ls:args.ls,fs:args.fs}).end()}});g2.prototype.slider=function(){return this.addCommand({c:"slider",a:arguments[0]})};g2.prototype.slider.prototype=g2.mixin({},g2.prototype.rec.prototype,{g2(){const args=Object.assign({b:32,h:16,fs:"@linkfill"},this);return g2().beg({x:args.x,y:args.y,w:args.w,fs:args.fs}).rec({x:-args.b/2,y:-args.h/2,b:args.b,h:args.h}).end()}});g2.prototype.spring=function(){return this.addCommand({c:"spring",a:arguments[0]})};g2.prototype.spring.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({h:16},this);const len=Math.hypot(args.x2-args.x1,args.y2-args.y1);const xm=(args.x2+args.x1)/2;const ym=(args.y2+args.y1)/2;const h=args.h;const ux=(args.x2-args.x1)/len;const uy=(args.y2-args.y1)/len;return g2().p().m({x:args.x1,y:args.y1}).l({x:xm-ux*h/2,y:ym-uy*h/2}).l({x:xm+(-ux/6+uy/2)*h,y:ym+(-uy/6-ux/2)*h}).l({x:xm+(ux/6-uy/2)*h,y:ym+(uy/6+ux/2)*h}).l({x:xm+ux*h/2,y:ym+uy*h/2}).l({x:args.x2,y:args.y2}).stroke(Object.assign({},{ls:"@nodcolor"},this,{fs:"transparent",lc:"round",lj:"round"}))}});g2.prototype.damper=function(){return this.addCommand({c:"damper",a:arguments[0]})};g2.prototype.damper.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({h:16},this);const len=Math.hypot(args.x2-args.x1,args.y2-args.y1);const xm=(args.x2+args.x1)/2;const ym=(args.y2+args.y1)/2;const h=args.h;const ux=(args.x2-args.x1)/len;const uy=(args.y2-args.y1)/len;return g2().p().m({x:args.x1,y:args.y1}).l({x:xm-ux*h/2,y:ym-uy*h/2}).m({x:xm+(ux-uy)*h/2,y:ym+(uy+ux)*h/2}).l({x:xm+(-ux-uy)*h/2,y:ym+(-uy+ux)*h/2}).l({x:xm+(-ux+uy)*h/2,y:ym+(-uy-ux)*h/2}).l({x:xm+(ux+uy)*h/2,y:ym+(uy-ux)*h/2}).m({x:xm,y:ym}).l({x:args.x2,y:args.y2}).stroke(Object.assign({},{ls:"@nodcolor"},this,{fs:"transparent",lc:"round",lj:"round"}))}});g2.prototype.link=function(){return this.addCommand({c:"link",a:arguments[0]})};g2.prototype.link.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){const args=Object.assign({ls:"@linkcolor",fs:"transparent"},this);return g2().ply(Object.assign({},this,{closed:true,ls:args.ls,fs:args.fs,lw:7,lc:"round",lj:"round"}))}});g2.prototype.link2=function(){return this.addCommand({c:"link2",a:arguments[0]})};g2.prototype.link2.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){return g2().ply(Object.assign({closed:true,ls:"@nodcolor",fs:"transparent",lw:7,lc:"round",lj:"round"},this)).ply(Object.assign({closed:true,ls:"@nodfill2",fs:"transparent",lw:4.5,lc:"round",lj:"round"},this)).ply(Object.assign({closed:true,ls:"@nodfill",fs:"transparent",lw:2,lc:"round",lj:"round"},this))}});g2.prototype.beam=function(){return this.addCommand({c:"beam",a:arguments[0]})};g2.prototype.beam.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){return g2().ply(Object.assign({closed:false,ls:"@linkcolor",fs:"transparent",lw:7,lc:"round",lj:"round"},this))}});g2.prototype.beam2=function(){return this.addCommand({c:"beam2",a:arguments[0]})};g2.prototype.beam2.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){return g2().ply(Object.assign({closed:false,ls:"@nodcolor",fs:"transparent",lw:7,lc:"round",lj:"round"},this)).ply(Object.assign({closed:false,ls:"@nodfill2",fs:"transparent",lw:4.5,lc:"round",lj:"round"},this)).ply(Object.assign({closed:false,ls:"@nodfill",fs:"transparent",lw:2,lc:"round",lj:"round"},this))}});g2.prototype.bar=function(){return this.addCommand({c:"bar",a:arguments[0]})};g2.prototype.bar.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){return g2().lin(Object.assign({ls:"@linkcolor",lw:6,lc:"round"},this))}});g2.prototype.bar2=function(){return this.addCommand({c:"bar2",a:arguments[0]})};g2.prototype.bar2.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({},this);return g2().lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:"@nodcolor",lw:7,lc:"round"}).lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:"@nodfill2",lw:4.5,lc:"round"}).lin({x1:args.x1,y1:args.y1,x2:args.x2,y2:args.y2,ls:"@nodfill",lw:2,lc:"round"})}});g2.prototype.pulley=function(){return this.addCommand({c:"pulley",a:arguments[0]})};g2.prototype.pulley.prototype=g2.mixin({},g2.prototype.cir.prototype,{g2(){const args=Object.assign({},this);return g2().beg({x:args.x,y:args.y,w:args.w}).cir({x:0,y:0,r:args.r,ls:"@nodcolor",fs:"#e6e6e6",lw:1}).cir({x:0,y:0,r:args.r-5,ls:"@nodcolor",fs:"#e6e6e6",lw:1}).cir({x:0,y:0,r:args.r-6,ls:"#8e8e8e",fs:"transparent",lw:2}).cir({x:0,y:0,r:args.r-8,ls:"#aeaeae",fs:"transparent",lw:2}).cir({x:0,y:0,r:args.r-10,ls:"#cecece",fs:"transparent",lw:2}).end()}});g2.prototype.pulley2=function(){return this.addCommand({c:"pulley2",a:arguments[0]})};g2.prototype.pulley2.prototype=g2.mixin({},g2.prototype.cir.prototype,{g2(){const args=Object.assign({},this);return g2().beg({x:args.x,y:args.y,w:args.w}).bar2({x1:0,y1:-args.r+4,x2:0,y2:args.r-4}).bar2({x1:-args.r+4,y1:0,x2:args.r-4,y2:0}).cir({x:0,y:0,r:args.r-2.5,ls:"#e6e6e6",fs:"transparent",lw:5}).cir({x:0,y:0,r:args.r,ls:"@nodcolor",fs:"transparent",lw:1}).cir({x:0,y:0,r:args.r-5,ls:"@nodcolor",fs:"transparent",lw:1}).end()}});g2.prototype.rope=function(){return this.addCommand({c:"rope",a:arguments[0]})};g2.prototype.rope.prototype=g2.mixin({},g2.prototype.lin.prototype,{g2(){const args=Object.assign({w:0},this);let x1="p1"in args?args.p1.x:"x1"in args?args.x1:"x"in args?args.x:0;let y1="p1"in args?args.p1.y:"y1"in args?args.y1:"y"in args?args.y:0;let x2="p2"in args?args.p2.x:"x2"in args?args.x2:"dx"in args?x1+args.dx:"r"in args?x1+args.r*Math.cos(args.w):x1+10;let y2="p2"in args?args.p2.y:"y2"in args?args.y2:"dy"in args?y1+args.dy:"r"in args?y1+args.r*Math.sin(args.w):y1;let Rmin=10;let R1=args.r1>Rmin?args.r1-2.5:args.r1<-Rmin?args.r1+2.5:0;let R2=args.r2>Rmin?args.r2-2.5:args.r2<Rmin?args.r2+2.5:0;let dx=x2-x1,dy=y2-y1,dd=dx**2+dy**2;let R12=R1+R2,l=Math.sqrt(dd-R12**2);let cpsi=(R12*dx+l*dy)/dd;let spsi=(R12*dy-l*dx)/dd;x1=x1+cpsi*R1,y1=y1+spsi*R1,x2=x2-cpsi*R2,y2=y2-spsi*R2;return g2().lin({x1:x1,x2:x2,y1:y1,y2:y2,ls:"#888",lw:4})}});g2.prototype.ground=function(){return this.addCommand({c:"ground",a:arguments[0]})};g2.prototype.ground.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){const args=Object.assign({h:4},this);const itr=g2.pntItrOf(args.pts);let pn,en,lam,i;let pp=itr(i=0);let p0=pp;let h=args.h;let p=itr(++i);let dx=p.x-pp.x;let dy=p.y-pp.y;let len=Math.hypot(dx,dy)||1;let ep={x:dx/len,y:dy/len};let e0=ep;let eq=[p0];let sign=args.pos==="left"?1:-1;for(pn=itr(++i);i<itr.len;pn=itr(++i)){dx=pn.x-p.x;dy=pn.y-p.y;len=Math.hypot(dx,dy)||1;len=Math.hypot(dx,dy)||1;en={x:dx/len,y:dy/len};lam=(1-en.x*ep.x-en.y*ep.y)/(ep.y*en.x-ep.x*en.y);eq.push({x:p.x+sign*(h+1)*(lam*ep.x-ep.y),y:p.y+sign*(h+1)*(lam*ep.y+ep.x)});ep=en;pp=p;p=pn}if(args.closed){dx=p0.x-p.x;dy=p0.y-p.y;len=Math.hypot(dx,dy)||1;en={x:dx/len,y:dy/len};lam=(1-en.x*ep.x-en.y*ep.y)/(ep.y*en.x-ep.x*en.y);eq.push({x:p.x+sign*(h+1)*(lam*ep.x-ep.y),y:p.y+sign*(h+1)*(lam*ep.y+ep.x)});lam=(1-e0.x*en.x-e0.y*en.y)/(en.y*e0.x-en.x*e0.y);eq[0]={x:p0.x+sign*(h+1)*(-lam*e0.x-e0.y),y:p0.y+sign*(h+1)*(-lam*e0.y+e0.x)}}else{eq[0]={x:p0.x-sign*(h+1)*e0.y,y:p0.y+sign*(h+1)*e0.x};eq.push({x:p.x-sign*(h+1)*ep.y,y:p.y+sign*(h+1)*ep.x})}return g2().beg({x:-.5,y:-.5,ls:"@linkcolor",lw:2,fs:"transparent",lc:"butt",lj:"miter"}).ply(Object.assign({},args,{pts:eq,ls:"@nodfill2",lw:2*h})).ply(Object.assign({},args)).end()}});g2.prototype.load=function(){return this.addCommand({c:"load",a:arguments[0]})};g2.prototype.load.prototype=g2.mixin({},g2.prototype.ply.prototype,{g2(){const args=Object.assign({pointAt:this.pointAt,spacing:20,w:-Math.PI/2},this);const pitr=g2.pntItrOf(args.pts),startLoc=[],arr=[];let arrLen=0;for(let itr=0;itr<pitr.len;itr++){arr.push(pitr(itr))}if(arr[arr.length-1]!==arr[0]){arr.push(arr[0])}for(let itr=1;itr<arr.length;itr++){arrLen+=Math.hypot(arr[itr].y-arr[itr-1].y,arr[itr].x-arr[itr-1].x)}for(let itr=0;itr*args.spacing<arrLen;itr++){startLoc.push(itr*args.spacing/arrLen)}args.pts=arr;function isPntInPly({x:x,y:y}){let match=0;for(let n=arr.length,i=0,pi=arr[i],pj=arr[n-1];i<n;pj=pi,pi=arr[++i]){if((y>=pi.y||y>=pj.y)&&(y<=pi.y||y<=pj.y)&&(x<=pi.x||x<=pj.x)&&pi.y!==pj.y&&(pi.x===pj.x||x<=pj.x+(y-pj.y)*(pi.x-pj.x)/(pi.y-pj.y))){match++}}return match%2!=0}return g2().ply({pts:args.pts,closed:true,ls:"transparent",fs:"@linkfill"}).ins(g=>{for(const pts of startLoc){let dist=10*args.lw||10;const{x:x,y:y}=args.pointAt(pts),t={x:x+Math.cos(args.w)*dist,y:y+Math.sin(args.w)*dist};if(isPntInPly(t,{pts:arr})){while(isPntInPly(t,{pts:arr})){dist++;t.x=x+Math.cos(args.w)*dist,t.y=y+Math.sin(args.w)*dist}g.vec({x1:x,y1:y,x2:t.x,y2:t.y,ls:args.ls||"darkred",lw:args.lw||1})}}})}});g2.prototype.pol=function(){return this.addCommand({c:"pol",a:arguments[0]||{}})};g2.prototype.pol.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).cir({r:6,fs:"@nodfill"}).cir({r:2.5,fs:"@ls",ls:"transparent"}).end()}});g2.prototype.gnd=function(){return this.addCommand({c:"gnd",a:arguments[0]||{}})};g2.prototype.gnd.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).cir({x:0,y:0,r:6,ls:"@nodcolor",fs:"@nodfill",lwnosc:true}).p().m({x:0,y:6}).a({dw:Math.PI/2,x:-6,y:0}).l({x:6,y:0}).a({dw:-Math.PI/2,x:0,y:-6}).z().fill({fs:"@nodcolor"}).end()}});g2.prototype.nod=function(){return this.addCommand({c:"nod",a:arguments[0]||{}})};g2.prototype.nod.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).cir({r:4,ls:"@nodcolor",fs:"@nodfill",lwnosc:true}).end()}});g2.prototype.dblnod=function(){return this.addCommand({c:"dblnod",a:arguments[0]||{}})};g2.prototype.dblnod.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).cir({r:6,ls:"@nodcolor",fs:"@nodfill"}).cir({r:3,ls:"@nodcolor",fs:"@nodfill2",lwnosc:true}).end()}});g2.prototype.nodfix=function(){return this.addCommand({c:"nodfix",a:arguments[0]||{}})};g2.prototype.nodfix.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).p().m({x:-8,y:-12}).l({x:0,y:0}).l({x:8,y:-12}).drw({ls:"@nodcolor",fs:"@nodfill2"}).cir({x:0,y:0,r:4,ls:"@nodcolor",fs:"@nodfill"}).end()}});g2.prototype.nodflt=function(){return this.addCommand({c:"nodflt",a:arguments[0]||{}})};g2.prototype.nodflt.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w}).p().m({x:-8,y:-12}).l({x:0,y:0}).l({x:8,y:-12}).drw({ls:"@nodcolor",fs:"@nodfill2"}).cir({x:0,y:0,r:4,ls:"@nodcolor",fs:"@nodfill"}).lin({x1:-9,y1:-19,x2:9,y2:-19,ls:"@nodfill2",lw:5,lwnosc:false}).lin({x1:-9,y1:-15.5,x2:9,y2:-15.5,ls:"@nodcolor",lw:2,lwnosc:false}).end()}});g2.prototype.origin=function(){return this.addCommand({c:"origin",a:arguments[0]||{}})};g2.prototype.origin.prototype=g2.mixin({},g2.prototype.use.prototype,{g2(){const args=Object.assign({x:0,y:0,scl:1,w:0,z:3.5},this);return g2().beg({x:args.x,y:args.y,scl:args.scl,w:args.w,lc:"round",lj:"round",fs:"#ccc"}).vec({x1:0,y1:0,x2:10*args.z,y2:0,lw:.8,fs:"#ccc"}).vec({x1:0,y1:0,x2:0,y2:10*args.z,lw:.8,fs:"#ccc"}).cir({x:0,y:0,r:2.5,fs:"#ccc"}).end()}});g2.State=g2.State||{};g2.State.nodcolor="#333";g2.State.nodfill="#dedede";g2.State.nodfill2="#aeaeae";g2.State.linkcolor="#666";g2.State.linkfill="rgba(225,225,225,0.75)";g2.State.dimcolor="darkslategray";g2.State.solid=[];g2.State.dash=[15,10];g2.State.dot=[4,4];g2.State.dashdot=[25,6.5,2,6.5];g2.State.labelOffset=5;g2.State.labelSignificantDigits=3;"use strict";
/**
 * g2.chart (c) 2015-18 Stefan Goessner
 * @author Stefan Goessner
 * @license MIT License
 * @requires g2.core.js
 * @requires g2.ext.js
 * @typedef g2
 * @returns {object} chart
 * @param {object} args - Chart arguments object or
 * @property {float} x - x-position of lower left corner of chart rectangle.
 * @property {float} y - y-position of lower left corner of chart rectangle.
 * @property {float} [b=150] - width of chart rectangle.
 * @property {float} [h=100] - height of chart rectangle.
 * @property {string} [ls] - border color.
 * @property {string} [fs] - fill color.
 * @property {(string|object)} [title] - chart title.
 * @property {string} [title.text] - chart title text string.
 * @property {float} [title.offset=0] - chart title vertical offset.
 * @property {object} [title.style] - chart title style.
 * @property {string} [title.style.font=14px serif] - chart title font.
 * @property {string} [title.style.thal=center] - chart title horizontal align.
 * @property {string} [title.style.tval=bottom] - chart title vertical align.
 * @property {array} [funcs=[]] - array of dataset `data` and/or function `fn` objects.
 * @property {object} [funcs[item]] - dataset or function object.
 * @property {array} [funcs[item].data] - data points as flat array `[x,y,..]`, array of point arrays `[[x,y],..]` or array of point objects `[{x,y},..]`.
 * @property {function} [funcs[item].fn] - function `y = f(x)` recieving x-value returning y-value.
 * @property {float} [funcs[item].dx] - x increment to apply to function `fn`. Ignored with data points.
 * @property {boolean} [funcs[item].fill] - fill region between function graph and x-origin line.
 * @property {boolean} [funcs[item].dots] - place circular dots at data points (Avoid with `fn`s).
 * @property {boolean|object} [xaxis=false] - x-axis.
 * @property {boolean|object} [xaxis.grid=false] - x-axis grid lines.
 * @property {string} [xaxis.grid.ls] - x-axis grid line style (color).
 * @property {string} [xaxis.grid.lw] - x-axis grid line width.
 * @property {string} [xaxis.grid.ld] - x-axis grid line dash style.
 * @property {boolean} [xaxis.line=true] - display x-axis base line.
 * @property {boolean} [xaxis.origin=false] - display x-axis origin line.
 * @property {boolean|object} [yaxis=false] - y-axis.
 * @property {boolean|object} [yaxis.grid=false] - y-axis grid lines.
 * @property {string} [yaxis.grid.ls] - y-axis grid line style color.
 * @property {string} [yaxis.grid.lw] - y-axis grid line width.
 * @property {string} [yaxis.grid.ld] - y-axis grid line dash style.
 * @property {boolean} [yaxis.line=true] - display y-axis base line.
 * @property {boolean} [yaxis.origin=false] - display y-axis origin line.
 * @property {float} [xmin] - minimal x-axis value. If not given it is calculated from chart data values.
 * @property {float} [xmax] - maximal x-axis value. If not given it is calculated from chart data values.
 * @property {float} [ymin] - minimal y-axis value. If not given it is calculated from chart data values.
 * @property {float} [ymax] - maximal y-axis value. If not given it is calculated from chart data values.
 */g2.prototype.chart=function chart({x:x,y:y,b:b,h:h,style:style,title:title,funcs:funcs,xaxis:xaxis,xmin:xmin,xmax:xmax,yaxis:yaxis,ymin:ymin,ymax:ymax}){return this.addCommand({c:"chart",a:arguments[0]})};g2.prototype.chart.prototype={g2(){const g=g2(),funcs=this.get("funcs"),title=this.title&&this.get("title");if(!this.b)this.b=this.defaults.b;if(!this.h)this.h=this.defaults.h;if(funcs&&funcs.length){const tmp=[this.xmin===undefined,this.xmax===undefined,this.ymin===undefined,this.ymax===undefined];funcs.forEach(f=>this.initFunc(f,...tmp))}this.xAxis=this.autoAxis(this.get("xmin"),this.get("xmax"),0,this.b);this.yAxis=this.autoAxis(this.get("ymin"),this.get("ymax"),0,this.h);g.rec({x:this.x,y:this.y,b:this.b,h:this.h,fs:this.get("fs"),ls:this.get("ls")});g.beg(Object.assign({x:this.x,y:this.y,lw:1},this.defaults.style,this.style));if(title)g.txt(Object.assign({str:this.title&&this.title.text||this.title,x:this.get("b")/2,y:this.get("h")+this.get("title","offset"),w:0},this.defaults.title.style,this.title&&this.title.style||{}));if(this.xaxis)this.drawXAxis(g);if(this.yaxis)this.drawYAxis(g);g.end();if(funcs)funcs.forEach((fnc,i)=>{this.drawFunc(g,fnc,this.defaults.colors[i%this.defaults.colors.length])});return g},initFunc(fn,setXmin,setXmax,setYmin,setYmax){let itr;if(fn.data&&fn.data.length){itr=fn.itr=g2.pntItrOf(fn.data)}else if(fn.fn&&fn.dx){const xmin=+this.xmin||this.defaults.xmin;const xmax=+this.xmax||this.defaults.xmax;itr=fn.itr=(i=>{let x=xmin+i*fn.dx;return{x:x,y:fn.fn(x)}});itr.len=(xmax-xmin)/fn.dx+1}if(itr&&(setXmin||setXmax||setYmin||setYmax)){const xarr=[];const yarr=[];for(let i=0;i<itr.len;++i){xarr.push(itr(i).x);yarr.push(itr(i).y)}if(setXmin){const xmin=Math.min(...xarr);if(!this.xmin||xmin<this.xmin)this.xmin=xmin}if(setXmax){const xmax=Math.max(...xarr);if(!this.xmax||xmax>this.xmax)this.xmax=xmax}if(setYmin){const ymin=Math.min(...yarr);if(!this.ymin||ymin<this.ymin)this.ymin=ymin}if(setYmax){const ymax=Math.max(...yarr);if(!this.ymax||ymax>this.ymax)this.ymax=ymax}if(fn.color&&typeof fn.color==="number")fn.color=this.defaults.colors[fn.color%this.defaults.colors.length]}},autoAxis(zmin,zmax,tmin,tmax){let base=2,exp=1,eps=Math.sqrt(Number.EPSILON),Dz=zmax-zmin||1,Dt=tmax-tmin||1,scl=Dz>eps?Dt/Dz:1,dz=base*Math.pow(10,exp),dt=Math.floor(scl*dz),N,dt01,i0,j0,jth,t0,res;while(dt<14||dt>35){if(dt<14){if(base==1)base=2;else if(base==2)base=5;else if(base==5){base=1;exp++}}else{if(base==1){base=5;exp--}else if(base==2)base=1;else if(base==5)base=2}dz=base*Math.pow(10,exp);dt=scl*dz}i0=(scl*Math.abs(zmin)+eps/2)%dt<eps?Math.floor(zmin/dz):Math.floor(zmin/dz)+1;let z0=i0*dz;t0=Math.round(scl*(z0-zmin));N=Math.floor((Dt-t0)/dt)+1;j0=base%2&&i0%2?i0+1:i0;jth=exp===0&&N<11?1:base===2&&N>9?5:2;return{zmin:zmin,zmax:zmax,base:base,exp:exp,scl:scl,dt:dt,dz:dz,N:N,t0:t0,z0:z0,i0:i0,j0:j0,jth:jth,itr(i){return{t:this.t0+i*this.dt,z:parseFloat((this.z0+i*this.dz).toFixed(Math.abs(this.exp))),maj:(this.j0-this.i0+i)%this.jth===0}}}},drawXAxis(g){let tick,showgrid=this.xaxis&&this.xaxis.grid,gridstyle=showgrid&&Object.assign({},this.defaults.xaxis.grid,this.xaxis.grid),showaxis=this.xaxis||this.xAxis,axisstyle=showaxis&&Object.assign({},this.defaults.xaxis.style,this.defaults.xaxis.labels.style,this.xaxis&&this.xaxis.style||{}),showline=showaxis&&this.get("xaxis","line"),showlabels=this.xAxis&&showaxis&&this.get("xaxis","labels"),showticks=this.xAxis&&showaxis&&this.get("xaxis","ticks"),ticklen=showticks?this.get("xaxis","ticks","len"):0,showorigin=showaxis&&this.get("xaxis","origin"),title=this.xaxis&&(this.get("xaxis","title","text")||this.xaxis.title)||"";g.beg(axisstyle);for(let i=0;i<this.xAxis.N;i++){tick=this.xAxis.itr(i);if(showgrid)g.lin(Object.assign({x1:tick.t,y1:0,x2:tick.t,y2:this.h},gridstyle));if(showticks)g.lin({x1:tick.t,y1:tick.maj?ticklen:2/3*ticklen,x2:tick.t,y2:tick.maj?-ticklen:-2/3*ticklen});if(showlabels&&tick.maj)g.txt(Object.assign({str:parseFloat(tick.z),x:tick.t,y:-(this.get("xaxis","ticks","len")+this.get("xaxis","labels","offset")),w:0},this.get("xaxis","labels","style")||{}))}if(showline)g.lin({y1:0,y2:0,x1:0,x2:this.b});if(showorigin&&this.xmin<=0&&this.xmax>=0)g.lin({x1:-this.xAxis.zmin*this.xAxis.scl,y1:0,x2:-this.xAxis.zmin*this.xAxis.scl,y2:this.h});if(title)g.txt(Object.assign({str:title.text||title,x:this.b/2,y:-(this.get("xaxis","title","offset")+(showticks&&this.get("xaxis","ticks","len")||0)+(showlabels&&this.get("xaxis","labels","offset")||0)+(showlabels&&parseFloat(this.get("xaxis","labels","style","font"))||0)),w:0},this.get("xaxis","title","style")));g.end()},drawYAxis(g){let tick,showgrid=this.yaxis&&this.yaxis.grid,gridstyle=showgrid&&Object.assign({},this.defaults.yaxis.grid,this.yaxis.grid),showaxis=this.yaxis||this.yAxis,axisstyle=showaxis&&Object.assign({},this.defaults.yaxis.style,this.defaults.yaxis.labels.style,this.yaxis&&this.yaxis.style||{}),showline=showaxis&&this.get("yaxis","line"),showlabels=this.yAxis&&showaxis&&this.get("yaxis","labels"),showticks=this.yAxis&&showaxis&&this.get("yaxis","ticks"),ticklen=showticks?this.get("yaxis","ticks","len"):0,showorigin=showaxis&&this.get("yaxis","origin"),title=this.yaxis&&(this.get("yaxis","title","text")||this.yaxis.title)||"";g.beg(axisstyle);for(let i=0;i<this.yAxis.N;i++){tick=this.yAxis.itr(i);if(i&&showgrid)g.lin(Object.assign({y1:tick.t,x2:this.b,x1:0,y2:tick.t},gridstyle));if(showticks)g.lin({y1:tick.t,x2:tick.maj?-ticklen:-2/3*ticklen,y2:tick.t,y2:tick.t,x1:tick.maj?ticklen:2/3*ticklen});if(showlabels&&tick.maj)g.txt(Object.assign({str:parseFloat(tick.z),x:-(this.get("yaxis","ticks","len")+this.get("yaxis","labels","offset")),y:tick.t,w:Math.PI/2},this.get("yaxis","labels","style")))}if(showline)g.lin({y1:0,x1:0,x2:0,y2:this.h});if(showorigin&&this.ymin<=0&&this.ymax>=0)g.lin({x1:0,y1:-this.yAxis.zmin*this.yAxis.scl,x2:this.b,y2:-this.yAxis.zmin*this.yAxis.scl});if(title)g.txt(Object.assign({str:title.text||title,x:-(this.get("yaxis","title","offset")+(showticks&&this.get("yaxis","ticks","len")||0)+(showlabels&&this.get("yaxis","labels","offset")||0)+(showlabels&&parseFloat(this.get("yaxis","labels","style","font"))||0)),y:this.h/2,w:Math.PI/2},this.get("yaxis","title","style")));g.end()},drawFunc(g,fn,defaultcolor){let itr=fn.itr;if(itr){let fill=fn.fill||fn.style&&fn.style.fs&&fn.style.fs!=="transparent",color=fn.color=fn.color||fn.style&&fn.style.ls||defaultcolor,plydata=[],args=Object.assign({pts:plydata,closed:false,ls:color,fs:fill?g2.color.rgbaStr(color,.125):"transparent",lw:1},fn.style);if(fill)plydata.push(this.pntOf({x:itr(0).x,y:0}));for(let i=0,n=itr.len;i<n;i++)plydata.push(this.pntOf(itr(i)));if(fill)plydata.push(this.pntOf({x:itr(itr.len-1).x,y:0}));if(fn.spline&&g.spline)g.spline(args);else g.ply(args);if(fn.dots){g.beg({fs:"snow"});for(var i=0;i<plydata.length;i++)g.cir(Object.assign({},plydata[i],{r:2,lw:1}));g.end()}}},pntOf:function(xy){return{x:this.x+Math.max(Math.min((xy.x-this.xAxis.zmin)*this.xAxis.scl,this.b),0),y:this.y+Math.max(Math.min((xy.y-this.yAxis.zmin)*this.yAxis.scl,this.h),0)}},get(n1,n2,n3,n4){const loc=n4?this[n1]&&this[n1][n2]&&this[n1][n2][n3]&&this[n1][n2][n3][n4]:n3?this[n1]&&this[n1][n2]&&this[n1][n2][n3]:n2?this[n1]&&this[n1][n2]:n1?this[n1]:undefined,dflts=this.defaults;return loc!==undefined?loc:n4?dflts[n1]&&dflts[n1][n2]&&dflts[n1][n2][n3]&&dflts[n1][n2][n3][n4]:n3?dflts[n1]&&dflts[n1][n2]&&dflts[n1][n2][n3]:n2?dflts[n1]&&dflts[n1][n2]:n1?dflts[n1]:undefined},defaults:{x:0,y:0,xmin:0,xmax:1,ymin:0,ymax:1,b:150,h:100,ls:"transparent",fs:"#efefef",color:false,colors:["#426F42","#8B2500","#23238E","#5D478B"],title:{text:"",offset:3,style:{font:"16px serif",fs:"black",thal:"center",tval:"bottom"}},funcs:[],xaxis:{fill:false,line:true,style:{ls:"#888",thal:"center",tval:"top",fs:"black"},origin:false,title:{text:null,offset:1,style:{font:"12px serif",fs:"black"}},ticks:{len:6},grid:{ls:"#ddd",ld:[]},labels:{loc:"auto",offset:1,style:{font:"11px serif",fs:"black"}}},yaxis:{line:true,style:{ls:"#888",thal:"center",tval:"bottom",fs:"black"},origin:false,title:{text:null,offset:2,style:{font:"12px serif",fs:"black"}},ticks:{len:6},grid:{ls:"#ddd",ld:[]},labels:{loc:"auto",offset:1,style:{font:"11px serif",fs:"black"}}}}};g2.color={rgba(color,alpha){let res;alpha=alpha!==undefined?alpha:1;if(color==="transparent")return{r:0,g:0,b:0,a:0};if(color in g2.color.names)color="#"+g2.color.names[color];if(res=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))return{r:parseInt(res[1],16),g:parseInt(res[2],16),b:parseInt(res[3],16),a:alpha};if(res=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))return{r:parseInt(res[1]+res[1],16),g:parseInt(res[2]+res[2],16),b:parseInt(res[3]+res[3],16),a:alpha};if(res=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))return{r:parseInt(res[1]),g:parseInt(res[2]),b:parseInt(res[3]),a:alpha};if(res=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(color))return{r:parseInt(res[1]),g:parseInt(res[2]),b:parseInt(res[3]),a:alpha!==undefined?alpha:parseFloat(res[4])};if(res=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))return{r:parseFloat(res[1])*2.55,g:parseFloat(res[2])*2.55,b:parseFloat(result[3])*2.55,a:alpha}},rgbaStr(color,alpha){const c=g2.color.rgba(color,alpha);return"rgba("+c.r+","+c.g+","+c.b+","+c.a+")"},names:{aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"}};
"use strict";

class G2ChartElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'width',
            'height',
            'xmin',
            'xmax',
            'ymin',
            'ymax',
            'title',
        ];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }

    get width() { return +this.getAttribute('width') || 301; }
    set width(q) { q && this.setAttribute('width', q) }
    get height() { return +this.getAttribute('height') || 201; }
    set height(q) { q && this.setAttribute('height', q) }
    get xmin() { return +this.getAttribute('xmin') || undefined; }
    set xmin(q) { return q && +this.setAttribute('xmin', q) }
    get xmax() { return +this.getAttribute('xmax') || undefined; }
    set xmax(q) { return q && +this.setAttribute('xmax', q) }
    get ymin() { return +this.getAttribute('ymin') || undefined; }
    set ymin(q) { return q && +this.setAttribute('ymin', q) }
    get ymax() { return +this.getAttribute('ymax') || undefined; }
    set ymax(q) { return q && +this.setAttribute('ymax', q) }
    get title() { return this.getAttribute('title') || ''; }
    set title(q) { return q && this.setAttribute('title', q) }

    connectedCallback() {
        this._root.innerHTML = G2ChartElement.template({
            width: this.width, height: this.height
        });

        this._ctx = this._root.getElementById('cnv').getContext('2d');

        this._g = g2().del().clr().view({ cartesian: true });

        const t = 35;
        this._chart = {
            x: t,
            y: t,
            xmin: this.xmin,
            xmax: this.xmax,
            ymin: this.ymin,
            ymax: this.ymax,
            title: this.title,
            b: this.width - t * 2,
            h: this.height - t * 2,
            xaxis: () => this.xaxis || {},
            yaxis: () => this.yaxis || {},
            title: () => this.title || "",
            funcs: () => this.funcs
        };

        try {
            // If not true, the element should be referenced by another module.
            if (this.innerHTML !== '') {
                // Remove all functions (declared by "fn": fn) and fetch them before parsing.
                // Then bring them back in using Function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Never_use_eval

                // Find all functions declared by "fn:" like here: https://goessner.github.io/g2/g2.chart.html#example-multiple-functions
                const funcRegEx = /(("|')fn("|'):)([^(,|})]+)/g;
                const funcs = JSON.parse(this.innerHTML.replace(funcRegEx, '"fn":"PLACEHOLDER"').trim());
                let itr = 0;
                for (const a of this.innerHTML.matchAll(funcRegEx)) {
                    funcs[itr].fn = (() => Function('"use strict"; return (' + a[4] + ')')())();
                    itr++;
                }
                this.funcs = [funcs];
            }
        }
        catch (e) {
            console.warn(e);
            this._g.txt({ str: e, y: 5 });
        }
        finally {
            this._g.chart(this._chart).nod({
                x: () => this.nod && this.nod().x,
                y: () => this.nod && this.nod().y,
                scl: () => this.nod && this.nod().scl || 0
            });
            this.render();
        }
    }

    render() {
        this._g.exe(this._ctx);
    }

    setChart(chart) {
        this._chart = chart;
    }

    disconnectedCallback() {
        // TODO
    }

    static template({ width, height }) {
        return `<canvas id='cnv' width=${width} height=${height}
            style="border:solid 1px black;"></canvas>`
    }
}
customElements.define('g2-chart', G2ChartElement);

/**
 * g2.selector.js (c) 2018 Stefan Goessner
 * @file selector for `g2` elements.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

/**
 * Extensions.
 * (Requires cartesian coordinate system)
 * @namespace
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...

// extend prototypes for argument objects
g2.selector = function(evt) {
    if (this instanceof g2.selector) {
        this.selection = false;
        this.evt = evt;
        return this;
    }
    return g2.selector.apply(Object.create(g2.selector.prototype), arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.selector ? ctx : false);

g2.selector.state = ['NONE','OVER','DRAG','OVER+DRAG','EDIT','OVER+EDIT'];

g2.selector.prototype = {
    init(grp) { return true; },
    exe(commands) {
        for (let elm=false, i=commands.length; i && !elm; i--)  // stop after first hit .. starting from list end !
            elm = this.hit(commands[i-1].a)
    },
    hit(elm) {
        if (!this.evt.inside || !elm || this.selection && this.selection !== elm)  // command without arguments object .. !
            return false;

        if (!elm.state && this.elementHit(elm)) {                     // no mode
            elm.state = g2.OVER;                                      // enter OVER mode ..
            this.evt.hit = true;
            this.selection = elm;
        }
        else if (elm.state & g2.DRAG) {                               // in DRAG mode
            if (!this.evt.btn)                                        // leave DRAG mode ..
                this.elementDragEnd(elm);
        }
        else if (elm.state & g2.OVER) {                               // in OVER mode
            if (!this.elementHit(elm)) {                              // leave OVER mode ..
                elm.state ^= g2.OVER;
                this.evt.hit = false;
                this.selection = false;
            }
            else if (this.evt.btn)                                    // enter DRAG mode
                this.elementDragBeg(elm);
        }
        return elm.state && elm;
    },
    elementDragBeg(elm) {
        elm.state |= g2.DRAG;
        if (elm.dragBeg) elm.dragBeg(e);
    },
    elementDragEnd(elm) {
        elm.state ^= (g2.OVER | g2.DRAG);
        this.selection = false;
        if (elm.dragEnd) elm.dragEnd(e);
    },
    elementHit(elm) {
        const hitpoint = {x:this.evt.xusr,y:this.evt.yusr,eps:this.evt.eps}
        return elm.isSolid ? elm.hitInner   && elm.hitInner(hitpoint)
                           : elm.hitContour && elm.hitContour(hitpoint);
    }
};

/**
 * canvasInteractor.js (c) 2018 Stefan Goessner
 * @file interaction manager for html `canvas`.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

const canvasInteractor = {
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o, arguments);
        return o;
    },
    // global static tickTimer properties
    fps: '?',
    fpsOrigin: 0,
    frames: 0,
    rafid: 0,
    instances: [],
    // global static timer methods
    tick(time) {
        canvasInteractor.fpsCount(time);
        for (const instance of canvasInteractor.instances) {
            instance.notify('tick', { t: time, dt: (time - instance.t) / 1000, dirty: instance.dirty });
            instance.t = time;
            instance.dirty = false;
        }
        canvasInteractor.rafid = requestAnimationFrame(canvasInteractor.tick);   // request next animation frame ...
    },
    add(instance) {
        canvasInteractor.instances.push(instance);
        if (canvasInteractor.instances.length === 1)  // first instance added ...
            canvasInteractor.tick(canvasInteractor.fpsOrigin = performance.now());
    },
    remove(instance) {
        canvasInteractor.instances.splice(canvasInteractor.instances.indexOf(instance), 1);
        if (canvasInteractor.instances.length === 0)   // last instance removed ...
            cancelAnimationFrame(canvasInteractor.rafid);
    },
    fpsCount(time) {
        if (time - canvasInteractor.fpsOrigin > 1000) {  // one second interval reached ...
            let fps = ~~(canvasInteractor.frames * 1000 / (time - canvasInteractor.fpsOrigin) + 0.5); // ~~ as Math.floor()
            if (fps !== canvasInteractor.fps)
                for (const instance of canvasInteractor.instances)
                    instance.notify('fps', canvasInteractor.fps = fps);
            canvasInteractor.fpsOrigin = time;
            canvasInteractor.frames = 0;
        }
        canvasInteractor.frames++;
    },

    prototype: {
        constructor(ctx, { x, y, scl, cartesian }) {
            // canvas interaction properties
            this.ctx = ctx;
            this.view = { x: x || 0, y: y || 0, scl: scl || 1, cartesian: cartesian || false };
            this.evt = {
                type: false,
                basetype: false,
                x: -2, y: -2,
                xi: 0, yi: 0,
                dx: 0, dy: 0,
                btn: 0,
                xbtn: 0, ybtn: 0,
                xusr: -2, yusr: -2,
                dxusr: 0, dyusr: 0,
                delta: 0,
                inside: false,
                hit: false,  // something hit by pointer ...
                eps: 5       // some pixel tolerance ...
            };
            this.dirty = true;
            // event handler registration
            const canvas = ctx.canvas;
            canvas.addEventListener("pointermove", this, false);
            canvas.addEventListener("pointerdown", this, false);
            canvas.addEventListener("pointerup", this, false);
            canvas.addEventListener("pointerenter", this, false);
            canvas.addEventListener("pointerleave", this, false);
            canvas.addEventListener("wheel", this, false);
            canvas.addEventListener("pointercancel", this, false);
        },
        deinit() {
            const canvas = this.ctx.canvas;

            canvas.removeEventListener("pointermove", this, false);
            canvas.removeEventListener("pointerdown", this, false);
            canvas.removeEventListener("pointerup", this, false);
            canvas.removeEventListener("pointerenter", this, false);
            canvas.removeEventListener("pointerleave", this, false);
            canvas.removeEventListener("wheel", this, false);
            canvas.removeEventListener("pointercancel", this, false);

            this.endTimer();

            delete this.signals;
            delete this.evt;
            delete this.ctx;

            return this;
        },
        // canvas interaction interface
        handleEvent(e) {
            if (e.type in this && (e.isPrimary || e.type === 'wheel')) {  // can I handle events of type e.type .. ?
                let bbox = e.target.getBoundingClientRect && e.target.getBoundingClientRect() || { left: 0, top: 0 },
                    x = e.clientX - Math.floor(bbox.left),
                    y = e.clientY - Math.floor(bbox.top),
                    //                    x = Math.round(e.clientX - Math.floor(bbox.left)),
                    //                    y = Math.round(e.clientY - Math.floor(bbox.top)),
                    btn = e.buttons !== undefined ? e.buttons : e.button || e.which;

                this.evt.type = e.type;
                this.evt.basetype = e.type;  // obsolete now ... ?
                this.evt.xi = this.evt.x;  // interim coordinates ...
                this.evt.yi = this.evt.y;  // ... of previous event.
                this.evt.dx = this.evt.dy = 0;
                this.evt.x = x;
                this.evt.y = this.view.cartesian ? this.ctx.canvas.height - y : y;
                this.evt.xusr = (this.evt.x - this.view.x) / this.view.scl;
                this.evt.yusr = (this.evt.y - this.view.y) / this.view.scl;
                this.evt.dxusr = this.evt.dyusr = 0;
                this.evt.dbtn = btn - this.evt.btn;
                this.evt.btn = btn;
                this.evt.delta = Math.max(-1, Math.min(1, e.deltaY || e.wheelDelta)) || 0;

                if (this.isDefaultPreventer(e.type))
                    e.preventDefault();
                this[e.type]();  // handle specific event .. ?
                this.notify(this.evt.type, this.evt);
                //                console.log('notify:'+this.evt.type)
                //                this.notify('pointer',this.evt);
                //                console.log({l:e.target.offsetLeft,t:e.target.offsetTop})
            }
            else
                console.log(e)
        },
        pointermove() {
            this.evt.dx = this.evt.x - this.evt.xi;
            this.evt.dy = this.evt.y - this.evt.yi;
            if (this.evt.btn === 1) {    // pointerdown state ...
                this.evt.dxusr = this.evt.dx / this.view.scl;  // correct usr coordinates ...
                this.evt.dyusr = this.evt.dy / this.view.scl;
                this.evt.xusr -= this.evt.dxusr;  // correct usr coordinates ...
                this.evt.yusr -= this.evt.dyusr;
                if (!this.evt.hit) {      // perform panning ...
                    this.view.x += this.evt.dx;
                    this.view.y += this.evt.dy;
                    this.evt.type = 'pan';
                }
                else
                    this.evt.type = 'drag';
            }
            // view, geometry or graphics might be modified ...
            this.dirty = true;
        },
        pointerdown() {
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
        },
        pointerup() {
            this.evt.type = this.evt.x === this.evt.xbtn && this.evt.y === this.evt.ybtn ? 'click' : 'pointerup';
            this.evt.xbtn = this.evt.x;
            this.evt.ybtn = this.evt.y;
        },
        pointerleave() {
            this.evt.inside = false;
        },
        pointerenter() {
            this.evt.inside = true;
        },
        wheel() {
            let scl = this.evt.delta > 0 ? 8 / 10 : 10 / 8;
            this.view.x = this.evt.x + scl * (this.view.x - this.evt.x);
            this.view.y = this.evt.y + scl * (this.view.y - this.evt.y);
            this.evt.eps /= scl;
            this.view.scl *= scl;
            this.dirty = true;
        },
        isDefaultPreventer(type) {
            return ['pointermove', 'pointerdown', 'pointerup', 'wheel'].includes(type);
        },
        pntToUsr: function (p) {
            let vw = this.view;
            p.x = (p.x - vw.x) / vw.scl;
            p.y = (p.y - vw.y) / vw.scl;
            return p;
        },
        // tickTimer interface
        startTimer() {
            this.notify('timerStart', this);
            this.time0 = this.fpsOrigin = performance.now();
            canvasInteractor.add(this);
            return this;
        },
        endTimer() {
            canvasInteractor.remove(this);
            this.notify('timerEnd', this.t / 1000);
            return this;
        },
        // observable interface
        notify(key, val) {
            if (this.signals && this.signals[key])
                for (let hdl of this.signals[key])
                    hdl(val);
            return this;
        },
        on(key, handler) {   // support array of keys as first argument.
            if (Array.isArray(key))
                for (let k of key)
                    this.on(k, handler);
            else
                ((this.signals || (this.signals = {})) && this.signals[key] || (this.signals[key] = [])).push(handler);

            return this;
        },
        remove(key, handler) {
            const idx = (this.signals && this.signals[key]) ? this.signals[key].indexOf(handler) : -1;
            if (idx >= 0)
                this.signals[key].splice(idx, 1);
        }
    }
};

/**
 * mec (c) 2018-19 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec namespace for the mec library.
 * It includes mainly constants and some general purpose functions.
 */
const mec = {
    /**
     * user language shortcut (for messages)
     * @const
     * @type {string}
     */
    lang: 'en',
    /**
     * namespace for user language neutral messages
     * @const
     * @type {object}
     */
    msg: {},
    /**
     * minimal float difference to 1.0
     * @const
     * @type {number}
     */
    EPS: 1.19209e-07,
    /**
     * Medium length tolerance for position correction.
     * @const
     * @type {number}
     */
    lenTol: 0.001,
    /**
     * Angular tolerance for orientation correction.
     * @const
     * @type {number}
     */
    angTol: 1 / 180 * Math.PI,
    /**
     * Velocity tolerance.
     * @const
     * @type {number}
     */
    velTol: 0.01,
    /**
     * Force tolerance.
     * @const
     * @type {number}
     */
    forceTol: 0.1,
    /**
     * Moment tolerance.
     * @const
     * @type {number}
     */
    momentTol: 0.01,
    /**
     * Tolerances (new concept)
     * accepting ['high','medium','low'].
     * @const
     * @type {number}
     */
    tol: {
        len: {
            low: 0.00001,
            medium: 0.001,
            high: 0.1
        }
    },
    maxLinCorrect: 20,
    /**
     * fixed limit of assembly iteration steps.
     */
    asmItrMax: 512, // 512,
    /**
     * itrMax: fixed limit of simulation iteration steps.
     */
    itrMax: 256,
    /**
     * corrMax: fixed number of position correction steps.
     */
    corrMax: 64,
    /**
    * graphics options
    * @const
    * @type {object}
    */
    show: {
        /**
         * flag for darkmode.
         * @const
         * @type {boolean}
         */
        darkmode: false,
        /**
         * flag for showing labels of nodes.
         * @const
         * @type {boolean}
         */
        nodeLabels: false,
        /**
         * flag for showing labels of constraints.
         * @const
         * @type {boolean}
         */
        constraintLabels: true,
        /**
         * flag for showing labels of loads.
         * @const
         * @type {boolean}
         */
        loadLabels: true,
        /**
         * flag for showing nodes.
         * @const
         * @type {boolean}
         */
        nodes: true,
        /**
         * flag for showing constraints.
         * @const
         * @type {boolean}
         */
        constraints: true,
        colors: {
            invalidConstraintColor: '#b11',
            validConstraintColor: { dark: '#ffffff99', light: '#777' },
            forceColor: { dark: 'orangered', light: 'orange' },
            springColor: { dark: '#ccc', light: '#aaa' },
            constraintVectorColor: { dark: 'orange', light: 'green' },
            hoveredElmColor: { dark: 'white', light: 'gray' },
            selectedElmColor: { dark: 'yellow', light: 'blue' },
            txtColor: { dark: 'white', light: 'black' },
            velVecColor: { dark: 'lightsteelblue', light: 'steelblue' },
            accVecColor: { dark: 'lightsalmon', light: 'firebrick' },
            forceVecColor: { dark: 'wheat', light: 'saddlebrown' }
        },
        /**
         * color for drawing valid constraints.
         * @return {string}
         */
        get validConstraintColor() { return this.darkmode ? this.colors.validConstraintColor.dark : this.colors.validConstraintColor.light },
        /**
         * color for drawing forces.
         * @return {string}
         */
        get forceColor() { return this.darkmode ? this.colors.forceColor.dark : this.colors.forceColor.light },
        /**
         * color for drawing springs.
         * @return {string}
         */
        get springColor() { return this.darkmode ? this.colors.springColor.dark : this.colors.springColor.light },
        /**
         * color for vectortypes of constraints.
         * @return {string}
         */
        get constraintVectorColor() { return this.darkmode ? this.colors.constraintVectorColor.dark : this.colors.constraintVectorColor.light },
        /**
         * hovered element shading color.
         * @return {string}
         */
        get hoveredElmColor() { return this.darkmode ? this.colors.hoveredElmColor.dark : this.colors.hoveredElmColor.light },
        /**
         * selected element shading color.
         * @return {string}
         */
        get selectedElmColor() { return this.darkmode ? this.colors.selectedElmColor.dark : this.colors.selectedElmColor.light },
        /**
         * color for g2.txt (ls).
         * @return {string}
         */
        get txtColor() { return this.darkmode ? this.colors.txtColor.dark : this.colors.txtColor.light },
        /**
         * color for velocity arrow (ls).
         * @const
         * @type {string}
         */
        get velVecColor() { return this.darkmode ? this.colors.velVecColor.dark : this.colors.velVecColor.light },
        /**
         * color for acceleration arrow (ls).
         * @const
         * @type {string}
         */
        get accVecColor() { return this.darkmode ? this.colors.accVecColor.dark : this.colors.accVecColor.light },
        /**
         * color for acceleration arrow (ls).
         * @const
         * @type {string}
         */
        get forceVecColor() { return this.darkmode ? this.colors.forceVecColor.dark : this.colors.forceVecColor.light }
    },
    /**
     * default gravity.
     * @const
     * @type {object}
     */
    gravity: { x: 0, y: -10, active: false },
    /*
     * analysing values
     */
    aly: {
        m: { get scl() { return 1 }, type: 'num', name: 'm', unit: 'kg' },
        pos: { type: 'pnt', name: 'p', unit: 'm' },
        vel: { get scl() { return mec.m_u }, type: 'vec', name: 'v', unit: 'm/s', get drwscl() { return 40 * mec.m_u } },
        acc: { get scl() { return mec.m_u }, type: 'vec', name: 'a', unit: 'm/s^2', get drwscl() { return 10 * mec.m_u } },
        w: { get scl() { return 180 / Math.PI }, type: 'num', name: 'φ', unit: '°' },
        wt: { get scl() { return 1 }, type: 'num', name: 'ω', unit: 'rad/s' },
        wtt: { get scl() { return 1 }, type: 'num', name: 'α', unit: 'rad/s^2' },
        r: { get scl() { return mec.m_u }, type: 'num', name: 'r', unit: 'm' },
        rt: { get scl() { return mec.m_u }, type: 'num', name: 'rt', unit: 'm/s' },
        rtt: { get scl() { return mec.m_u }, type: 'num', name: 'rtt', unit: 'm/s^2' },
        force: { get scl() { return mec.m_u }, type: 'vec', name: 'F', unit: 'N', get drwscl() { return 5 * mec.m_u } },
        velAbs: { get scl() { return mec.m_u }, type: 'num', name: 'v', unit: 'm/s' },
        accAbs: { get scl() { return mec.m_u }, type: 'num', name: 'a', unit: 'm/s' },
        forceAbs: { get scl() { return mec.m_u }, type: 'num', name: 'F', unit: 'N' },
        moment: { get scl() { return mec.m_u ** 2 }, type: 'num', name: 'M', unit: 'Nm' },
        energy: { get scl() { return mec.to_J }, type: 'num', name: 'E', unit: 'J' },
        pole: { type: 'pnt', name: 'P', unit: 'm' },
        polAcc: { get scl() { return mec.m_u }, type: 'vec', name: 'a_P', unit: 'm/s^2', get drwscl() { return 10 * mec.m_u } },
        polChgVel: { get scl() { return mec.m_u }, type: 'vec', name: 'u_P', unit: 'm/s', get drwscl() { return 40 * mec.m_u } },
        accPole: { type: 'pnt', name: 'Q', unit: 'm' },
        inflPole: { type: 'pnt', name: 'I', unit: 'm' },
        t: { get scl() { return 1 }, type: 'num', name: 't', unit: 's' }
    },
    /**
     * unit specifiers and relations
     */
    /**
     * default length scale factor (meter per unit) [m/u].
     * @const
     * @type {number}
     */
    m_u: 0.01,
    /**
     * convert [u] => [m]
     * @return {number} Value in [m]
     */
    to_m(x) { return x * mec.m_u; },
    /**
     * convert [m] = [u]
     * @return {number} Value in [u]
     */
    from_m(x) { return x / mec.m_u; },
    /**
     * convert [kgu/m^2] => [kgm/s^2] = [N]
     * @return {number} Value in [N]
     */
    to_N(x) { return x * mec.m_u; },
    /**
     * convert [N] = [kgm/s^2] => [kgu/s^2]
     * @return {number} Value in [kgu/s^2]
     */
    from_N(x) { return x / mec.m_u; },
    /**
     * convert [kgu^2/m^2] => [kgm^2/s^2] = [Nm]
     * @return {number} Value in [Nm]
     */
    to_Nm(x) { return x * mec.m_u * mec.m_u; },
    /**
     * convert [Nm] = [kgm^2/s^2] => [kgu^2/s^2]
     * @return {number} Value in [kgu^2/s^2]
     */
    from_Nm(x) { return x / mec.m_u / mec.m_u; },
    /**
     * convert [N/m] => [kg/s^2] = [N/m] (spring rate)
     * @return {number} Value in [N/m]
     */
    to_N_m(x) { return x; },
    /**
     * convert [N/m] = [kg/s^2] => [kg/s^2]
     * @return {number} Value in [kg/s^2]
     */
    from_N_m(x) { return x; },
    /**
     * convert [kgu/m^2] => [kgm^2/s^2] = [J]
     * @return {number} Value in [N]
     */
    to_J(x) { return mec.to_Nm(x) },
    /**
     * convert [J] = [kgm^2/s^2] => [kgu^2/s^2]
     * @return {number} Value in [kgu^2/s^2]
     */
    from_J(x) { return mec.from_Nm(x) },
    /**
     * convert [kgu^2] => [kgm^2]
     * @return {number} Value in [kgm^2]
     */
    to_kgm2(x) { return x * mec.m_u * mec.m_u; },
    /**
     * convert [kgm^2] => [kgu^2]
     * @return {number} Value in [kgu^2]
     */
    from_kgm2(x) { return x / mec.m_u / mec.m_u; },
    /**
     * Helper functions
     */
    /**
     * Test, if the absolute value of a number `a` is smaller than eps.
     * @param {number} a Value to test.
     * @param {number} [eps=mec.EPS]  used epsilon.
     * @returns {boolean} test result.
     */
    isEps(a, eps) {
        return a < (eps || mec.EPS) && a > -(eps || mec.EPS);
    },
    /**
    * If the absolute value of a number `a` is smaller than eps, it is set to zero.
    * @param {number} a Value to test.
    * @param {number} [eps=mec.EPS]  used epsilon.
    * @returns {number} original value or zero.
    */
    toZero(a, eps) {
        return a < (eps || mec.EPS) && a > -(eps || mec.EPS) ? 0 : a;
    },
    /**
     * Clamps a numerical value linearly within the provided bounds.
     * @param {number} val Value to clamp.
     * @param {number} lo Lower bound.
     * @param {number} hi Upper bound.
     * @returns {number} Value within the bounds.
     */
    clamp(val, lo, hi) { return Math.min(Math.max(val, lo), hi); },
    /**
     * Clamps a numerical value asymptotically within the provided bounds.
     * @param {number} val Value to clamp.
     * @param {number} lo Lower bound.
     * @param {number} hi Upper bound.
     * @returns {number} Value within the bounds.
     */
    asympClamp(val, lo, hi) {
        const dq = hi - lo;
        return dq ? lo + 0.5 * dq + Math.tanh(((Math.min(Math.max(val, lo), hi) - lo) / dq - 0.5) * 5) * 0.5 * dq : lo;
    },
    /**
     * Convert angle from degrees to radians.
     * @param {number} deg Angle in degrees.
     * @returns {number} Angle in radians.
     */
    toRad(deg) { return deg * Math.PI / 180; },
    /**
     * Convert angle from radians to degrees.
     * @param {number} rad Angle in radians.
     * @returns {number} Angle in degrees.
     */
    toDeg(rad) { return rad / Math.PI * 180; },
    /**
     * Continuously rotating objects require infinite angles, both positives and negatives.
     * Setting an angle `winf` to a new angle `w` does this with respect to the
     * shortest angular distance from  `winf` to `w`.
     * @param {number} winf infinite extensible angle in radians.
     * @param {number} w  Destination angle in radians [-pi,pi].
     * @returns {number} Extended angle in radians.
     */
    infAngle(winf, w) {
        let pi = Math.PI, pi2 = 2 * pi, d = w - winf % pi2;
        if (d > pi) d -= pi2;
        else if (d < -pi) d += pi2;
        return winf + d;
    },
    /**
     * Mixin a set of prototypes into a primary object.
     * @param {object} obj Primary object.
     * @param {objects} ...protos Set of prototype objects.
     */
    mixin(obj, ...protos) {
        protos.forEach(proto => {
            obj = Object.defineProperties(obj, Object.getOwnPropertyDescriptors(proto))
        })
        return obj;
    },
    /**
     * Assign getters to an objects prototype.
     * @param {object} obj Primary object.
     * @param {objects} ...protos Set of prototype objects.
     */
    assignGetters(obj, getters) {
        for (const key in getters)
            Object.defineProperty(obj, key, { get: getters[key], enumerable: true, configurable: true });
    },
    /**
     * Create message string from message object.
     * @param {object} msg message/warning/error object.
     * @returns {string} message string.
     */
    messageString(msg) {
        const entry = mec.msg[mec.lang][msg.mid];
        return entry ? msg.mid[0] + ': ' + entry(msg) : '';
    }
}

/**
 * mec.model (c) 2018-19 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 */
"use strict";

/**
 * Wrapper class for extending plain model objects, usually generated from a JSON object.
 * @method
 * @returns {object} model object.
 * @param {object} - plain javascript model object.
 * @property {string} id - model id.
 * @property {boolean|object} [gravity] - Vector `{x,y}` of gravity or `{x:0,y:-10}` in case of `true`.
 * @property {object} [labels] - user specification of labels to show `default={nodes:false,constraints:true,loads:true}`.
 */
mec.model = {
    extend(model, env = mec) {
        Object.setPrototypeOf(model, this.prototype);
        model.constructor(env);
        return model;
    },
    prototype: {
        constructor(env) {
            this.env = env; // reference environment of model
            if (env !== mec && !env.show) // it's possible that user defined a (complete!) custom show object
                this.env.show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy show object including getters

            this.showInfo = { nodes: this.env.show.nodeInfo, constraints: this.env.show.constraintInfo, loads: false };
            this.state = { valid: true, itrpos: 0, itrvel: 0, preview: false };
            this.timer = { t: 0, dt: 1 / 60, sleepMin: 1 };
            // create empty containers for all elements
            for (const key of Object.keys(this.plugIns)) {
                if (!this[key]) {
                    this[key] = [];
                }
            }
            this.forAllPlugIns((elm, plugIn) => { plugIn.extend(elm); });
        },
        /**
         * Init model
         * @method
         * @returns object} model.
         */
        init() {
            if (this.gravity === true)
                this.gravity = Object.assign({}, mec.gravity, { active: true });
            else if (!this.gravity)
                this.gravity = Object.assign({}, mec.gravity, { active: false });
            // else ... gravity might be given by user as vector !

            if (!this.tolerance) this.tolerance = 'medium';

            this.state.valid = true;  // clear previous logical error result ...

            for (const key of Object.keys(this.plugIns)) {
                for (let idx = 0; idx < this[key].length; ++idx) {
                    this[key][idx].init(this, idx);
                }
            }

            return this;
        },
        plugIns: {},
        addPlugIn(name, plugIn) {
            // TODO define interface ? 
            // if (!plugIn ||
            //     !plugIn.extend ||
            //     !plugIn.init ||
            //     !plugIn.reset
            //     // !plugIn.dependsOn not sure if this is a hard requirement...
            //     ) {
            //     return;
            // }
            this.plugIns[name] = plugIn;
        },

        forAllPlugIns(fn) {
            for (const [key, plugIn] of Object.entries(this.plugIns)) {
                for (const elm of this[key]) {
                    const ret = fn(elm, plugIn, key);
                    if (ret) return ret;
                }
            }
        },
        /**
         * Notification of validity by child. Error message aborts init procedure.
         * @method
         * @param {boolean | object} msg - message object or false in case of no error / warning.
         * @returns {boolean | object} message object in case of logical error / warning or `false`.
         */
        notifyValid(msg) {
            if (msg) {
                this.state.msg = msg;
                return (this.state.valid = msg.mid[0] !== 'E');
            }
            return true;
        },
        /**
         * Reset model
         * All nodes are set to their initial position.
         * Kinematic values are set to zero.
         * @method
         * @returns {object} model
         */
        reset() {
            this.timer.t = 0;
            this.timer.sleepMin = 1;
            Object.assign(this.state, { valid: true, itrpos: 0, itrvel: 0 });
            this.forAllPlugIns((elm) => elm.reset && elm.reset());
            return this;
        },
        /**
         * Preview model
         * Some views need pre calculation for getting immediate results (i.e. traces)
         * After `preview` was called, model is in `reset` state.
         * @method
         * @returns {object} model
         */
        preview() {
            let previewMode = false, tmax = 0;
            for (const view of this.views) {
                if (view.mode === 'preview') {
                    tmax = view.t0 + view.Dt;
                    view.reset(previewMode = true);
                }
            }
            if (previewMode) {
                this.reset();
                this.state.preview = true;
                this.timer.dt = 1 / 30;

                for (this.timer.t = 0; this.timer.t <= tmax; this.timer.t += this.timer.dt) {
                    this.pre().itr().post();
                    for (const view of this.views)
                        if (view.preview)
                            view.preview();
                }

                this.timer.dt = 1 / 60;
                this.state.preview = false;
                this.reset();
            }
            return this;
        },
        /**
         * Assemble model (depricated ... use pose() instead)
         * @method
         * @returns {object} model
         */
        asm() {
            let valid = this.asmPos();
            valid = this.asmVel() && valid;
            return this;
        },
        /**
         * Bring mechanism to a valid pose.
         * No velocities or forces are calculated.
         * @method
         * @returns {object} model
         */
        pose() {
            return this.asmPos();
        },
        /**
         * Perform timer tick.
         * Model time is incremented by `dt`.
         * Model time is independent of system time.
         * Input elements may set simulation time and `dt` explicite. Depricated, they maintain their local time in parallel !
         * `model.tick()` is then called with `dt = 0`.
         * @method
         * @param {number} [dt=0] - time increment.
         * @returns {object} model
         */
        tick(dt) {
            // fix: ignore dt for now, take it as a constant (study variable time step theoretically) !!
            this.timer.t += (this.timer.dt = 1 / 60);
            this.pre().itr().post();
            return this;
        },
        /**
         * Stop model motion.
         * Zero out velocities and accelerations.
         * @method
         * @returns {object} model
         */
        stop() {
            // post process nodes
            for (const node of this.nodes)
                node.xt = node.yt = node.xtt = node.ytt = 0;
            return this;
        },
        /**
         * Model degree of freedom (movability)
         */
        get dof() {
            let dof = 0;
            if (!this.nodes || !this.constraints) {
                console.warn('TODO');
            }
            for (const node of this.nodes) {
                dof += node.dof;
            }
            for (const constraint of this.constraints) {
                dof -= (2 - constraint.dof);
            }
            return dof;
        },
        /**
         * Gravity (vector) value.
         * @type {boolean}
         */
        get hasGravity() { return this.gravity.active; },

        get valid() { return this.state.valid; },
        set valid(q) { this.state.valid = q; },
        /**
         * Message object resulting from initialization process.
         * @type {object}
         */
        get msg() { return this.state.msg; },
        get info() {
            if (this.showInfo.nodes)
                for (const node of this.nodes)
                    if (node.showInfo)
                        return node.info(this.showInfo.nodes);
            if (this.showInfo.constraints)
                for (const constraint of this.constraints)
                    if (constraint.showInfo)
                        return constraint.info(this.showInfo.constraints);
        },
        /*
                get info() {
                    let str = '';
                    for (const view of this.views)
                        if (view.hasInfo)
                            str += view.infoString()+'<br>';
                    return str.length === 0 ? false : str;
                },
        */
        /**
         * Number of positional iterations.
         * @type {number}
         */
        get itrpos() { return this.state.itrpos; },
        set itrpos(q) { this.state.itrpos = q; },
        /**
         * Number of velocity iterations.
         * @type {number}
         */
        get itrvel() { return this.state.itrvel; },
        set itrvel(q) { this.state.itrvel = q; },
        /**
         * Set offset to current time, when testing nodes for sleeping state shall begin.
         * @type {number}
         */
        set sleepMinDelta(dt) { this.timer.sleepMin = this.timer.t + dt; },
        /**
         * Test, if none of the nodes are moving (velocity = 0).
         * @type {boolean}
         */
        get isSleeping() {
            let sleeping = this.timer.t > this.timer.sleepMin;  // chance for sleeping exists ...
            if (sleeping)
                for (const node of this.nodes)
                    sleeping = sleeping && node.isSleeping;
            return sleeping;
        },
        /**
         * Number of active drives
         * @const
         * @type {int}
         */
        get activeDriveCount() {
            let activeCnt = 0;
            for (const constraint of this.constraints)
                activeCnt += constraint.activeDriveCount(this.timer.t);
            return activeCnt;
        },
        /**
         * Some drives are active
         * deprecated: Use `activeDriveCount` instead.
         * @const
         * @type {boolean}
         */
        get hasActiveDrives() { return this.activeDriveCount > 0; },
        /**
         * Array of objects referencing constraints owning at least one input controlled drive.
         * The array objects are structured like so: 
         * { constraint: <constraint reference>,
         *   sub: <string of `['ori', 'len']`
         * }
         * If no input controlled drives exist, an empty array is returned.
         * @const
         * @type {array} Array holding objects of type {constraint, sub};
         */
        get inputControlledDrives() {
            const inputs = [];
            for (const constraint of this.constraints) {
                if (constraint.ori.type === 'drive' && constraint.ori.input)
                    inputs.push({ constraint: constraint, sub: 'ori' })
                if (constraint.len.type === 'drive' && constraint.len.input)
                    inputs.push({ constraint: constraint, sub: 'len' })
            }
            return inputs;
        },
        /**
         * Test, if model is active.
         * Nodes are moving (nonzero velocities) or active drives exist.
         * @type {boolean}
         */
        get isActive() {
            return this.activeDriveCount > 0   // active drives
                || this.dof > 0           // or can move by itself
                && !this.isSleeping;      // and does exactly that
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            for (const node of this.nodes)
                e += node.energy;
            for (const load of this.loads)
                e += load.energy;
            return e;
        },
        /**
         * center of gravity 
         */
        get cog() {
            var center = { x: 0, y: 0 }, m = 0;
            for (const node of this.nodes) {
                if (!node.base) {
                    center.x += node.x * node.m;
                    center.y += node.y * node.m;
                    m += node.m;
                }
            }
            center.x /= m;
            center.y /= m;
            return center;
        },

        /**
         * Check, if other elements are dependent on specified element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} true in case of existing dependents.
         */
        hasDependents(elem) {
            // TODO why return the last occurence? Why not stop at the first? 
            let dependency = false;
            this.forAllPlugIns((elm) => dependency = elm.dependsOn(elem) || dependency)
            return dependency;
        },
        /**
         * Get direct dependents of a specified element.
         * As a result a dictionary object containing dependent elements is created:
         * `{constraints:[], loads:[], shapes:[], views:[]}`
         * @method
         * @param {object} elem - element.
         * @returns {object} dictionary object containing dependent elements.
         */
        dependentsOf(elem, deps = {}) {
            this.forAllPlugIns((elm, plugIn, plugInKey) => {
                if (elm.dependsOn(elem)) {
                    this.dependentsOf(elm, deps);
                    (deps[plugInKey] = deps[plugInKey] || []).push(elm);
                }
            });
            return deps;
        },
        /**
         * Verify an element indirect (deep) depending on another element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} dependency exists.
         */
        /*
        deepDependsOn(elem,target) {
            if (elem === target)
                return true;
            else {
                for (const node of this.nodes)
                    if (elem.dependsOn(node))
                        return true;
                for (const constraint of this.constraints)
                    if (elem.dependsOn(elem) || this.deepDependsOn(elem,constraint))
                        return true;
                for (const load of this.loads)
                    if (load.dependsOn(elem))
                        deps.loads.push(load);
            for (const view of this.views)
                if (view.dependsOn(elem))
                    deps.views.push(view);
            for (const shape of this.shapes)
                if (shape.dependsOn(elem))
                    deps.shapes.push(shape);
                for 
            }
        },
*/
        /**
         * Purge all elements in an element dictionary.
         * @method
         * @param {object} elems - element dictionary.
         */
        purgeElements(elems) {
            for (const key of Object.keys(elems)) {
                for (const elm of elems[key]) {
                    this[key].splice(this[key].indexOf(elm), 1)
                }
            }
        },
        /**
         * Get element by id.
         * @method
         * @param {string} id - element id.
         */
        elementById(id) {
            return this.forAllPlugIns(elm => {
                if (elm.id === id) return elm;
            }) || id === 'model' && this;
        },
        /**
         * Add node to model.
         * @method
         * @param {object} node - node to add.
         */
        addNode(node) {
            this.nodes.push(node);
        },
        /**
         * Add constraint to model.
         * @method
         * @param {object} constraint - constraint to add.
         */
        addConstraint(constraint) {
            this.constraints.push(constraint);
        },
        /**
         * Add load to model.
         * @method
         * @param {object} load - load to add.
         */
        addLoad(load) {
            this.loads.push(load);
        },
        /**
         * Add shape to model.
         * @method
         * @param {object} shape - shape to add.
         */
        addShape(shape) {
            this.shapes.push(shape);
        },
        /**
         * Add view to model.
         * @method
         * @param {object} view - view to add.
         */
        addView(view) {
            this.views.push(view);
        },
        /**
         * Return a JSON-string of the model
         * @method
         * @returns {string} model as JSON-string.
         */
        asJSON() {
            // dynamically create a JSON output string ...
            const nodeCnt = this.nodes.length;
            const contraintCnt = this.constraints.length;
            const loadCnt = this.loads.length;
            const shapeCnt = this.shapes.length;
            const viewCnt = this.views.length;
            const comma = (i, n) => i < n - 1 ? ',' : '';
            const str = '{'
                + '\n  "id":"' + this.id + '"'
                + (this.title ? (',\n  "title":"' + this.title + '"') : '')
                + (this.gravity.active ? ',\n  "gravity":true' : '')  // in case of true, should also look at vector components  .. !
                + (nodeCnt ? ',\n  "nodes": [\n' : '\n')
                + (nodeCnt ? this.nodes.map((n, i) => '    ' + n.asJSON() + comma(i, nodeCnt) + '\n').join('') : '')
                + (nodeCnt ? (contraintCnt || loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                + (contraintCnt ? '  "constraints": [\n' : '')
                + (contraintCnt ? this.constraints.map((n, i) => '    ' + n.asJSON() + comma(i, contraintCnt) + '\n').join('') : '')
                + (contraintCnt ? (loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                + (loadCnt ? '  "loads": [\n' : '')
                + (loadCnt ? this.loads.map((n, i) => '    ' + n.asJSON() + comma(i, loadCnt) + '\n').join('') : '')
                + (loadCnt ? (shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                + (shapeCnt ? '  "shapes": [\n' : '')
                + (shapeCnt ? this.shapes.map((n, i) => '    ' + n.asJSON() + comma(i, shapeCnt) + '\n').join('') : '')
                + (shapeCnt ? viewCnt ? '  ],\n' : '  ]\n' : '')
                + (viewCnt ? '  "views": [\n' : '')
                + (viewCnt ? this.views.map((n, i) => '    ' + n.asJSON() + comma(i, viewCnt) + '\n').join('') : '')
                + (viewCnt ? '  ]\n' : '')
                + '}';

            return str;
        },
        /**
         * Apply loads to their nodes.
         * @internal
         * @method
         * @returns {object} model
         */
        applyLoads() {
            // Apply node weight in case of gravity.
            for (const node of this.nodes) {
                node.Qx = node.Qy = 0;
                if (!node.base && this.hasGravity) {
                    node.Qx = node.m * mec.from_m(this.gravity.x);
                    node.Qy = node.m * mec.from_m(this.gravity.y);
                }
            }
            // Apply external loads.
            for (const load of this.loads)
                load.apply();
            return this;
        },
        /**
         * Assemble positions of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmPos() {
            let valid = false;
            this.itrpos = 0;
            while (!valid && this.itrpos++ < mec.asmItrMax) {
                valid = this.posStep();
            }
            return this.valid = valid;
        },
        /**
         * Position iteration step over all constraints.
         * @internal
         * @method
         * @returns {object} model
         */
        posStep() {
            let valid = true;  // pre-assume valid constraints positions ...
            for (const constraint of this.constraints)
                valid = constraint.posStep() && valid;
            return valid;
        },
        /**
         * Assemble velocities of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmVel() {
            let valid = false;
            this.itrvel = 0;
            while (!valid && this.itrvel++ < mec.asmItrMax)
                valid = this.velStep();
            return this.valid = valid;
        },
        /**
         * Velocity iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        velStep() {
            let valid = true;  // pre-assume valid constraints velocities ...
            for (const constraint of this.constraints) {
                valid = constraint.velStep(this.timer.dt) && valid;
            }
            return valid;
        },
        /**
         * Pre-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        pre() {
            // Clear node loads and velocity differences.
            for (const node of this.nodes)
                node.pre_0();
            // Apply external loads.
            for (const load of this.loads)
                load.apply();
            // pre process nodes
            for (const node of this.nodes)
                node.pre(this.timer.dt);
            // pre process constraints
            for (const constraint of this.constraints)
                constraint.pre(this.timer.dt);
            // eliminate drift ...
            this.asmPos(this.timer.dt);
            // pre process views
            for (const view of this.views)
                if (view.pre)
                    view.pre(this.timer.dt);
            return this;
        },

        /**
         * Perform iteration steps until constraints are valid or max-iteration
         * steps for assembly are reached.
         * @internal
         * @method
         * @returns {object} model
         */
        itr() {
            if (this.valid)  // valid asmPos as prerequisite ...
                this.asmVel();
            return this;
        },
        /**
         * Post-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        post() {
            // post process nodes
            for (const node of this.nodes)
                node.post(this.timer.dt);
            // post process constraints
            for (const constraint of this.constraints)
                constraint.post(this.timer.dt);
            // post process views
            for (const view of this.views)
                if (view.post)
                    view.post(this.timer.dt);

            //    console.log('E:'+mec.to_J(this.energy))
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {
            // Make sure constraints and nodes are rendered last.
            this.forAllPlugIns((elm, plugIn) => {
                if (plugIn === this.plugIns['constraints'] ||
                    plugIn === this.plugIns['nodes']) {
                    return;
                }
                elm.draw(g);
            });
            for (const elm of this.constraints) {
                elm.draw(g);
            }
            for (const elm of this.nodes) {
                elm.draw(g);
            }
            return this;
        }
    }
}
/**
 * mec.node (c) 2018-19 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain node objects, usually coming from JSON strings.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - node id.
 * @property {number} x - x-coordinate.
 * @property {number} y - y-coordinate.
 * @property {number} [m=1] - mass.
 * @property {boolean} [base=false] - specify node as base node.
 */
mec.node = {
    extend(node) { Object.setPrototypeOf(node, this.prototype); node.constructor(); return node; },
    prototype: {
        constructor() { // always parameterless .. !
            this.x = this.x || 0;
            this.y = this.y || 0;
            this.x0 = this.x;
            this.y0 = this.y;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
            this.Qx = this.Qy = 0;     // sum of external loads ...
        },
        /**
         * Check node properties for validity.
         * @method
         * @param {number} idx - index in node array.
         * @returns {boolean | object} false - if no error was detected, error object otherwise.
         */
        validate(idx) {
            if (!this.id)
                return { mid: 'E_ELEM_ID_MISSING', elemtype: 'node', idx };
            if (this.model.elementById(this.id) !== this)
                return { mid: 'E_ELEM_ID_AMBIGIOUS', id: this.id };
            if (typeof this.m === 'number' && mec.isEps(this.m))
                return { mid: 'E_NODE_MASS_TOO_SMALL', id: this.id, m: this.m };
            return false;
        },
        /**
         * Initialize node. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in node array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            // make inverse mass to first class citizen ...
            this.im = typeof this.m === 'number' ? 1 / this.m
                : this.base === true ? 0
                    : 1;
            // ... and mass / base to getter/setter
            Object.defineProperty(this, 'm', {
                get: () => 1 / this.im,
                set: (m) => this.im = 1 / m,
                enumerable: true, configurable: true
            });
            Object.defineProperty(this, 'base', {
                get: () => this.im === 0,
                set: (q) => this.im = q ? 0 : 1,
                enumerable: true, configurable: true
            });

            this.g2cache = false;
        },
        /**
         * Remove node, if there are no dependencies to other objects.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        remove() {
            const elms = this.model.nodes;
            return this.model.hasDependents(this) ?
                false :
                !!elms.splice(elms.indexOf(this), 1);
        },
        /**
         * Delete node and all depending elements from model.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
        get type() { return 'node' }, // needed for ... what .. ?
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        /**
         * Test, if node is not resting
         * @const
         * @type {boolean}
         */
        get isSleeping() {
            return this.base
                || mec.isEps(this.xt, mec.velTol)
                && mec.isEps(this.yt, mec.velTol)
                && mec.isEps(this.xtt, mec.velTol / this.model.timer.dt)
                && mec.isEps(this.ytt, mec.velTol / this.model.timer.dt);
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            if (!this.base) {
                if (this.model.hasGravity)
                    e += this.m * (-(this.x - this.x0) * mec.from_m(this.model.gravity.x) - (this.y - this.y0) * mec.from_m(this.model.gravity.y));
                e += 0.5 * this.m * (this.xt ** 2 + this.yt ** 2);
            }
            return e;
        },
        /**
         * Check node for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} always false.
         */
        dependsOn(elem) { return false; },
        /**
         * Check node for deep (indirect) dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} dependency exists.
         */
        deepDependsOn(elem) {
            return elem === this;
        },
        reset() {
            if (!this.base) {
                this.x = this.x0;
                this.y = this.y0;
            }
            // resetting kinematic values ...
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },

        /**
         * First step of node pre-processing.
         * Zeroing out node forces and differential velocities.
         * @method
         */
        pre_0() {
            this.Qx = this.Qy = 0;
            this.dxt = this.dyt = 0;
        },
        /**
         * Second step of node pre-processing.
         * @method
         * @param {number} dt - time increment [s].
         * @returns {boolean} dependency exists.
         */
        pre(dt) {
            // apply optional gravitational force
            if (!this.base && this.model.hasGravity) {
                this.Qx += this.m * mec.from_m(this.model.gravity.x);
                this.Qy += this.m * mec.from_m(this.model.gravity.y);
            }
            // semi-implicite Euler step ... !
            this.dxt += this.Qx * this.im * dt;
            this.dyt += this.Qy * this.im * dt;

            // increasing velocity is done dynamically and implicitly by using `xtcur, ytcur` during iteration ...

            // increase positions using previously incremented velocities ... !
            // x = x0 + (dx/dt)*dt + 1/2*(dv/dt)*dt^2
            this.x += (this.xt + 1.5 * this.dxt) * dt;
            this.y += (this.yt + 1.5 * this.dyt) * dt;
        },

        /**
         * Node post-processing.
         * @method
         * @param {number} dt - time increment [s].
         * @returns {boolean} dependency exists.
         */
        post(dt) {
            // update velocity from `xtcur, ytcur`
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt / dt;
            this.ytt = this.dyt / dt;
        },
        asJSON() {
            return '{ "id":"' + this.id + '","x":' + this.x0 + ',"y":' + this.y0
                + (this.base ? ',"base":true' : '')
                + ((!this.base && this.m !== 1) ? ',"m":' + this.m : '')
                + (this.idloc ? ',"idloc":"' + this.idloc + '"' : '')
                + ' }';
        },

        // analysis getters
        get force() { return { x: this.Qx, y: this.Qy }; },
        get pos() { return { x: this.x, y: this.y }; },
        get vel() { return { x: this.xt, y: this.yt }; },
        get acc() { return { x: this.xtt, y: this.ytt }; },
        get forceAbs() { return Math.hypot(this.Qx, this.Qy); },
        get velAbs() { return Math.hypot(this.xt, this.yt); },
        get accAbs() { return Math.hypot(this.xtt, this.ytt); },

        // interaction
        get showInfo() {
            return this.state & g2.OVER;
        },
        get infos() {
            return {
                'id': () => `'${this.id}'`,
                'pos': () => `p=(${this.x.toFixed(0)},${this.y.toFixed(0)})`,
                'vel': () => `v=(${mec.to_m(this.xt).toFixed(2)},${mec.to_m(this.yt).toFixed(2)})m/s`,
                'm': () => `m=${this.m}`
            }
        },
        info(q) { const i = this.infos[q]; return i ? i() : '?'; },
        //        _info() { return `x:${this.x.toFixed(1)}<br>y:${this.y.toFixed(1)}` },
        hitInner({ x, y, eps }) {
            return g2.isPntInCir({ x, y }, this, eps);
        },
        selectBeg({ x, y, t }) { },
        selectEnd({ x, y, t }) {
            if (!this.base) {
                this.xt = this.yt = this.xtt = this.ytt = 0;
            }
        },
        drag({ x, y, mode }) {
            if (mode === 'edit' && !this.base) { this.x0 = x; this.y0 = y; }
            else { this.x = x; this.y = y; }
        },
        // graphics ...
        get isSolid() { return true },
        get sh() {
            return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor]
                : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor]
                    : false;
        },
        get r() { return mec.node.radius; },

        g2() {
            const g = g2().use({
                grp: this.base ? mec.node.g2BaseNode
                    : mec.node.g2Node, x: this.x, y: this.y, sh: this.sh
            });
            if (this.model.env.show.nodeLabels) {
                const loc = mec.node.locdir[this.idloc || 'n'];
                g.txt({
                    str: this.id || '?',
                    x: this.x + 3 * this.r * loc[0],
                    y: this.y + 3 * this.r * loc[1],
                    thal: 'center', tval: 'middle',
                    ls: this.model.env.show.txtColor
                });
            }
            return g;
        },
        draw(g) {
            if (this.model.env.show.nodes)
                g.ins(this);
        }
    },
    radius: 5,
    locdir: {
        e: [1, 0], ne: [Math.SQRT2 / 2, Math.SQRT2 / 2], n: [0, 1], nw: [-Math.SQRT2 / 2, Math.SQRT2 / 2],
        w: [-1, 0], sw: [-Math.SQRT2 / 2, -Math.SQRT2 / 2], s: [0, -1], se: [Math.SQRT2 / 2, -Math.SQRT2 / 2]
    },
    g2BaseNode: g2().cir({ x: 0, y: 0, r: 5, ls: "@nodcolor", fs: "@nodfill" })
        .p().m({ x: 0, y: 5 }).a({ dw: Math.PI / 2, x: -5, y: 0 }).l({ x: 5, y: 0 })
        .a({ dw: -Math.PI / 2, x: 0, y: -5 }).z().fill({ fs: "@nodcolor" }),
    g2Node: g2().cir({ x: 0, y: 0, r: 5, ls: "@nodcolor", fs: "@nodfill" })
}

mec.model.prototype.addPlugIn('nodes', mec.node);
/**
 * mec.constraint (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.drive.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain constraint objects, usually coming from JSON objects.
 * @method
 * @returns {object} constraint object.
 * @param {object} - plain javascript constraint object.
 * @property {string} id - constraint id.
 * @property {string|number} [idloc='left'] - label location ['left','right',-1..1]
 * @property {string} p1 - first point id.
 * @property {string} p2 - second point id.
 * @property {object} [ori] - orientation object.
 * @property {string} [ori.type] - type of orientation constraint ['free'|'const'|'drive'].
 * @property {number} [ori.w0] - initial angle [rad].
 * @property {string} [ori.ref] - referenced constraint id.
 * @property {string} [ori.passive] - no impulses back to referenced value (default: `false`).
 * @property {string} [ori.reftype] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [ori.func] - drive function name from `mec.drive` object ['linear'|'quadratic', ...].
 *                                 If the name points to a function in `mec.drive` (not an object as usual)
 *                                 it will be called with `ori.arg` as an argument.
 * @property {string} [ori.arg] - drive function argument.
 * @property {number} [ori.t0] - drive parameter start value.
 * @property {number} [ori.Dt] - drive parameter value range.
 * @property {number} [ori.Dw] - drive angular range [rad].
 * @property {boolean} [ori.bounce=false] - drive oscillate between drivestart and driveend.
 * @property {number} [ori.repeat] - drive parameter scaling Dt.
 * @property {boolean} [ori.input=false] - drive flags for actuation via an existing range-input with the same id.
 * @property {object} [len] - length object.
 * @property {string} [len.type] - type of length constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [len.r0] - initial length.
 * @property {string} [len.ref] - referenced constraint id.
 * @property {string} [len.passive] - no impulses back to referenced value (default: `false`).
 * @property {string} [len.reftype] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [len.ratio] - ratio to referencing value.
 * @property {string} [len.func] - drive function name ['linear'|'quadratic', ...].
 * @property {string} [len.arg] - drive function argument.
 * @property {number} [len.t0] - drive parameter start value.
 * @property {number} [len.Dt] - drive parameter value range.
 * @property {number} [len.Dr] - drive linear range.
 * @property {boolean} [len.bounce=false] - drive oscillate between drivestart and driveend.
 * @property {number} [len.repeat] - drive parameter scaling Dt.
 * @property {boolean} [len.input=false] - drive flags for actuation via an existing range-input with the same id.
 */
mec.constraint = {
    extend(c) { Object.setPrototypeOf(c, this.prototype); c.constructor(); return c; },
    prototype: {
        constructor() { }, // always parameterless .. !
        /**
         * Check constraint properties for validity.
         * @method
         * @param {number} idx - index in constraint array.
         * @returns {boolean | object} true - if no error was detected, error object otherwise.
         */
        validate(idx) {
            let tmp, warn = false;

            if (!this.id)
                return { mid: 'E_ELEM_ID_MISSING', elemtype: 'constraint', idx };
            if (this.model.elementById(this.id) !== this)
                return { mid: 'E_ELEM_ID_AMBIGIOUS', id: this.id };
            if (!this.p1)
                return { mid: 'E_CSTR_NODE_MISSING', id: this.id, loc: 'start', p: 'p1' };
            if (!this.p2)
                return { mid: 'E_CSTR_NODE_MISSING', id: this.id, loc: 'end', p: 'p2' };
            if (mec.isEps(this.p1.x - this.p2.x) && mec.isEps(this.p1.y - this.p2.y))
                warn = { mid: 'W_CSTR_NODES_COINCIDE', id: this.id, p1: this.p1.id, p2: this.p2.id };

            if (!this.hasOwnProperty('ori')) {
                this.ori = { type: 'free' };
            } else if (this.ori.type === 'drive') {
                if (this.ori.ref && this.ori.ref[this.ori.reftype || 'ori'].type === 'free')
                    return { mid: 'E_CSTR_DRIVEN_REF_TO_FREE', id: this.id, sub: 'ori', ref: this.ori.ref.id, reftype: this.ori.reftype || 'ori' };
                if (this.ratio !== undefined && this.ratio !== 1)
                    return { mid: 'E_CSTR_RATIO_IGNORED', id: this.id, sub: 'ori', ref: this.ori.ref.id, reftype: this.ori.reftype || 'ori' };
            }
            if (!this.hasOwnProperty('len')) {
                this.len = { type: 'free' };
            } else if (this.len.type === 'drive') {
                if (this.len.ref && this.len.ref[this.len.reftype || 'len'].type === 'free')
                    return { mid: 'E_CSTR_DRIVEN_REF_TO_FREE', id: this.id, sub: 'len', ref: this.len.ref.id, reftype: this.len.reftype || 'len' };
                if (this.ratio !== undefined && this.ratio !== 1)
                    return { mid: 'E_CSTR_RATIO_IGNORED', id: this.id, sub: 'len', ref: this.ori.ref.id, reftype: this.ori.reftype || 'len' };
            }
            if (!this.ori.hasOwnProperty('type'))
                this.ori.type = 'free';
            if (!this.len.hasOwnProperty('type'))
                this.len.type = 'free';

            return warn;
        },
        /**
         * Initialize constraint. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in constraint array.
         */
        init(model, idx) {
            this.model = model;
            this.assignRefs();
            if (!this.model.notifyValid(this.validate(idx))) return;

            const ori = this.ori, len = this.len;

            // initialize absolute magnitude and orientation
            this.initVector();

            this._angle = 0;   // infinite extensible angle

            if (ori.type === 'free') this.init_ori_free(ori);
            else if (ori.type === 'const') this.init_ori_const(ori);
            else if (ori.type === 'drive') this.init_ori_drive(ori);

            if (len.type === 'free') this.init_len_free(len);
            else if (len.type === 'const') this.init_len_const(len);
            else if (len.type === 'drive') this.init_len_drive(len);

            // trigonometric cache
            this._angle = this.w0;
            this.sw = Math.sin(this.w); this.cw = Math.cos(this.w);

            // lagrange identifiers
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        assignRefs() {
            if (typeof this.p1 === 'string') {
                this.p1 = this.model.nodes.find(e => e.id === this.p1);
            }
            if (typeof this.p2 === 'string') {
                this.p2 = this.model.nodes.find(e => e.id === this.p2);
            }
            if (this.ori && typeof this.ori.ref === 'string') {
                this.ori.ref = this.model.constraints.find(e => e.id === (this.ori.ref));
            }
            if (this.len && typeof this.len.ref === 'string') {
                this.len.ref = this.model.constraints.find(e => e.id === (this.len.ref));
            }
        },
        /**
         * Init vector magnitude and orientation.
         * Referenced constraints can be assumed to be already initialized here.
         */
        /*
                 initVector() {
                    const correctLen = this.len.hasOwnProperty('r0') && !this.len.hasOwnProperty('ref'),
                          correctOri = this.ori.hasOwnProperty('w0') && !this.ori.hasOwnProperty('ref');
                    this.r0 = correctLen ? this.len.r0 : Math.hypot(this.ay,this.ax);
                    this.w0 = correctOri ? this.ori.w0 : Math.atan2(this.ay,this.ax);
        
                    if (correctLen || correctOri) {
                        this.p2.x = this.p1.x + this.r0*Math.cos(this.w0);
                        this.p2.y = this.p1.y + this.r0*Math.sin(this.w0);
                    }
                },
        */
        /**
         * Remove constraint, if there are no dependencies to other objects.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         * @returns {boolean} true, the constraint was removed, otherwise false in case of existing dependencies.
         */
        remove() {
            const elms = this.model.constraints;
            return this.model.hasDependents(this) ?
                false :
                !!elms.splice(elms.indexOf(this), 1);
        },
        /**
         * Delete constraint and all depending elements from model.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        },
        initVector() {
            let correctLen = false, correctOri = false;
            if (this.len.hasOwnProperty('r0')) {
                this.r0 = this.len.r0;                 // presume absolute value ...
                correctLen = true;
                if (this.len.hasOwnProperty('ref')) {  // relative ...
                    if (this.len.reftype !== 'ori')    // reftype === 'len'
                        this.r0 += (this.len.ratio || 1) * this.len.ref.r0; // interprete as relative delta len ...
                    //  else                               // todo ...
                }
            }
            else
                this.r0 = Math.hypot(this.ay, this.ax);

            if (this.ori.hasOwnProperty('w0')) {
                this.w0 = this.ori.w0;                 // presume absolute value ...
                correctOri = true;
                if (this.ori.hasOwnProperty('ref')) {  // relative ...
                    if (this.ori.reftype !== 'len')    // reftype === 'ori'
                        this.w0 += (this.ori.ratio || 1) * this.ori.ref.w0; // interprete as relative delta angle ...
                    // else                               // todo ...
                }
            }
            else
                this.w0 = Math.atan2(this.ay, this.ax);

            if (correctLen || correctOri) {
                this.p2.x = this.p1.x + this.r0 * Math.cos(this.w0);
                this.p2.y = this.p1.y + this.r0 * Math.sin(this.w0);
            }
        },
        /**
         * Track unlimited angle
         */
        angle(w) {
            return this._angle = mec.infAngle(this._angle, w);
        },
        /**
         * Reset constraint
         */
        reset() {
            this.initVector();
            this._angle = this.w0;
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        get type() {
            const ori = this.ori, len = this.len;
            return ori.type === 'free' && len.type === 'free' ? 'free'
                : ori.type === 'free' && len.type !== 'free' ? 'rot'
                    : ori.type !== 'free' && len.type === 'free' ? 'tran'
                        : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
                            : 'invalid';
        },
        get initialized() { return this.model !== undefined },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) +
                (this.len.type === 'free' ? 1 : 0);
        },
        get lenTol() { return mec.tol.len[this.model.tolerance]; },

        // analysis getters
        /**
         * Force value in [N]
         */
        get force() { return -this.lambda_r; },
        get forceAbs() { return -this.lambda_r; },  // deprecated !
        /**
         * Moment value in [N*u]
         */
        get moment() { return -this.lambda_w * this.r; },
        /**
         * Instantaneous centre of velocity
         */
        get pole() {
            return { x: this.p1.x - this.p1.yt / this.wt, y: this.p1.y + this.p1.xt / this.wt };
        },
        get velPole() { return this.pole; },
        /**
         * Inflection pole
         */
        get inflPole() {
            return {
                x: this.p1.x + this.p1.xtt / this.wt ** 2 - this.wtt / this.wt ** 3 * this.p1.xt,
                y: this.p1.y + this.p1.ytt / this.wt ** 2 - this.wtt / this.wt ** 3 * this.p1.yt
            };
        },
        /**
         * Acceleration pole
         */
        get accPole() {
            const wt2 = this.wt ** 2,
                wtt = this.wtt,
                den = wtt ** 2 + wt2 ** 2;
            return {
                x: this.p1.x + (wt2 * this.p1.xtt - wtt * this.p1.ytt) / den,
                y: this.p1.y + (wt2 * this.p1.ytt + wtt * this.p1.xtt) / den
            };
        },

        /**
         * Number of active drives.
         * @method
         * @param {number} t - current time.
         * @returns {int} Number of active drives.
         */
        activeDriveCount(t) {
            let ori = this.ori, len = this.len, drvCnt = 0;
            if (ori.type === 'drive' && (ori.input || t <= ori.t0 + ori.Dt * (ori.bounce ? 2 : 1) * (ori.repeat || 1) + 0.5 * this.model.timer.dt))
                ++drvCnt;
            if (len.type === 'drive' && (len.input || t <= len.t0 + len.Dt * (len.bounce ? 2 : 1) * (len.repeat || 1) + 0.5 * this.model.timer.dt))
                ++drvCnt;
            return drvCnt;
        },
        /**
         * Check constraint for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} dependency exists.
         */
        dependsOn(elem) {
            return this.p1 === elem
                || this.p2 === elem
                || this.ori && this.ori.ref === elem
                || this.len && this.len.ref === elem;
        },
        /**
         * Check constraint for deep (indirect) dependency on another element.
         * @method
         * @param {object} elem - element to test deep dependency for.
         * @returns {boolean} dependency exists.
         */
        /*
        deepDependsOn(target) {
            return this === target
                || this.dependsOn(target)
                || this.model.deepDependsOn(this.p1,target)
                || this.model.deepDependsOn(this.p2,target)
                || this.ori && this.model.deepDependsOn(this.ori.ref,target)
                || this.len && this.model.deepDependsOn(this.len.ref,target);
        },
        */
        // privates
        get ax() { return this.p2.x - this.p1.x },
        get ay() { return this.p2.y - this.p1.y },
        get axt() { return this.p2.xtcur - this.p1.xtcur },
        get ayt() { return this.p2.ytcur - this.p1.ytcur },
        get axtt() { return this.p2.xtt - this.p1.xtt },
        get aytt() { return this.p2.ytt - this.p1.ytt },
        // default orientational constraint equations
        get ori_C() { return this.ay * this.cw - this.ax * this.sw; },
        get ori_Ct() { return this.ayt * this.cw - this.axt * this.sw - this.wt * this.r; },
        get ori_mc() {
            const imc = mec.toZero(this.p1.im + this.p2.im);
            return imc ? 1 / imc : 0;
        },
        // default magnitude constraint equations
        get len_C() { return this.ax * this.cw + this.ay * this.sw - this.r; },
        get len_Ct() { return this.axt * this.cw + this.ayt * this.sw - this.rt; },
        get len_mc() {
            let imc = mec.toZero(this.p1.im + this.p2.im);
            return (imc ? 1 / imc : 0);
        },

        /**
         * Perform preprocess step.
         * @param {number} dt - time increment.
         */
        pre(dt) {
            let w = this.w;
            // perfect location to update trig. cache
            this.cw = Math.cos(w);
            this.sw = Math.sin(w);
            // apply angular impulse (warmstarting)
            this.ori_impulse_vel(this.lambda_w * dt);
            // apply axial impulse (warmstarting)
            this.len_impulse_vel(this.lambda_r * dt);

            this.dlambda_r = this.dlambda_w = 0; // important !!
        },
        post(dt) {
            // apply angular impulse  Q = J^T * lambda
            this.lambda_w += this.dlambda_w;
            this.ori_apply_Q(this.lambda_w)
            // apply radial impulse  Q = J^T * lambda
            this.lambda_r += this.dlambda_r;
            this.len_apply_Q(this.lambda_r)
        },
        /**
         * Perform position step.
         */
        posStep() {
            let res, w = this.w;
            // perfect location to update trig. cache
            this.cw = Math.cos(w);
            this.sw = Math.sin(w);
            return this.type === 'free' ? true
                : this.type === 'rot' ? this.len_pos()
                    : this.type === 'tran' ? this.ori_pos()
                        : this.type === 'ctrl' ? (res = this.ori_pos(), (this.len_pos() && res))
                            : false;
        },
        /**
         * Perform velocity step.
         */
        velStep(dt) {
            let res;
            return this.type === 'free' ? true
                : this.type === 'rot' ? this.len_vel(dt)
                    : this.type === 'tran' ? this.ori_vel(dt)
                        : this.type === 'ctrl' ? (res = this.ori_vel(dt), (this.len_vel(dt) && res))
                            : false;
        },

        /**
         * Calculate orientation.
         */
        ori_pos() {
            const C = this.ori_C, impulse = -this.ori_mc * C;

            this.ori_impulse_pos(impulse);
            if (this.ori.ref && !this.ori.passive) {
                const ref = this.ori.ref;
                if (this.ori.reftype === 'len')
                    ref.len_impulse_pos(-(this.ori.ratio || 1) * impulse);
                else
                    ref.ori_impulse_pos(-(this.ori.ratio || 1) * this.r / ref.r * impulse);
            }

            return mec.isEps(C, mec.lenTol);  // orientation constraint satisfied .. !
        },
        /**
         * Calculate orientational velocity.
         * @param {dt} - time increment.
         */
        ori_vel(dt) {
            const Ct = this.ori_Ct, impulse = -this.ori_mc * Ct;

            this.ori_impulse_vel(impulse);
            this.dlambda_w += impulse / dt;
            if (this.ori.ref && !this.ori.passive) {
                const ref = this.ori.ref,
                    ratioimp = impulse * (this.ori.ratio || 1);
                if (this.ori.reftype === 'len') {
                    ref.len_impulse_vel(-ratioimp);
                    ref.dlambda_r -= ratioimp / dt;
                }
                else {
                    const refimp = this.r / this.ori.ref.r * ratioimp;
                    ref.ori_impulse_vel(-refimp);
                    ref.dlambda_w -= refimp / dt;
                }
            }

            //            return Math.abs(impulse/dt) < mec.forceTol;  // orientation constraint satisfied .. !
            return mec.isEps(Ct * dt, mec.lenTol);  // orientation constraint satisfied .. !
        },
        /**
         * Apply pseudo impulse `impulse` from ori constraint to its node positions.
         * 'delta q = -W * J^T * m_c * C'
         * @param {number} impulse - pseudo impulse.
         */
        ori_impulse_pos(impulse) {
            this.p1.x += this.p1.im * this.sw * impulse;
            this.p1.y += -this.p1.im * this.cw * impulse;
            this.p2.x += -this.p2.im * this.sw * impulse;
            this.p2.y += this.p2.im * this.cw * impulse;
        },
        /**
         * Apply impulse `impulse` from ori constraint to its node displacements.
         * 'delta dot q = -W * J^T * m_c * dot C'
         * @param {number} impulse - impulse.
         */
        ori_impulse_vel(impulse) {
            this.p1.dxt += this.p1.im * this.sw * impulse;
            this.p1.dyt += -this.p1.im * this.cw * impulse;
            this.p2.dxt += -this.p2.im * this.sw * impulse;
            this.p2.dyt += this.p2.im * this.cw * impulse;
        },
        /**
         * Apply constraint force `lambda` from ori constraint to its nodes.
         * 'Q_c = J^T * lambda'
         * @param {number} lambda - moment.
         */
        ori_apply_Q(lambda) {
            this.p1.Qx += this.sw * lambda;
            this.p1.Qy += -this.cw * lambda;
            this.p2.Qx += -this.sw * lambda;
            this.p2.Qy += this.cw * lambda;
        },

        /**
         * Calculate length.
         */
        len_pos() {
            const C = this.len_C, impulse = -this.len_mc * C;

            this.len_impulse_pos(impulse);
            if (this.len.ref && !this.len.passive) {
                if (this.len.reftype === 'ori')
                    this.len.ref.ori_impulse_pos(-(this.len.ratio || 1) * impulse);
                else
                    this.len.ref.len_impulse_pos(-(this.len.ratio || 1) * impulse);
            }
            return mec.isEps(C, mec.lenTol); // length constraint satisfied .. !
        },
        /**
         * Calculate length velocity.
         * @param {number} dt - time increment.
         */
        len_vel(dt) {
            const Ct = this.len_Ct, impulse = -this.len_mc * Ct;

            this.len_impulse_vel(impulse);
            this.dlambda_r += impulse / dt;
            if (this.len.ref && !this.len.passive) {
                const ref = this.len.ref,
                    ratioimp = impulse * (this.ori.ratio || 1);
                if (this.len.reftype === 'ori') {
                    ref.ori_impulse_vel(-ratioimp);
                    ref.dlambda_w -= ratioimp / dt;
                }
                else {
                    ref.len_impulse_vel(-ratioimp);
                    ref.dlambda_r -= ratioimp / dt;
                }
            }
            return mec.isEps(Ct * dt, mec.lenTol); // velocity constraint satisfied .. !
        },
        /**
         * Apply pseudo impulse `impulse` from len constraint to its node positions.
         * 'delta q = -W * J^T * m_c * C'
         * @param {number} impulse - pseudo impulse.
         */
        len_impulse_pos(impulse) {
            this.p1.x += -this.p1.im * this.cw * impulse;
            this.p1.y += -this.p1.im * this.sw * impulse;
            this.p2.x += this.p2.im * this.cw * impulse;
            this.p2.y += this.p2.im * this.sw * impulse;
        },
        /**
         * Apply impulse `impulse` from len constraint to its node displacements.
         * 'delta dot q = -W * J^T * m_c * dot C'
         * @param {number} impulse - impulse.
         */
        len_impulse_vel(impulse) {
            this.p1.dxt += -this.p1.im * this.cw * impulse;
            this.p1.dyt += -this.p1.im * this.sw * impulse;
            this.p2.dxt += this.p2.im * this.cw * impulse;
            this.p2.dyt += this.p2.im * this.sw * impulse;
        },
        /**
         * Apply force `lambda` from len constraint to its node forces.
         * 'Q_c = J^T * lambda'
         * @param {number} lambda - force.
         */
        len_apply_Q(lambda) {
            this.p1.Qx += -this.cw * lambda;
            this.p1.Qy += -this.sw * lambda;
            this.p2.Qx += this.cw * lambda;
            this.p2.Qy += this.sw * lambda;
        },
        /**
         * Initialize a free orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_free(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : this.angle(Math.atan2(this.ay, this.ax));
            mec.assignGetters(this, {
                w: () => this.angle(Math.atan2(this.ay, this.ax)),
                wt: () => (this.ayt * this.cw - this.axt * this.sw) / this.r,
                wtt: () => (this.aytt * this.cw - this.axtt * this.sw) / this.r
            });
        },
        /**
         * Initialize a const orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_const(ori) {
            if (!!ori.ref) {
                const ref = ori.ref = this.model.constraints.find(e => e.id === (ori.ref)) || ori.ref,
                    reftype = ori.reftype || 'ori',
                    ratio = ori.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);  // 'idx' argument not necessary here !

                if (reftype === 'ori') {
                    const w0 = ori.hasOwnProperty('w0') ? ref.w0 + ori.w0 : Math.atan2(this.ay, this.ax);

                    mec.assignGetters(this, {
                        w: () => w0 + ratio * (ref.w - ref.w0),
                        wt: () => ratio * ref.wt,
                        wtt: () => ratio * ref.wtt,
                        ori_C: () => this.ay * this.cw - this.ax * this.sw - ratio * this.r / (ref.r || 1) * (ref.ay * ref.cw - ref.ax * ref.sw),
                        ori_Ct: () => this.ayt * this.cw - this.axt * this.sw - ratio * this.r / (ref.r || 1) * (ref.ayt * ref.cw - ref.axt * ref.sw),
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio ** 2 * this.r ** 2 / (ref.r || 1) ** 2 * mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });
                }
                else { // reftype === 'len'
                    const w0 = ori.hasOwnProperty('w0') ? ref.w0 + ori.w0 : Math.atan2(this.ay, this.ax);

                    mec.assignGetters(this, {
                        w: () => w0 + ratio * (ref.r - ref.r0) / this.r,
                        wt: () => ratio * ref.rt,
                        wtt: () => ratio * ref.rtt,
                        ori_C: () => this.r * (this.angle(Math.atan2(this.ay, this.ax)) - w0) - ratio * (ref.ax * ref.cw + ref.ay * ref.sw - ref.r0),
                        ori_Ct: () => this.ayt * this.cw - this.axt * this.sw - ratio * (ref.axt * ref.cw + ref.ayt * ref.sw),
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio ** 2 * mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });
                }
            }
            else {
                mec.assignGetters(this, {
                    w: () => this.w0,
                    wt: () => 0,
                    wtt: () => 0,
                });
            }
        },
        /**
         * Initialize a driven orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_drive(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : this.angle(Math.atan2(this.ay, this.ax));

            ori.Dw = ori.Dw || 2 * Math.PI;
            ori.t0 = ori.t0 || 0;
            ori.Dt = ori.Dt || 1;

            if (ori.input) {
                // maintain a local input controlled time 'local_t'.
                ori.local_t = 0;
                ori.t = () => !this.model.state.preview ? ori.local_t : this.model.timer.t;
                ori.inputCallbk = (w) => { ori.local_t = w * Math.PI / 180 * ori.Dt / ori.Dw; };
            }
            else
                ori.t = () => this.model.timer.t;

            ori.drive = mec.drive.create({
                func: ori.func || ori.input && 'static' || 'linear',
                z0: ori.ref ? 0 : this.w0,
                Dz: ori.Dw,
                t0: ori.t0,
                Dt: ori.Dt,
                t: ori.t,
                bounce: ori.bounce,
                repeat: ori.repeat,
                args: ori.args
            });

            if (!!ori.ref) {
                const ref = ori.ref = this.model.constraints.find(e => e.id === ori.ref) || ori.ref,
                    reftype = ori.reftype || 'ori',
                    ratio = ori.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'ori')
                    mec.assignGetters(this, {
                        w: () => this.w0 + (ref.w - ref.w0) + ori.drive.f(),
                        wt: () => ref.wt + ori.drive.ft(),
                        wtt: () => ref.wtt + ori.drive.ftt(),
                        ori_C: () => this.r * (this.angle(Math.atan2(this.ay, this.ax)) - this.w0) - this.r * (ref.angle(Math.atan2(ref.ay, ref.ax)) - ref.w0) - this.r * ori.drive.f(),
                        ori_Ct: () => { return this.ayt * this.cw - this.axt * this.sw - this.r / ref.r * (ref.ayt * ref.cw - ref.axt * ref.sw) - this.r * ori.drive.ft() },
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + this.r ** 2 / ref.r ** 2 * mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });

                else // reftype === 'len'
                    mec.assignGetters(this, {
                        w: () => this.w0 + ratio * (ref.r - ref.r0) + ori.drive.f(),
                        wt: () => ratio * ref.rt + ori.drive.ft(),
                        wtt: () => ratio * ref.rtt + ori.drive.ftt()
                    });
            }
            else {
                mec.assignGetters(this, {
                    w: ori.drive.f,
                    wt: ori.drive.ft,
                    wtt: ori.drive.ftt
                });
            }
        },
        /**
         * Initialize a free elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_free(len) {
            mec.assignGetters(this, {
                r: () => this.ax * this.cw + this.ay * this.sw,
                rt: () => this.axt * this.cw + this.ayt * this.sw,
                rtt: () => this.axtt * this.cw + this.aytt * this.sw,
            })
        },
        /**
         * Initialize a constant elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_const(len) {
            if (!!len.ref) {
                const ref = len.ref = this.model.constraints.find(e => e.id === len.ref) || len.ref,
                    reftype = len.reftype || 'len',
                    ratio = len.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'len')
                    //                    const r0 = ori.hasOwnProperty('r0') ? ref.w0 + ori.w0 : Math.atan2(this.ay,this.ax);
                    mec.assignGetters(this, {
                        r: () => this.r0 + ratio * (ref.r - ref.r0),
                        rt: () => ratio * ref.rt,
                        rtt: () => ratio * ref.rtt,
                        len_C: () => (this.ax * this.cw + this.ay * this.sw - this.r0) - ratio * (ref.ax * ref.cw + ref.ay * ref.sw - ref.r0),
                        len_Ct: () => this.axt * this.cw + this.ayt * this.sw - ratio * (ref.axt * ref.cw + ref.ayt * ref.sw),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio ** 2 * mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });
                else // reftype === 'ori'
                    mec.assignGetters(this, {
                        r: () => this.r0 + ratio * ref.r * (ref.w - ref.w0),
                        rt: () => ratio * ref.wt,
                        rtt: () => ratio * ref.wtt,
                        len_C: () => this.ax * this.cw + this.ay * this.sw - this.r0 - ratio * ref.r * (ref.angle(Math.atan2(ref.ay, ref.ax)) - ref.w0),
                        len_Ct: () => this.axt * this.cw + this.ayt * this.sw - ratio * (ref.ayt * ref.cw - ref.axt * ref.sw),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio ** 2 * mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });
            }
            else {
                mec.assignGetters(this, {
                    r: () => this.r0,
                    rt: () => 0,
                    rtt: () => 0,
                });
            }
        },
        /**
         * Initialize a driven elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_drive(len) {
            this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay, this.ax);

            len.Dr = len.Dr || 100;
            len.t0 = len.t0 || 0;
            len.Dt = len.Dt || 1;

            if (len.input) {
                // maintain a local input controlled time 'local_t'.
                len.local_t = 0;
                len.t = () => !this.model.state.preview ? len.local_t : this.model.timer.t;
                len.inputCallbk = (u) => { len.local_t = u * len.Dt / len.Dr; };
            }
            else
                len.t = () => this.model.timer.t;

            len.drive = mec.drive.create({
                func: len.func || len.input && 'static' || 'linear',
                z0: len.ref ? 0 : this.r0,
                Dz: len.Dr,
                t0: len.t0,
                Dt: len.Dt,
                t: len.t,
                bounce: len.bounce,
                repeat: len.repeat,
                args: len.args
            });

            if (!!len.ref) {
                const ref = len.ref = this.model.constraints.find(e => e.id === len.ref) || len.ref,
                    reftype = len.reftype || 'len',
                    ratio = len.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'len')
                    mec.assignGetters(this, {
                        r: () => this.r0 + ratio * (ref.r - ref.r0) + len.drive.f(),
                        rt: () => ref.rt + len.drive.ft(),
                        rtt: () => ref.rtt + len.drive.ftt(),
                        len_C: () => (this.ax * this.cw + this.ay * this.sw - this.r0) - (ref.ax * ref.cw + ref.ay * ref.sw - ref.r0) - len.drive.f(),
                        len_Ct: () => this.axt * this.cw + this.ayt * this.sw - (ref.axt * ref.cw + ref.ayt * ref.sw) - len.drive.ft(),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1 / imc : 0;
                        }
                    });
                else // reftype === 'ori'
                    mec.assignGetters(this, {
                        r: () => this.r0 + ratio * (ref.w - ref.w0) + len.drive.f(),
                        rt: () => ratio * ref.wt + len.drive.ft(),
                        rtt: () => ratio * ref.wtt + len.drive.ftt()
                    });
            }
            else {
                mec.assignGetters(this, {
                    r: len.drive.f,
                    rt: len.drive.ft,
                    rtt: len.drive.ftt
                });
            }
        },
        asJSON() {
            let jsonString = '{ "id":"' + this.id + '","p1":"' + this.p1.id + '","p2":"' + this.p2.id + '"';

            if (this.len && !(this.len.type === 'free')) {
                jsonString += (this.len.type === 'const' ? ',"len":{ "type":"const"' : '')
                    + (this.len.type === 'drive' ? ',"len":{ "type":"drive"' : '')
                    + (this.len.ref ? ',"ref":"' + this.len.ref.id + '"' : '')
                    + (this.len.reftype ? ',"reftype":"' + this.len.reftype + '"' : '')
                    + (this.len.r0 && this.len.r0 > 0.0001 ? ',"r0":' + this.len.r0 : '')
                    + (this.len.ratio && Math.abs(this.len.ratio - 1) > 0.0001 ? ',"ratio":' + this.len.ratio : '')
                    + (this.len.func ? ',"func":"' + this.len.func + '"' : '')
                    + (this.len.arg ? ',"arg":"' + this.len.arg + '"' : '')
                    + (this.len.t0 && this.len.t0 > 0.0001 ? ',"t0":' + this.len.t0 : '')
                    + (this.len.Dt ? ',"Dt":' + this.len.Dt : '')
                    + (this.len.Dr ? ',"Dr":' + this.len.Dr : '')
                    + (this.len.bounce ? ',"bounce":true' : '')
                    + (this.len.input ? ',"input":true' : '')
                    + ' }'
            };

            if (this.ori && !(this.ori.type === 'free')) {
                jsonString += (this.ori.type === 'const' ? ',"ori":{ "type":"const"' : '')
                    + (this.ori.type === 'drive' ? ',"ori":{ "type":"drive"' : '')
                    + (this.ori.ref ? ',"ref":"' + this.ori.ref.id + '"' : '')
                    + (this.ori.reftype ? ',"reftype":"' + this.ori.reftype + '"' : '')
                    + (this.ori.w0 && this.ori.w0 > 0.0001 ? ',"r0":' + this.ori.w0 : '')
                    + (this.ori.ratio && Math.abs(this.ori.ratio - 1) > 0.0001 ? ',"ratio":' + this.ori.ratio : '')
                    + (this.ori.func ? ',"func":"' + this.ori.func + '"' : '')
                    + (this.ori.arg ? ',"arg":"' + this.ori.arg + '"' : '')
                    + (this.ori.t0 && this.ori.t0 > 0.0001 ? ',"t0":' + this.ori.t0 : '')
                    + (this.ori.Dt ? ',"Dt":' + this.ori.Dt : '')
                    + (this.ori.Dw ? ',"Dw":' + this.ori.Dw : '')
                    + (this.ori.bounce ? ',"bounce":true' : '')
                    + (this.ori.input ? ',"input":true' : '')
                    + ' }'
            };

            jsonString += ' }';

            return jsonString;
        },
        // interaction
        get showInfo() {
            return this.state & g2.OVER;
        },
        get infos() {
            return {
                'id': () => `'${this.id}'`,
                'pos': () => `r=${this.r.toFixed(1)},&phi;=${mec.toDeg(this.w).toFixed(0) % 360}°`,
                'vel': () => `rt=${mec.to_m(this.rt).toFixed(2)}m/s,&phi;t=${this.wt.toFixed(2)}rad/s`,
                'load': () => `F=${mec.toZero(mec.to_N(this.force)).toPrecision(3)},M=${mec.toZero(mec.toDeg(this.moment)).toPrecision(3)}`
            }
        },
        info(q) { const i = this.infos[q]; return i ? i() : '?'; },

        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
        hitContour({ x, y, eps }) {
            const p1 = this.p1, p2 = this.p2,
                dx = this.p2.x - this.p1.x, dy = this.p2.y - this.p1.y,
                len = Math.hypot(dy, dx) || 0,
                off = len ? 2 * mec.node.radius / len : 0;
            return g2.isPntOnLin({ x, y }, { x: p1.x + off * dx, y: p1.y + off * dy },
                { x: p2.x - off * dx, y: p2.y - off * dy }, eps);
        },
        // drawing
        get color() {
            return this.model.valid
                ? this.ls || this.model.env.show.validConstraintColor
                : this.model.env.show.colors.invalidConstraintColor;  // due to 'this.model.env.show.invalidConstraintColor' undefined
        },
        g2() {
            const { p1, w, r, type, id, idloc } = this,
                g = g2().beg({
                    x: p1.x, y: p1.y, w, scl: 1, lw: 2,
                    ls: this.model.env.show.constraintVectorColor,
                    fs: '@ls', lc: 'round', sh: this.sh
                })
                    .p()
                    .m({ x: !this.ls && r > 50 ? 50 : 0, y: 0 })
                    .l({ x: r, y: 0 })
                    .stroke({ ls: this.color, lw: this.lw || 2, ld: this.ld || [], lsh: true })
                    .drw({ d: mec.constraint.arrow[type], lsh: true })
                    .end();

            if (this.model.env.show.constraintLabels) {
                let idstr = id || '?', cw = this.cw, sw = this.sw,
                    u = idloc === 'left' ? 0.5
                        : idloc === 'right' ? -0.5
                            : idloc + 0 === idloc ? idloc  // is numeric
                                : 0.5,
                    lam = Math.abs(u) * 45, mu = u > 0 ? 10 : -15,
                    xid = p1.x + lam * cw - mu * sw,
                    yid = p1.y + lam * sw + mu * cw;
                if (this.ori.type === 'ref' || this.len.type === 'ref') {
                    const comma = this.ori.type === 'ref' && this.len.type === 'ref' ? ',' : '';
                    idstr += '('
                        + (this.ori.type === 'ref' ? this.ori.ref.id : '')
                        + comma
                        + (this.len.type === 'ref' ? this.len.ref.id : '')
                        + ')';
                    xid -= 3 * sw;
                    yid += 3 * cw;
                };
                g.txt({ str: idstr, x: xid, y: yid, thal: 'center', tval: 'middle', ls: this.model.env.show.txtColor })
            }
            return g;
        },
        draw(g) {
            if (this.model.env.show.constraints)
                g.ins(this);
        }
    },
    arrow: {
        'ctrl': 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'rot': 'M12,0 8,6 12,0 8,-6Z M0,0 8,0M15,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'tran': 'M0,0 12,0M16,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'free': 'M12,0 8,6 12,0 8,-6ZM0,0 8,0M15,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z'
    }
}

mec.model.prototype.addPlugIn('constraints', mec.constraint);
/**
 * mec.drive (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 */
"use strict";

/**
 * @namespace mec.drive namespace for drive types of the mec library.
 * They are named and implemented after VDI 2145 and web easing functions.
 */
mec.drive = {
    create({ func, z0, Dz, t0, Dt, t, bounce, repeat, args }) {
        const isin = (x, x1, x2) => x >= x1 && x < x2;
        let drv = func && func in mec.drive ? mec.drive[func] : mec.drive.linear,
            DtTotal = Dt;

        if (typeof drv === 'function') {
            drv = drv(args);
        }
        if (bounce && func !== 'static') {
            drv = mec.drive.bounce(drv);
            DtTotal *= 2;  // preserve duration while bouncing
        }
        if (repeat && func !== 'static') {
            drv = mec.drive.repeat(drv, repeat);
            DtTotal *= repeat;  // preserve duration per repetition
        }
        return {
            f: () => z0 + drv.f(Math.max(0, Math.min((t() - t0) / DtTotal, 1))) * Dz,
            ft: () => isin(t(), t0, t0 + DtTotal) ? drv.fd((t() - t0) / DtTotal) * Dz / Dt : 0,
            ftt: () => isin(t(), t0, t0 + DtTotal) ? drv.fdd((t() - t0) / DtTotal) * Dz / Dt / Dt : 0
        };
    },
    "const": {   // used for resting segments in a composite drive sequence.
        f: (q) => 0, fd: (q) => 0, fdd: (q) => 0
    },
    linear: {
        f: (q) => q, fd: (q) => 1, fdd: (q) => 0
    },
    quadratic: {
        f: (q) => q <= 0.5 ? 2 * q * q : -2 * q * q + 4 * q - 1,
        fd: (q) => q <= 0.5 ? 4 * q : -4 * q + 4,
        fdd: (q) => q <= 0.5 ? 4 : -4
    },
    harmonic: {
        f: (q) => (1 - Math.cos(Math.PI * q)) / 2,
        fd: (q) => Math.PI / 2 * Math.sin(Math.PI * q),
        fdd: (q) => Math.PI * Math.PI / 2 * Math.cos(Math.PI * q)
    },
    sinoid: {
        f: (q) => q - Math.sin(2 * Math.PI * q) / 2 / Math.PI,
        fd: (q) => 1 - Math.cos(2 * Math.PI * q),
        fdd: (q) => Math.sin(2 * Math.PI * q) * 2 * Math.PI
    },
    poly5: {
        f: (q) => (10 - 15 * q + 6 * q * q) * q * q * q,
        fd: (q) => (30 - 60 * q + 30 * q * q) * q * q,
        fdd: (q) => (60 - 180 * q + 120 * q * q) * q
    },
    static: {   // used for actuators (Stellantrieb) without velocities and accelerations
        f: (q) => q, fd: (q) => 0, fdd: (q) => 0
    },
    seq(segments) {
        let zmin = Number.POSITIVE_INFINITY,
            zmax = Number.NEGATIVE_INFINITY,
            z = 0, Dz = 0, Dt = 0,
            segof = (t) => {
                let tsum = 0, zsum = 0, dz;
                for (const seg of segments) {
                    dz = seg.dz || 0;
                    if (tsum <= t && t <= tsum + seg.dt) {
                        return {
                            f: zsum + mec.drive[seg.func].f((t - tsum) / seg.dt) * dz,
                            fd: mec.drive[seg.func].fd((t - tsum) / seg.dt) * dz / Dt,
                            fdd: mec.drive[seg.func].fdd((t - tsum) / seg.dt) * dz / Dt / Dt
                        }
                    }
                    tsum += seg.dt;
                    zsum += dz;
                }
                return {};  // error
            };

        for (const seg of segments) {
            if (typeof seg.func === 'string') { // add error logging here ..
                Dt += seg.dt;
                z += seg.dz || 0;
                zmin = Math.min(z, zmin);
                zmax = Math.max(z, zmax);
            }
        }
        Dz = zmax - zmin;
        //        console.log({Dt,Dz,zmin,zmax,segof:segof(0.5*Dt).f})
        return {
            f: (q) => (segof(q * Dt).f - zmin) / Dz,
            fd: (q) => segof(q * Dt).fd / Dz,
            fdd: (q) => 0
        }
    },
    // todo .. test valid velocity and acceleration signs with bouncing !!
    bounce(drv) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f(q < 0.5 ? 2 * q : 2 - 2 * q),
            fd: q => drv.fd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1),
            fdd: q => drv.fdd(q < 0.5 ? 2 * q : 2 - 2 * q) * (q < 0.5 ? 1 : -1)
        }
    },
    repeat(drv, n) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f((q * n) % 1),
            fd: q => drv.fd((q * n) % 1),
            fdd: q => drv.fdd((q * n) % 1)
        }
    },
    // Penner's' simple potential functions ... why are they so popular ?
    pot: [{ f: q => 1, fd: q => 0, fdd: q => 0 },
    { f: q => q, fd: q => 1, fdd: q => 0 },
    { f: q => q * q, fd: q => 2 * q, fdd: q => 2 },
    { f: q => q * q * q, fd: q => 3 * q * q, fdd: q => 6 * q },
    { f: q => q * q * q * q, fd: q => 4 * q * q * q, fdd: q => 12 * q * q },
    { f: q => q * q * q * q * q, fd: q => 5 * q * q * q * q, fdd: q => 20 * q * q * q }],

    inPot(n) { return this.pot[n]; },

    outPot(n) {
        const fn = this.pot[n];
        return {
            f: q => 1 - fn.f(1 - q),
            fd: q => fn.fd(1 - q),
            fdd: q => -fn.fdd(1 - q)
        }
    },

    inOutPot(n) {
        const fn = this.pot[n], exp2 = Math.pow(2, n - 1);
        return {
            f: q => q < 0.5 ? exp2 * fn.f(q) : 1 - exp2 * fn.f(1 - q),
            fd: q => q < 0.5 ? exp2 * fn.fd(q) : exp2 * fn.fd(1 - q),
            fdd: q => q < 0.5 ? exp2 * (n - 1) * fn.fdd(q) : -exp2 * (n - 1) * fn.fdd(1 - q)
        }
    },

    get inQuad() { return this.inPot(2); },
    get outQuad() { return this.outPot(2); },
    get inOutQuad() { return this.inOutPot(2); },
    get inCubic() { return this.inPot(3); },
    get outCubic() { return this.outPot(3); },
    get inOutCubic() { return this.inOutPot(3); },
    get inQuart() { return this.inPot(4); },
    get outQuart() { return this.outPot(4); },
    get inOutQuart() { return this.inOutPot(4); },
    get inQuint() { return this.inPot(5); },
    get outQuint() { return this.outPot(5); },
    get inOutQuint() { return this.inOutPot(5); }
}

mec.model.prototype.addPlugIn('drives', mec.drive);

/**
 * mec.load (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";
/**
 * Wrapper class for extending plain load objects, usually coming from JSON objects.
 * @method
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {string} type - load type ['force'|'spring'].
 */
mec.load = {
    extend(load) {
        if (!load.type)
            load.type = 'force';
        if (mec.load[load.type]) {
            const o = Object.assign({}, this.prototype, mec.load[load.type])
            Object.setPrototypeOf(view, o);
            load.constructor();
        }
        return load;
    },
    prototype: {
        /**
         * Remove load, if there are no other objects depending on it.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} node - load to remove.
         * @returns {boolean} true, the node was removed, otherwise other objects depend on it.
         */
        remove() {
            const shapes = this.model.shapes;
            return this.model.hasDependents(this) ?
                false :
                !!shapes.splice(shapes.indexOf(this), 1);
        },
        /**
         * Delete load and all depending elements from model.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} load - load to delete.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        }
    }
}

/**
 * @param {object} - force load.
 * @property {string} p - node id, the force is acting upon.
 * @property {string} [wref] - constraint id, the force orientation is referring to.
 * @property {number} [value=1] - Force value in [N]
 * @property {number} [w0=0] - initial / offset orientation of force vector.
 * @property {number} [mode='pull'] - drawing mode of force arrow ['push'|'pull'] with regard to node.
 */
mec.load.force = {
        constructor() { }, // always parameterless .. !
        /**
         * Check force properties for validity.
         * @method
         * @param {number} idx - index in load array.
         * @returns {boolean} false - if no error / warning was detected.
         */
        validate(idx) {
            let warn = false;

            if (!this.id)
                warn = { mid: 'W_ELEM_ID_MISSING', elemtype: 'force', idx };
            if (this.p === undefined)
                return { mid: 'E_ELEM_REF_MISSING', elemtype: 'force', id: this.id, reftype: 'node', name: 'p' };
            if (!this.model.nodes.find(e => e.id === this.p))
                return { mid: 'E_ELEM_INVALID_REF', elemtype: 'force', id: this.id, reftype: 'node', name: this.p };
            else
                this.p = this.model.nodes.find(e => e.id === this.p);

            if (this.wref && !this.model.constraints.find(e => e.id === this.wref))
                return { mid: 'E_ELEM_INVALID_REF', elemtype: 'force', id: this.id, reftype: 'constraint', name: 'wref' };
            else
                this.wref = this.model.constraints.find(e => e.id === this.wref);

            if (typeof this.value === 'number' && mec.isEps(this.value))
                return { mid: 'E_FORCE_VALUE_INVALID', val: this.value, id: this.id };

            return warn;
        },
        /**
         * Initialize force. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in load array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            this._value = mec.from_N(this.value || 1);  // allow multiple init's
            this.w0 = typeof this.w0 === 'number' ? this.w0 : 0;
        },
        /**
         * Check load for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p === elem
                || this.wref === elem;
        },
        asJSON() {
            return '{ "type":"' + this.type + '","id":"' + this.id + '","p":"' + this.p.id + '"'
                + ((!!this.mode && (this.mode === 'push')) ? ',"mode":"push"' : '')
                + ((this.w0 && Math.abs(this.w0) > 0.001) ? ',"w0":' + this.w0 : '')
                + (this.wref ? ',"wref":' + this.wref.id + '"' : '')
                + (this._value && Math.abs(this._value - mec.from_N(1)) > 0.01 ? ',"value":' + mec.to_N(this._value) : '')
                + ' }';
        },

        // cartesian components
        get w() { return this.wref ? this.wref.w + this.w0 : this.w0; },
        get Qx() { return this._value * Math.cos(this.w); },
        get Qy() { return this._value * Math.sin(this.w); },
        get energy() { return 0; },
        reset() { },
        apply() {
            this.p.Qx += this.Qx;
            this.p.Qy += this.Qy;
        },
        // analysis getters
        get forceAbs() { return this._value; },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
        hitContour({ x, y, eps }) {
            const len = mec.load.force.arrowLength,   // const length for all force arrows
                p = this.p, w = this.w,
                cw = w ? Math.cos(w) : 1, sw = w ? Math.sin(w) : 0,
                off = 2 * mec.node.radius,
                x1 = this.mode === 'push' ? p.x - (len + off) * cw
                    : p.x + off * cw,
                y1 = this.mode === 'push' ? p.y - (len + off) * sw
                    : p.y + off * sw;
            return g2.isPntOnLin({ x, y }, { x: x1, y: y1 },
                { x: x1 + len * cw, y: y1 + len * sw }, eps);
        },
        g2() {
            const w = this.w,
                cw = w ? Math.cos(w) : 1, sw = w ? Math.sin(w) : 0,
                p = this.p,
                len = mec.load.force.arrowLength,
                off = 2 * mec.node.radius,
                x = this.mode === 'push' ? p.x - (len + off) * cw
                    : p.x + off * cw,
                y = this.mode === 'push' ? p.y - (len + off) * sw
                    : p.y + off * sw,
                g = g2().p().use({
                    grp: mec.load.force.arrow, x, y, w, lw: 2,
                    ls: this.model.env.show.forceColor,
                    lc: 'round', sh: this.sh, fs: '@ls'
                });

            if (this.model.env.show.loadLabels && this.id) {
                const idsign = this.mode === 'push' ? 1 : 1,
                    side = this.idloc === 'right' ? -1 : 1,
                    xid = x + idsign * 25 * cw - 12 * side * sw,
                    yid = y + idsign * 25 * sw + 12 * side * cw;
                g.txt({ str: this.id, x: xid, y: yid, thal: 'center', tval: 'middle', ls: this.model.env.show.txtColor });
            }
            return g;
        },
        draw(g) {
            g.ins(this);
        }
    }
mec.load.force.arrowLength = 45;
    mec.load.force.arrow = g2().p().m({ x: 0, y: 0 }).l({ x: 35, y: 0 }).m({ x: 45, y: 0 }).l({ x: 36, y: -3 }).l({ x: 37, y: 0 }).l({ x: 36, y: 3 }).z().drw();  // implicit arrow length ...

    /**
     * @param {object} - spring load.
     * @property {string} [p1] - referenced node id 1.
     * @property {string} [p2] - referenced node id 2.
     * @property {number} [k = 1] - spring rate.
     * @property {number} [len0] - unloaded spring length. If not specified,
     * the initial distance between p1 and p2 is taken.
     */
    mec.load.spring = {
        constructor() { }, // always parameterless .. !
        /**
         * Check spring properties for validity.
         * @method
         * @param {number} idx - index in load array.
         * @returns {boolean} false - if no error / warning was detected.
         */
        validate(idx) {
            let warn = false;

            if (!this.id)
                warn = { mid: 'W_ELEM_ID_MISSING', elemtype: 'spring', idx };

            if (this.p1 === undefined)
                return { mid: 'E_ELEM_REF_MISSING', elemtype: 'spring', id: this.id, reftype: 'node', name: 'p1' };
            if (!this.model.nodes.find(e => e.id === this.p1))
                return { mid: 'E_ELEM_INVALID_REF', elemtype: 'spring', id: this.id, reftype: 'node', name: this.p1 };
            else
                this.p1 = this.model.nodes.find(e => e.id === this.p1);

            if (this.p2 === undefined)
                return { mid: 'E_ELEM_REF_MISSING', elemtype: 'spring', id: this.id, reftype: 'node', name: 'p2' };
            if (!this.model.nodes.find(e => e.id === this.p2))
                return { mid: 'E_ELEM_INVALID_REF', elemtype: 'spring', id: this.id, reftype: 'node', name: this.p2 };
            else
                this.p2 = this.model.nodes.find(e => e.id === this.p2);

            if (typeof this.k === 'number' && mec.isEps(this.k))
                return { mid: 'E_SPRING_RATE_INVALID', id: this.id, val: this.k };

            return warn;
        },
        /**
         * Initialize spring. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in load array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            this._k = mec.from_N_m(this.k || 0.01);
            this.len0 = typeof this.len0 === 'number'
                ? this.len0
                : Math.hypot(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
        },
        /**
         * Check load for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p1 === elem
                || this.p2 === elem;
        },
        asJSON() {
            return '{ "type":"' + this.type + '","id":"' + this.id + '","p1":"' + this.p1.id + '","p2":"' + this.p2.id + '"'
                + (this._k && Math.abs(this._k - mec.from_N_m(0.01)) > 0.01 ? ',"k":' + mec.to_N_m(this._k) : '')
                + ((this.len0 && Math.abs(this.len0 - Math.hypot(this.p2.x0 - this.p1.x0, this.p2.y0 - this.p1.y0)) > 0.0001) ? ',"len0":' + this.len0 : '')
                + ' }';
        },

        // cartesian components
        get len() { return Math.hypot(this.p2.y - this.p1.y, this.p2.x - this.p1.x); },
        get w() { return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x); },
        get force() { return this._k * (this.len - this.len0); },                      // todo: rename due to analysis convention .. !
        get Qx() { return this.force * Math.cos(this.w) },
        get Qy() { return this.force * Math.sin(this.w) },
        get energy() { return 0.5 * this._k * (this.len - this.len0) ** 2; },
        reset() { },
        apply() {
            const f = this.force, w = this.w,
                Qx = f * Math.cos(w), Qy = f * Math.sin(w);
            this.p1.Qx += Qx;
            this.p1.Qy += Qy;
            this.p2.Qx -= Qx;
            this.p2.Qy -= Qy;
        },
        // analysis getters
        get forceAbs() { return this.force; },
        // interaction
        get isSolid() { return false },
        // get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
        hitContour({ x, y, eps }) {
            const p1 = this.p1, p2 = this.p2,
                w = this.w,
                cw = w ? Math.cos(w) : 1, sw = w ? Math.sin(w) : 0,
                off = 2 * mec.node.radius;
            return g2.isPntOnLin({ x, y }, { x: p1.x + off * cw, y: p1.y + off * sw },
                { x: p2.x - off * cw, y: p2.y - off * sw }, eps);
        },
        g2() {
            const h = 16,
                x1 = this.p1.x, y1 = this.p1.y,
                dx = this.p2.x - x1, dy = this.p2.y - y1,
                len = Math.hypot(dy, dx),
                w = Math.atan2(dy, dx),
                xm = len / 2,
                off = 2 * mec.node.radius,
                g = g2().beg({ x: x1, y: y1, w })
                    .p()
                    .m({ x: off, y: 0 })
                    .l({ x: xm - h / 2, y: 0 })
                    .l({ x: xm - h / 6, y: -h / 2 })
                    .l({ x: xm + h / 6, y: h / 2 })
                    .l({ x: xm + h / 2, y: 0 })
                    .l({ x: len - off, y: 0 })
                    .stroke({ ls: this.model.env.show.springColor, lw: 2, lc: 'round', lj: 'round', sh: this.sh, lsh: true })
                    .end();

            if (this.model.env.show.loadLabels && this.id) {
                const cw = len ? dx / len : 1, sw = len ? dy / len : 0,
                    idloc = this.idloc,
                    u = idloc === 'left' ? 0.5
                        : idloc === 'right' ? -0.5
                            : idloc + 0 === idloc ? idloc  // is numeric
                                : 0.5,
                    lam = Math.abs(u) * len, mu = u > 0 ? 20 : -25;

                g.txt({
                    str: this.id,
                    x: x1 + lam * cw - mu * sw,
                    y: y1 + lam * sw + mu * cw,
                    thal: 'center', tval: 'middle', ls: this.model.env.show.txtColor
                })
            }
            return g;
        },
        draw(g) {
            g.ins(this);
        }
    }

mec.model.prototype.addPlugIn('loads', mec.load);
/**
 * mec.view (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * @method
 * @param {object} - plain javascript view object.
 * @property {string} id - view id.
 * @property {string} type - view type ['vector','trace','info'].
 */
mec.view = {
    extend(view) {
        if (view.as && mec.view[view.as]) {
            const o = Object.assign({}, this.prototype, mec.view[view.as])
            Object.setPrototypeOf(view, o);
            view.constructor();
        }
        return view;
    },

    prototype: {
        /**
         * Remove view, if there are no other objects depending on it.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to remove.
         */
        remove() {
            const elms = this.model.shapes;
            return this.model.hasDependents(this) ?
                false :
                !!elms.splice(elms.indexOf(this), 1);
        },
        /**
         * Delete view and all dependent elements from model.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to delete.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        }
    }
}

/**
 * @param {object} - point view.
 * @property {string} show - kind of property to show as point.
 * @property {string} of - element property belongs to.
 */
mec.view.point = {
    constructor() { }, // always parameterless .. !
    /**
     * Check point view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.of === undefined)
            return { mid: 'E_ELEM_MISSING', elemtype: 'view as point', id: this.id, idx, reftype: 'element', name: 'of' };
        if (!this.model.elementById(this.of))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'view as point', id: this.id, idx, reftype: 'element', name: this.of };
        else
            this.of = this.model.elementById(this.of);

        if (this.show && !(this.show in this.of))
            return { mid: 'E_ALY_PROP_INVALID', elemtype: 'view as point', id: this.id, idx, reftype: this.of, name: this.show };

        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model, idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
        this.p = Object.assign({}, this.of[this.show]);
        this.p.r = this.r;
    },
    dependsOn(elem) {
        return this.of === elem || this.ref === elem;
    },
    reset() {
        Object.assign(this.p, this.of[this.show]);
    },
    post() {
        Object.assign(this.p, this.of[this.show]);
    },
    asJSON() {
        return '{ "show":"' + this.show + '","of":"' + (this.show === 'cog' ? 'model' : this.of.id) + '","as":"point" }';
    },
    // interaction
    get r() { return 6; },
    get isSolid() { return true },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitInner({ x, y, eps }) {
        return g2.isPntInCir({ x, y }, this.p, eps);
    },
    g2() {
        return this.g2cache
            || (this.g2cache = g2().beg({ x: () => this.p.x, y: () => this.p.y, sh: () => this.sh })
                .cir({ r: 6, fs: 'snow' })
                .cir({ r: 2.5, fs: '@ls', ls: 'transparent' })
                .end());
    },
    draw(g) { g.ins(this); },
}

/**
 * @param {object} - vector view.
 * @property {string} show - kind of property to show as vector.
 * @property {string} of - element property belongs to.
 * @property {string} [at] - node id as anchor to show vector at.
 */
mec.view.vector = {
    constructor() { }, // always parameterless .. !
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.show === undefined)
            return { mid: 'E_SHOW_PROP_MISSING', elemtype: 'view as vector', id: this.id, idx, name: 'show' };
        if (this.of === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'view as vector', id: this.id, idx, reftype: 'node', name: 'of' };
        if (!this.model.elementById(this.of))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'view as vector', id: this.id, idx, reftype: 'node', name: this.of };
        else
            this.of = this.model.elementById(this.of);

        if (this.at === undefined) {
            if ('pos' in this.of)
                Object.defineProperty(this, 'anchor', { get: () => this.of['pos'], enumerable: true, configurable: true });
            else
                return { mid: 'E_SHOW_VEC_ANCHOR_MISSING', elemtype: 'view as vector', id: this.id, idx, name: 'at' };
        }
        else {
            if (this.model.nodes.find(e => e.id === this.at)) {
                let at = this.model.nodes.find(e => e.id === this.at);
                Object.defineProperty(this, 'anchor', { get: () => at['pos'], enumerable: true, configurable: true });
            }
            else if (this.at in this.of)
                Object.defineProperty(this, 'anchor', { get: () => this.of[this.at], enumerable: true, configurable: true });
            else
                return { mid: 'E_SHOW_VEC_ANCHOR_INVALID', elemtype: 'view as vector', id: this.id, idx, name: 'at' };
        }

        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model, idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
        this.p = Object.assign({}, this.anchor);
        this.v = Object.assign({}, this.of[this.show]);
    },
    dependsOn(elem) {
        return this.of === elem || this.at === elem;
    },
    update() {
        Object.assign(this.p, this.anchor);
        Object.assign(this.v, this.of[this.show]);
        const vabs = Math.hypot(this.v.y, this.v.x);
        const vview = !mec.isEps(vabs, 0.5)
            ? mec.asympClamp(mec.aly[this.show].drwscl * vabs, 25, 100)
            : 0;
        this.v.x *= vview / vabs;
        this.v.y *= vview / vabs;
    },
    reset() { this.update(); },
    post() { this.update(); },
    asJSON() {
        return '{ "show":"' + this.show + '","of":"' + this.of.id + '","as":"vector"'
            + (this.id ? ',"id":"' + this.id + '"' : '')
            + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitContour({ x, y, eps }) {
        const p = this.p, v = this.v;
        return g2.isPntOnLin({ x, y }, p, { x: p.x + v.x, y: p.y + v.y }, eps);
    },
    g2() {
        return this.g2cache
            || (this.g2cache = g2().vec({
                x1: () => this.p.x,
                y1: () => this.p.y,
                x2: () => this.p.x + this.v.x,
                y2: () => this.p.y + this.v.y,
                ls: this.model.env.show[this.show + 'VecColor'],
                lw: 1.5,
                sh: this.sh
            }));
    },
    draw(g) { g.ins(this); },
}

/**
 * @param {object} - trace view.
 * @property {string} show - kind of property to show as trace.
 * @property {string} of - element property belongs to.
 * @property {string} ref - reference constraint id.
 * @property {string} [mode='dynamic'] - ['static','dynamic','preview'].
 * @property {string} [p] - node id to trace ... (deprecated .. use 'show':'pos' now!)
 * @property {number} [t0=0] - trace begin [s].
 * @property {number} [Dt=1] - trace duration [s].
 * @property {string} [stroke='navy'] - stroke web color.
 * @property {string} [fill='transparent'] - fill web color.
 */
mec.view.trace = {
    constructor() {
        this.pts = [];  // allocate array
    },
    /**
     * Check trace view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.of === undefined)
            return { mid: 'E_ELEM_MISSING', elemtype: 'view as trace', id: this.id, idx, reftype: 'element', name: 'of' };
        if (!this.model.elementById(this.of))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'view as trace', id: this.id, idx, reftype: 'element', name: this.of };
        else
            this.of = this.model.elementById(this.of);

        if (this.show && !(this.show in this.of))
            return { mid: 'E_ALY_INVALID_PROP', elemtype: 'view as trace', id: this.id, idx, reftype: this.of, name: this.show };

        if (this.ref && !this.model.constraints.find(e => e.id === this.ref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'view as trace', id: this.id, idx, reftype: 'constraint', name: this.ref };
        else
            this.ref = this.model.constraints.find(e => e.id === this.ref);

        // (deprecated !)
        if (this.p) {
            if (!this.model.nodes.find(e => e.id === this.p))
                return { mid: 'E_ELEM_INVALID_REF', elemtype: 'trace', id: this.id, idx, reftype: 'node', name: this.p };
            else {
                this.show = 'pos';
                this.of = this.model.nodes.find(e => e.id === this.p);
            }
        }

        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx)))
            return;

        this.t0 = this.t0 || 0;
        this.Dt = this.Dt || 1;
        this.mode = this.mode || 'dynamic';
        this.pts.length = 0;  // clear points array ...
    },
    dependsOn(elem) {
        return this.of === elem
            || this.ref === elem
            || this.p === elem;  // deprecated !!
    },
    addPoint() {
        const t = this.model.timer.t,
            pnt = this.of[this.show],
            sw = this.ref ? Math.sin(this.ref.w) : 0,      // transform to ..
            cw = this.ref ? Math.cos(this.ref.w) : 1,      // reference system, i.e ...
            xp = pnt.x - (this.ref ? this.ref.p1.x : 0),   // `ref.p1` as origin ...
            yp = pnt.y - (this.ref ? this.ref.p1.y : 0),
            p = { x: cw * xp + sw * yp, y: -sw * xp + cw * yp };
        //console.log("wref="+this.wref)
        if (this.mode === 'static' || this.mode === 'preview') {
            if (this.t0 <= t && t <= this.t0 + this.Dt)
                this.pts.push(p);
        }
        else if (this.mode === 'dynamic') {
            if (this.t0 < t)
                this.pts.push(p);
            if (this.t0 + this.Dt < t)
                this.pts.shift();
        }
    },
    preview() {
        if (this.mode === 'preview' && this.model.valid)
            this.addPoint();
    },
    reset(preview) {
        if (preview || this.mode !== 'preview')
            this.pts.length = 0;
    },
    post(dt) {  // add model.timer.t to parameter list .. or use timer as parameter everywhere !
        if (this.mode !== 'preview' && this.model.valid)
            this.addPoint();
    },
    asJSON() {
        return '{ "show":"' + this.show + '","of":"' + (this.show === 'cog' ? 'model' : this.of.id) + '","as":"' + this.as + '"'
            + (this.ref ? ',"ref":' + this.ref.id : '')
            + (this.mode !== 'dynamic' ? ',"mode":"' + this.mode + '"' : '')
            + (this.id ? ',"id":"' + this.id + '"' : '')
            + (this.Dt !== 1 ? ',"Dt":' + this.Dt : '')
            + (this.stroke && !(this.stroke === 'navy') ? ',"stroke":"' + this.stroke + '"' : '')
            + (this.fill && !(this.stroke === 'transparent') ? ',"fill":"' + this.fill + '"' : '')
            + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitContour({ x, y, eps }) {
        return false;
    },
    g2() {
        return this.g2cache
            || (this.g2cache = g2().ply({
                pts: this.pts,
                format: '{x,y}',
                x: this.ref ? () => this.ref.p1.x : 0,
                y: this.ref ? () => this.ref.p1.y : 0,
                w: this.ref ? () => this.ref.w : 0,
                ls: this.stroke || 'navy',
                lw: 1.5,
                fs: this.fill || 'transparent',
                sh: () => this.sh
            }));
    },
    draw(g) { g.ins(this); },
}

/**
 * @param {object} - info view.
 * @property {string} show - kind of property to show as info.
 * @property {string} of - element, the property belongs to.
 */
mec.view.info = {
    constructor() { }, // always parameterless .. !
    /**
     * Check info view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.of === undefined)
            return { mid: 'E_ELEM_MISSING', elemtype: 'view as info', id: this.id, idx, reftype: 'element', name: 'of' };
        if (!this.model.elementById(this.of))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'view as info', id: this.id, idx, reftype: 'element', name: this.of };
        else
            this.of = this.model.elementById(this.of);

        if (this.show && !(this.show in this.of))
            return { mid: 'E_ALY_PROP_INVALID', elemtype: 'view as infot', id: this.id, idx, reftype: this.of, name: this.show };

        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model, idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
    },
    dependsOn(elem) {
        return this.of === elem;
    },
    reset() { },
    asJSON() {
        return '{ "show":"' + this.show + '","of":"' + this.of.id + '","as":"info"'
            + (this.id ? ',"id":"' + this.id + '"' : '')
            + ' }'
    },
    get hasInfo() {
        return this.of.state === g2.OVER;  // exclude: OVER & DRAG
    },
    infoString() {
        if (this.show in this.of) {
            const val = this.of[this.show];
            const aly = mec.aly[this.name || this.show];
            const type = aly.type;
            const nodescl = (this.of.type === 'node' && this.model.env.show.nodeScaling) ? 1.5 : 1;
            const usrval = q => (q * aly.scl / nodescl).toPrecision(3);

            return (aly.name || this.show) + ': '
                + (type === 'vec' ? '{x:' + usrval(val.x) + ',y:' + usrval(val.y) + '}'
                    : usrval(val))
                + ' ' + aly.unit;
        }
        return '?';
    },
    draw(g) { }
}

/**
 * @param {object} - chart view.
 * @property {string} [mode='dynamic'] - ['static','dynamic','preview'].
 * @property {number} [t0=0] - trace begin [s].
 * @property {number} [Dt=1] - trace duration [s].
 * @property {number} [x=0] - x-position.
 * @property {number} [y=0] - y-position.
 * @property {number} [h=100] - height of chart area.
 * @property {number} [b=150] - breadth / width of chart area.
 * @property {boolean | string} [canvas=false] - Id of canvas in dom chart will be rendered to. If property evaluates to true, rendering has to be handled by the app.
 *
 * @property {string} show - kind of property to show on yaxis.
 * @property {string} of - element property belongs to.
 * 
 * @property {object} [against] -- definition of xaxis.
 * @property {string} [against.show=t] -- kind of property to show on xaxis.
 * @property {string} [against.of=timer] -- element property belongs to.
 */
mec.view.chart = {
    constructor() { }, // always parameterless .. !
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        const def = { elemtype: 'view as chart', id: this.id, idx };
        if (this.of === undefined)
            return { mid: 'E_ELEM_MISSING', ...def, reftype: 'element', name: 'of' };
        if (this.against.of === undefined)
            return { mod: 'E_ELEM_MISSING', ...def, reftype: 'element', name: 'of in against' };

        const xelem = this.model.elementById(this.against.of) || this.model[this.against.of];
        const yelem = this.model.elementById(this.of) || this.model[this.of]

        if (!xelem)
            return { mid: 'E_ELEM_INVALID_REF', ...def, reftype: 'element', name: this.against.of };
        if (!yelem)
            return { mid: 'E_ELEM_INVALID_REF', ...def, reftype: 'element', anme: this.of };
        if (this.show && !(this.show in yelem))
            return { mid: 'E_ALY_INVALID_PROP', ...def, reftype: this.of, name: this.show };

        if (this.against.show && !(this.against.show in xelem))
            return { mid: 'E_ALY_INVALID_PROP', ...def, reftype: this.against.of, name: this.against.show };

        return false;
    },
    // Get element a. a might be an element of the model, or a timer
    elem(a) {
        const ret = this.model.elementById(a.of) || this.model[a.of] || undefined;
        // Get the corresponding property from a to show on the graph
        return ret ? ret[a.show] : undefined;
    },
    // Check the mec.core.aly object for analysing parameters
    aly(val) {
        return mec.aly[val.show]
            // If it does not exist, take a normalized template
            || { get scl() { return 1 }, type: 'num', name: val.show, unit: val.unit || '' };
    },
    getAxis({ show, of }) {
        const fs = () => this.model.env.show.txtColor;
        // Don't show text "of timer" (which is default) in x-axis
        const text = `${show} ${of !== 'timer' ? `of ${of}` : ''} [ ${this.aly({ show, of }).unit} ]`;
        return {
            title: { text, style: { font: '12px serif', fs } },
            labels: { style: { fs } },
            origin: true,
            grid: true,
        };
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model, idx) {
        this.model = model;
        this.mode = this.mode || 'static';
        this.canvas = this.canvas || false;
        this.t0 = this.t0 || 0;
        this.Dt = this.Dt || 1;
        // The xAxis is referenced by the timer if not otherwise specified
        this.against = Object.assign({ show: 't', of: 'timer' }, { ...this.against });
        if (!this.model.notifyValid(this.validate(idx))) {
            return;
        }
        this.graph = Object.assign({
            x: 0, y: 0, funcs: [{ data: [] }],
            xaxis: Object.assign(this.getAxis(this.against)),
            yaxis: Object.assign(this.getAxis(this))
        }, this);
    },

    get local_t() {
        if (this.mode !== 'preview') {
            return undefined
        }
        const drive = this.model.inputControlledDrives[0]
            && this.model.inputControlledDrives[0].constraint;
        if (!drive) {
            return undefined;
        }
        if (drive.ori.type === 'drive') {
            return drive.ori.t();
        }
        else if (drive.len.type === 'drive') {
            return drive.len.t();
        }
    },
    get currentY() {
        return this.aly(this).scl * this.elem(this);
    },
    get currentX() {
        return this.aly(this.against).scl * this.elem(this.against);
    },
    get previewNod() {
        const data = this.graph.funcs[0].data;
        // this.graph.xAxis is not defined if the graph was never rendered.
        // Therefore the pntOf(...) function is not inherited by the graph => no previewNod
        if (this.mode !== 'preview' || !this.graph.xAxis || this.model.env.editing) {
            return undefined
        }
        const pt = data.findIndex(data => data.t > this.local_t)
        return pt === -1
            ? { x: 0, y: 0, scl: 0 } // If point is out of bounds
            : { ...this.graph.pntOf(data[pt] || { x: 0, y: 0 }), scl: 1 };
    },
    dependsOn(elem) {
        return this.against.of === elem || this.of === elem;
    },
    addPoint() {
        const data = this.graph.funcs[0].data;
        if (this.t0 >= this.model.timer.t) {
            return;
        }
        // In viable time span for static or preview mode
        const inTimeSpan = this.model.timer.t <= this.t0 + (this.Dt || 0);
        if (this.mode !== 'dynamic' && !inTimeSpan) {
            return;
        }
        // local_t is necessary to determine the previewNod (undefined if mode is not preview)
        data.push({ x: this.currentX, y: this.currentY, t: this.local_t });
        // Remove tail in dynamic mode
        inTimeSpan || data.shift();
        // Redundant if g2.chart gets respective update ...
        const g = this.graph;
        [g.xmin, g.xmax, g.ymin, g.ymax] = [];
    },
    preview() {
        if (this.mode === 'preview') {
            this.addPoint();
        }
    },
    reset(preview) {
        if (this.graph && (preview || this.mode !== 'preview')) {
            this.graph.funcs[0].data = [];
        }
    },
    post() {
        if (this.mode !== 'preview') {
            this.addPoint();
        }
    },
    asJSON() {
        return JSON.stringify({
            as: this.as,
            id: this.id,
            canvas: this.canvas,
            x: this.x,
            y: this.y,
            b: this.b,
            h: this.h,
            t0: this.t0,
            Dt: this.Dt,
            mode: this.mode,
            cnv: this.cnv,
            against: this.against,
            show: this.show,
            of: this.of
        });
        // TODO insert replace statements for readability....
        // .replace('"show"', '\n      "show"').replace('}}', '}\n   }')
        // .replace('"against"', '\n      "against"').replace(/[{]/gm, '{ ').replace(/[}]/gm, ' }');
    },
    draw(g) {
        if (!this.canvas) {
            g.chart(this.graph);
            // Preview is set, and an input drive is identified
            if (this.mode === 'preview') {
                // Create references for automatic modification
                g.nod({
                    x: () => this.previewNod.x,
                    y: () => this.previewNod.y,
                    scl: () => this.previewNod.scl
                });
            }
            return g;
        }
    }
}

mec.model.prototype.addPlugIn('views', mec.view);
/**
 * mec.shape (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * @method
 * @param {object} - plain javascript shape object.
 * @property {string} type - shape type ['fix'|'flt'|'slider'|'bar'|'beam'|'wheel'|'poly'|'img'].
 */
mec.shape = {
    extend(shape) {
        if (shape.type && mec.shape[shape.type]) {
            const o = Object.assign({}, this.prototype, mec.shape[shape.type]);
            Object.setPrototypeOf(shape, o);
            shape.constructor();
        }
        return shape;
    },
    prototype: {
        /**
         * Remove shape, if there are no other objects depending on it.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to remove.
         */
        remove() {
            const shapes = this.model.shapes;
            return this.model.hasDependents(this) ?
                false :
                !!shapes.splice(shapes.indexOf(this), 1);
        },
        /**
         * Delete shape and all dependent elements from model.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to delete.
         */
        purge() {
            this.model.purgeElements(this.model.dependentsOf(this));
            return this.remove();
        }
    }
}

/**
 * @param {object} - fixed node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0=0] - initial angle.
 */
mec.shape.fix = {
    /**
     * Check fixed node properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'shape', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'shape', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);
        return false;
    },
    /**
     * Initialize shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p":"' + this.p.id + '"'
            + ((this.w0 && this.w0 > 0.0001) ? ',"w0":' + this.w0 : '')
            + ' }';
    },
    draw(g) {
        g.nodfix({ x: () => this.p.x, y: () => this.p.y, w: this.w0 || 0 });
    }
}

/**
 * @param {object} - floating node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0] - initial angle.
 */
mec.shape.flt = {
    /**
     * Check floating node properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'shape', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'shape', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);
        return false;
    },
    /**
     * Initialize shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p":"' + this.p.id + '"'
            + ((this.w0 && this.w0 > 0.0001) ? ',"w0":' + this.w0 : '')
            + ' }';
    },
    draw(g) {
        g.nodflt({ x: () => this.p.x, y: () => this.p.y, w: this.w0 || 0 });
    }
}

/**
 * @param {object} - slider shape.
 * @property {string} p - referenced node id for position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0] - initial angle / -difference.
 */
mec.shape.slider = {
    /**
     * Check slider shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'slider', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'slider', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);

        if (this.wref && !this.model.constraints.find(e => e.id === this.wref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'slider', id: this.id, idx, reftype: 'constraint', name: this.wref };
        else
            this.wref = this.model.constraints.find(e => e.id === this.wref);

        return false;
    },
    /**
     * Initialize slider shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
    },
    /**
     * Check shape for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p":"' + this.p.id + '"'
            + ((this.w0 && this.w0 > 0.0001) ? ',"w0":' + this.w0 : '')
            + (this.wref ? ',"wref":"' + this.wref.id + '"' : '')
            + ' }';
    },
    draw(g) {
        const w = this.wref ? () => this.wref.w : this.w0 || 0;
        g.beg({ x: () => this.p.x, y: () => this.p.y, w })
            .rec({ x: -16, y: -10, b: 32, h: 20, ls: "@nodcolor", fs: "@linkfill", lw: 1, lj: "round" })
            .end()
    }
}

/**
 * @param {object} - bar shape.
 * @property {string} p1 - referenced node id for start point position.
 * @property {string} p2 - referenced node id for end point position.
 */
mec.shape.bar = {
    /**
     * Check bar shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p1 === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'bar', id: this.id, idx, reftype: 'node', name: 'p1' };
        if (!this.model.nodes.find(e => e.id === this.p1))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'bar', id: this.id, idx, reftype: 'node', name: this.p1 };
        else
            this.p1 = this.model.nodes.find(e => e.id === this.p1);

        if (this.p2 === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'bar', id: this.id, idx, reftype: 'node', name: 'p2' };
        if (!this.model.nodes.find(e => e.id === this.p2))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'bar', id: this.id, idx, reftype: 'node', name: this.p2 };
        else
            this.p2 = this.model.nodes.find(e => e.id === this.p2);

        return false;
    },
    /**
     * Initialize bar shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
    },
    dependsOn(elem) {
        return this.p1 === elem || this.p2 === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p1":"' + this.p1.id + '","p2":"' + this.p2.id + '" }';
    },
    draw(g) {
        const x1 = () => this.p1.x,
            y1 = () => this.p1.y,
            x2 = () => this.p2.x,
            y2 = () => this.p2.y;
        g.lin({ x1, y1, x2, y2, ls: "@nodcolor", lw: 8, lc: "round" })
            .lin({ x1, y1, x2, y2, ls: "@nodfill2", lw: 5.5, lc: "round" })
            .lin({ x1, y1, x2, y2, ls: "@nodfill", lw: 3, lc: "round" })
    }
}

/**
 * @param {object} - beam shape.
 * @property {string} p - referenced node id for start point position.
 * @property {string} wref - referenced constraint id for orientation.
 * @property {number} [len=100] - beam length
 */
mec.shape.beam = {
    /**
     * Check beam shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'beam', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'beam', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);

        if (this.wref === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'beam', id: this.id, idx, reftype: 'constraint', name: 'wref' };
        if (!this.model.constraints.find(e => e.id === this.wref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'beam', id: this.id, idx, reftype: 'constraint', name: this.wref };
        else
            this.wref = this.model.constraints.find(e => e.id === this.wref);

        return false;
    },
    /**
     * Initialize beam shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.len = this.len || 100;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p":"' + this.p.id + '","wref":"' + this.wref.id + '","len":"' + this.len + '" }';
    },
    draw(g) {
        const x1 = () => this.p.x,
            y1 = () => this.p.y,
            x2 = () => this.p.x + this.len * Math.cos(this.wref.w),
            y2 = () => this.p.y + this.len * Math.sin(this.wref.w);
        g.lin({ x1, y1, x2, y2, ls: "@nodcolor", lw: 8, lc: "round" })
            .lin({ x1, y1, x2, y2, ls: "@nodfill2", lw: 5.5, lc: "round" })
            .lin({ x1, y1, x2, y2, ls: "@nodfill", lw: 3, lc: "round" })
    }
}

/**
 * @param {object} - wheel shape.
 * @property {string} p - referenced node id for center point position, and ...
 * @property {string} [wref] - referenced constraint id for orientation and ...
 * @property {number} [w0=0] - start / offset angle [rad].
 * @property {number} [r=20] - radius
 */
mec.shape.wheel = {
    /**
     * Check wheel shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'wheel', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'wheel', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);

        if (this.wref === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'wheel', id: this.id, idx, reftype: 'constraint', name: 'wref' };
        if (!this.model.constraints.find(e => e.id === this.wref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'wheel', id: this.id, idx, reftype: 'constraint', name: this.wref };
        else
            this.wref = this.model.constraints.find(e => e.id === this.wref);

        return false;
    },
    /**
     * Initialize wheel shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
        this.r = this.r || 20;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","p":"' + this.p.id + '","r":' + this.r
            + ((this.w0 && this.w0 > 0.0001) ? ',"w0":' + this.w0 : '')
            + (this.wref ? ',"wref":"' + this.wref.id + '"' : '')
            + ' }';
    },
    draw(g) {
        const w = this.wref ? () => this.wref.w : this.w0 || 0, r = this.r,
            sgamma = Math.sin(2 * Math.PI / 3), cgamma = Math.cos(2 * Math.PI / 3);
        g.beg({ x: () => this.p.x, y: () => this.p.y, w })
            .lin({ x1: 0, y1: 0, x2: r - 4, y2: 0, ls: "@nodcolor", lw: 8, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: r - 4, y2: 0, ls: "@nodfill2", lw: 5.5, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: r - 4, y2: 0, ls: "@nodfill", lw: 3, lc: "round" })

            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: (r - 4) * sgamma, ls: "@nodcolor", lw: 8, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: (r - 4) * sgamma, ls: "@nodfill2", lw: 5.5, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: (r - 4) * sgamma, ls: "@nodfill", lw: 3, lc: "round" })

            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: -(r - 4) * sgamma, ls: "@nodcolor", lw: 8, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: -(r - 4) * sgamma, ls: "@nodfill2", lw: 5.5, lc: "round" })
            .lin({ x1: 0, y1: 0, x2: (r - 4) * cgamma, y2: -(r - 4) * sgamma, ls: "@nodfill", lw: 3, lc: "round" })

            .cir({ x: 0, y: 0, r: r - 2.5, ls: "#e6e6e6", fs: "transparent", lw: 5 })
            .cir({ x: 0, y: 0, r, ls: "@nodcolor", fs: "transparent", lw: 1 })
            .cir({ x: 0, y: 0, r: r - 5, ls: "@nodcolor", fs: "transparent", lw: 1 })
            .end()
    }
}

/**
 * @param {object} - filled polygon shape.
 * @property {array} pts - array of points.
 * @property {string} p - referenced node id for reference point position.
 * @property {string} wref - referenced constraint id for orientation.
 * @property {string} [fill='#aaaaaa88'] - fill color.
 * @property {string} [stroke='transparent'] - stroke color.
 */
mec.shape.poly = {
    /**
     * Check polygon shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.pts === undefined)
            return { mid: 'E_POLY_PTS_MISSING', id: this.id, idx };
        if (this.pts.length < 2)
            return { mid: 'E_POLY_PTS_INVALID', id: this.id, idx };

        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'polygon', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'polygon', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);

        if (this.wref === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'polygon', id: this.id, idx, reftype: 'constraint', name: 'wref' };
        if (!this.model.constraints.find(e => e.id === this.wref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'polygon', id: this.id, idx, reftype: 'constraint', name: this.wref };
        else
            this.wref = this.model.constraints.find(e => e.id === this.wref);

        return false;
    },
    /**
     * Initialize polygon shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.fill = this.fill || '#aaaaaa88';
        this.stroke = this.stroke || 'transparent';
    },
    get x0() { return this.p.x0; },
    get y0() { return this.p.y0; },
    get w0() { return this.wref.w0; },
    get w() { return this.wref.w - this.wref.w0; },
    get x() {
        const w = this.wref.w - this.wref.w0;
        return this.p.x - Math.cos(w) * this.p.x0 + Math.sin(w) * this.p.y0;
    },
    get y() {
        const w = this.wref.w - this.wref.w0;
        return this.p.y - Math.sin(w) * this.p.x0 - Math.cos(w) * this.p.y0;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","pts":' + JSON.stringify(this.pts) + ',"p":"' + this.p.id + '"'
            + (this.wref ? ',"wref":"' + this.wref.id + '"' : '')
            + ((this.w0 && this.w0 > 0.0001 && !(this.wref.w0 === this.w0)) ? ',"w0":' + this.w0 : '')
            + (this.stroke && !(this.stroke === 'transparent') ? ',"stroke":"' + this.stroke + '"' : '')
            + (this.fill && !(this.fill === '#aaaaaa88') ? ',"fill":"' + this.fill + '"' : '')
            + ' }';
    },
    draw(g) {
        g.ply({ pts: this.pts, closed: true, x: () => this.x, y: () => this.y, w: () => this.w, fs: this.fill, ls: this.stroke })
    }
}

/**
 * @param {object} - image shape.
 * @property {string} uri - image uri
 * @property {string} p - referenced node id for center point position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0=0] - start / offset angle [rad].
 * @property {number} [xoff=0] - x offset value.
 * @property {number} [yoff=0] - y offset value.
 * @property {number} [scl=1] - scaling factor.
 */
mec.shape.img = {
    /**
     * Check image shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        if (this.uri === undefined)
            return { mid: 'E_IMG_URI_MISSING', id: this.id, idx };

        if (this.p === undefined)
            return { mid: 'E_ELEM_REF_MISSING', elemtype: 'image', id: this.id, idx, reftype: 'node', name: 'p' };
        if (!this.model.nodes.find(e => e.id === this.p))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'image', id: this.id, idx, reftype: 'node', name: this.p };
        else
            this.p = this.model.nodes.find(e => e.id === this.p);

        if (this.wref && !this.model.constraints.find(e => e.id === this.wref))
            return { mid: 'E_ELEM_INVALID_REF', elemtype: 'image', id: this.id, idx, reftype: 'constraint', name: this.wref };
        else
            this.wref = this.model.constraints.find(e => e.id === this.wref);

        return false;
    },
    /**
     * Initialize polygon shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model, idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
        this.xoff = this.xoff || 0;
        this.yoff = this.yoff || 0;
        this.scl = this.scl || 1;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"' + this.type + '","uri":"' + this.uri + '","p":"' + this.p.id + '"'
            + (this.wref ? ',"wref":"' + this.wref.id + '"' : '')
            + ((this.w0 && Math.abs(this.w0) > 0.0001) ? ',"w0":' + this.w0 : '')
            + ((this.xoff && Math.abs(this.xoff) > 0.0001) ? ',"xoff":' + this.xoff : '')
            + ((this.yoff && Math.abs(this.yoff) > 0.0001) ? ',"yoff":' + this.yoff : '')
            + ((this.scl && Math.abs(this.scl - 1) > 0.0001) ? ',"scl":' + this.scl : '')
            + ' }';
    },
    draw(g) {
        const w0 = this.w0 || 0, w = this.wref ? () => this.wref.w + w0 : w0;
        g.img({ uri: this.uri, x: () => this.p.x, y: () => this.p.y, w, scl: this.scl, xoff: this.xoff, yoff: this.yoff })
    }
}

mec.model.prototype.addPlugIn('shapes', mec.shape);
/**
 * mec.msg.en (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec.msg.en namespace for English mec related messages.
 */
mec.msg.en = {
    // User interface related messages
    U_SEL_SECOND_NODE: () => `Select second node.`,

    // Logical warnings
    W_CSTR_NODES_COINCIDE: ({ cstr, p1, p2 }) => `Warning: Nodes '${p1}' and '${p2}' of constraint '${cstr}' coincide.`,

    // Logical errors / warnings
    E_ELEM_ID_MISSING: ({ elemtype, idx }) => `${elemtype} with index ${idx} must have an id defined.`,
    E_ELEM_ID_AMBIGIOUS: ({ elemtype, id }) => `${elemtype} id '${id}' is ambigious.`,
    W_ELEM_ID_MISSING: ({ elemtype, idx }) => `${elemtype} with index ${idx} should have an id defined.`,
    E_ELEM_REF_MISSING: ({ elemtype, id, idx, reftype, name }) => `${elemtype} ${id ? ("'" + id + "'") : ("[" + idx + "]")} must have a ${reftype} reference '${name}' defined.`,
    E_ELEM_INVALID_REF: ({ elemtype, id, idx, reftype, name, }) => `${reftype} reference '${name}' of ${elemtype} ${id ? ("'" + id + "'") : ("[" + idx + "]")} is invalid.`,

    E_NODE_MASS_TOO_SMALL: ({ id, m }) => `Node's (id='${id}') mass of ${m} is too small.`,

    E_CSTR_NODE_MISSING: ({ id, loc, p }) => `${loc} node '${p}' of constraint (id='${id}') is missing.`,
    E_CSTR_NODE_NOT_EXISTS: ({ id, loc, p, nodeId }) => `${loc} node '${p}':'${nodeId}' of constraint '${id}' does not exist.`,
    E_CSTR_REF_NOT_EXISTS: ({ id, sub, ref }) => `Reference to '${ref}' in '${sub} of constraint '${id}' does not exist.`,
    E_CSTR_DRIVEN_REF_TO_FREE: ({ id, sub, ref, reftype }) => `Driven ${sub} constraint of '${id}' must not reference free ${reftype} of constraint '${ref}'.`,
    W_CSTR_RATIO_IGNORED: ({ id, sub, ref, reftype }) => `Ratio value of driven ${sub} constraint '${id}' with reference to '${reftype}' constraint '${ref}' ignored.`,

    E_FORCE_VALUE_INVALID: ({ id, val }) => `Force value '${val}' of load '${id}' is not allowed.`,
    E_SPRING_RATE_INVALID: ({ id, val }) => `Spring rate '${val}' of load '${id}' is not allowed.`,

    E_POLY_PTS_MISSING: ({ id, idx }) => `Polygon shape ${id ? ("'" + id + "'") : ("[" + idx + "]")} must have a points array 'pts' defined.`,
    E_POLY_PTS_INVALID: ({ id, idx }) => `Polygon shape ${id ? ("'" + id + "'") : ("[" + idx + "]")} must have a points array 'pts' with at least two points defined.`,

    E_IMG_URI_MISSING: ({ id, idx }) => `Image shape ${id ? ("'" + id + "'") : ("[" + idx + "]")} must have an uniform resource locator 'uri' defined.`,

    E_ALY_REF_MISSING: ({ id, idx }) => ({ elemtype, id, idx, reftype, name }) => `${elemtype} ${id ? ("'" + id + "'") : ("[" + idx + "]")} must have with '${name}' an existing property name of a ${reftype} specified. One of ${keys} are supported.`,
    E_ALY_REF_INVALID: ({ id, idx }) => ({ elemtype, id, idx, reftype, name }) => `${elemtype} ${id ? ("'" + id + "'") : ("[" + idx + "]")} has with '${name}' an invalid property name of a ${reftype} specified. One of ${keys} are supported.`,
}



class MecSlider extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'min', 'max', 'step', 'value', 'bubble'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
    }

    // html slider attributes 
    get width() { return +this.getAttribute("width") || 100 }
    get min() { return +this.getAttribute("min") || 0 }
    get max() { return +this.getAttribute("max") || 100 }
    get step() { return +this.getAttribute("step") || 1 }
    get value() { return +this.getAttribute('value') || 0; }
    set value(q) {
        q = this._nfrac > 0 ? q.toFixed(this._nfrac) : q;
        this.setAttribute('value', q);
        this._slider.setAttribute('value', this._slider.value = q);
        this._slider.value = q;
        this.dispatchEvent(new CustomEvent('input', { detail: q }));
    }

    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() { this.init(); }
    disconnectedCallback() { this.deinit(); }
    attributeChangedCallback(name, oldval, val) { }

    init() {
        this.bubble = this.hasAttribute("bubble");
        this._root.innerHTML = MecSlider.template({
            id: this.id,
            width: this.width,
            height: this.height,
            min: this.min,
            max: this.max,
            step: this.step,
            value: this.value,
            darkmode: this.darkmode,
            bubble: this.bubble
        });
        // cache elements of shadow dom
        this._slider = this._root.querySelector('input');
        this._forbtn = this._root.querySelector('.forward');
        this._revbtn = this._root.querySelector('.reverse');
        // install instance specific function pointers from prototype methods ...
        this._sliderInputHdl = this.sliderInput.bind(this);
        this._startForwardHdl = this.startForward.bind(this);
        this._startReverseHdl = this.startReverse.bind(this);
        this._endForwardHdl = this.endForward.bind(this);
        this._endReverseHdl = this.endReverse.bind(this);
        // install initial event listeners
        this._slider.addEventListener("input", this._sliderInputHdl, false);
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        // cache instant specific values
        this._nfrac = Math.max(0, Math.ceil(-Math.log10(this.step)));  // number of digits after decimal point of step
        // init value bubble
        if (this.bubble) {
            this._bubble = this._root.getElementById('bubble');
            this._bubbleShowHdl = this.showBubble.bind(this);
            this._bubbleHideHdl = this.hideBubble.bind(this);

            this._slider.addEventListener("focusin", this._bubbleShowHdl, false);
            this._slider.addEventListener("focusout", this._bubbleHideHdl, false);
        }
    }
    deinit() {
        // remove event listeners
        this._slider.removeEventListener("input", this.sliderInputHdl, false);
        this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
        this._forbtn.removeEventListener("pointerup", this._endForwardHdl, false);
        this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
        this._revbtn.removeEventListener("pointerup", this._endReverseHdl, false);
        if (this.bubble) {
            this._slider.removeEventListener("focusin", this._bubbleShowHdl, false);
            this._slider.removeEventListener("focusout", this._bubbleHideHdl, false);
        }
        // delete cached data
        delete this._bubble;
        delete this._slider;
        delete this._forbtn;
        delete this._revbtn;
    }

    sliderInput() {
        this.value = +this._slider.value;
        if (this._bubble)
            this.placeBubble();
    }
    showBubble() {
        this._bubble.style.display = 'block';
        this.placeBubble();
    }
    hideBubble() {
        this._bubble.style.display = 'none';
    }
    placeBubble() {
        const thumbWidth = 12,  // width of thumb estimated .. depends on browser
            sliderBox = this._slider.getBoundingClientRect(),
            bubbleBox = this._bubble.getBoundingClientRect(),
            thumbLeft = Math.floor(sliderBox.left + thumbWidth / 2),
            thumbRange = sliderBox.width - thumbWidth;
        this._bubble.style.left = Math.floor(thumbLeft - bubbleBox.width / 2 + thumbRange * Math.max(0, Math.min(1, (this.value - this.min) / (this.max - this.min)))) + 'px';
        this._bubble.style.top = Math.floor(sliderBox.top - bubbleBox.height) + 'px';
        this._bubble.innerHTML = this.getAttribute('value');
    }
    startForward() {
        if (this.value < this.max) {
            // change forward-button to stop-button
            this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
            this._forbtn.innerHTML = MecSlider.stopsym;
            this._forbtn.addEventListener("pointerup", this._endForwardHdl, false);
            // deactivate reverse-button
            this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
            this._revbtn.style.color = "#888";  // show disabled !
            // focus to slider ... disable it
            this._slider.focus();
            this._slider.setAttribute('disabled', true);
            this.showBubble();                  // needed for chrome !

            this.goFwd();
        }
    }
    endForward() {
        // change stop-button to forward-button
        this._forbtn.removeEventListener("pointerup", this._endForwardHdl, false);
        this._forbtn.innerHTML = MecSlider.fwdsym;
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        // reactivate reverse-button
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        this._revbtn.style.color = "inherit";
        // focus to slider ... enable it
        this._slider.focus();
        this._slider.removeAttribute('disabled');
        window.clearTimeout(this.timeoutId);
    }
    fwdStep() {
        let delta = this.value + this.step < this.max ? this.step : Math.max(this.max - this.value, 0);
        if (delta) { // proceed ...
            this.value += delta;
            if (this._bubble)
                this.placeBubble();
        }
        else
            this.endForward();
        return !!delta;
    }
    goFwd() {
        // '.. loop with guarantee that the previous interval has completed before recursing.'
        // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
        this.timeoutId = window.setTimeout(() => {
            if (this.fwdStep())
                this.goFwd();
        }, 20);
    }
    startReverse() {
        if (this.value >= this.min) {
            // change reverse-button to stop-button
            this._revbtn.removeEventListener("pointerup", this._startReverseHdl, false);
            this._revbtn.innerHTML = MecSlider.stopsym;
            this._revbtn.addEventListener("pointerup", this._endReverseHdl, false);
            // deactivate forward-button
            this._forbtn.removeEventListener("pointerup", this._startForwardHdl, false);
            this._forbtn.style.color = "#888";  // show disabled !
            // focus to slider ... disable it
            this._slider.focus();
            this._slider.setAttribute('disabled', true);
            this.showBubble();                  // needed for chrome !

            this.goRev();
        }
    }
    endReverse() {
        // change stop-button to reverse-button
        this._revbtn.removeEventListener("pointerup", this._endReverseHdl, false);
        this._revbtn.innerHTML = MecSlider.revsym;
        this._revbtn.addEventListener("pointerup", this._startReverseHdl, false);
        // reactivate forward-button
        this._forbtn.addEventListener("pointerup", this._startForwardHdl, false);
        this._forbtn.style.color = "inherit";
        // focus to slider ... enable it
        this._slider.focus();
        this._slider.removeAttribute('disabled');

        window.clearTimeout(this.timeoutId);
    }
    revStep() {
        let delta = this.value - this.step >= this.min ? -this.step : -Math.max(this.min - this.value, 0);
        if (delta) { // proceed ...
            this.value += delta;
            if (this._bubble)
                this.placeBubble();
        }
        else
            this.endReverse();
        return !!delta;
    }
    goRev() {
        // '.. loop with guarantee that the previous interval has completed before recursing.'
        // see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval
        this.timeoutId = window.setTimeout(() => {
            if (this.revStep())
                this.goRev();
        }, 20);
    }

    static template({ id, width, min, max, step, value, bubble }) {
        return `
<style>
   ::shadow {
       display:inline-flex; 
       width:${width}px; 
       align-items:center;
    }

    .slider {
       width: 100%; 
       font-size: 10pt;
    }

    input {
        min-width: calc(100% - 2.5em);
        margin: 0;
        padding: 0;
        vertical-align: middle;
    }

   .forward, .reverse {
       font-family: Consolas;
       font-size: 10pt;
       vertical-align: middle;
       cursor: default;
       user-select: none;
       -moz-user-select: none;
   }

   ${bubble ? `
   #bubble {
        color: black;
        background-color: #f8f8f888;
        border: 1px solid #c8c8c8;
        border-radius: 2px 2px 10px 10px;
        font-family: Consolas;
        font-size: 10pt;
        text-align: center;
        padding: 2px;
        position: absolute;
        left: 0px;
        top: 0px;
        display: none;
        pointer-events:none`
                : ''}
</style>
<div class="slider">
    <span class="reverse">${MecSlider.revsym}</span>
    <input type="range" min="${min}" max="${max}" value="${value}" step="${step}"/>
    <span class="forward">${MecSlider.fwdsym}</span>
    ${bubble ? `<div id="bubble">?</div>` : ''}
</div>`
    }
}

MecSlider.fwdsym = '&#9655;'
MecSlider.revsym = '&#9665;'
MecSlider.stopsym = '&#9744;'

customElements.define('mec-slider', MecSlider);
class Mec2Element extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height', 'cartesian', 'grid', 'x0', 'y0',
            'darkmode', 'gravity', 'hidenodes', 'hideconstraints',
            'nodelabels', 'constraintlabels', 'loadlabels',
            'nodeinfo', 'constraintinfo', 'nav'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'open' });
        this._state = { edit: false, pause: true };
        this._inputs = [];
    }

    get width() { return +this.getAttribute('width') || 301; }
    set width(q) { if (q) this.setAttribute('width', q); }
    get height() { return +this.getAttribute('height') || 201; }
    set height(q) { if (q) this.setAttribute('height', q); }
    get x0() { return (+this.getAttribute('x0')) || 0; }
    set x0(q) { if (q) this.setAttribute('x0', q); }
    get y0() { return (+this.getAttribute('y0')) || 0; }
    set y0(q) { if (q) this.setAttribute('y0', q); }
    get cartesian() { return this.hasAttribute('cartesian'); }
    set cartesian(q) { q ? this.setAttribute('cartesian', '') : this.removeAttribute('cartesian'); }
    get grid() { return this.hasAttribute('grid') || false; }
    set grid(q) { q ? this.setAttribute('grid', '') : this.removeAttribute('grid'); }
    get nav() { return this.hasAttribute('nav') || false; }
    set nav(q) { q ? this.setAttribute('nav', '') : this.removeAttribute('nav'); }

    get show() { return this._show; }

    get hasInputs() { return !!this._inputs.length; }
    get inputDriveCount() { return this._inputs.length; }

    get gravity() { return this._model.gravity.active; }
    set gravity(q) {
        if (this.gravbtn) {
            this._gravbtn.innerHTML = q ? '&checkmark;g' : '&nbsp;&nbsp;g';
        }
        this._model.gravity.active = q;
    }

    get pausing() { return this._state.pause; }
    set pausing(q) {
        if (this._state.pause && !q) {  // start / continue running
            if (!this._model.isActive)
                this._model.reset();
            this._state.pause = false;
            this._model.sleepMinDelta = 1;
            if (this.editing)  // do not run in edit mode ... so toggle !
                this.editing = false;
            if (this._runbtn) {
                this._runbtn.innerHTML = this.updateRunBtn();
            }
        }
        else if (!this._state.pause && q) {
            this._state.pause = true;
            if (this._runbtn) {
                this._runbtn.innerHTML = this.updateRunBtn();
            }

        }
        //  else  ... nothing to do
    }
    /*
        get editing() { return this._state.edit; }
        set editing(q) {
            if (!this._state.edit && q) {  // edit in initial pose only
                if (this.hasInputs)
                    for (const input of this._inputs) {
                        const val0 = input.sub === 'ori' ? input.w0 : input.r0;
                        this._root.getElementById(input.id).value = val0;
                        //                    input.constraint[input.sub].inputCallbk(val0);  // necessary ?
                    }
                this._model.reset();
                this._editbtn.innerHTML = 'drag';
                this._state.edit = true;
            }
            else if (this._state.edit && !q) {
                this._editbtn.innerHTML = 'edit';
                this._state.edit = false;
            }
            //  else  ... nothing to do
            //        this.log(`editing=${this._state.edit}`)
        }
        */
    init() {
        // create model
        if (!this.parseModel(this.innerHTML)) return;
        // install 'show' environment ...
        this._show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy defaults
        this._show.darkmode = this.getAttribute('darkmode') === "" ? true : false;  // boolean
        this._show.nodes = this.getAttribute('hidenodes') === "" ? false : true;  // boolean
        this._show.constraints = this.getAttribute('hideconstraints') === "" ? false : true;  // boolean
        this._show.nodeLabels = this.getAttribute('nodelabels') === "" ? true : false;  // boolean
        this._show.constraintLabels = this.getAttribute('constraintlabels') === "" ? true : false;  // boolean
        this._show.nodeInfo = this.hasAttribute('nodeinfo') && (this.getAttribute('nodeinfo') || 'id');  // string
        this._show.constraintInfo = this.hasAttribute('constraintinfo') && (this.getAttribute('constraintinfo') || 'id');  // string
        this._model = mec.model.extend(this._model, this);
        this._model.init();
        // find input-drives
        this._inputs = this._model.inputControlledDrives;
        // find chart elements which are refered to by the model
        this._charts = this._model.views.filter(v => v.as === 'chart' && v.canvas);
        this._chartRefs = this._charts.map(c => document.getElementById(c.canvas));
        // Apply functions to html elements.
        for (const idx in this._chartRefs) {
            const elm = this._chartRefs[idx];
            const chart = this._charts[idx];
            Object.assign(elm, chart.graph);
            elm.nod = () => {
                // this._charts[idx].previewNod;
                const data = chart.graph.funcs[0].data;
                const pt = data.findIndex(data => data.t > chart.local_t);
                const coord = pt === -1 ? undefined // If point is out of bounds
                    : {
                        x: (data[pt].x - elm._chart.xmin) * (elm._chart.b /
                            (elm._chart.xmax - elm._chart.xmin)) + elm._chart.x,
                        y: (data[pt].y - elm._chart.ymin) * (elm._chart.h /
                            (elm._chart.ymax - elm._chart.ymin)) + elm._chart.y,
                        // y: elm._chart.y + elm._chart.h,
                        scl: 1
                    };
                if (!coord ||
                    coord.y < elm._chart.y ||
                    coord.y > elm._chart.y + elm._chart.h) {
                    return { scl: 0 }
                }
                return coord;
            }
        }

        // add shadow dom
        this._root.innerHTML = Mec2Element.template({
            width: this.width,
            height: this.height,
            dof: this._model.dof,
            gravity: this._model.gravity.active,
            inputs: this._inputs,
            darkmode: this._show.darkmode,
            nav: this.nav,
        });
        // cache elements of shadow dom
        this._ctx = this._root.getElementById('cnv').getContext('2d');
        this._runbtn = this._root.getElementById('runbtn');
        this._resetbtn = this._root.getElementById('resetbtn');
        //        this._editbtn  = this._root.getElementById('editbtn');
        this._gravbtn = this._root.getElementById('gravbtn');
        this._corview = this._root.getElementById('corview');
        this._dofview = this._root.getElementById('dofview');
        //        this._egyview  = this._root.getElementById('egyview');
        this._fpsview = this._root.getElementById('fpsview');
        this._itrview = this._root.getElementById('itrview');
        this._info = this._root.getElementById('info');
        this._logview = this._root.getElementById('logview');
        // check gravity attribute
        this.gravity = this.getAttribute('gravity') === "" ? true : false;
        // add event listeners
        this._runbtnHdl = this.run;
        if (this._runbtn) {
            this._runbtn.addEventListener("click", this._runbtnHdl, false);
            this._resetbtnHdl = e => this.reset();
            this._resetbtn.addEventListener("click", this._resetbtnHdl, false);
        }
        //      this._resetbtnHdl = e => this.editing = !this.editing; this._editbtn .addEventListener("click", this._resetbtnHdl, false);
        if (this._gravbtn) {
            this._gravbtnHdl = e => this.toggleGravity();
            this._gravbtn.addEventListener("click", this._gravbtnHdl, false);
        }
        // some more members
        this._interactor = canvasInteractor.create(this._ctx, { x: this.x0, y: this.y0, cartesian: this.cartesian });
        this._g = g2().clr().view(this._interactor.view);
        this._gusr = g2();
        if (this.grid) this._g.grid({ color: this._show.darkmode ? '#999' : '#ccc' });

        this._selector = g2.selector(this._interactor.evt);
        // treat valid initial model
        if (this._model.valid) {
            // add input event listeners
            for (const input of this._inputs) {
                const z0 = input.sub === 'ori' ? input.w0 : input.r0;
                input.hdl = e => {
                    if (this.editing) this.editing = false;
                    input.constraint[input.sub].inputCallbk((+e.target.value - z0), false);
                    this.pausing = false;
                };
                this._root.getElementById(input.id).addEventListener("input", input.hdl, false);
            }
            this._model.preview();
            this._model.pose();
            this._model.draw(this._g);
            this._g.ins(this._gusr);
            this.render();
            this._interactor.on('drag', e => this.ondrag(e))
                .on('tick', e => this.ontick(e))
                .on(['pointermove', 'pointerup'], e => this.showInfo(e))
                .on('pointerdown', e => this.hideInfo(e))
                //                            .on('pointerup', e => this.showInfo(e))
                .startTimer();
            this.dispatchEvent(new CustomEvent('init'));
        }
        else if (this._model.msg) {
            this.render();
            this.log(mec.messageString(this._model.msg));
        }
        this.pausing = true;  // initially ...
    }
    deinit() {
        delete this._g;
        delete this._gusr;
        delete this._model;    // we may need a model.deinit method perhaps
        delete this._selector;
        delete this._interactor.deinit();
        // find input-drives
        for (const input of this._inputs)
            this._root.getElementById(input.id).removeEventListener("input", input.hdl, false);
        delete this._inputs;
        delete this._chartRefs;
        // remove event listeners
        this._runbtn.removeEventListener("click", this._runbtnHdl, false);
        this._resetbtn.removeEventListener("click", this._resetbtnHdl, false);
        //        this._editbtn .removeEventListener("click", this._resetbtnHdl, false);
        this._gravbtn.removeEventListener("click", this._gravbtnHdl, false);
        // delete cached data
        delete this._ctx;
        delete this._runbtn;
        delete this._resetbtn;
        //        delete this._editbtn;
        delete this._gravbtn;
        delete this._corview;
        delete this._dofview;
        //        delete this._egyview;
        delete this._fpsview;
        delete this._itrview;
        delete this._info;
        delete this._logview;
    }

    parseModel() {
        try { this._model = JSON.parse(this.innerHTML); return true; }
        catch (e) { this._root.innerHTML = e.message; }
        return false;
    }

    render() {
        for (const idx in this._chartRefs) {
            this._chartRefs[idx].render();
        }
        this._g.exe(this._ctx);
    }

    run = () => {
        this.pausing = !this.pausing;
        if (this._runbtn) {
            this._runbtn.innerHTML = this.updateRunBtn();
        }
    }

    updateRunBtn = () => this._inputs.length ? '' :
        this.pausing ? '&#9654;' : '&#10074;&#10074;';
    toggleGravity = () => { this.gravity = !this.gravity; }

    reset() {
        this._model.reset();
        this._model.pose();
        this.render();
        this.pausing = true;  // initially ...
    }
    showInfo(e) {
        const info = this._model.info;
        if (info) {
            const bbox = this._ctx.canvas.getBoundingClientRect();
            this._info.style.left = (bbox.left + e.x + 8).toFixed(0) + 'px';
            this._info.style.top = this.cartesian
                ? (bbox.top + this._ctx.canvas.height - e.y - 20).toFixed(0) + 'px'
                : (bbox.top + e.y - 20).toFixed(0) + 'px';
            this._info.innerHTML = info;
            this._info.style.display = 'inline';
        }
        else
            this._info.style.display = 'none';
    }
    hideInfo(e) {
        if (this._info.style.display === 'inline') {
            this._info.style.display = 'none';
        }
    }

    log(str) {
        this._logview.innerHTML = str;
    }

    ondrag(e) {
        if (this._selector.selection && this._selector.selection.drag) {
            this._selector.selection.drag({ x: e.xusr, y: e.yusr, dx: e.dxusr, dy: e.dyusr, mode: this.editing ? 'edit' : 'drag' });
            this._model.preview();
            this._model.pose();
            this.dispatchEvent(new CustomEvent('drag'));
            this.render();
            // this._state.edit ? this._model.reset() : this._model.pose();
        }
    }
    ontick(e) {
        if (!this.pausing && this._model.isActive) {
            if (this._selector.selection && !this.hasInputs)
                this.pausing = true;
            else {
                this._model.tick(1 / 60);
                this.dispatchEvent(new CustomEvent('tick'));
            }
        }
        if (this._model.isActive || this.editing || e.dirty) { // simulation is running ... or pointer is moving ...
            this._g.exe(this._selector);
            this.render();
        }
        // avoid unnecessary model.tick's with mechanims fully controlled by inputs .. !
        if (this.pausing === false &&
            this._model.activeDriveCount - this.inputDriveCount === 0 &&
            (this._model.dof === 0 || this._model.isSleeping))
            this.pausing = true;
        //        this.log(`activeDrives=${this._model.activeDriveCount}, inputDrives=${this.inputDriveCount}, isSleeping=${this._model.isSleeping}, pausing=${this.pausing}, t=${this._model.timer.t}`)
        if (this._corview) {
            this._corview.innerHTML = this._interactor.evt.xusr.toFixed(0) + ', ' + this._interactor.evt.yusr.toFixed(0);
        }
        if (this._fpsview) {
            this._fpsview.innerHTML = 'fps: ' + canvasInteractor.fps;
        }
        //        this._egyview.innerHTML = 'E: '+(this._model.valid ? mec.to_J(this._model.energy).toFixed(2) : '-');
        if (this._itrview) {
            this._itrview.innerHTML = this._model.state.itrpos + '/' + this._model.state.itrvel;
        }
    }

    // standard lifecycle callbacks
    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.deinit();
    }
    attributeChangedCallback(name, oldval, val) {
        if (this._root && this._root.getElementById('cnv')) {
            if (name === 'width') {  // todo: preserve minimum width
                this._root.getElementById('cnv').setAttribute('width', val);
                if (this.nav) {
                    this._root.querySelector('.status').style.width = val + 'px';
                }
            }
            if (name === 'height')   // todo: preserve minimum height
                this._root.getElementById('cnv').setAttribute('height', val);
        }
    }

    static template({ width, height, darkmode, dof, gravity, inputs, nav }) {
        return `
<style>
    nav {
        width: ${width - 2}px;
        background-color:#555;
        color:#ddd;
        font-family:Arial;
        font-size: 10pt;
        display: grid;
        grid-gap: 1px;
        grid-template-columns: auto auto;
        padding: 2px;
        align-content: center;
        -moz-user-select: none;
        user-select: none;
        cursor:default;
    }

    mec-slider {
        display: inline-block;
        width: ${width - 2}px;
    }

    .right {
        text-align: right;
        vertical-align: bottom;
    }
    nav > span > span:hover { color:#fff; }
    nav > span > output { display:inline-block; padding:0px 1px; margin:0px 0px; }
    #cnv {
        border:solid 1px ${darkmode ? '#777' : '#eee'};
        background-color:${darkmode ? '#777' : '#eee'};
        touch-action: none;
    }
</style>
<div style="width:${width};">
${nav ? Mec2Element.nav({ dof, inputs }) : ""}
<canvas id="cnv" width="${width}" height="${height}" touch-action="none"></canvas><br>
<span id="info" style="position:absolute;display:none;color:#222;background-color:#ffb;border:1px solid black;font:0.9em monospace;padding:0.1em;font-family:Courier;font-size:9pt;">tooltip</span>
${inputs.length ? inputs.map((input, i) => Mec2Element.slider({ input, i, width })).join('') : ''}
<pre id="logview"></pre>
</div>
`
    }
    static nav({ dof }) {
        return `<nav>
            <span class="left">
                ${this.logo}
                <span>&nbsp;</span>
                ${this.runbtn({ dof })}
                ${this.resetbtn()}
                ${this.gravbtn()}
            </span>
            <span class="right">
                ${this.corview()}
                ${this.fpsview()}
                ${this.dofview({ dof })}
                ${this.itrview()}
            </span>
        </nav>`
    }

    static runbtn({ dof }) {
        return `<span id="runbtn" title="run/pause">${dof > 0 ? '&#9654;' : ''}</span>`;
    }
    static resetbtn() {
        return `<span id="resetbtn" title="reset">&nbsp;&nbsp;&#8617;</span>`;
    }
    static gravbtn() {
        return `<span id="gravbtn" title="gravity on/off">&nbsp;&nbsp;g</span>`
    }
    static corview() {
        return `<output id="corview" title="pointer cordinates" style="min-width:4.5em;">0,0</output>`;
    }
    static fpsview() {
        return `<output id="fpsview" title="frames per second" style="min-width:3em;"></output>`;
    }
    static dofview({ dof }) {
        return `<output id="dofview" title="degrees of freedom" style="min-width:2em;">dof: ${dof}</output>`;
    }
    static itrview() {
        return `itr: <output id="itrview" title="pos/vel iterations" style="min-width:3.5em"></output>`;
    }

    static slider({ input, i, width, darkmode }) {
        const sub = input.sub, cstr = input.constraint;
        input.id = 'slider_' + i;
        if (sub === 'ori') {
            const w0 = Math.round(mec.toDeg(cstr.w0)),
                w1 = w0 + Math.round(mec.toDeg(cstr.ori.Dw || 2 * Math.PI));
            input.w0 = w0;
            return `<mec-slider id="${input.id}" title="${input.constraint.id + '.ori'}" min="${w0}" max="${w1}" value="${w0}" step="2" bubble></mec-slider>`;
        }
        else { // if (sub === 'len')
            const r0 = cstr.r0, r1 = r0 + cstr.len.Dr;
            input.r0 = r0;
            return `<mec-slider id="${input.id}" title="${input.constraint.id + '.len'}" min="${r0}" max="${r1}" value="${r0}" step="1" bubble></mec-slider>`;
        }
    }

    static logo = `<svg style="margin-bottom:-5pt; padding-left: 5pt;" class="flex-shrink-0 mr-2" version="1.0" xmlns="http://www.w3.org/2000/svg" width="16pt" height="16pt" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet">
<g transform="translate(0,512) scale(0.1,-0.1)" fill="#ddd" stroke="none">
    <path d="M1300 4786 c-345 -47 -603 -160 -734 -322 -50 -61 -115 -188 -143
-280 -24 -81 -23 -272 2 -369 58 -225 237 -425 380 -425 34 0 35 1 35 38 0 21
-5 43 -12 50 -15 15 -50 124 -94 294 -64 251 -45 366 83 493 173 171 430 243
823 232 286 -8 538 -52 845 -147 144 -44 205 -59 247 -60 32 0 40 4 54 33 9
17 34 53 55 79 22 26 39 57 39 70 0 44 -58 80 -212 130 -274 90 -481 140 -728
173 -156 22 -518 28 -640 11z" fill="orange"></path>
    <path d="M3217 4489 c-159 -37 -309 -189 -346 -350 -26 -111 -8 -266 41 -364
27 -51 120 -148 172 -179 151 -89 371 -90 519 -3 95 56 191 188 216 298 13 57
13 191 0 248 -37 163 -187 313 -350 350 -53 13 -199 12 -252 0z"></path>
    <path d="M2684 3899 c-31 -34 -183 -153 -261 -203 -139 -90 -328 -168 -520
-216 -24 -6 -43 -16 -43 -21 0 -6 22 -36 50 -66 55 -60 106 -157 116 -221 4
-27 12 -42 21 -42 8 0 51 31 96 69 202 169 431 285 685 346 39 9 72 22 72 27
0 6 -20 33 -45 60 -50 56 -100 152 -110 213 -14 83 -25 93 -61 54z"></path>
    <path d="M3954 3813 c-9 -21 -29 -67 -45 -102 -16 -35 -29 -77 -29 -95 0 -34
23 -64 174 -233 162 -180 257 -356 300 -550 20 -90 20 -139 0 -228 -9 -38 -20
-90 -24 -115 -4 -25 -14 -65 -23 -90 -55 -159 -51 -190 19 -190 34 0 121 61
167 117 44 53 101 167 129 257 25 81 34 232 19 336 -38 258 -212 556 -471 806
-135 131 -189 153 -216 87z" fill="orange"></path>
    <path d="M3659 3474 c-70 -48 -144 -66 -286 -72 -97 -3 -133 -8 -133 -17 0 -7
11 -37 24 -66 48 -110 125 -329 170 -484 88 -308 136 -618 162 -1052 7 -127
10 -129 72 -88 77 51 146 68 300 73 78 2 142 8 142 11 0 4 -18 54 -41 112
-208 529 -299 923 -331 1427 -13 203 -13 202 -79 156z"></path>
    <path d="M1297 3480 c-162 -41 -309 -190 -346 -351 -13 -57 -13 -191 0 -248
17 -74 58 -149 116 -212 99 -106 202 -149 358 -149 156 0 264 46 364 156 86
94 120 189 121 336 0 150 -44 253 -153 355 -93 86 -167 115 -312 119 -60 2
-127 -1 -148 -6z"></path>
    <path d="M1110 2333 c0 -149 -21 -275 -71 -425 -21 -65 -39 -122 -39 -127 0
-5 66 -11 148 -13 120 -4 158 -9 207 -27 33 -13 67 -25 76 -28 14 -4 15 15 15
164 0 186 14 266 73 416 17 43 31 81 31 86 0 5 -64 11 -142 13 -115 4 -155 9
-203 27 -105 40 -95 49 -95 -86z"></path>
    <path d="M978 1621 c-152 -49 -282 -189 -317 -342 -13 -57 -13 -191 0 -248 37
-163 187 -313 350 -350 57 -13 191 -13 248 0 163 37 313 187 350 350 13 57 13
191 0 248 -25 110 -121 242 -216 298 -110 64 -292 83 -415 44z"></path>
    <path d="M3828 1621 c-83 -27 -138 -62 -201 -130 -58 -63 -99 -138 -116 -212
-13 -57 -13 -191 0 -248 37 -163 187 -313 350 -350 57 -13 191 -13 248 0 163
37 313 187 350 350 13 57 13 191 0 248 -35 155 -166 294 -320 342 -81 25 -231
25 -311 0z"></path>
</g>
</svg>`
}

customElements.define('mec-2', Mec2Element);

