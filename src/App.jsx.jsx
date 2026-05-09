import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig={apiKey:"AIzaSyCoV5LkFJBTGYVkYiqEfGObG8ssFCHtagY",authDomain:"mod-pos.firebaseapp.com",databaseURL:"https://mod-pos-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"mod-pos",storageBucket:"mod-pos.firebasestorage.app",messagingSenderId:"305044305596",appId:"1:305044305596:web:51276b693010c784f542b9"};
const _app=initializeApp(firebaseConfig);
const db=getDatabase(_app);
const auth=getAuth(_app);
const googleProvider=new GoogleAuthProvider();

const T = {
  bg:"#f2f5ff", surface:"#ffffff", surfaceAlt:"#f7f9ff", border:"#e2e8f5",
  borderMid:"#c8d4ee", primary:"#1a7a4a", primaryL:"#e6f7ee", primaryD:"#125c37",
  accent:"#8b1a5a", accentL:"#f9e8f2", orange:"#d97706", orangeL:"#fef3e2",
  blue:"#1d6fa4", blueL:"#e8f4fd", red:"#dc2626", redL:"#fee2e2",
  green:"#16a34a", greenL:"#dcfce7", purple:"#7c3aed", purpleL:"#ede9fe",
  text:"#1e2235", textMid:"#4a5568", textMuted:"#7a8aaa", textDim:"#b0bdd4",
  shadow:"0 2px 12px rgba(26,122,74,0.10)", shadowMd:"0 6px 28px rgba(26,122,74,0.14)",
};

// ─── PER-CATEGORY ADDONS ──────────────────────────────────────────────────────
const ITEM_ADDONS = {
  scoops:[{id:"s1",name:"Extra Scoop",price:50},{id:"s2",name:"Cone",price:15},{id:"s3",name:"Family Pack",price:100},{id:"s4",name:"No Sugar",price:0},{id:"s5",name:"Extra Sweet",price:0},{id:"s6",name:"Choco Drizzle",price:20},{id:"s7",name:"Dry Fruits",price:30}],
  falooda:[{id:"f1",name:"Extra Falooda Seev",price:20},{id:"f2",name:"Extra Basil Seeds",price:10},{id:"f3",name:"No Rose Syrup",price:0},{id:"f4",name:"Less Sweet",price:0},{id:"f5",name:"Extra Scoop",price:50},{id:"f6",name:"No Ice Cream",price:0}],
  mojito:[{id:"m1",name:"No Ice",price:0},{id:"m2",name:"Less Ice",price:0},{id:"m3",name:"Extra Mint",price:0},{id:"m4",name:"Less Sugar",price:0},{id:"m5",name:"Extra Lemon",price:0},{id:"m6",name:"Salt Rim",price:0}],
  cocktail:[{id:"c1",name:"No Ice",price:0},{id:"c2",name:"Less Sweet",price:0},{id:"c3",name:"Extra Fruit",price:30},{id:"c4",name:"No Soda",price:0}],
  milkshake:[{id:"mk1",name:"Extra Thick",price:0},{id:"mk2",name:"No Ice Cream",price:0},{id:"mk3",name:"Less Sweet",price:0},{id:"mk4",name:"Extra Oreo",price:20},{id:"mk5",name:"Whipped Cream",price:20}],
  sundae:[{id:"su1",name:"Extra Hot Choc",price:20},{id:"su2",name:"Extra Scoop",price:50},{id:"su3",name:"Dry Fruits",price:30},{id:"su4",name:"No Nuts",price:0}],
  pizza:[{id:"p1",name:"Extra Cheese",price:40},{id:"p2",name:"Thin Crust",price:0},{id:"p3",name:"Thick Crust",price:0},{id:"p4",name:"Extra Sauce",price:20},{id:"p5",name:"No Onion",price:0},{id:"p6",name:"Well Done",price:0},{id:"p7",name:"Extra Toppings",price:50}],
  burger:[{id:"b1",name:"Extra Patty",price:60},{id:"b2",name:"Extra Cheese",price:30},{id:"b3",name:"No Onion",price:0},{id:"b4",name:"No Mayo",price:0},{id:"b5",name:"Extra Spicy",price:0},{id:"b6",name:"Less Spicy",price:0},{id:"b7",name:"Double Sauce",price:10}],
  starter:[{id:"st1",name:"Extra Crispy",price:0},{id:"st2",name:"Extra Spicy",price:0},{id:"st3",name:"Less Spicy",price:0},{id:"st4",name:"Extra Sauce",price:20},{id:"st5",name:"No Chili",price:0}],
  dessert:[{id:"d1",name:"Extra Hot Fudge",price:20},{id:"d2",name:"Ice Cream Side",price:50},{id:"d3",name:"No Nuts",price:0},{id:"d4",name:"Extra Sweet",price:0}],
};

const RINGTONES=[{id:"bell",name:"Bell 🔔"},{id:"chime",name:"Chime 🎵"},{id:"buzz",name:"Buzz 📳"},{id:"ping",name:"Ping 🔉"},{id:"alert",name:"Alert ⚠️"},{id:"classic",name:"Classic 📯"}];

const buildCss=(fs)=>`
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{font-family:'Nunito',sans-serif;background:${T.bg};color:${T.text};font-size:${fs}px;-webkit-tap-highlight-color:transparent;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-thumb{background:${T.borderMid};border-radius:2px;}
.pos{min-height:100vh;display:flex;flex-direction:column;}
.tnav{background:${T.primary};height:54px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;box-shadow:${T.shadowMd};}
.brand{font-weight:900;font-size:20px;color:#fff;letter-spacing:-0.5px;}
.brand span{color:#a8f0c8;}
.nav-r{display:flex;gap:6px;align-items:center;}
.nibtn{background:rgba(255,255,255,0.18);border:none;color:#fff;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;}
.nibtn:hover{background:rgba(255,255,255,0.28);}
.ntime{font-size:12px;font-weight:700;color:#a8f0c8;font-family:'JetBrains Mono',monospace;}
.btab{position:fixed;bottom:0;left:0;right:0;background:${T.surface};border-top:2px solid ${T.border};display:flex;z-index:200;box-shadow:0 -3px 14px rgba(0,0,0,.07);}
.ti{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 2px 6px;cursor:pointer;border:none;background:none;color:${T.textMuted};font-family:'Nunito',sans-serif;font-size:10px;font-weight:700;gap:2px;transition:all .15s;position:relative;}
.ti.active{color:${T.primary};}
.ti.active::after{content:'';position:absolute;top:0;left:18%;right:18%;height:3px;background:${T.primary};border-radius:0 0 5px 5px;}
.ti-ic{font-size:20px;line-height:1;}
.main{flex:1;padding:14px;padding-bottom:78px;}
.shdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.stitle{font-size:20px;font-weight:900;}
.ftabs{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none;}
.ftabs::-webkit-scrollbar{display:none;}
.ftab-wrap{display:flex;align-items:center;gap:2px;flex-shrink:0;}
.ftab{background:${T.surface};border:1.5px solid ${T.border};color:${T.textMid};padding:7px 15px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s;}
.ftab.active{background:${T.primary};border-color:${T.primary};color:#fff;}
.fedit{background:none;border:none;font-size:13px;cursor:pointer;opacity:.65;padding:2px 3px;}

/* TABLE GRID */
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.tcard{background:${T.surface};border:2px solid ${T.border};border-radius:14px;padding:12px;cursor:pointer;transition:all .15s;min-height:96px;display:flex;flex-direction:column;justify-content:space-between;position:relative;box-shadow:${T.shadow};}
.tcard:active{transform:scale(.97);}
.tcard.occ{background:linear-gradient(135deg,${T.primaryL},#edfbf4);border-color:${T.primary}70;}
.tcard.online{background:linear-gradient(135deg,${T.orangeL},#fff8e1);border-color:${T.orange}70;}
.tcard.parcel{background:linear-gradient(135deg,${T.blueL},#e0f2fe);border-color:${T.blue}70;}
.tname{font-size:13px;font-weight:800;}
.tamt{font-size:17px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}
.tmeta{font-size:10px;color:${T.textMuted};display:flex;gap:6px;flex-wrap:wrap;margin-top:2px;}
.tempty{font-size:11px;color:${T.textDim};font-weight:600;margin-top:4px;}
.tbadge{position:absolute;top:7px;right:7px;border-radius:8px;font-size:9px;font-weight:800;padding:2px 6px;color:#fff;background:${T.accent};}
.tbadge.urg{background:${T.red};}
.pill{padding:3px 9px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;}
.pill-waiting{background:${T.orangeL};color:${T.orange};}
.pill-preparing{background:${T.blueL};color:${T.blue};}
.pill-ready{background:${T.greenL};color:${T.green};}

/* BUTTONS */
.btn{padding:10px 16px;border-radius:12px;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.btn:active{transform:scale(.96);}
.btn-g{background:${T.primary};color:#fff;}
.btn-g:hover{background:${T.primaryD};}
.btn-r{background:${T.red};color:#fff;}
.btn-o{background:${T.orange};color:#fff;}
.btn-b{background:${T.blue};color:#fff;}
.btn-out{background:${T.surface};border:1.5px solid ${T.border};color:${T.textMid};}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:9px;}
.btn-xs{padding:4px 8px;font-size:11px;border-radius:7px;}
.f1{flex:1;}

/* ORDER SCREEN */
.ord-screen{display:flex;flex-direction:column;height:calc(100vh - 132px);}
.ohdr{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-shrink:0;}
.bbtn{background:${T.surfaceAlt};border:1.5px solid ${T.border};color:${T.text};width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;flex-shrink:0;}
.otitle{font-size:17px;font-weight:900;}
.osub{font-size:11px;color:${T.textMuted};font-weight:600;}
.tinfo{background:${T.blueL};border:1px solid ${T.blue}25;border-radius:10px;padding:7px 11px;margin-bottom:8px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;flex-shrink:0;}
.tic{font-size:11px;font-weight:700;}
.tic.warn{color:${T.red};}

/* ORDER ITEMS LIST */
.ord-list{flex:1;background:${T.surface};border:1.5px solid ${T.border};border-radius:13px;overflow:hidden;display:flex;flex-direction:column;min-height:0;}
.ord-list-hdr{background:${T.primary};padding:7px 12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.ord-list-hdr span{color:#fff;font-size:12px;font-weight:800;}
.ord-items{overflow-y:auto;flex:1;}
.oi{padding:5px 10px;border-bottom:1px solid ${T.border};display:flex;align-items:center;gap:6px;}
.oi:last-child{border-bottom:none;}
.oi.new{border-left:3px solid ${T.green};}
.oi-left{flex:1;min-width:0;}
.oi-name{font-size:12px;font-weight:800;}
.oi-var{font-size:10px;color:${T.textMuted};margin-top:0px;}
.oi-addons{font-size:10px;color:${T.orange};margin-top:0px;font-weight:600;}
.oi-note-row{display:flex;align-items:center;gap:4px;margin-top:1px;}
.oi-note-text{font-size:10px;color:${T.blue};font-style:italic;flex:1;}
.oi-note-btn{background:none;border:1px dashed ${T.borderMid};border-radius:6px;padding:1px 6px;font-size:10px;color:${T.textMuted};cursor:pointer;white-space:nowrap;flex-shrink:0;}
.oi-note-btn:hover,.oi-note-btn:active{border-color:${T.blue};color:${T.blue};background:${T.blueL};}
.oi-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.oi-price{font-size:12px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}
.qrow{display:flex;align-items:center;gap:5px;}
.qb{background:${T.border};border:none;color:${T.text};width:26px;height:26px;border-radius:7px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:900;}
.qb.del{background:${T.redL};color:${T.red};}
.qb.mv{background:${T.blueL};color:${T.blue};}
.qn{font-size:12px;font-weight:900;min-width:16px;text-align:center;font-family:'JetBrains Mono',monospace;}
.ord-footer{border-top:2px solid ${T.border};padding:7px 11px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.ord-total{font-size:14px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}

/* ADD MENU BTN */
.add-menu-btn{background:${T.primary};color:#fff;border:none;border-radius:12px;padding:11px 0;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;flex-shrink:0;}

/* SLIDE-UP MENU */
.menu-overlay{position:fixed;inset:0;z-index:150;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;}
.menu-overlay.open{pointer-events:all;}
.menu-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.38);opacity:0;transition:opacity .25s;}
.menu-overlay.open .menu-backdrop{opacity:1;}
.menu-panel{background:${T.surface};border-radius:22px 22px 0 0;width:100%;max-height:76vh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .28s cubic-bezier(.32,.72,0,1);box-shadow:0 -8px 40px rgba(0,0,0,.18);}
.menu-overlay.open .menu-panel{transform:translateY(0);}
.menu-panel-hdr{padding:12px 16px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${T.border};flex-shrink:0;}
.menu-panel-title{font-size:16px;font-weight:900;}
.mclose{background:${T.surfaceAlt};border:1.5px solid ${T.border};color:${T.textMuted};width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}
.menu-search{padding:8px 12px;border-bottom:1px solid ${T.border};flex-shrink:0;}
.menu-sinp{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:9px;padding:7px 11px;color:${T.text};font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;width:100%;outline:none;}
.menu-sinp:focus{border-color:${T.primary};}
.menu-body{display:flex;flex:1;min-height:0;}
.cat-list{width:80px;overflow-y:auto;flex-shrink:0;border-right:1px solid ${T.border};scrollbar-width:none;}
.cat-list::-webkit-scrollbar{display:none;}
.cat-btn{padding:10px 6px;text-align:center;cursor:pointer;font-size:11px;font-weight:800;transition:all .12s;color:${T.textMid};border-bottom:1px solid ${T.border}50;}
.cat-btn.active{background:${T.primary};color:#fff;}
.item-list{flex:1;overflow-y:auto;padding:6px;}
.mitem{background:${T.surfaceAlt};border:1px solid ${T.border};border-radius:10px;padding:9px 11px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:all .12s;margin-bottom:5px;}
.mitem:active{background:${T.primaryL};}
.iname{font-size:12px;font-weight:700;}
.ivars{font-size:10px;color:${T.textMuted};margin-top:1px;}
.ipr{font-size:13px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}
.iadd{background:${T.primary};color:#fff;border:none;width:28px;height:28px;border-radius:8px;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:900;flex-shrink:0;}

/* MODALS */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:300;display:flex;align-items:flex-end;}
.modal{background:${T.surface};border-radius:22px 22px 0 0;padding:18px;width:100%;max-height:92vh;overflow-y:auto;}
.mhdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.mtitle{font-size:17px;font-weight:900;}
.sec-lbl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:${T.textMuted};margin-bottom:7px;}
.modal-sum{background:${T.primaryL};border:1.5px solid ${T.primary}30;border-radius:11px;padding:10px 13px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;}
.modal-sum-lbl{font-size:11px;color:${T.textMid};font-weight:600;}
.modal-sum-price{font-size:20px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}
.vgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px;}
.vbtn{background:${T.surfaceAlt};border:2px solid ${T.border};border-radius:11px;padding:10px 5px;text-align:center;cursor:pointer;transition:all .12s;}
.vbtn.sel{background:${T.primaryL};border-color:${T.primary};}
.vn{font-size:12px;font-weight:800;}
.vp{font-size:11px;color:${T.primary};font-family:'JetBrains Mono',monospace;margin-top:2px;font-weight:700;}
.addon-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px;}
.addon-btn{background:${T.surfaceAlt};border:2px solid ${T.border};border-radius:10px;padding:8px 10px;cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:space-between;}
.addon-btn.sel{background:${T.orangeL};border-color:${T.orange};}
.addon-name{font-size:12px;font-weight:700;}
.addon-price{font-size:11px;font-weight:800;color:${T.orange};font-family:'JetBrains Mono',monospace;}
.addon-price.free{color:${T.textMuted};}
.addon-qty{display:flex;align-items:center;gap:4px;margin-top:3px;}
.aqb{background:${T.orange};border:none;color:#fff;width:20px;height:20px;border-radius:5px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:900;}
.notes-area{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:10px;padding:9px 11px;color:${T.text};font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;width:100%;outline:none;resize:none;min-height:60px;}
.notes-area:focus{border-color:${T.primary};}
.recent-notes{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;}
.rnote{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:20px;padding:4px 11px;font-size:11px;font-weight:700;cursor:pointer;}
.rnote:hover,.rnote:active{background:${T.blueL};border-color:${T.blue};color:${T.blue};}

/* KITCHEN */
.kscreen{padding:14px;min-height:calc(100vh - 132px);}
.kscreen.dark{background:#0f1117;color:#f0f4ff;}
.krow{display:flex;align-items:stretch;border-radius:12px;overflow:hidden;margin-bottom:7px;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
.krow.dark{border:1px solid #2e3352;}
.kstrip{width:5px;flex-shrink:0;}
.kstrip.waiting{background:${T.orange};}
.kstrip.normal{background:${T.blue};}
.kbody{flex:1;background:${T.surface};padding:8px 10px;}
.krow.dark .kbody{background:#1a1d27;}
.khead{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.ktbl{font-size:13px;font-weight:900;}
.krow.dark .ktbl{color:#f0f4ff;}
.kmeta{font-size:10px;color:${T.textMuted};display:flex;gap:6px;margin-left:auto;}
.kmeta.urgent{color:${T.red};}
.kline{display:flex;align-items:flex-start;padding:4px 0;border-bottom:1px dashed ${T.border};}
.krow.dark .kline{border-bottom-color:#2e3352;}
.kline:last-child{border-bottom:none;}
.kqty{font-weight:900;color:#1e2235 !important;font-family:'JetBrains Mono',monospace;font-size:13px;min-width:24px;}
.krow.dark .kqty{color:#f0f4ff !important;}
.knm{font-size:12px;font-weight:700;color:#1e2235;}
.krow.dark .knm{color:#f0f4ff;}
.kdetail{font-size:10px;color:#1e2235 !important;}
.krow.dark .kdetail{color:#f0f4ff !important;}
.kaddons{font-size:10px;color:${T.orange};font-weight:600;}
.knote-k{font-size:10px;color:${T.blue};font-style:italic;}
.icheck{width:24px;height:24px;border-radius:7px;border:1.5px solid ${T.border};background:${T.surface};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;flex-shrink:0;transition:all .12s;margin-left:6px;margin-top:1px;}
.icheck.done{background:${T.green};border-color:${T.green};color:#fff;}
.krow.dark .icheck{background:#22263a;border-color:#3e4660;}
.krow.dark .icheck.done{background:${T.green};border-color:${T.green};}
.kactions{background:${T.surfaceAlt};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px;gap:5px;min-width:44px;}
.krow.dark .kactions{background:#22263a;}
.kallbtn{background:${T.primary};border:none;color:#fff;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;font-weight:900;}
.kall-lbl{font-size:9px;font-weight:800;color:${T.textMuted};text-align:center;}
.krow.dark .kall-lbl{color:#555e80;}

/* PAYMENT */
.pay-mode-row{display:flex;gap:7px;margin-bottom:12px;}
.pay-mode{flex:1;padding:"8px 4px";border-radius:10px;border:2px solid transparent;text-align:center;cursor:pointer;font-size:11px;font-weight:800;transition:all .12s;padding:8px 4px;}
.pmg{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;}
.pm{background:${T.surfaceAlt};border:2px solid ${T.border};border-radius:12px;padding:12px;text-align:center;cursor:pointer;transition:all .12s;}
.pm.sel{background:${T.primaryL};border-color:${T.primary};}
.pmic{font-size:24px;margin-bottom:3px;}
.pmn{font-size:13px;font-weight:800;}
.partial-inp{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:10px;padding:9px 12px;color:${T.text};font-family:'Nunito',sans-serif;font-size:16px;font-weight:700;width:100%;outline:none;}
.partial-inp:focus{border-color:${T.primary};}
.pay-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;border:1.5px solid ${T.border};cursor:pointer;transition:all .12s;background:${T.surface};margin-bottom:5px;}
.pay-item.sel{background:${T.primaryL};border-color:${T.primary};}
.pcheck{width:20px;height:20px;border-radius:6px;border:2px solid ${T.border};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .12s;}
.pcheck.on{background:${T.primary};border-color:${T.primary};color:#fff;}

/* TABLE TRANSFER */
.tr-section{margin-bottom:12px;}
.tr-section-lbl{font-size:11px;font-weight:800;color:${T.textMuted};text-transform:uppercase;letter-spacing:.7px;margin-bottom:7px;}
.tr-item-list{display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto;margin-bottom:10px;}
.tr-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:9px;border:1.5px solid ${T.border};cursor:pointer;transition:all .12s;}
.tr-item.sel{background:${T.blueL};border-color:${T.blue};}
.tr-tbl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.tr-tbl-btn{background:${T.surfaceAlt};border:2px solid ${T.border};border-radius:10px;padding:9px 4px;text-align:center;cursor:pointer;font-size:11px;font-weight:800;transition:all .12s;}
.tr-tbl-btn.sel{background:${T.primaryL};border-color:${T.primary};color:${T.primary};}
.tr-tbl-btn.occ{border-color:${T.orange}50;background:${T.orangeL};}
.tr-tbl-btn.self{opacity:.35;pointer-events:none;}

/* SETTINGS */
.sg{margin-bottom:18px;}
.sg-lbl{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${T.textMuted};margin-bottom:8px;}
.si{background:${T.surface};border:1.5px solid ${T.border};border-radius:11px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;cursor:pointer;transition:all .12s;box-shadow:${T.shadow};}
.si:hover{border-color:${T.primary}50;}
.si-lbl{font-size:14px;font-weight:700;}
.si-val{font-size:12px;color:${T.textMuted};font-weight:600;}
.tog{width:44px;height:24px;background:${T.border};border-radius:12px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}
.tog.on{background:${T.primary};}
.tog::after{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
.tog.on::after{transform:translateX(20px);}
.inp{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:11px;padding:10px 12px;color:${T.text};font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;width:100%;outline:none;transition:border-color .2s;}
.inp:focus{border-color:${T.primary};}
.ilbl{font-size:11px;font-weight:800;color:${T.textMid};margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;}
.ig{margin-bottom:12px;}
.row{display:flex;gap:8px;}
.chip{display:inline-flex;align-items:center;gap:3px;background:${T.primaryL};border:1px solid ${T.primary}30;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:${T.primary};}
.notif{position:fixed;top:62px;right:12px;z-index:500;background:${T.primary};border-radius:12px;padding:10px 16px;font-size:13px;font-weight:700;color:#fff;box-shadow:${T.shadowMd};animation:nIn .25s ease;}
@keyframes nIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.card{background:${T.surface};border:1.5px solid ${T.border};border-radius:14px;padding:14px;box-shadow:${T.shadow};}
.clbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:${T.textMuted};margin-bottom:10px;}
.rrow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid ${T.border}50;}
.rrow:last-child{border-bottom:none;}
.rlbl{font-size:13px;font-weight:700;}
.rval{font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${T.primary};}
.rbar-w{display:flex;align-items:center;gap:7px;}
.rbar{width:72px;height:7px;background:${T.border};border-radius:4px;overflow:hidden;}
.rbar-f{height:100%;border-radius:4px;}
.sgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-bottom:12px;}
.sc{background:${T.surface};border:1.5px solid ${T.border};border-radius:13px;padding:13px;box-shadow:${T.shadow};}
.slbl{font-size:10px;color:${T.textMuted};text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:4px;}
.sval{font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;}
.sval.g{color:${T.primary};}.sval.o{color:${T.orange};}.sval.b{color:${T.blue};}
.rtab{background:${T.surface};border:1.5px solid ${T.border};border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;color:${T.textMid};}
.rtab.active{background:${T.primary};border-color:${T.primary};color:#fff;}
.stcard{background:${T.surface};border:1.5px solid ${T.border};border-radius:13px;padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:11px;box-shadow:${T.shadow};}
.stav{width:42px;height:42px;border-radius:50%;background:${T.primaryL};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
.stnm{font-size:14px;font-weight:800;}
.strl{font-size:11px;color:${T.textMuted};font-weight:600;}
.pgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}
.pit{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:9px;padding:8px 10px;display:flex;align-items:center;gap:6px;cursor:pointer;transition:all .12s;}
.pit.on{background:${T.primaryL};border-color:${T.primary};}
.pchk{width:18px;height:18px;border-radius:5px;border:2px solid ${T.border};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;}
.pchk.on{background:${T.primary};border-color:${T.primary};color:#fff;}
.plbl{font-size:12px;font-weight:700;}
.pbox{width:22px;height:22px;border:2px solid ${T.border};border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pbox.on{background:${T.accent};border-color:${T.accent};}
.plbl2{font-size:14px;font-weight:600;}
.prow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid ${T.border}50;cursor:pointer;}
.prow:last-child{border-bottom:none;}
.printer-card{background:${T.surface};border:2px solid ${T.border};border-radius:13px;padding:13px;margin-bottom:8px;}
.printer-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.printer-dot.connected{background:${T.green};}
.sbtn{background:${T.surfaceAlt};border:2px solid ${T.border};border-radius:10px;padding:7px 15px;font-size:13px;font-weight:800;cursor:pointer;}
.sbtn.sel{background:${T.primaryL};border-color:${T.primary};color:${T.primary};}
.stbl{width:100%;border-collapse:collapse;font-size:13px;}
.stbl th{text-align:left;padding:7px 9px;font-size:10px;font-weight:800;text-transform:uppercase;color:${T.textMuted};border-bottom:2px solid ${T.border};}
.stbl td{padding:7px 9px;border-bottom:1px solid ${T.border}50;}
.stbl tr:last-child td{border-bottom:none;}
.otab{background:${T.surface};border:2px solid ${T.border};color:${T.textMid};padding:6px 14px;border-radius:20px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap;flex-shrink:0;}
.drag-handle{cursor:grab;color:${T.textDim};font-size:16px;padding:0 4px;}
.tbl-edit-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid ${T.border}50;}
.tbl-edit-row:last-child{border-bottom:none;}
.div{height:1px;background:${T.border};margin:10px 0;}
.mt6{margin-top:6px;}.mt8{margin-top:8px;}.mt12{margin-top:12px;}
.mb6{margin-bottom:6px;}.mb8{margin-bottom:8px;}.mb12{margin-bottom:12px;}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const initFloors=()=>[
  {id:"f1",name:"Ground Floor",tables:[{id:"t1",name:"Table 1"},{id:"t2",name:"Table 2"},{id:"t3",name:"Table 3"},{id:"t4",name:"Table 4"},{id:"t5",name:"Table 5"},{id:"t6",name:"Table 6"},{id:"t7",name:"Table 7"},{id:"t8",name:"Table 8"},{id:"t9",name:"Table 9"},{id:"t10",name:"Table 10"},{id:"tp1",name:"Parcel 1"},{id:"tp2",name:"Parcel 2"}],stickerTables:["tp1","tp2"]},
  {id:"f2",name:"1st Floor",tables:[{id:"t11",name:"Table 11"},{id:"t12",name:"Table 12"},{id:"t13",name:"Table 13"},{id:"t14",name:"Table 14"},{id:"t15",name:"Table 15"},{id:"t16",name:"Table 16"},{id:"t17",name:"Table 17"},{id:"t18",name:"Table 18"}],stickerTables:[]},
  {id:"f3",name:"Terrace",tables:[{id:"t19",name:"Table 19"},{id:"t20",name:"Table 20"},{id:"t21",name:"Table 21"},{id:"t22",name:"Table 22"}],stickerTables:[]},
  {id:"f4",name:"Private Dining",tables:[{id:"vip1",name:"VIP 1"},{id:"vip2",name:"VIP 2"},{id:"vip3",name:"VIP 3"},{id:"vip4",name:"VIP 4"}],stickerTables:[]},
  {id:"f5",name:"Outdoor",tables:[{id:"o1",name:"Outdoor 1"},{id:"o2",name:"Outdoor 2"},{id:"o3",name:"Outdoor 3"},{id:"o4",name:"Outdoor 4"}],stickerTables:[]},
];

const KITCHENS=["Kitchen 1","Kitchen 2","Kitchen 3","Bar","Kitchen 4"];
const CATS=[]; // cleared - use Firebase menu
const ITEMS=[]; // cleared - use Firebase menu

const nowStr=()=>{const d=new Date();return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;};
const elapsed=(ms)=>{const m=Math.floor((Date.now()-ms)/60000);return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60}m`;};
const elapsedM=(ms)=>Math.floor((Date.now()-ms)/60000);
const uid=()=>Math.random().toString(36).slice(2,9);
const itemTotal=(it)=>(it.basePrice+(it.varPrice||0)+(it.addons||[]).reduce((s,a)=>s+a.price*a.qty,0))*it.qty;

// makeInitOrders removed - starting with empty orders

const DEF_STAFF=[]; // staff managed via Firebase

function useTick(ms=30000){const[t,setT]=useState(0);useEffect(()=>{const iv=setInterval(()=>setT(x=>x+1),ms);return()=>clearInterval(iv);},[ms]);return t;}
function useClock(){const[t,setT]=useState(nowStr());useEffect(()=>{const iv=setInterval(()=>setT(nowStr()),10000);return()=>clearInterval(iv);},[]);return t;}

function playRing(count,tone,vol){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    const ac=new AC();
    const freqs={bell:880,chime:1046,buzz:200,ping:1318,alert:660,classic:523};
    const freq=freqs[tone]||880;
    const v=Math.min(1,(vol||4)/8)*0.3;
    for(let i=0;i<count;i++){setTimeout(()=>{const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=freq;o.type=tone==="buzz"?"sawtooth":"sine";g.gain.setValueAtTime(v,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.35);o.start(ac.currentTime);o.stop(ac.currentTime+0.35);},i*450);}
  }catch(e){}
}

// Category-wise recent notes — stored in memory, max 5 per category
function useRecentNotes(){
  const[notes,setNotes]=useState({});
  const addNote=(cat,note)=>{
    if(!note||!note.trim())return;
    setNotes(prev=>{
      const catNotes=prev[cat]||[];
      const cleaned=[note,...catNotes.filter(n=>n!==note)].slice(0,5);
      return{...prev,[cat]:cleaned};
    });
  };
  return{notes,addNote};
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[restaurantId,setRestaurantId]=useState(null); // owner's UID = restaurant key
  const[staffList,setStaffList]=useState([]);
  const[isOwner,setIsOwner]=useState(false);
  const[restInfo,setRestInfo]=useState({});
  const[selfOrders,setSelfOrders]=useState([]);
  const[selfOrderModal,setSelfOrderModal]=useState(null); // selected self order to view
  const[menuData,setMenuData]=useState({cats:[],items:[]});

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,(u)=>{
      setUser(u);
      if(!u){setAuthLoading(false);setRestaurantId(null);return;}
      // Step 1: Check if this user is an owner (has their own restaurant)
      const ownerRef=ref(db,`restaurants/${u.uid}/info`);
      onValue(ownerRef,(snap)=>{
        if(snap.exists()){
          // This user IS an owner - load their restaurant
          setRestaurantId(u.uid);
          setIsOwner(true);
          setAuthLoading(false);
        } else {
          // Step 2: Not an owner - check staffIndex to find their restaurant
          const emailKey=u.email.toLowerCase().replace(/[.]/g,"_").replace(/@/g,"_at_");
          const staffLookupRef=ref(db,`staffIndex/${emailKey}`);
          onValue(staffLookupRef,(staffSnap)=>{
            if(staffSnap.exists()){
              // Found as staff - link to owner's restaurant
              const rid=staffSnap.val().restaurantId;
              setRestaurantId(rid);
              setIsOwner(false);
            } else {
              // Brand new user - create their own fresh restaurant
              set(ref(db,`restaurants/${u.uid}/info`),{
                name:"",
                owner:u.email,
                ownerName:u.displayName||u.email,
                createdAt:Date.now()
              });
              setRestaurantId(u.uid);
              setIsOwner(true);
            }
            setAuthLoading(false);
          },{onlyOnce:true});
        }
      },{onlyOnce:true});
    });
    return()=>unsub();
  },[]);

  // Load self orders (customer QR orders) - show notification
  useEffect(()=>{
    if(!restaurantId)return;
    const r=ref(db,`restaurants/${restaurantId}/self_orders`);
    const unsub=onValue(r,(snap)=>{
      const d=snap.val();
      setSelfOrders(d?Object.values(d).filter(o=>o.status==="pending"):[]);
    });
    return()=>unsub();
  },[restaurantId]);

  // Load restaurant info
  useEffect(()=>{
    if(!restaurantId)return;
    const infoRef=ref(db,`restaurants/${restaurantId}/info`);
    const unsub=onValue(infoRef,(snap)=>{if(snap.exists())setRestInfo(snap.val());});
    return()=>unsub();
  },[restaurantId]);

  // Load staff list from this restaurant's Firebase path
  useEffect(()=>{
    if(!restaurantId)return;
    const staffRef=ref(db,`restaurants/${restaurantId}/staff`);
    const unsub=onValue(staffRef,(snapshot)=>{
      const data=snapshot.val();
      if(!data){setStaffList([]);return;}
      const arr=Array.isArray(data)?data:Object.values(data);
      setStaffList(arr.filter(Boolean));
    });
    return()=>unsub();
  },[restaurantId]);

  // Load menu from Firebase
  useEffect(()=>{
    if(!restaurantId)return;
    const menuRef=ref(db,`restaurants/${restaurantId}/menu`);
    const unsub=onValue(menuRef,(snapshot)=>{
      const data=snapshot.val();
      if(data){
        const items=data.items?Object.values(data.items).map(it=>({...it,basePrice:it.basePrice||it.price})):[];
        setMenuData({
          cats:data.cats?Object.values(data.cats).sort((a,b)=>(a.priority||0)-(b.priority||0)):[],
          items
        });
      }
    });
    return()=>unsub();
  },[restaurantId]);

  // Load orders from this restaurant's Firebase path
  // (replaces the useEffect below which uses RID — keep in sync)

  const signIn=()=>signInWithPopup(auth,googleProvider).catch(e=>alert("Login error: "+e.message));
  const signOutUser=()=>{signOut(auth);setRestaurantId(null);setIsOwner(false);}; 
  const RID=restaurantId; // shorthand for restaurant path
  const[floors,setFloors]=useState(initFloors);
  const allTables=floors.flatMap(f=>f.tables);
  const[activeFloor,setActiveFloor]=useState("f1");
  const[orders,setOrders]=useState({});

  useEffect(()=>{
    if(!RID)return;
    const ordersRef=ref(db,`restaurants/${RID}/orders`);
    const unsub=onValue(ordersRef,(snapshot)=>{
      setOrders(snapshot.val()||{});
    });
    return()=>unsub();
  },[RID]);

  const saveOrders=useCallback((newOrders)=>{
    const resolved=typeof newOrders==="function"?newOrders(orders):newOrders;
    setOrders(resolved);
    if(RID)set(ref(db,`restaurants/${RID}/orders`),resolved);
  },[orders,RID]);
  const[selTable,setSelTable]=useState(null);
  const[menuOpen,setMenuOpen]=useState(false);
  const[varModal,setVarModal]=useState(null);
  const[noteModal,setNoteModal]=useState(null);
  const[payModal,setPayModal]=useState(false);
  const[transferModal,setTransferModal]=useState(null);
  const[tab,setTab]=useState("orders");
  const[notif,setNotif]=useState(null);
  const[activeKitchen,setActiveKitchen]=useState("Kitchen 1");
  const[kitchenDark,setKitchenDark]=useState(false);
  const[kss,setKss]=useState({vol:6,count:2,tone:"bell"});
  const[editFloor,setEditFloor]=useState(null);
  const[staffModal,setStaffModal]=useState(null);
  const[staff,setStaff]=useState(DEF_STAFF);
  const[fontSize,setFontSize]=useState(14);
  const[itemDone,setItemDone]=useState({});
  const[reportPeriod,setReportPeriod]=useState("today");
  const[kitchenCfg,setKitchenCfg]=useState({waiterName:false,itemNotes:true,sortBy:"default"});
  const[printCfg,setPrintCfg]=useState({companyName:true,header:"Opp. Redij Petrol Pump, Near D.B.J College, Chiplun, 415605",footer:"Thank You! Visit Again!!",time:true,qty:true,price:true,desc:true,tax:false,table:true});
  const{notes:recentNotes,addNote}=useRecentNotes();
  const clock=useClock();
  useTick();

  const showNotif=useCallback((msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),2500);},[]);
  const ring=useCallback((n)=>playRing(n||kss.count,kss.tone,kss.vol),[kss]);

  const getStickerOn=(tid)=>{
    if(!tid)return false;
    const tbl=allTables.find(t=>t.id===tid);
    if(!tbl)return false;
    const nm=tbl.name.toLowerCase();
    if(nm.includes("zomato")||nm.includes("swiggy")||nm.includes("unbox")||nm.includes("parcel"))return true;
    for(const fl of floors){if(fl.tables.find(t=>t.id===tid))return fl.stickerTables?.includes(tid)||false;}
    return false;
  };

  const addItemToOrder=(configured)=>{
    const newItem={...configured,uid:uid(),sent:false};
    saveOrders(prev=>{
      const ex=prev[selTable];
      if(ex)return{...prev,[selTable]:{...ex,items:[...ex.items,newItem]}};
      return{...prev,[selTable]:{items:[newItem],time:nowStr(),startMs:Date.now(),status:"waiting",waiter:"modchiplun",orderNote:"",paidAmount:0}};
    });
    // ring(1);
    showNotif(`${configured.name} added ✓`);
  };

  const removeItem=(tid,uid_)=>{
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      const items=prev[tid].items.filter(i=>i.uid!==uid_);
      if(!items.length){const n={...prev};delete n[tid];return n;}
      return{...prev,[tid]:{...prev[tid],items}};
    });
    // ring(1);
  };

  const updateItem=(tid,uid_,changes)=>{
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      return{...prev,[tid]:{...prev[tid],items:prev[tid].items.map(it=>it.uid===uid_?{...it,...changes}:it)}};
    });
  };

  const saveNote=(tid,uid_,note,cat)=>{
    updateItem(tid,uid_,{note});
    if(note&&cat)addNote(cat,note);
    // ring(1);
    showNotif("Note saved ✓");
  };

  const sendKitchen=(tid)=>{
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      return{...prev,[tid]:{...prev[tid],status:"waiting",items:prev[tid].items.map(it=>({...it,sent:true}))}};
    });
    // ring(kss.count);
    showNotif("Sent to kitchen! 🍳");
    // Fix 1: close table and go back to orders list immediately
    setSelTable(null);
    setMenuOpen(false);
  };

  const markItemDone=(tid,uid_)=>{
    const key=`${tid}-${uid_}`;
    const newDone={...itemDone,[key]:true};
    setItemDone(newDone);
    const ord=orders[tid];if(!ord)return;
    const kitItems=ord.items.filter(it=>it.kitchen===activeKitchen&&it.sent);
    if(kitItems.every(it=>newDone[`${tid}-${it.uid}`])){
      setTimeout(()=>{saveOrders(p=>p[tid]?{...p,[tid]:{...p[tid],status:"ready"}}:p);showNotif("Ready! ✅");},300);
    }
  };

  const markAllDone=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const nd={...itemDone};
    ord.items.filter(it=>it.kitchen===activeKitchen&&it.sent).forEach(it=>{nd[`${tid}-${it.uid}`]=true;});
    setItemDone(nd);
    setTimeout(()=>{saveOrders(p=>p[tid]?{...p,[tid]:{...p[tid],status:"ready"}}:p);showNotif("All ready! ✅");},300);
  };

  // Transfer: move specific items (by uid array) or whole order to another table
  const transferItems=(fromId,toId,itemUids)=>{
    saveOrders(prev=>{
      const from=prev[fromId];if(!from)return prev;
      const toMove=itemUids==="all"?from.items:from.items.filter(i=>itemUids.includes(i.uid));
      const remaining=itemUids==="all"?[]:from.items.filter(i=>!itemUids.includes(i.uid));
      const toOrd=prev[toId];
      // Fix 2: auto-mark moved items as sent=true so they go to kitchen immediately
      const newToItems=[...(toOrd?.items||[]),...toMove.map(i=>({...i,uid:uid(),sent:true}))];
      const newTo=toOrd?{...toOrd,items:newToItems,status:"waiting"}:{items:newToItems,time:nowStr(),startMs:Date.now(),status:"waiting",waiter:from.waiter||"modchiplun",orderNote:"",paidAmount:0};
      const n={...prev,[toId]:newTo};
      if(remaining.length===0)delete n[fromId];
      else n[fromId]={...from,items:remaining};
      return n;
    });
    // ring(1);
    const toName=allTables.find(t=>t.id===toId)?.name||toId;
    showNotif(`Transferred → ${toName} · sent to kitchen ✓`);
    setTransferModal(null);
    if(itemUids==="all"){setSelTable(toId);}
  };

  const floorTables=floors.find(f=>f.id===activeFloor)?.tables||[];

  if(authLoading||(!restaurantId&&user))return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",fontSize:18,color:"#1a7a4a",fontWeight:700}}>Loading MOD POS...</div>;

  // staffAuth - owner gets full access, staff get only their assigned perms
  const rawStaffAuth=user&&restaurantId?(
    isOwner
      // Owner always gets full access
      ? {name:user.displayName||"Owner",role:"Owner",email:user.email,
          perms:{orders:true,payment:true,cancel:true,kitchen:true,kitchen1:true,kitchen2:true,kitchen3:true,kitchen4:true,bar:true,reports:true,settings:true,font:true}}
      // Staff: find in staffList (may be null if list still loading)
      : staffList.find(s=>s.email&&s.email.toLowerCase()===user.email.toLowerCase())||null
  ):null;

  // Manager role = same as owner
  const isManager=rawStaffAuth?.role==="Manager"||rawStaffAuth?.role==="Owner";

  const staffAuth=rawStaffAuth?(
    isManager
      ? {...rawStaffAuth,perms:{orders:true,payment:true,cancel:true,kitchen:true,kitchen1:true,kitchen2:true,kitchen3:true,kitchen4:true,bar:true,reports:true,settings:true,font:true}}
      : rawStaffAuth  // staff gets exactly what was assigned - nothing more
  ):null;

  // Which tabs this user can see
  const _allowedTabs=(!staffAuth||isManager)?null:{
    orders:true, // everyone can see orders
    kitchen:!!(staffAuth.perms?.kitchen||staffAuth.perms?.kitchen1||staffAuth.perms?.kitchen2||staffAuth.perms?.kitchen3||staffAuth.perms?.bar||staffAuth.perms?.kitchen4),
    reports:staffAuth.perms?.reports===true,
    settings:staffAuth.perms?.settings===true,
    more:true,
  };

  if(!user)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",background:"#f2f5ff"}}>
      <div style={{fontSize:48,marginBottom:8}}>🍽</div>
      <div style={{fontSize:32,fontWeight:900,color:"#1a7a4a",marginBottom:4}}>MOD <span style={{color:"#1e2235"}}>POS</span></div>
      <div style={{fontSize:13,color:"#7a8aaa",marginBottom:40,fontWeight:600}}>Restaurant Point of Sale</div>
      <button onClick={signIn} style={{background:"#ffffff",border:"2px solid #e2e8f5",borderRadius:14,padding:"14px 28px",fontSize:15,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Sign in with Google
      </button>
      <div style={{fontSize:11,color:"#b0bdd4",marginTop:16}}>Owner or staff — sign in with your Google account</div>
    </div>
  );

  // Show denied only if staff whose email is NOT found in owner's staffList
  if(user&&!authLoading&&restaurantId&&!isOwner&&staffList.length>0&&!staffList.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase()))return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",background:"#f2f5ff",padding:24}}>
      <div style={{fontSize:48,marginBottom:16}}>🚫</div>
      <div style={{fontSize:20,fontWeight:900,color:"#dc2626",marginBottom:8}}>Not Authorized</div>
      <div style={{fontSize:14,color:"#7a8aaa",marginBottom:4,textAlign:"center"}}>Your Gmail is not in this restaurant's staff list.</div>
      <div style={{fontSize:13,color:"#1a7a4a",fontWeight:700,marginBottom:8,background:"#f0fdf4",padding:"6px 14px",borderRadius:8}}>{user.email}</div>
      <div style={{fontSize:12,color:"#b0bdd4",marginBottom:32,textAlign:"center"}}>Ask the restaurant owner to add you in Settings → Staff.</div>
      <button onClick={signOutUser} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",fontSize:14,fontWeight:800,cursor:"pointer"}}>← Sign Out</button>
    </div>
  );

  const printBill=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const tbl=allTables.find(t=>t.id===tid)?.name||tid;
    const total=ord.items.reduce((s,i)=>s+itemTotal(i),0);
    showNotif(`🖨 Printing bill for ${tbl} · ₹${total}`);
  };

  return(<>
    <style>{buildCss(fontSize)}</style>
    {notif&&<div className="notif">{notif}</div>}
    <div className="pos">
      <nav className="tnav">
        <div className="brand">MOD<span> POS</span><span style={{fontSize:9,opacity:.5,marginLeft:4}}>v2</span></div>
        <span className="ntime">{clock}</span>
        <div className="nav-r">
          <button className="nibtn" title="Bill Printer" onClick={()=>showNotif("MPT-II ● Connected")}>🖨</button>
          <button className="nibtn" title="Label Printer" onClick={()=>showNotif("Shreyansh LP-50 ● Connected")}>🏷</button>
          <button className="nibtn" onClick={()=>showNotif("Syncing")}>☁️</button>
          <div style={{fontSize:10,color:"#a8f0c8",fontWeight:700,maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{staffAuth?.name?.split(" ")[0]||"Staff"}</div>
          <button className="nibtn" onClick={signOutUser} title="Sign Out">👤</button>
        </div>
      </nav>

      <div className="main">
        {tab==="orders"&&!selTable&&<OrdersTab floors={floors} activeFloor={activeFloor} setActiveFloor={setActiveFloor} tables={floorTables} orders={orders} allTables={allTables} onOpen={(tid)=>{setSelTable(tid);setMenuOpen(true);}} onEditFloor={setEditFloor}/>}
        {tab==="orders"&&selTable&&<OrderScreen tid={selTable} orders={orders} allTables={allTables} onBack={()=>{setSelTable(null);setMenuOpen(false);}} onOpenMenu={()=>setMenuOpen(true)} onRemove={removeItem} onUpdate={updateItem} onSend={sendKitchen} onPay={()=>setPayModal(true)} onNoteItem={setNoteModal} onTransfer={()=>setTransferModal({tid:selTable})} onPrint={printBill} showNotif={showNotif} stickerOn={getStickerOn(selTable)} staffAuth={staffAuth}/>}
        {tab==="kitchen"&&<KitchenTab kitchens={KITCHENS} active={activeKitchen} setActive={setActiveKitchen} orders={orders} allTables={allTables} itemDone={itemDone} onItemDone={markItemDone} onAllDone={markAllDone} dark={kitchenDark} setDark={setKitchenDark} cfg={kitchenCfg} kss={kss} setKss={setKss} playRing={playRing} staffAuth={staffAuth}/>}
        {tab==="more"&&<MoreTab orders={orders} saveOrders={saveOrders} allTables={allTables} showNotif={showNotif} staffAuth={staffAuth} user={user} staffList={staffList} restaurantId={RID}/>}
        {tab==="reports"&&(_allowedTabs===null||_allowedTabs.reports?<ReportsTab orders={orders} period={reportPeriod} setPeriod={setReportPeriod}/>:<div style={{textAlign:"center",padding:60,color:T.textDim}}><div style={{fontSize:40}}>🚫</div><div style={{fontWeight:800,marginTop:8}}>No Access</div></div>)}
        {tab==="settings"&&(_allowedTabs===null||_allowedTabs.settings?<SettingsTab floors={floors} setFloors={setFloors} staff={staff} setStaff={setStaff} fontSize={fontSize} setFontSize={setFontSize} printCfg={printCfg} setPrintCfg={setPrintCfg} kitchenCfg={kitchenCfg} setKitchenCfg={setKitchenCfg} onStaff={setStaffModal} showNotif={showNotif} allTables={allTables} staffList={staffList} setStaffList={setStaffList} restaurantId={RID} menuData={menuData} restInfo={restInfo}/>:<div style={{textAlign:"center",padding:60,color:T.textDim}}><div style={{fontSize:40}}>🚫</div><div style={{fontWeight:800,marginTop:8}}>No Access</div></div>)}
      </div>

      <nav className="btab">
        {[
          {id:"orders",ic:"🍽",lb:"Orders",perm:null},
          {id:"kitchen",ic:"👨‍🍳",lb:"Kitchen",perm:"kitchen"},
          {id:"more",ic:"📱",lb:"More",perm:null},
          {id:"reports",ic:"📊",lb:"Reports",perm:"reports"},
          {id:"settings",ic:"⚙️",lb:"Settings",perm:"settings"},
        ].filter(t=>{
          if(isManager||!_allowedTabs)return true;
          if(t.id==="orders"||t.id==="more")return true;
          return _allowedTabs[t.id]===true;
        }).map(t=>(
          <button key={t.id} className={`ti ${tab===t.id?"active":""}`} onClick={()=>{setTab(t.id);if(t.id!=="orders"){setSelTable(null);setMenuOpen(false);}}}>
            <span className="ti-ic">{t.ic}</span>{t.lb}
          </button>
        ))}
      </nav>
    </div>

    {selTable&&<SlideMenu open={menuOpen} onClose={()=>setMenuOpen(false)} onSelectItem={setVarModal} menuData={menuData}/>}
    {varModal&&<VarAddonModal item={varModal} onConfirm={(cfg)=>{addItemToOrder(cfg);setVarModal(null);}} onClose={()=>setVarModal(null)}/>}

    {noteModal&&<div className="overlay" onClick={()=>setNoteModal(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Note · {noteModal.name}</div><button className="mclose" onClick={()=>setNoteModal(null)}>✕</button></div>
        {/* Category-wise recent notes */}
        {(recentNotes[noteModal.cat]||[]).length>0&&(<>
          <div className="sec-lbl">Recent for {noteModal.catName}</div>
          <div className="recent-notes mb8">
            {(recentNotes[noteModal.cat]||[]).map(rn=>(<div key={rn} className="rnote" onClick={()=>setNoteModal(p=>({...p,note:p.note?`${p.note}, ${rn}`:rn}))}>{rn}</div>))}
          </div>
        </>)}
        <div className="sec-lbl">Note</div>
        <textarea className="notes-area mb12" value={noteModal.note} onChange={e=>setNoteModal(p=>({...p,note:e.target.value}))} placeholder="Type your instruction..." rows={3} autoFocus/>
        <div className="row">
          <button className="btn btn-out f1" onClick={()=>setNoteModal(null)}>Cancel</button>
          <button className="btn btn-g f1" onClick={()=>{saveNote(noteModal.tid||selTable,noteModal.uid,noteModal.note,noteModal.cat);setNoteModal(null);}}>✓ Save</button>
        </div>
      </div>
    </div>}

    {payModal&&selTable&&<PaymentModal tid={selTable} allTables={allTables} orders={orders} saveOrders={saveOrders} stickerOn={getStickerOn(selTable)} onClose={()=>setPayModal(false)} onDone={(msg,fullyClosed)=>{
      setPayModal(false);
      showNotif(msg);
      if(fullyClosed){
        // Fix: use setTimeout so modal unmounts first, then redirect
        setTimeout(()=>{setSelTable(null);setMenuOpen(false);},80);
      }
    }} onPrint={printBill}/> }

    {transferModal&&<div className="overlay" onClick={()=>setTransferModal(null)}>
      <TransferModal data={transferModal} orders={orders} allTables={allTables} floors={floors} onTransfer={transferItems} onClose={()=>setTransferModal(null)}/>
    </div>}

    {editFloor&&<div className="overlay" onClick={()=>setEditFloor(null)}>
      <EditFloorModal floor={editFloor} onSave={(fid,name)=>{setFloors(p=>p.map(f=>f.id===fid?{...f,name}:f));setEditFloor(null);showNotif("Floor renamed ✓");}} onClose={()=>setEditFloor(null)}/>
    </div>}
    {staffModal&&<div className="overlay" onClick={()=>setStaffModal(null)}>
      <StaffPermModal person={staffModal} onSave={(u)=>{setStaff(p=>p.map(s=>s.id===u.id?u:s));setStaffModal(null);showNotif("Saved ✓");}} onClose={()=>setStaffModal(null)}/>
    </div>}

    {/* SELF ORDER NOTIFICATION BAR */}
    {selfOrders.length>0&&!selfOrderModal&&(
      <div onClick={()=>setSelfOrderModal(selfOrders[0])} style={{position:"fixed",bottom:68,left:0,right:0,zIndex:250,padding:"0 12px",cursor:"pointer"}}>
        <div style={{background:"linear-gradient(135deg,#d97706,#f59e0b)",borderRadius:14,padding:"11px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(217,119,6,0.4)",animation:"slideUp .3s ease"}}>
          <div style={{fontSize:22,flexShrink:0}}>🔔</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{selfOrders.length} Self Order{selfOrders.length>1?"s":""} Waiting!</div>
            <div style={{fontSize:11,color:"#fef3c7"}}>{selfOrders.map(o=>o.tableName).join(", ")} · Tap to review</div>
          </div>
          <div style={{fontSize:12,color:"#fef3c7",fontWeight:700}}>↑ View</div>
        </div>
      </div>
    )}

    {/* SELF ORDER DETAIL MODAL */}
    {selfOrderModal&&<div className="overlay" onClick={()=>setSelfOrderModal(null)}>
      <div className="modal" style={{maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div className="mhdr">
          <div>
            <div className="mtitle">🛒 Self Order · {selfOrderModal.tableName}</div>
            <div style={{fontSize:11,color:T.textMuted}}>{selfOrderModal.items?.length} items · ₹{selfOrderModal.total}</div>
          </div>
          <button className="mclose" onClick={()=>setSelfOrderModal(null)}>✕</button>
        </div>

        {/* All items */}
        <div style={{marginBottom:14}}>
          {selfOrderModal.items?.map((it,i)=>(
            <div key={i} style={{padding:"9px 0",borderBottom:`1px solid ${T.border}50`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800}}>×{it.qty} {it.name}</div>
                {it.variantLabel&&<div style={{fontSize:11,color:T.textMuted}}>{it.variantLabel}{it.variantPrice>0?` +₹${it.variantPrice}`:""}</div>}
                {it.addons?.length>0&&<div style={{fontSize:11,color:T.orange}}>+ {it.addons.map(a=>a.name||a.label).join(", ")}</div>}
                {it.instruction&&<div style={{fontSize:11,color:T.blue}}>📝 {it.instruction}</div>}
              </div>
              <div style={{fontSize:13,fontWeight:800,color:T.primary,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>
                ₹{(it.price+(it.variantPrice||0)+(it.addons||[]).reduce((s,a)=>s+a.price,0))*it.qty}
              </div>
            </div>
          ))}
          {selfOrderModal.note&&<div style={{fontSize:12,color:T.orange,marginTop:8,padding:"8px 10px",background:T.orangeL,borderRadius:8}}>📝 {selfOrderModal.note}</div>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,padding:"8px 0",borderTop:`2px solid ${T.border}`}}>
            <span style={{fontWeight:800}}>Total</span>
            <span style={{fontWeight:900,fontSize:16,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{selfOrderModal.total}</span>
          </div>
        </div>

        {/* Other pending orders */}
        {selfOrders.length>1&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:800,color:T.textMuted,marginBottom:6,textTransform:"uppercase"}}>Other Pending ({selfOrders.length-1})</div>
          {selfOrders.filter(o=>o.id!==selfOrderModal.id).map(o=>(
            <div key={o.id} onClick={()=>setSelfOrderModal(o)} style={{padding:"8px 12px",borderRadius:10,border:`1.5px solid ${T.orange}40`,background:T.orangeL,cursor:"pointer",marginBottom:6,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,fontWeight:700}}>{o.tableName} · {o.items?.length} items</span>
              <span style={{fontSize:12,fontWeight:800,color:T.orange}}>₹{o.total} →</span>
            </div>
          ))}
        </div>}

        <div className="row">
          <button className="btn btn-r f1" onClick={()=>{
            set(ref(db,`restaurants/${RID}/self_orders/${selfOrderModal.id}`),null);
            setSelfOrderModal(selfOrders.find(o=>o.id!==selfOrderModal.id)||null);
            showNotif("Order rejected");
          }}>✕ Reject</button>
          <button className="btn btn-g f1" onClick={()=>{
            const tableId=allTables.find(t=>t.name===selfOrderModal.tableName)?.id;
            if(!tableId){showNotif("Table not found!");return;}
            const items=selfOrderModal.items.map(it=>({
              uid:Math.random().toString(36).slice(2,9),
              id:it.id,name:it.name,basePrice:it.price,
              varName:it.variantLabel||"",varPrice:it.variantPrice||0,
              addons:(it.addons||[]).map(a=>({id:a.id,name:a.name||a.label,price:a.price,qty:1})),
              note:it.instruction||"",qty:it.qty,
              kitchen:it.kitchen||"Kitchen 1",cat:it.catId||"",sent:true
            }));
            saveOrders(prev=>{
              const ex=prev[tableId];
              if(ex)return{...prev,[tableId]:{...ex,items:[...ex.items,...items],status:"waiting"}};
              return{...prev,[tableId]:{items,time:nowStr(),startMs:Date.now(),status:"waiting",waiter:"Self Order",orderNote:selfOrderModal.note||"",paidAmount:0}};
            });
            set(ref(db,`restaurants/${RID}/self_orders/${selfOrderModal.id}`),null);
            setSelfOrderModal(selfOrders.find(o=>o.id!==selfOrderModal.id)||null);
            showNotif(`✓ Order from ${selfOrderModal.tableName} sent to kitchen!`);
          }}>✓ Accept & Send to Kitchen</button>
        </div>
      </div>
    </div>}
  </>);
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab({floors,activeFloor,setActiveFloor,tables,orders,allTables,onOpen,onEditFloor}){
  useTick();
  const occ=Object.keys(orders).length;
  const total=Object.values(orders).reduce((s,o)=>s+o.items.reduce((ss,i)=>ss+itemTotal(i),0),0);
  return(<>
    <div className="shdr">
      <div className="stitle">Tables</div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <div className="chip">{occ} active</div>
        <span style={{fontSize:13,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{total.toLocaleString()}</span>
      </div>
    </div>
    <div className="ftabs">
      {floors.map(f=>(<div key={f.id} className="ftab-wrap"><div className={`ftab ${activeFloor===f.id?"active":""}`} onClick={()=>setActiveFloor(f.id)}>{f.name}</div>{activeFloor===f.id&&<button className="fedit" onClick={()=>onEditFloor(f)}>✏️</button>}</div>))}
    </div>
    <div className="tgrid">
      {tables.map(tbl=>{
        const ord=orders[tbl.id];const occ=!!ord;
        const tot=occ?ord.items.reduce((s,i)=>s+itemTotal(i),0):0;
        const paid=occ?ord.paidAmount||0:0;
        const mins=occ?elapsedM(ord.startMs):0;const urgent=mins>30;
        const nm=tbl.name.toLowerCase();
        const isOnline=nm.includes("zomato")||nm.includes("swiggy")||nm.includes("unbox");
        const isParcel=nm.includes("parcel");
        return(
          <div key={tbl.id} className={`tcard ${occ?(isOnline?"online":isParcel?"parcel":"occ"):""}`} onClick={()=>onOpen(tbl.id)}>
            {occ&&mins>0&&<div className={`tbadge ${urgent?"urg":""}`}>{elapsed(ord.startMs)}</div>}
            <div>
              <div className="tname">{tbl.name}</div>
              {occ?(<>
                <div className="tamt">₹{(tot-paid).toLocaleString()}{paid>0&&<span style={{fontSize:10,color:T.green}}> +₹{paid}✓</span>}</div>
                <div className="tmeta"><span>🕐{ord.time}</span><span>🛒{ord.items.length}</span>{ord.waiter&&ord.waiter!=="Online"&&<span>👤{ord.waiter}</span>}</div>
                {ord.orderNote&&<div style={{fontSize:10,color:T.orange,fontStyle:"italic",marginTop:2}}>📝{ord.orderNote}</div>}
              </>):<div className="tempty">Empty · tap to order</div>}
            </div>
            {occ&&<span className={`pill pill-${ord.status}`}>{ord.status}</span>}
          </div>
        );
      })}
    </div>
  </>);
}

// ─── ORDER SCREEN ─────────────────────────────────────────────────────────────
function OrderScreen({tid,orders,allTables,onBack,onOpenMenu,onRemove,onUpdate,onSend,onPay,onNoteItem,onTransfer,onPrint,showNotif,stickerOn,staffAuth}){
  useTick(10000);
  const ord=orders[tid];
  const items=ord?.items||[];
  const total=items.reduce((s,i)=>s+itemTotal(i),0);
  const paid=ord?.paidAmount||0;
  const unsent=items.filter(i=>!i.sent).length;
  const tblName=allTables.find(t=>t.id===tid)?.name||tid;
  const changeQty=(uid_,d)=>{const it=items.find(i=>i.uid===uid_);if(!it)return;onUpdate(tid,uid_,{qty:Math.max(1,it.qty+d)});};
  return(
    <div className="ord-screen">
      <div className="ohdr">
        <button className="bbtn" onClick={onBack}>←</button>
        <div style={{flex:1}}>
          <div className="otitle">{tblName}</div>
          <div className="osub">{items.length} items · ₹{total-paid} due{paid>0?` · ₹${paid} paid`:""}{unsent>0?` · ${unsent} unsent`:""}</div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <button className="btn btn-out btn-sm" style={{fontSize:12}} onClick={onTransfer} title="Transfer items">⇄ Move</button>
          {total>0&&staffAuth?.perms?.payment&&<button className="btn btn-sm btn-o" onClick={onPay}>💳</button>}
        </div>
      </div>
      {ord&&<div className="tinfo mb8">
        <span className="tic">🕐{ord.time}</span>
        <span className={`tic ${elapsedM(ord.startMs)>25?"warn":""}`}>⏱{elapsed(ord.startMs)}</span>
        {ord.orderNote&&<span style={{fontSize:11,color:T.orange,fontStyle:"italic",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📝{ord.orderNote}</span>}
      </div>}
      <div className="ord-list">
        <div className="ord-list-hdr">
          <span>{tblName}</span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{color:"#a8f0c8",fontFamily:"'JetBrains Mono',monospace"}}>₹{total}</span>
            {/* Print button — manual only */}
            {total>0&&<button style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",borderRadius:7,padding:"2px 9px",fontSize:11,cursor:"pointer",fontWeight:700}} onClick={()=>onPrint(tid)}>🖨 Print</button>}
          </div>
        </div>
        <div className="ord-items">
          {items.length===0&&<div style={{textAlign:"center",padding:"16px",color:T.textDim,fontSize:12}}>No items yet</div>}
          {items.map(it=>{
            const tot=itemTotal(it);
            const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>`${a.qty>1?a.qty+"×":""}${a.name}${a.price>0?` +₹${a.price*a.qty}`:""}`).join(", ");
            const cat=CATS.find(c=>c.id===it.cat);
            return(
              <div key={it.uid} className={`oi ${!it.sent?"new":""}`}>
                <div className="oi-left">
                  <div className="oi-name">{it.name}{!it.sent&&<span style={{fontSize:9,background:T.greenL,color:T.green,borderRadius:10,padding:"1px 5px",marginLeft:5,fontWeight:700}}>NEW</span>}</div>
                  {it.varName&&<div className="oi-var">{it.varName}{it.varPrice>0?` +₹${it.varPrice}`:""}</div>}
                  {addonStr&&<div className="oi-addons">+ {addonStr}</div>}
                  <div className="oi-note-row">
                    {it.note?<span className="oi-note-text">📝 {it.note}</span>:<span style={{fontSize:10,color:T.textDim,fontStyle:"italic"}}>no note</span>}
                    <button className="oi-note-btn" onClick={()=>onNoteItem({uid:it.uid,name:it.name,note:it.note||"",cat:it.cat,catName:cat?.n||"",tid})}>
                      {it.note?"edit":"+ note"}
                    </button>
                  </div>
                </div>
                <div className="oi-right">
                  <div className="oi-price">₹{tot}</div>
                  <div className="qrow">
                    <button className="qb" onClick={()=>changeQty(it.uid,-1)}>−</button>
                    <span className="qn">{it.qty}</span>
                    <button className="qb" onClick={()=>changeQty(it.uid,1)}>+</button>
                    {staffAuth?.perms?.cancel&&<button className="qb del" onClick={()=>onRemove(tid,it.uid)}>✕</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="ord-footer">
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {paid>0&&<span style={{fontSize:11,color:T.green,fontWeight:700}}>₹{paid} paid</span>}
            <span className="ord-total">₹{total-paid} due</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            {unsent>0&&<button className="btn btn-g btn-sm" onClick={()=>onSend(tid)}>🍳 Send ({unsent})</button>}
            {total>0&&staffAuth?.perms?.payment&&<button className="btn btn-o btn-sm" onClick={onPay}>💳 Pay</button>}
          </div>
        </div>
      </div>
      <button className="add-menu-btn" onClick={onOpenMenu}><span style={{fontSize:20}}>+</span> Add Items</button>
    </div>
  );
}

// ─── SLIDE-UP MENU ────────────────────────────────────────────────────────────
function SlideMenu({open,onClose,onSelectItem,menuData}){
  // Use Firebase menu if available, else fall back to hardcoded demo menu
  const dynCats=menuData?.cats?.length>0
    ?[...menuData.cats].sort((a,b)=>(a.priority||0)-(b.priority||0))
    :[];
  const dynItems=menuData?.items?.length>0 ? menuData.items : [];
  const hasDynMenu=dynCats.length>0;

  const[cat,setCat]=useState(dynCats[0]?.id||"");
  const[q,setQ]=useState("");

  // Reset to first cat when menu opens
  useEffect(()=>{if(open&&dynCats.length>0)setCat(dynCats[0].id);},[open]);

  const filtered=q
    ?dynItems.filter(i=>i.name.toLowerCase().includes(q.toLowerCase()))
    :dynItems.filter(i=>(i.catId||i.cat)===cat);

  const handleSelect=(item)=>{
    // Normalize item for both Firebase and hardcoded items
    onSelectItem({
      ...item,
      basePrice:item.basePrice||item.price,
      cat:item.catId||item.cat,
      vars:item.vars||[],
      addons:item.addons||[],
    });
  };

  return(
    <div className={`menu-overlay ${open?"open":""}`}>
      <div className="menu-backdrop" onClick={onClose}/>
      <div className="menu-panel">
        <div className="menu-panel-hdr">
          <div className="menu-panel-title">Add Items</div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="menu-search">
          <input className="menu-sinp" placeholder="🔍 Search items..." value={q} onChange={e=>setQ(e.target.value)} autoComplete="off"/>
        </div>
        <div className="menu-body">
          {!q&&<div className="cat-list">
            {dynCats.map(c=>(<div key={c.id} className={`cat-btn ${cat===c.id?"active":""}`} onClick={()=>setCat(c.id)}>
              {c.icon&&<div style={{fontSize:16,marginBottom:2}}>{c.icon}</div>}
              <div>{c.name||c.n}</div>
            </div>))}
          </div>}
          <div className="item-list">
            {filtered.length===0&&<div style={{textAlign:"center",padding:20,color:T.textDim,fontSize:12}}>
              {q?"No items found":"No items in this category yet"}
            </div>}
            {!hasDynMenu&&!q&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:12,lineHeight:1.7}}>
              <div style={{fontSize:32,marginBottom:8}}>🍽</div>
              <div style={{fontWeight:800,color:T.textMid,marginBottom:4}}>Menu not set up yet</div>
              <div>Go to Settings → Menu to add your categories and items</div>
            </div>}
            {filtered.map(item=>(<div key={item.id} className="mitem" onClick={()=>handleSelect(item)}>
              <div style={{flex:1}}>
                <div className="iname">{item.name}</div>
                {item.vars?.length>0&&<div className="ivars">{item.vars.length} size options</div>}
                {item.addons?.length>0&&<div style={{fontSize:10,color:T.orange,marginTop:1}}>{item.addons.length} add-ons</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <div className="ipr">₹{item.basePrice||item.price}</div>
                <button className="iadd" onClick={e=>{e.stopPropagation();handleSelect(item);}}>+</button>
              </div>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VARIATION + ADDON + NOTE MODAL ──────────────────────────────────────────
function VarAddonModal({item,onConfirm,onClose}){
  const[selVar,setSelVar]=useState(item.vars?.[0]||null);
  const[selAddons,setSelAddons]=useState({});
  const[note,setNote]=useState("");
  // Use item's own addons from Firebase menu, fallback to hardcoded ITEM_ADDONS
  const catAddons=(item.addons&&item.addons.length>0)?item.addons:(ITEM_ADDONS[item.cat]||[]);
  const varP=selVar?.p||0;
  const addonTotal=Object.entries(selAddons).reduce((s,[id,qty])=>{const a=catAddons.find(x=>x.id===id);return s+(a?a.price*qty:0);},0);
  const unitP=(item.basePrice||item.price)+varP+addonTotal;
  const toggleAddon=(id)=>setSelAddons(p=>({...p,[id]:p[id]?0:1}));
  const aqChange=(id,d)=>setSelAddons(p=>({...p,[id]:Math.max(0,(p[id]||0)+d)}));
  const addonsList=Object.entries(selAddons).filter(([,q])=>q>0).map(([id,qty])=>{const a=catAddons.find(x=>x.id===id);return{...a,qty};});
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">{item.name}</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div className="modal-sum">
          <div className="modal-sum-lbl">₹{item.basePrice||item.price}{selVar&&selVar.p>0?` + var ₹${selVar.p}`:""}{ addonTotal>0?` + add-ons ₹${addonTotal}`:""}</div>
          <div className="modal-sum-price">₹{unitP}</div>
        </div>
        {item.vars?.length>0&&(<><div className="sec-lbl">Variation</div>
          <div className="vgrid mb12">{item.vars.map(v=>(<div key={v.n} className={`vbtn ${selVar?.n===v.n?"sel":""}`} onClick={()=>setSelVar(v)}><div className="vn">{v.n}</div><div className="vp">{v.p>0?`+₹${v.p}`:"Base"}</div></div>))}</div>
        </>)}
        {catAddons.length>0&&(<><div className="sec-lbl">Add-ons for {item.name}</div>
          <div className="addon-grid mb12">{catAddons.map(a=>{const qty=selAddons[a.id]||0;const sel=qty>0;return(
            <div key={a.id} className={`addon-btn ${sel?"sel":""}`}>
              <div style={{flex:1}} onClick={()=>toggleAddon(a.id)}><div className="addon-name">{a.name}</div>
                {sel&&qty>1&&<div className="addon-qty"><button className="aqb" onClick={e=>{e.stopPropagation();aqChange(a.id,-1);}}>−</button><span style={{fontSize:12,fontWeight:900,minWidth:16,textAlign:"center"}}>{qty}</span><button className="aqb" onClick={e=>{e.stopPropagation();aqChange(a.id,1);}}>+</button></div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <div className={`addon-price ${a.price===0?"free":""}`}>{a.price>0?`+₹${a.price}`:"Free"}</div>
                {sel&&qty===1&&<button className="aqb" style={{fontSize:10,width:"auto",padding:"0 5px"}} onClick={e=>{e.stopPropagation();aqChange(a.id,1);}}>+qty</button>}
              </div>
            </div>
          );})}
          </div>
        </>)}
        <div className="sec-lbl">Note (optional)</div>
        <textarea className="notes-area mb12" placeholder="Any instruction for this item..." value={note} onChange={e=>setNote(e.target.value)} rows={2}/>
        <div className="row">
          <button className="btn btn-out f1" onClick={onClose}>Cancel</button>
          <button className="btn btn-g f1" onClick={()=>onConfirm({id:item.id,name:item.name,basePrice:item.basePrice||item.price,varName:selVar?.n||"",varPrice:selVar?.p||0,addons:addonsList,note,qty:1,kitchen:item.kitchen,cat:item.catId||item.cat})}>+ Add · ₹{unitP}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TABLE TRANSFER MODAL ─────────────────────────────────────────────────────
function TransferModal({data,orders,allTables,floors,onTransfer,onClose}){
  const{tid}=data;
  const ord=orders[tid];
  const items=ord?.items||[];
  const[selItems,setSelItems]=useState(new Set()); // selected item uids
  const[selTarget,setSelTarget]=useState(null);
  const[mode,setMode]=useState("items"); // "items" | "all"
  const tblName=allTables.find(t=>t.id===tid)?.name||tid;
  const toggleItem=(uid_)=>setSelItems(p=>{const s=new Set(p);s.has(uid_)?s.delete(uid_):s.add(uid_);return s;});
  const canConfirm=selTarget&&(mode==="all"||selItems.size>0);
  return(
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mhdr"><div className="mtitle">Move Items · {tblName}</div><button className="mclose" onClick={onClose}>✕</button></div>

      {/* Mode */}
      <div style={{display:"flex",gap:7,marginBottom:12}}>
        {[{v:"items",l:"Select items"},{v:"all",l:"Entire order"}].map(m=>(<div key={m.v} onClick={()=>setMode(m.v)} style={{flex:1,padding:"8px",borderRadius:10,border:`2px solid ${mode===m.v?T.primary:T.border}`,background:mode===m.v?T.primaryL:T.surfaceAlt,textAlign:"center",cursor:"pointer",fontSize:12,fontWeight:800,color:mode===m.v?T.primary:T.textMid}}>{m.l}</div>))}
      </div>

      {/* Item selector */}
      {mode==="items"&&(<>
        <div className="tr-section-lbl">Select items to move</div>
        <div className="tr-item-list">
          {items.map(it=>{
            const tot=itemTotal(it);const sel=selItems.has(it.uid);
            return(<div key={it.uid} className={`tr-item ${sel?"sel":""}`} onClick={()=>toggleItem(it.uid)}>
              <div className={`pcheck ${sel?"on":""}`}>{sel&&"✓"}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700}}>{it.name} ×{it.qty}</div>
                {it.varName&&<div style={{fontSize:10,color:T.textMuted}}>{it.varName}</div>}
              </div>
              <div style={{fontSize:12,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{tot}</div>
            </div>);
          })}
        </div>
        {selItems.size>0&&<div style={{fontSize:12,fontWeight:700,color:T.primary,marginBottom:8}}>{selItems.size} item{selItems.size>1?"s":""} selected</div>}
      </>)}

      {/* Target table */}
      <div className="tr-section-lbl">Move to which table?</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {floors.map(fl=>(<div key={fl.id}>
          <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:5,textTransform:"uppercase"}}>{fl.name}</div>
          <div className="tr-tbl-grid">
            {fl.tables.map(t=>{
              const occ=!!orders[t.id];const self=t.id===tid;
              return(<div key={t.id} className={`tr-tbl-btn ${selTarget===t.id?"sel":""} ${occ&&!self?"occ":""} ${self?"self":""}`} onClick={()=>{if(!self)setSelTarget(t.id);}}>
                <div style={{fontSize:11,fontWeight:800}}>{t.name}</div>
                {occ&&!self&&<div style={{fontSize:9,color:T.orange,fontWeight:700}}>occupied</div>}
              </div>);
            })}
          </div>
        </div>))}
      </div>

      {selTarget&&<div style={{background:T.primaryL,borderRadius:10,padding:"8px 12px",margin:"10px 0",fontSize:12,fontWeight:700,color:T.primary}}>
        → {mode==="all"?"Entire order":"Selected items"} will move to {allTables.find(t=>t.id===selTarget)?.name}{orders[selTarget]?" (merged with existing order)":""}
      </div>}

      <div className="row mt8">
        <button className="btn btn-out f1" onClick={onClose}>Cancel</button>
        <button className="btn btn-g f1" style={{opacity:canConfirm?1:.4}} onClick={()=>canConfirm&&onTransfer(tid,selTarget,mode==="all"?"all":[...selItems])}>
          ✓ Move{selTarget?` to ${allTables.find(t=>t.id===selTarget)?.name}`:""}
        </button>
      </div>
    </div>
  );
}

// ─── PAYMENT MODAL ────────────────────────────────────────────────────────────
function PaymentModal({tid,allTables,orders,saveOrders,stickerOn,onClose,onDone,onPrint}){
  const ord=orders[tid];
  const items=ord?.items||[];
  const grandTotal=items.reduce((s,i)=>s+itemTotal(i),0);
  const alreadyPaid=ord?.paidAmount||0;
  const grandRemaining=grandTotal-alreadyPaid;
  const[mode,setMode]=useState("full");
  const[selItems,setSelItems]=useState({});
  const[partialAmt,setPartialAmt]=useState("");
  const[payMethod,setPayMethod]=useState("upi");
  const tblName=allTables.find(t=>t.id===tid)?.name||tid;
  const selectedTotal=Object.entries(selItems).filter(([,v])=>v).reduce((s,[uid_])=>{const it=items.find(i=>i.uid===uid_);return s+(it?itemTotal(it):0);},0);
  const payNow=mode==="full"?grandRemaining:mode==="items"?selectedTotal:parseFloat(partialAmt)||0;
  if(!ord)return null;
  const collect=()=>{
    if(payNow<=0)return;
    const newPaid=alreadyPaid+payNow;
    if(newPaid>=grandTotal){
      saveOrders(prev=>{const n={...prev};delete n[tid];return n;});
      // Fix 3: full payment — close table, redirect to orders list
      onDone(`✅ ₹${payNow} · ${tblName} closed`,true);
    } else {
      // Fix 3: partial/selective — keep table open
      saveOrders(prev=>({...prev,[tid]:{...prev[tid],paidAmount:newPaid}}));
      onDone(`✅ ₹${payNow} collected · ₹${grandTotal-newPaid} remaining`,false);
    }
  };
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Payment · {tblName}</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div style={{background:`linear-gradient(135deg,${T.primaryL},#dcfce7)`,borderRadius:13,padding:13,marginBottom:12,border:`1.5px solid ${T.primary}40`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:12,color:T.textMuted,fontWeight:700}}>Bill Total</span>
            <span style={{fontSize:16,fontWeight:900,fontFamily:"'JetBrains Mono',monospace"}}>₹{grandTotal}</span>
          </div>
          {alreadyPaid>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:12,color:T.green,fontWeight:700}}>Already Paid</span>
            <span style={{fontSize:13,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.green}}>₹{alreadyPaid}</span>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.primary}30`,paddingTop:5}}>
            <span style={{fontSize:13,fontWeight:800,color:T.primary}}>Due Now</span>
            <span style={{fontSize:22,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.primary}}>₹{grandRemaining}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:12}}>
          {[{v:"full",l:"Full"},{v:"items",l:"By Items"},{v:"partial",l:"Partial"}].map(m=>(<div key={m.v} onClick={()=>setMode(m.v)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`2px solid ${mode===m.v?T.primary:T.border}`,background:mode===m.v?T.primaryL:T.surfaceAlt,textAlign:"center",cursor:"pointer",fontSize:11,fontWeight:800,color:mode===m.v?T.primary:T.textMid}}>{m.l}</div>))}
        </div>
        {mode==="items"&&(<>
          {items.map(it=>{const tot=itemTotal(it);const sel=!!selItems[it.uid];const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");return(
            <div key={it.uid} className={`pay-item ${sel?"sel":""}`} onClick={()=>setSelItems(p=>({...p,[it.uid]:!p[it.uid]}))}>
              <div className={`pcheck ${sel?"on":""}`}>{sel&&"✓"}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{it.name} ×{it.qty}</div>{addonStr&&<div style={{fontSize:10,color:T.orange}}>{addonStr}</div>}</div>
              <div style={{fontSize:13,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.primary}}>₹{tot}</div>
            </div>
          );})}
          {selectedTotal>0&&<div style={{textAlign:"right",fontSize:13,fontWeight:800,color:T.primary,marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>₹{selectedTotal}</div>}
        </>)}
        {mode==="partial"&&(<>
          <input className="partial-inp mb8" type="number" placeholder={`Max ₹${grandRemaining}`} value={partialAmt} onChange={e=>setPartialAmt(e.target.value)}/>
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {[100,200,300,500,1000].filter(v=>v<=grandRemaining).map(v=>(<button key={v} className="btn btn-out btn-sm" onClick={()=>setPartialAmt(String(v))}>₹{v}</button>))}
            <button className="btn btn-out btn-sm" onClick={()=>setPartialAmt(String(grandRemaining))}>Full</button>
          </div>
        </>)}
        <div className="sec-lbl mb6">Payment</div>
        {/* Only Cash and UPI */}
        <div className="pmg mb10">
          {[{id:"cash",ic:"💵",n:"Cash"},{id:"upi",ic:"📲",n:"UPI"}].map(m=>(<div key={m.id} className={`pm ${payMethod===m.id?"sel":""}`} onClick={()=>setPayMethod(m.id)}><div className="pmic">{m.ic}</div><div className="pmn">{m.n}</div></div>))}
        </div>
        {/* Printer info — no auto-print, just info */}
        <div style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:9,padding:"7px 12px",marginBottom:10,fontSize:12,fontWeight:600,color:T.textMid,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{stickerOn?"🏷 Labels → Shreyansh LP-50":"🧾 Bill → MPT-II"}</span>
          <button className="btn btn-out btn-xs" onClick={()=>onPrint(tid)}>🖨 Print Now</button>
        </div>
        <div className="row">
          <button className="btn btn-out f1" onClick={onClose}>Cancel</button>
          <button className="btn btn-g f1" onClick={collect} style={{opacity:payNow>0?1:.45}}>✓ Collect ₹{payNow||"..."}</button>
        </div>
      </div>
    </div>
  );
}

// ─── KITCHEN TAB ─────────────────────────────────────────────────────────────
function KitchenTab({kitchens,active,setActive,orders,allTables,itemDone,onItemDone,onAllDone,dark,setDark,cfg,kss,setKss,playRing,staffAuth}){
  // Filter kitchens based on staff permissions
  const kitchenPermMap={"Kitchen 1":"kitchen1","Kitchen 2":"kitchen2","Kitchen 3":"kitchen3","Bar":"bar","Kitchen 4":"kitchen4"};
  const allowedKitchens=staffAuth?.perms?.kitchen
    ? kitchens  // full kitchen access
    : kitchens.filter(k=>{
        const permKey=kitchenPermMap[k];
        return permKey&&staffAuth?.perms?.[permKey];
      });
  const visibleKitchens=allowedKitchens.length>0?allowedKitchens:kitchens;
  useTick(10000);
  const[showKss,setShowKss]=useState(false);
  const pendingOrders=Object.entries(orders).filter(([tid,ord])=>{
    const kitItems=ord.items.filter(it=>it.kitchen===active&&it.sent);
    return kitItems.length>0&&kitItems.some(it=>!itemDone[`${tid}-${it.uid}`])&&ord.status!=="ready";
  }).sort((a,b)=>cfg.sortBy==="new"?b[1].startMs-a[1].startMs:a[1].startMs-b[1].startMs);
  const kBg=dark?"#0f1117":T.bg;const kCol=dark?"#f0f4ff":T.text;
  const getTblName=(tid)=>allTables.find(t=>t.id===tid)?.name||tid;
  return(
    <div className={`kscreen ${dark?"dark":""}`} style={{margin:"-14px",padding:"14px",background:kBg,color:kCol,minHeight:"calc(100vh - 132px)"}}>
      <div className="shdr">
        <div className="stitle" style={{color:kCol,fontSize:17}}>{active}</div>
        <div style={{display:"flex",gap:6}}>
          <div className="chip" style={dark?{background:"#22263a",borderColor:"#2e3352",color:"#a8f0c8"}:{}}>{pendingOrders.length} pending</div>
          <button className="btn btn-out btn-xs" style={dark?{background:"#22263a",borderColor:"#2e3352",color:"#f0f4ff"}:{}} onClick={()=>setDark(!dark)}>{dark?"☀️":"🌙"}</button>
          <button className="btn btn-out btn-xs" style={dark?{background:"#22263a",borderColor:"#2e3352",color:"#f0f4ff"}:{}} onClick={()=>setShowKss(true)}>⚙️</button>
        </div>
      </div>
      <div className="ftabs" style={{marginBottom:10}}>
        {visibleKitchens.map(k=>(<div key={k} className={`ftab ${active===k?"active":""}`} style={dark&&active!==k?{background:"#22263a",borderColor:"#2e3352",color:"#8890b0",fontSize:12}:{fontSize:12}} onClick={()=>setActive(k)}>{k}</div>))}
      </div>
      {pendingOrders.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:dark?"#555e80":T.textDim}}><div style={{fontSize:56,marginBottom:10}}>✅</div><div style={{fontSize:17,fontWeight:800}}>All clear!</div></div>
      ):pendingOrders.map(([tid,ord])=>{
        const kitItems=ord.items.filter(it=>it.kitchen===active&&it.sent);
        const pendingItems=kitItems.filter(it=>!itemDone[`${tid}-${it.uid}`]);
        const urgent=elapsedM(ord.startMs)>(ord.prepEst||20);
        return(
          <div key={tid} className={`krow ${dark?"dark":""}`}>
            <div className={`kstrip ${urgent?"waiting":"normal"}`}/>
            <div className="kbody">
              <div className="khead">
                <span className="ktbl">{getTblName(tid)}</span>
                {cfg.waiterName&&ord.waiter&&ord.waiter!=="Online"&&<span style={{fontSize:10,color:dark?"#8890b0":T.textMuted,fontWeight:600}}>👤{ord.waiter}</span>}
                <div className={`kmeta ${urgent?"urgent":""}`}><span>🕐{ord.time}</span><span>⏱{elapsed(ord.startMs)}</span></div>
              </div>
              {ord.orderNote&&<div style={{fontSize:10,color:T.orange,fontStyle:"italic",marginBottom:4}}>📝{ord.orderNote}</div>}
              {pendingItems.map(it=>{
                const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>`${a.qty>1?a.qty+"×":""}${a.name}${a.price>0?` +₹${a.price*a.qty}`:""}`).join(", ");
                return(
                  <div key={it.uid} className="kline">
                    <span className="kqty">×{it.qty}</span>
                    <div style={{flex:1}}>
                      <span className="knm">{it.name}</span>
                      {it.varName&&<span className="kdetail"> ({it.varName})</span>}
                      {addonStr&&<div className="kaddons">+ {addonStr}</div>}
                      {it.note&&cfg.itemNotes&&<div className="knote-k">📝{it.note}</div>}
                    </div>
                    <div className={`icheck ${itemDone[`${tid}-${it.uid}`]?"done":""}`} style={dark&&!itemDone[`${tid}-${it.uid}`]?{background:"#22263a",borderColor:"#3e4660"}:{}} onClick={()=>onItemDone(tid,it.uid)}>{itemDone[`${tid}-${it.uid}`]?"✓":""}</div>
                  </div>
                );
              })}
            </div>
            <div className="kactions">
              <button className="kallbtn" onClick={()=>onAllDone(tid)}>✓</button>
              <div className="kall-lbl">ALL</div>
            </div>
          </div>
        );
      })}
      {showKss&&<div className="overlay" onClick={()=>setShowKss(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhdr"><div className="mtitle">Sound Settings</div><button className="mclose" onClick={()=>setShowKss(false)}>✕</button></div>
          <div className="sec-lbl mb8">Volume (1–8)</div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
            <button className="btn btn-out btn-sm" onClick={()=>setKss(p=>({...p,vol:Math.max(1,p.vol-1)}))}>−</button>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:900,fontSize:22,color:T.primary,minWidth:28,textAlign:"center"}}>{kss.vol}</span>
            <button className="btn btn-out btn-sm" onClick={()=>setKss(p=>({...p,vol:Math.min(8,p.vol+1)}))}>+</button>
            <span style={{fontSize:16}}>{"🔔".repeat(Math.min(kss.vol,6))}</span>
          </div>
          <div className="sec-lbl mb8">Ring Count</div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[1,2,3,4].map(n=>(<button key={n} className={`sbtn ${kss.count===n?"sel":""}`} onClick={()=>setKss(p=>({...p,count:n}))}>{n}× {"🔔".repeat(n)}</button>))}
          </div>
          <div className="sec-lbl mb8">Ringtone</div>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
            {RINGTONES.map(rt=>(<div key={rt.id} className="si" style={{marginBottom:0,background:kss.tone===rt.id?T.primaryL:T.surface,borderColor:kss.tone===rt.id?T.primary:T.border}} onClick={()=>setKss(p=>({...p,tone:rt.id}))}>
              <div className="si-lbl">{rt.name}</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {kss.tone===rt.id&&<span style={{color:T.primary,fontSize:12,fontWeight:800}}>✓</span>}
                <button className="btn btn-out btn-xs" onClick={e=>{e.stopPropagation();playRing(kss.count,rt.id,kss.vol);}}>▶</button>
              </div>
            </div>))}
          </div>
          <button className="btn btn-g" style={{width:"100%",marginBottom:8}} onClick={()=>playRing(kss.count,kss.tone,kss.vol)}>▶ Test Sound</button>
          <button className="btn btn-out" style={{width:"100%"}} onClick={()=>setShowKss(false)}>Close</button>
        </div>
      </div>}
    </div>
  );
}

// ─── ONLINE TAB ───────────────────────────────────────────────────────────────
function OnlineTab({orders,saveOrders,allTables,showNotif,onBack}){
  const[platform,setPlatform]=useState("zomato");
  const platforms=[{id:"zomato",n:"Zomato",color:"#e23744",ic:"🍽"},{id:"swiggy",n:"Swiggy",color:"#fc8019",ic:"🛵"},{id:"unbox",n:"Unbox",color:T.blue,ic:"📦"},{id:"grosav",n:"Grosav",color:T.purple,ic:"🛒"}];
  const onlineOrders=Object.entries(orders).filter(([,o])=>o.platform===platform);
  const pc=platforms.find(p=>p.id===platform);
  const getTblName=(tid)=>allTables.find(t=>t.id===tid)?.name||tid;
  return(<>
    <div className="shdr">
      {onBack&&<button className="bbtn" onClick={onBack} style={{marginRight:8}}>←</button>}
      <div className="stitle">Online Orders</div>
    </div>
    <div className="ftabs">{platforms.map(p=>(<div key={p.id} className="otab" style={platform===p.id?{borderColor:p.color,color:p.color,background:p.color+"15"}:{}} onClick={()=>setPlatform(p.id)}>{p.ic} {p.n}</div>))}</div>
    <div className="card mb12" style={{borderColor:`${T.orange}30`,background:T.orangeL}}>
      <div style={{fontSize:12,fontWeight:800,color:T.orange,marginBottom:2}}>⚠️ {pc?.n} — pending partner API approval</div>
      <button className="btn btn-out btn-sm mt6" style={{fontSize:11}} onClick={()=>showNotif("Opening partner portal...")}>Apply →</button>
    </div>
    {onlineOrders.length===0?(<div style={{textAlign:"center",padding:"40px 20px",color:T.textDim}}><div style={{fontSize:48,marginBottom:12}}>{pc?.ic}</div><div style={{fontSize:15,fontWeight:700}}>No {pc?.n} orders</div></div>)
    :onlineOrders.map(([tid,ord])=>{
      const tot=ord.items.reduce((s,i)=>s+itemTotal(i),0);
      return(<div key={tid} className="card mb12">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div>
            <div style={{fontSize:10,fontWeight:900,color:pc?.color,textTransform:"uppercase",letterSpacing:1}}>{platform} · {getTblName(tid)}</div>
            {ord.items.map((it,i)=>{const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");return(<div key={i} style={{fontSize:12,fontWeight:600,marginTop:2}}>×{it.qty} {it.name}{it.varName?` (${it.varName})`:""}{addonStr?<span style={{color:T.orange,fontSize:10}}> +{addonStr}</span>:""}{it.note?<span style={{color:T.blue,fontSize:10}}> 📝{it.note}</span>:""}</div>);})}
            {ord.orderNote&&<div style={{fontSize:11,color:T.orange,marginTop:3}}>📝{ord.orderNote}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:17,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.primary}}>₹{tot}</div>
            <div style={{fontSize:11,color:T.textMuted}}>{ord.time}</div>
            <span className={`pill pill-${ord.status}`}>{ord.status}</span>
          </div>
        </div>
        <div className="row mt8">
          {ord.status==="waiting"&&<><button className="btn btn-g f1 btn-sm" onClick={()=>{saveOrders(p=>({...p,[tid]:{...p[tid],status:"preparing"}}));showNotif("Accepted ✓");}}>✓ Accept</button><button className="btn btn-r btn-sm" onClick={()=>{saveOrders(p=>{const n={...p};delete n[tid];return n;});showNotif("Rejected");}}>Reject</button></>}
          {ord.status==="preparing"&&<div style={{color:T.blue,fontSize:13,fontWeight:700}}>🍳 Preparing...</div>}
          {ord.status==="ready"&&<div style={{color:T.green,fontSize:13,fontWeight:700}}>✅ Ready</div>}
        </div>
      </div>);
    })}
  </>);
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsTab({orders,period,setPeriod}){
  const total=8420+Object.values(orders).reduce((s,o)=>s+o.items.reduce((ss,i)=>ss+itemTotal(i),0),0);
  const orderCount=28+Object.keys(orders).length;
  const catData=[{n:"Falooda",s:3200,c:T.accent},{n:"Mojito",s:2800,c:T.blue},{n:"Scoops",s:1800,c:T.primary},{n:"Pizza",s:1400,c:T.orange},{n:"Shake",s:920,c:T.purple},{n:"Burger",s:480,c:T.red},{n:"Starters",s:420,c:"#0891b2"},{n:"Desserts",s:380,c:"#d97706"}];
  const maxCat=Math.max(...catData.map(c=>c.s));
  const floorData=[{n:"Ground Floor",s:4800,o:18},{n:"1st Floor",s:2100,o:8},{n:"Terrace",s:1200,o:5},{n:"Private",s:800,o:2},{n:"Online",s:960,o:6}];
  const maxFloor=Math.max(...floorData.map(f=>f.s));
  const weekData=[{d:"Mon",s:6200},{d:"Tue",s:5800},{d:"Wed",s:7100},{d:"Thu",s:6600},{d:"Fri",s:9200},{d:"Sat",s:11400},{d:"Sun",s:8900}];
  const maxWeek=Math.max(...weekData.map(d=>d.s));
  return(<>
    <div className="shdr"><div className="stitle">Reports</div></div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{["today","week","month","custom"].map(p=>(<div key={p} className={`rtab ${period===p?"active":""}`} style={{textTransform:"capitalize"}} onClick={()=>setPeriod(p)}>{p}</div>))}</div>
    <div className="sgrid mb12">
      <div className="sc"><div className="slbl">Sales</div><div className="sval g">₹{total.toLocaleString()}</div></div>
      <div className="sc"><div className="slbl">Orders</div><div className="sval b">{orderCount}</div></div>
      <div className="sc"><div className="slbl">Avg Bill</div><div className="sval o">₹{Math.round(total/orderCount)}</div></div>
      <div className="sc"><div className="slbl">Active</div><div className="sval">{Object.keys(orders).length}</div></div>
    </div>
    <div className="card mb12"><div className="clbl">Weekly</div>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:80}}>
        {weekData.map(d=>(<div key={d.d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{fontSize:9,fontWeight:700,color:T.textMuted}}>{d.s>=1000?`${(d.s/1000).toFixed(1)}k`:d.s}</div>
          <div style={{width:"100%",height:`${(d.s/maxWeek)*60}px`,background:T.primary,borderRadius:"4px 4px 0 0",minHeight:4}}/>
          <div style={{fontSize:10,fontWeight:700,color:T.textMuted}}>{d.d}</div>
        </div>))}
      </div>
    </div>
    <div className="card mb12"><div className="clbl">Category</div>{catData.map(c=>(<div key={c.n} className="rrow"><div className="rlbl">{c.n}</div><div className="rbar-w"><div className="rbar"><div className="rbar-f" style={{width:`${(c.s/maxCat)*100}%`,background:c.c}}/></div><div className="rval" style={{color:c.c}}>₹{c.s.toLocaleString()}</div></div></div>))}</div>
    <div className="card mb12"><div className="clbl">Floor</div>{floorData.map(f=>(<div key={f.n} className="rrow"><div><div className="rlbl">{f.n}</div><div style={{fontSize:10,color:T.textMuted}}>{f.o} orders</div></div><div className="rbar-w"><div className="rbar"><div className="rbar-f" style={{width:`${(f.s/maxFloor)*100}%`,background:T.primary}}/></div><div className="rval">₹{f.s.toLocaleString()}</div></div></div>))}</div>
    <div className="card"><div className="clbl">Payment</div>{[{n:"UPI",p:58,c:T.primary},{n:"Cash",p:30,c:T.orange},{n:"Online",p:12,c:T.blue}].map(pm=>(<div key={pm.n} className="rrow"><div className="rlbl">{pm.n}</div><div className="rbar-w"><div className="rbar"><div className="rbar-f" style={{width:`${pm.p}%`,background:pm.c}}/></div><div className="rval" style={{color:pm.c,minWidth:34}}>{pm.p}%</div></div></div>))}</div>
  </>);
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab({floors,setFloors,staff,setStaff,fontSize,setFontSize,printCfg,setPrintCfg,kitchenCfg,setKitchenCfg,onStaff,showNotif,allTables,staffList,setStaffList,restaurantId,menuData,restInfo}){
  const[sub,setSub]=useState("general");
  return(<>
    <div className="shdr"><div className="stitle">Settings</div></div>
    <div className="ftabs mb12">
      {["general","menu","tables","printers","print","kitchen","staff"].map(s=>(<div key={s} className={`ftab ${sub===s?"active":""}`} style={{textTransform:"capitalize"}} onClick={()=>setSub(s)}>{s}</div>))}
    </div>
    {sub==="general"&&(<>
      <div className="sg"><div className="sg-lbl">Restaurant Info</div>
        <div className="ig"><div className="ilbl">Restaurant Name</div>
          <input className="inp" placeholder="e.g. Moods of Desserts" defaultValue={restInfo?.name||""} onBlur={e=>{if(restaurantId)set(ref(db,`restaurants/${restaurantId}/info/name`),e.target.value);showNotif("Saved ✓");}}/>
        </div>
        <div className="ig"><div className="ilbl">Address</div>
          <input className="inp" placeholder="e.g. Chiplun, 415605" defaultValue={restInfo?.address||""} onBlur={e=>{if(restaurantId)set(ref(db,`restaurants/${restaurantId}/info/address`),e.target.value);showNotif("Saved ✓");}}/>
        </div>
        <div className="ig"><div className="ilbl">GST %</div>
          <input className="inp" type="number" placeholder="e.g. 5" defaultValue={restInfo?.gst||""} onBlur={e=>{if(restaurantId)set(ref(db,`restaurants/${restaurantId}/info/gst`),e.target.value);showNotif("Saved ✓");}}/>
        </div>
      </div>
      <div className="sg"><div className="sg-lbl">Font Size</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {[12,13,14,15,16,18].map(s=>(<button key={s} className={`sbtn ${fontSize===s?"sel":""}`} onClick={()=>setFontSize(s)}>{s}px</button>))}
        </div>
      </div>
      <div className="sg"><div className="sg-lbl">Backup</div>
        <div className="row"><button className="btn btn-out f1 btn-sm" onClick={()=>showNotif("Backup ✓")}>☁️ Backup</button><button className="btn btn-out f1 btn-sm" onClick={()=>showNotif("Day-end ✓")}>📊 Day-End</button></div>
      </div>
    </>)}

    {sub==="menu"&&(restaurantId
      ?<MenuEditor menuData={menuData||{cats:[],items:[]}} restaurantId={restaurantId} showNotif={showNotif} kitchens={["Kitchen 1","Kitchen 2","Kitchen 3","Bar","Kitchen 4"]}/>
      :<div style={{textAlign:"center",padding:40,color:T.textDim}}>Loading menu...</div>
    )}

    {sub==="tables"&&(<>
      <div className="card mb12" style={{background:T.blueL,borderColor:`${T.blue}40`}}>
        <div style={{fontSize:13,fontWeight:700,color:T.blue,marginBottom:3}}>✏️ Edit Table Names & Order</div>
        <div style={{fontSize:12,color:T.textMid}}>Tap a name to edit it. Drag ≡ to reorder tables within a floor.</div>
      </div>
      {floors.map(fl=>(<FloorTableEditor key={fl.id} floor={fl} onUpdate={(updatedFloor)=>setFloors(p=>p.map(f=>f.id===fl.id?updatedFloor:f))} showNotif={showNotif}/>))}
      <button className="btn btn-g btn-sm mt8" style={{width:"100%"}} onClick={()=>{const name=window.prompt("New floor name:");if(name){setFloors(p=>[...p,{id:`f${Date.now()}`,name,tables:[],stickerTables:[]}]);showNotif(`${name} added ✓`);}}}>+ Add Floor</button>
    </>)}

    {sub==="printers"&&(<>
      <div className="printer-card" style={{borderColor:`${T.primary}40`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div className="printer-dot connected"/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800}}>🧾 Bill Printer (MPT-II)</div><div style={{fontSize:11,color:T.textMuted}}>66:32:8F:85:19:15 · Bluetooth</div></div>
          <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenL,padding:"3px 9px",borderRadius:20}}>Connected</span>
        </div>
        <div style={{fontSize:12,color:T.textMid,marginBottom:8}}>Bill prints only when you press the 🖨 Print button</div>
        <div className="row"><button className="btn btn-g btn-sm f1" onClick={()=>showNotif("Connecting...")}>🔗 Connect</button><button className="btn btn-out btn-sm" onClick={()=>showNotif("Test bill 🖨")}>Test</button></div>
      </div>
      <div className="printer-card" style={{borderColor:`${T.orange}40`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div className="printer-dot connected"/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800}}>🏷 Label Printer (Shreyansh LP-50)</div><div style={{fontSize:11,color:T.textMuted}}>AA:BB:CC:DD:EE:FF · Bluetooth</div></div>
          <span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenL,padding:"3px 9px",borderRadius:20}}>Connected</span>
        </div>
        <div className="row"><button className="btn btn-o btn-sm f1" onClick={()=>showNotif("Connecting label...")}>🔗 Connect</button><button className="btn btn-out btn-sm" onClick={()=>showNotif("Test label 🏷")}>Test</button></div>
      </div>
    </>)}

    {sub==="print"&&(<>
      <div className="card mb12" style={{background:T.greenL,borderColor:`${T.green}40`}}>
        <div style={{fontSize:13,fontWeight:700,color:T.green,marginBottom:3}}>🖨 Manual Print Only</div>
        <div style={{fontSize:12,color:T.textMid}}>Bills only print when you press the Print button in the order screen or payment screen. No auto-printing.</div>
      </div>
      <div className="sg"><div className="sg-lbl">Header & Footer</div>
        <div className="ig"><div className="ilbl">Address</div><textarea className="inp" rows={2} defaultValue={printCfg.header} style={{resize:"none"}} onChange={e=>setPrintCfg(p=>({...p,header:e.target.value}))}/></div>
        <div className="ig"><div className="ilbl">Footer</div><input className="inp" defaultValue={printCfg.footer} onChange={e=>setPrintCfg(p=>({...p,footer:e.target.value}))}/></div>
      </div>
      <div className="card"><div className="clbl">Include on Bill</div>
        {[{k:"companyName",l:"Company Name"},{k:"time",l:"Time"},{k:"table",l:"Table"},{k:"qty",l:"Quantity"},{k:"price",l:"Price"},{k:"desc",l:"Descriptions"},{k:"tax",l:"GST"}].map(({k,l})=>(<div key={k} className="prow" onClick={()=>setPrintCfg(p=>({...p,[k]:!p[k]}))}>
          <div className={`pbox ${printCfg[k]?"on":""}`}>{printCfg[k]&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>
          <div className="plbl2">{l}</div>
        </div>))}
      </div>
    </>)}

    {sub==="kitchen"&&(<>
      <div className="card mb12"><div className="clbl">Display</div>
        {[{k:"waiterName",l:"Show Waiter Name"},{k:"itemNotes",l:"Show Item Notes"}].map(({k,l})=>(<div key={k} className="si mb6" style={{marginBottom:6}} onClick={()=>setKitchenCfg(p=>({...p,[k]:!p[k]}))}>
          <div className="si-lbl">{l}</div><div className={`tog ${kitchenCfg[k]?"on":""}`}/>
        </div>))}
      </div>
      <div className="card"><div className="clbl">Sort</div>
        {[{v:"default",l:"Oldest first"},{v:"new",l:"Newest first"}].map(({v,l})=>(<div key={v} className="si mb6" style={{marginBottom:6}} onClick={()=>setKitchenCfg(p=>({...p,sortBy:v}))}>
          <div className="si-lbl">{l}</div>
          <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${kitchenCfg.sortBy===v?T.primary:T.border}`,background:kitchenCfg.sortBy===v?T.primary:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {kitchenCfg.sortBy===v&&<div style={{width:8,height:8,background:"#fff",borderRadius:"50%"}}/>}
          </div>
        </div>))}
      </div>
    </>)}

    {sub==="staff"&&(restaurantId
      ?<StaffAuthSettings staffList={staffList} setStaffList={setStaffList} restaurantId={restaurantId} showNotif={showNotif}/>
      :<div style={{textAlign:"center",padding:40,color:T.textDim}}>Loading...</div>
    )}
  </>);
}

// ─── FLOOR TABLE EDITOR ───────────────────────────────────────────────────────
function FloorTableEditor({floor,onUpdate,showNotif}){
  const[editing,setEditing]=useState(null); // table id being edited
  const[editName,setEditName]=useState("");
  const[expanded,setExpanded]=useState(false);
  const reorder=(fromIdx,toIdx)=>{
    const tables=[...floor.tables];
    const [moved]=tables.splice(fromIdx,1);
    tables.splice(toIdx,0,moved);
    onUpdate({...floor,tables});
  };
  const rename=(tid,newName)=>{
    onUpdate({...floor,tables:floor.tables.map(t=>t.id===tid?{...t,name:newName}:t)});
    setEditing(null);
    showNotif(`Renamed to "${newName}" ✓`);
  };
  const addTable=()=>{
    const name=window.prompt(`Add table to ${floor.name}:`);
    if(name)onUpdate({...floor,tables:[...floor.tables,{id:`t${Date.now()}`,name}]});
  };
  const removeTable=(tid)=>{
    onUpdate({...floor,tables:floor.tables.filter(t=>t.id!==tid)});
  };
  return(
    <div className="card mb12">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontWeight:800,fontSize:14}}>{floor.name}</div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-out btn-xs" onClick={addTable}>+ Table</button>
          <button className="btn btn-out btn-xs" onClick={()=>setExpanded(!expanded)}>{expanded?"▲ Hide":"▼ Edit"}</button>
        </div>
      </div>
      {expanded&&(<>
        {floor.tables.map((tbl,idx)=>(
          <div key={tbl.id} className="tbl-edit-row">
            <span className="drag-handle" title="Drag to reorder">≡</span>
            {editing===tbl.id?(
              <input className="inp" style={{flex:1,padding:"5px 9px",fontSize:13}} value={editName} onChange={e=>setEditName(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter")rename(tbl.id,editName);if(e.key==="Escape")setEditing(null);}}/>
            ):(
              <div style={{flex:1,fontSize:13,fontWeight:700}}>{tbl.name}</div>
            )}
            {editing===tbl.id?(
              <div style={{display:"flex",gap:5}}>
                <button className="btn btn-g btn-xs" onClick={()=>rename(tbl.id,editName)}>✓</button>
                <button className="btn btn-out btn-xs" onClick={()=>setEditing(null)}>✕</button>
              </div>
            ):(
              <div style={{display:"flex",gap:4}}>
                {idx>0&&<button className="btn btn-out btn-xs" onClick={()=>reorder(idx,idx-1)}>↑</button>}
                {idx<floor.tables.length-1&&<button className="btn btn-out btn-xs" onClick={()=>reorder(idx,idx+1)}>↓</button>}
                <button className="btn btn-out btn-xs" onClick={()=>{setEditing(tbl.id);setEditName(tbl.name);}}>✏️</button>
                <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>{if(window.confirm(`Remove ${tbl.name}?`))removeTable(tbl.id);}}>✕</button>
              </div>
            )}
          </div>
        ))}
        {floor.tables.length===0&&<div style={{fontSize:12,color:T.textDim,padding:"8px 0"}}>No tables. Add one above.</div>}
      </>)}
    </div>
  );
}

// ─── EDIT FLOOR MODAL ─────────────────────────────────────────────────────────
function EditFloorModal({floor,onSave,onClose}){
  const[name,setName]=useState(floor.name);
  return(<div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="mhdr"><div className="mtitle">Rename Floor</div><button className="mclose" onClick={onClose}>✕</button></div>
    <div className="ig"><div className="ilbl">Floor Name</div><input className="inp" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
    <div className="row"><button className="btn btn-out f1" onClick={onClose}>Cancel</button><button className="btn btn-g f1" onClick={()=>onSave(floor.id,name)}>✓ Save</button></div>
  </div>);
}




// ─── MENU EDITOR ─────────────────────────────────────────────────────────────
function MenuEditor({menuData,restaurantId,showNotif,kitchens}){
  const[view,setView]=useState("cats");
  const[selCat,setSelCat]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const[editCat,setEditCat]=useState(null);

  const cats=Array.isArray(menuData?.cats)?menuData.cats:(menuData?.cats?Object.values(menuData.cats):[]);
  const allItems=Array.isArray(menuData?.items)?menuData.items:(menuData?.items?Object.values(menuData.items):[]);
  const catItems=selCat?allItems.filter(i=>i.catId===selCat.id):allItems;

  const saveMenu=(newCats,newItems)=>{
    if(!restaurantId){showNotif("Error: Restaurant not loaded");return;}
    const catsObj={};
    (newCats||cats).forEach(c=>{if(c&&c.id)catsObj[c.id]=c;});
    const itemsObj={};
    (newItems||allItems).forEach(i=>{if(i&&i.id)itemsObj[i.id]=i;});
    set(ref(db,`restaurants/${restaurantId}/menu`),{cats:catsObj,items:itemsObj});
  };

  const deleteCat=(id)=>{
    if(!window.confirm("Delete category and all its items?"))return;
    const newCats=cats.filter(c=>c.id!==id);
    const newItems=allItems.filter(i=>i.catId!==id);
    saveMenu(newCats,newItems);
    if(selCat?.id===id)setSelCat(null);
    showNotif("Category deleted ✓");
  };

  const deleteItem=(id)=>{
    if(!window.confirm("Delete this item?"))return;
    const newItems=allItems.filter(i=>i.id!==id);
    saveMenu(cats,newItems);
    showNotif("Item deleted ✓");
  };

  const moveCat=(idx,dir)=>{
    const newCats=[...cats];
    const swap=idx+dir;
    if(swap<0||swap>=newCats.length)return;
    [newCats[idx],newCats[swap]]=[newCats[swap],newCats[idx]];
    newCats.forEach((c,i)=>c.priority=i);
    saveMenu(newCats,allItems);
  };

  const moveItem=(idx,dir)=>{
    const items=[...catItems];
    const swap=idx+dir;
    if(swap<0||swap>=items.length)return;
    [items[idx],items[swap]]=[items[swap],items[idx]];
    items.forEach((it,i)=>it.priority=i);
    const newItems=allItems.map(i=>{const found=items.find(x=>x.id===i.id);return found||i;});
    saveMenu(cats,newItems);
  };

  if(view==="addCat"||editCat)return<CatForm cat={editCat} cats={cats} onSave={(c)=>{
    const newCats=editCat?cats.map(x=>x.id===c.id?c:x):[...cats,{...c,id:`cat${Date.now()}`,priority:cats.length}];
    saveMenu(newCats,allItems);showNotif(editCat?"Category updated ✓":"Category added ✓");
    setView("cats");setEditCat(null);
  }} onBack={()=>{setView("cats");setEditCat(null);}}/>;

  if(view==="addItem"||editItem)return<ItemForm item={editItem} cats={cats} kitchens={kitchens} defaultCatId={selCat?.id} onSave={(it)=>{
    const newItems=editItem?allItems.map(x=>x.id===it.id?it:x):[...allItems,{...it,id:`item${Date.now()}`,priority:catItems.length}];
    saveMenu(cats,newItems);showNotif(editItem?"Item updated ✓":"Item added ✓");
    setView("items");setEditItem(null);
  }} onBack={()=>{setView("items");setEditItem(null);}}/>;

  return(<>
    {/* CATEGORIES VIEW */}
    {view==="cats"&&(<>
      <div className="shdr">
        <div style={{fontSize:15,fontWeight:800}}>Categories ({cats.length})</div>
        <button className="btn btn-g btn-sm" onClick={()=>setView("addCat")}>+ Add Category</button>
      </div>
      {cats.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:13}}>No categories yet. Add your first category!</div>}
      {cats.map((c,idx)=>(<div key={c.id} className="card mb8" style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setSelCat(c);setView("items");}}>
          <div style={{fontSize:14,fontWeight:800}}>{c.name}</div>
          <div style={{fontSize:11,color:T.textMuted}}>{allItems.filter(i=>i.catId===c.id).length} items · Priority {idx+1}</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {idx>0&&<button className="btn btn-out btn-xs" onClick={()=>moveCat(idx,-1)}>↑</button>}
          {idx<cats.length-1&&<button className="btn btn-out btn-xs" onClick={()=>moveCat(idx,1)}>↓</button>}
          <button className="btn btn-out btn-xs" onClick={()=>{setEditCat(c);setView("addCat");}}>✏️</button>
          <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>deleteCat(c.id)}>✕</button>
        </div>
      </div>))}
    </>)}

    {/* ITEMS VIEW */}
    {view==="items"&&selCat&&(<>
      <div className="ohdr mb12">
        <button className="bbtn" onClick={()=>{setView("cats");setSelCat(null);}}>←</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800}}>{selCat.name}</div><div style={{fontSize:11,color:T.textMuted}}>{catItems.length} items</div></div>
        <button className="btn btn-g btn-sm" onClick={()=>setView("addItem")}>+ Add Item</button>
      </div>
      {catItems.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:13}}>No items in this category yet.</div>}
      {catItems.sort((a,b)=>(a.priority||0)-(b.priority||0)).map((it,idx)=>(<div key={it.id} className="card mb8" style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800}}>{it.name}</div>
          <div style={{fontSize:11,color:T.textMuted}}>₹{it.price} · {it.kitchen} · {it.vars?.length||0} vars · {it.addons?.length||0} add-ons</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {idx>0&&<button className="btn btn-out btn-xs" onClick={()=>moveItem(idx,-1)}>↑</button>}
          {idx<catItems.length-1&&<button className="btn btn-out btn-xs" onClick={()=>moveItem(idx,1)}>↓</button>}
          <button className="btn btn-out btn-xs" onClick={()=>{setEditItem(it);setView("addItem");}}>✏️</button>
          <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>deleteItem(it.id)}>✕</button>
        </div>
      </div>))}
    </>)}
  </>);
}

// ─── CATEGORY FORM ────────────────────────────────────────────────────────────
function CatForm({cat,onSave,onBack}){
  const[name,setName]=useState(cat?.name||"");
  const[icon,setIcon]=useState(cat?.icon||"🍽");
  return(<>
    <div className="ohdr mb12">
      <button className="bbtn" onClick={onBack}>←</button>
      <div className="otitle">{cat?"Edit Category":"Add Category"}</div>
    </div>
    <div className="ig"><div className="ilbl">Category Name</div><input className="inp" placeholder="e.g. Ice Cream, Mojito..." value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
    <div className="ig"><div className="ilbl">Icon (emoji)</div><input className="inp" placeholder="🍦" value={icon} onChange={e=>setIcon(e.target.value)}/></div>
    <div className="row mt8">
      <button className="btn btn-out f1" onClick={onBack}>Cancel</button>
      <button className="btn btn-g f1" onClick={()=>{if(!name.trim()){return;}onSave({...cat,name:name.trim(),icon});}}>✓ Save</button>
    </div>
  </>);
}

// ─── ITEM FORM ────────────────────────────────────────────────────────────────
function ItemForm({item,cats,kitchens,onSave,onBack,defaultCatId}){
  const[name,setName]=useState(item?.name||"");
  const[price,setPrice]=useState(item?.price||"");
  const[catId,setCatId]=useState(item?.catId||defaultCatId||(cats.length>0?cats[0].id:""));
  const[kitchen,setKitchen]=useState(item?.kitchen||kitchens[0]||"Kitchen 1");
  const[vars,setVars]=useState(item?.vars||[]);
  const[addons,setAddons]=useState(item?.addons||[]);
  const[newVar,setNewVar]=useState({n:"",p:""});
  const[newAddon,setNewAddon]=useState({name:"",price:""});

  return(<>
    <div className="ohdr mb8">
      <button className="bbtn" onClick={onBack}>←</button>
      <div className="otitle">{item?"Edit Item":"Add Item"}</div>
    </div>
    <div className="ig"><div className="ilbl">Item Name</div><input className="inp" placeholder="e.g. Vanilla Scoop" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
    <div className="ig"><div className="ilbl">Base Price (₹)</div><input className="inp" type="number" placeholder="0" value={price} onChange={e=>setPrice(e.target.value)}/></div>
    <div className="ig"><div className="ilbl">Category</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {cats.map(c=>(<button key={c.id} className={`sbtn ${catId===c.id?"sel":""}`} style={{fontSize:12}} onClick={()=>setCatId(c.id)}>{c.name}</button>))}
      </div>
    </div>
    <div className="ig"><div className="ilbl">Kitchen</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {kitchens.map(k=>(<button key={k} className={`sbtn ${kitchen===k?"sel":""}`} style={{fontSize:12}} onClick={()=>setKitchen(k)}>{k}</button>))}
      </div>
    </div>

    <div className="ig"><div className="ilbl">Variations ({vars.length})</div>
      {vars.map((v,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
        <input className="inp" style={{flex:2}} value={v.n} placeholder="e.g. Large" onChange={e=>setVars(p=>p.map((x,j)=>j===i?{...x,n:e.target.value}:x))}/>
        <input className="inp" style={{flex:1}} value={v.p} placeholder="+₹" type="number" onChange={e=>setVars(p=>p.map((x,j)=>j===i?{...x,p:Number(e.target.value)}:x))}/>
        <button className="btn btn-xs" style={{background:T.redL,color:T.red}} onClick={()=>setVars(p=>p.filter((_,j)=>j!==i))}>✕</button>
      </div>))}
      <div style={{display:"flex",gap:6}}>
        <input className="inp" style={{flex:2}} value={newVar.n} placeholder="Variation name" onChange={e=>setNewVar(p=>({...p,n:e.target.value}))}/>
        <input className="inp" style={{flex:1}} value={newVar.p} placeholder="+₹" type="number" onChange={e=>setNewVar(p=>({...p,p:e.target.value}))}/>
        <button className="btn btn-g btn-sm" onClick={()=>{if(!newVar.n)return;setVars(p=>[...p,{n:newVar.n,p:Number(newVar.p)||0}]);setNewVar({n:"",p:""});}}>+</button>
      </div>
    </div>

    <div className="ig"><div className="ilbl">Add-ons ({addons.length})</div>
      {addons.map((a,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
        <input className="inp" style={{flex:2}} value={a.name} placeholder="e.g. Extra Cheese" onChange={e=>setAddons(p=>p.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/>
        <input className="inp" style={{flex:1}} value={a.price} placeholder="+₹" type="number" onChange={e=>setAddons(p=>p.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))}/>
        <button className="btn btn-xs" style={{background:T.redL,color:T.red}} onClick={()=>setAddons(p=>p.filter((_,j)=>j!==i))}>✕</button>
      </div>))}
      <div style={{display:"flex",gap:6}}>
        <input className="inp" style={{flex:2}} value={newAddon.name} placeholder="Add-on name" onChange={e=>setNewAddon(p=>({...p,name:e.target.value}))}/>
        <input className="inp" style={{flex:1}} value={newAddon.price} placeholder="+₹" type="number" onChange={e=>setNewAddon(p=>({...p,price:e.target.value}))}/>
        <button className="btn btn-g btn-sm" onClick={()=>{if(!newAddon.name)return;setAddons(p=>[...p,{id:`a${Date.now()}`,name:newAddon.name,price:Number(newAddon.price)||0}]);setNewAddon({name:"",price:""});}}>+</button>
      </div>
    </div>

    <div className="row mt8">
      <button className="btn btn-out f1" onClick={onBack}>Cancel</button>
      <button className="btn btn-g f1" onClick={()=>{
        if(!name.trim()||!price)return;
        const p=Number(price);
        onSave({...item,name:name.trim(),price:p,basePrice:p,catId,kitchen,vars,addons:addons.map((a,i)=>({...a,id:a.id||`a${Date.now()}${i}`}))});
      }}>✓ Save Item</button>
    </div>
  </>);
}

// ─── STAFF AUTH SETTINGS ──────────────────────────────────────────────────────
function StaffAuthSettings({staffList,setStaffList,restaurantId,showNotif}){
  const[addModal,setAddModal]=useState(false);
  const[editStaff,setEditStaff]=useState(null);
  const[newEmail,setNewEmail]=useState("");
  const[newName,setNewName]=useState("");
  const[newRole,setNewRole]=useState("Waiter");
  const[newPerms,setNewPerms]=useState({orders:true,payment:false,cancel:false,kitchen:false,reports:false,settings:false});

  const saveStaffToFirebase=(updatedList)=>{
    if(!restaurantId)return;
    const obj={};
    (updatedList||[]).forEach((s,i)=>{if(s)obj[s.id||`s${i}`]=s;});
    set(ref(db,`restaurants/${restaurantId}/staff`),obj);
  };

  const addStaff=()=>{
    if(!newEmail.trim()||!newName.trim()){showNotif("Enter name and Gmail ⚠️");return;}
    if(staffList.find(s=>s.email.toLowerCase()===newEmail.toLowerCase())){showNotif("Already added!");return;}
    const emailKey=newEmail.toLowerCase().trim().replace(/[.]/g,"_").replace(/@/g,"_at_");
    const newStaff={id:`s${Date.now()}`,name:newName,email:newEmail.toLowerCase().trim(),role:newRole,perms:newPerms};
    const updated=[...staffList,newStaff];
    saveStaffToFirebase(updated);
    // Also save staffIndex so staff can find their restaurant
    set(ref(db,`staffIndex/${emailKey}`),{restaurantId,addedAt:Date.now()});
    showNotif(`${newName} added ✓`);
    setAddModal(false);setNewEmail("");setNewName("");setNewRole("Waiter");
    setNewPerms({orders:true,payment:false,cancel:false,kitchen:false,reports:false,settings:false});
  };

  const removeStaff=(id)=>{
    if(!window.confirm("Remove this staff member?"))return;
    const updated=staffList.filter(s=>s.id!==id);
    saveStaffToFirebase(updated);
    showNotif("Removed ✓");
  };

  const saveEdit=()=>{
    const updated=staffList.map(s=>s.id===editStaff.id?editStaff:s);
    saveStaffToFirebase(updated);
    showNotif("Saved ✓");
    setEditStaff(null);
  };

  const ROLES=["Owner","Manager","Waiter","Kitchen","Cashier","Other"];
  const PERM_LIST=[
    {k:"orders",l:"📋 Take Orders"},
    {k:"payment",l:"💳 Accept Payment"},
    {k:"cancel",l:"❌ Cancel Items"},
    {k:"kitchen",l:"👨‍🍳 All Kitchens"},
    {k:"kitchen1",l:"🍳 Kitchen 1 only"},
    {k:"kitchen2",l:"🍳 Kitchen 2 only"},
    {k:"kitchen3",l:"🍳 Kitchen 3 only"},
    {k:"bar",l:"🍹 Bar only"},
    {k:"kitchen4",l:"🍳 Kitchen 4 only"},
    {k:"reports",l:"📊 View Reports"},
    {k:"settings",l:"⚙️ Settings"},
  ];

  return(<>
    <div className="card mb12" style={{background:T.primaryL,borderColor:`${T.primary}30`}}>
      <div style={{fontSize:13,fontWeight:800,color:T.primary,marginBottom:4}}>👤 How Staff Login Works</div>
      <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>
        1. Add staff Gmail here → Set their permissions<br/>
        2. Staff open the app → Sign in with their Google account<br/>
        3. They see the same POS with their access level<br/>
        4. If Gmail not added here → Access Denied
      </div>
    </div>

    <div className="shdr" style={{marginBottom:10}}>
      <div style={{fontSize:15,fontWeight:800}}>Staff ({staffList.length})</div>
      <button className="btn btn-g btn-sm" onClick={()=>setAddModal(true)}>+ Add Staff</button>
    </div>

    {(!staffList||staffList.length===0)&&<div style={{textAlign:"center",padding:"30px",color:T.textDim,fontSize:13}}>No staff added yet. Tap + Add Staff to begin.</div>}

    {(staffList||[]).map(s=>(<div key={s.id||s.email} className="stcard">
      <div className="stav">👤</div>
      <div style={{flex:1}}>
        <div className="stnm">{s.name}</div>
        <div className="strl">{s.role} · {s.email}</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
          {Object.entries(s.perms||{}).filter(([,v])=>v).map(([k])=>(<span key={k} style={{fontSize:9,background:T.primaryL,color:T.primary,borderRadius:20,padding:"2px 7px",fontWeight:700,textTransform:"capitalize"}}>{k}</span>))}
        </div>
      </div>
      <div style={{display:"flex",gap:5}}>
        <button className="btn btn-out btn-xs" onClick={()=>setEditStaff({...s})}>Edit</button>
        <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>removeStaff(s.id)}>✕</button>
      </div>
    </div>))}

    {/* ADD MODAL */}
    {addModal&&<div className="overlay" onClick={()=>setAddModal(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Add Staff Member</div><button className="mclose" onClick={()=>setAddModal(false)}>✕</button></div>
        <div className="ig"><div className="ilbl">Full Name</div><input className="inp" placeholder="e.g. Rahul Patil" value={newName} onChange={e=>setNewName(e.target.value)}/></div>
        <div className="ig"><div className="ilbl">Gmail Address</div><input className="inp" placeholder="e.g. rahul@gmail.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email"/></div>
        <div className="ig"><div className="ilbl">Role</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ROLES.map(r=>(<button key={r} className={`sbtn ${newRole===r?"sel":""}`} style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setNewRole(r)}>{r}</button>))}
          </div>
        </div>
        <div className="sec-lbl">Permissions</div>
        <div className="pgrid mb12">
          {PERM_LIST.map(({k,l})=>(<div key={k} className={`pit ${newPerms[k]?"on":""}`} onClick={()=>setNewPerms(p=>({...p,[k]:!p[k]}))}>
            <div className={`pchk ${newPerms[k]?"on":""}`}>{newPerms[k]&&"✓"}</div>
            <div className="plbl">{l}</div>
          </div>))}
        </div>
        <div className="row">
          <button className="btn btn-out f1" onClick={()=>setAddModal(false)}>Cancel</button>
          <button className="btn btn-g f1" onClick={addStaff}>✓ Add Staff</button>
        </div>
      </div>
    </div>}

    {/* EDIT MODAL */}
    {editStaff&&<div className="overlay" onClick={()=>setEditStaff(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Edit · {editStaff.name}</div><button className="mclose" onClick={()=>setEditStaff(null)}>✕</button></div>
        <div className="ig"><div className="ilbl">Full Name</div><input className="inp" value={editStaff.name} onChange={e=>setEditStaff(p=>({...p,name:e.target.value}))}/></div>
        <div className="ig"><div className="ilbl">Gmail</div><input className="inp" value={editStaff.email} onChange={e=>setEditStaff(p=>({...p,email:e.target.value}))} type="email"/></div>
        <div className="ig"><div className="ilbl">Role</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ROLES.map(r=>(<button key={r} className={`sbtn ${editStaff.role===r?"sel":""}`} style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setEditStaff(p=>({...p,role:r}))}>{r}</button>))}
          </div>
        </div>
        <div className="sec-lbl">Permissions</div>
        <div className="pgrid mb12">
          {PERM_LIST.map(({k,l})=>(<div key={k} className={`pit ${editStaff.perms?.[k]?"on":""}`} onClick={()=>setEditStaff(p=>({...p,perms:{...p.perms,[k]:!p.perms?.[k]}}))}>
            <div className={`pchk ${editStaff.perms?.[k]?"on":""}`}>{editStaff.perms?.[k]&&"✓"}</div>
            <div className="plbl">{l}</div>
          </div>))}
        </div>
        <div className="row">
          <button className="btn btn-out f1" onClick={()=>setEditStaff(null)}>Cancel</button>
          <button className="btn btn-g f1" onClick={saveEdit}>✓ Save Changes</button>
        </div>
      </div>
    </div>}
  </>);
}

// ─── MORE TAB ─────────────────────────────────────────────────────────────────
function MoreTab({orders,saveOrders,allTables,showNotif,staffAuth,user,restaurantId}){
  const[section,setSection]=useState(null);
  if(section==="online")return<OnlineTab orders={orders} saveOrders={saveOrders} allTables={allTables} showNotif={showNotif} onBack={()=>setSection(null)}/>;
  if(section==="staffmgr")return<StaffMgrTab onBack={()=>setSection(null)} showNotif={showNotif} restaurantId={restaurantId}/>;
  if(section==="qr")return<QRSelfOrderTab onBack={()=>setSection(null)} restaurantId={restaurantId} allTables={allTables} orders={orders} saveOrders={saveOrders} showNotif={showNotif}/>;
  const tiles=[
    {id:"online",ic:"📱",name:"Online Orders",desc:"Zomato · Swiggy · Unbox",color:T.orange},
    {id:"staffmgr",ic:"👥",name:"Staff Manager",desc:"Attendance · Salary · Payslip",color:T.blue},
    {id:"qr",ic:"📷",name:"QR Self Order",desc:"Customer ordering via QR",color:T.purple},
    {id:"expense",ic:"💰",name:"Expense Manager",desc:"Track daily expenses",color:T.accent,soon:true},
    {id:"inventory",ic:"📦",name:"Inventory",desc:"Stock management",color:T.green,soon:true},
    {id:"loyalty",ic:"⭐",name:"Loyalty & Offers",desc:"Customer rewards",color:"#d97706",soon:true},
  ];
  return(<>
    <div className="shdr"><div className="stitle">More</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {tiles.map(t=>(<div key={t.id} onClick={()=>!t.soon&&setSection(t.id)} style={{background:T.surface,border:`2px solid ${t.color}30`,borderRadius:16,padding:16,cursor:t.soon?"default":"pointer",opacity:t.soon?0.6:1,position:"relative",boxShadow:T.shadow}}>
        {t.soon&&<div style={{position:"absolute",top:8,right:8,background:T.textDim,color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,padding:"2px 7px"}}>SOON</div>}
        <div style={{fontSize:32,marginBottom:8}}>{t.ic}</div>
        <div style={{fontSize:13,fontWeight:800,color:T.text}}>{t.name}</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{t.desc}</div>
      </div>))}
    </div>
    <div style={{marginTop:16,background:T.primaryL,borderRadius:12,padding:"12px 14px",border:`1px solid ${T.primary}30`}}>
      <div style={{fontSize:12,fontWeight:800,color:T.primary}}>👤 Logged in as {staffAuth?.name||user?.email}</div>
      <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{staffAuth?.role} · {user?.email}</div>
    </div>
  </>);
}


// ─── QR SELF ORDER TAB ────────────────────────────────────────────────────────
function QRSelfOrderTab({onBack,restaurantId,allTables,orders,saveOrders,showNotif}){
  const[selTable,setSelTable]=useState(null);
  const[showQR,setShowQR]=useState(false);
  const[pendingOrders,setPendingOrders]=useState([]);

  // Listen for self-orders in Firebase
  useEffect(()=>{
    if(!restaurantId)return;
    const r=ref(db,`restaurants/${restaurantId}/self_orders`);
    const unsub=onValue(r,(snap)=>{
      const d=snap.val();
      if(d){
        const list=Object.values(d).filter(o=>o.status==="pending");
        setPendingOrders(list);
      } else setPendingOrders([]);
    });
    return()=>unsub();
  },[restaurantId]);

  const acceptOrder=(selfOrder)=>{
    // Move self_order into main orders
    const tableId=allTables.find(t=>t.name===selfOrder.tableName)?.id;
    if(!tableId){showNotif("Table not found!");return;}
    const items=selfOrder.items.map(it=>({
      uid:Math.random().toString(36).slice(2,9),
      id:it.id,name:it.name,
      basePrice:it.price,varName:it.variantLabel||"",varPrice:it.variantPrice||0,
      addons:(it.addons||[]).map(a=>({...a,qty:1})),
      note:it.instruction||"",qty:it.qty,
      kitchen:it.kitchen||"Kitchen 1",cat:it.catId||"",sent:true
    }));
    saveOrders(prev=>{
      const ex=prev[tableId];
      if(ex)return{...prev,[tableId]:{...ex,items:[...ex.items,...items],status:"waiting"}};
      return{...prev,[tableId]:{items,time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false}),startMs:Date.now(),status:"waiting",waiter:"Self Order",orderNote:selfOrder.note||"",paidAmount:0}};
    });
    // Remove from self_orders
    set(ref(db,`restaurants/${restaurantId}/self_orders/${selfOrder.id}`),null);
    showNotif(`✓ Order from ${selfOrder.tableName} accepted!`);
  };

  const rejectOrder=(selfOrder)=>{
    set(ref(db,`restaurants/${restaurantId}/self_orders/${selfOrder.id}`),null);
    showNotif("Order rejected");
  };

  const baseUrl=window.location.origin;
  const qrUrl=selTable?`${baseUrl}?rid=${restaurantId}&table=${encodeURIComponent(selTable.name)}`:"";

  return(<>
    <div className="ohdr">
      <button className="bbtn" onClick={onBack}>←</button>
      <div style={{flex:1}}><div className="otitle">QR Self Order</div><div className="osub">Customer scans → orders → POS receives</div></div>
    </div>

    {/* Pending orders from customers */}
    {pendingOrders.length>0&&(<>
      <div style={{background:T.orangeL,border:`2px solid ${T.orange}40`,borderRadius:13,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:24}}>🔔</div>
        <div>
          <div style={{fontWeight:800,color:T.orange,fontSize:13}}>{pendingOrders.length} New Self Order{pendingOrders.length>1?"s":""}</div>
          <div style={{fontSize:11,color:T.textMuted}}>Customers are waiting for confirmation</div>
        </div>
      </div>
      {pendingOrders.map(o=>(<div key={o.id} className="card mb8" style={{borderColor:`${T.orange}40`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <div style={{fontWeight:800,fontSize:14}}>🪑 {o.tableName}</div>
            <div style={{fontSize:11,color:T.textMuted}}>{o.items?.length} items · ₹{o.total}</div>
          </div>
          <span className={`pill pill-waiting`}>Self Order</span>
        </div>
        {o.items?.map((it,i)=>(<div key={i} style={{fontSize:12,color:T.textMid,padding:"3px 0",borderBottom:`1px solid ${T.border}50`}}>
          ×{it.qty} {it.name}{it.variantLabel?` (${it.variantLabel})`:""}{it.addons?.length>0?` + ${it.addons.map(a=>a.label).join(", ")}`:""}
          {it.instruction&&<span style={{color:T.orange}}> · 📝{it.instruction}</span>}
        </div>))}
        {o.note&&<div style={{fontSize:11,color:T.orange,marginTop:6}}>📝 {o.note}</div>}
        <div className="row" style={{marginTop:10}}>
          <button className="btn btn-out f1 btn-sm" onClick={()=>rejectOrder(o)}>✕ Reject</button>
          <button className="btn btn-g f1 btn-sm" onClick={()=>acceptOrder(o)}>✓ Accept & Send to Kitchen</button>
        </div>
      </div>))}
    </>)}

    {/* QR Generator */}
    <div className="card mb12" style={{background:T.purpleL,borderColor:`${T.purple}30`}}>
      <div style={{fontSize:13,fontWeight:800,color:T.purple,marginBottom:4}}>📷 How it works</div>
      <div style={{fontSize:12,color:T.textMid,lineHeight:1.7}}>
        1. Select a table below → Generate QR<br/>
        2. Print/display the QR at the table<br/>
        3. Customer scans → browses YOUR menu → places order<br/>
        4. Order appears here for you to accept → sent to kitchen
      </div>
    </div>

    <div className="shdr mb8"><div style={{fontSize:14,fontWeight:800}}>Select Table for QR</div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
      {allTables.map(t=>(<div key={t.id} onClick={()=>{setSelTable(t);setShowQR(true);}} style={{background:selTable?.id===t.id?T.primaryL:T.surface,border:`2px solid ${selTable?.id===t.id?T.primary:T.border}`,borderRadius:12,padding:"10px 6px",textAlign:"center",cursor:"pointer"}}>
        <div style={{fontSize:12,fontWeight:800,color:selTable?.id===t.id?T.primary:T.text}}>{t.name}</div>
      </div>))}
    </div>

    {showQR&&selTable&&(<div className="overlay" onClick={()=>setShowQR(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr">
          <div className="mtitle">QR Code · {selTable.name}</div>
          <button className="mclose" onClick={()=>setShowQR(false)}>✕</button>
        </div>
        <div style={{textAlign:"center",padding:"10px 0 20px"}}>
          {/* QR Code using Google Charts API */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}`}
            alt="QR Code"
            style={{borderRadius:12,border:`3px solid ${T.border}`,marginBottom:14}}
          />
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>{selTable.name}</div>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:16,wordBreak:"break-all",padding:"0 10px"}}>{qrUrl}</div>
          <div style={{fontSize:12,color:T.textMid,background:T.surfaceAlt,borderRadius:10,padding:"10px 14px",marginBottom:16,textAlign:"left"}}>
            📱 Customer scans this → sees your menu → places order → you accept it here
          </div>
          <div className="row">
            <button className="btn btn-out f1" onClick={()=>{navigator.clipboard?.writeText(qrUrl);showNotif("Link copied!");}}>📋 Copy Link</button>
            <button className="btn btn-g f1" onClick={()=>{
              const w=window.open("","_blank");
              w.document.write(`<html><body style="text-align:center;padding:40px;font-family:sans-serif">
                <h2 style="color:#1a7a4a">Scan to Order</h2>
                <p style="color:#888">${selTable.name}</p>
                <img src="${`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`}" style="border:3px solid #eee;border-radius:12px"/>
                <p style="color:#aaa;font-size:12px;margin-top:20px">Scan with your phone camera</p>
              </body></html>`);
              w.print();
              showNotif("Print dialog opened!");
            }}>🖨 Print QR</button>
          </div>
        </div>
      </div>
    </div>)}
  </>);
}

// ─── STAFF MANAGER TAB ────────────────────────────────────────────────────────


// ─── QR SELF ORDER TAB ────────────────────────────────────────────────────────

// ─── STAFF MANAGER TAB ────────────────────────────────────────────────────────
function StaffMgrTab({onBack,showNotif,restaurantId}){
  const[page,setPage]=useState("attendance");
  const[staffList,setStaffList]=useState([]);
  const[selDate,setSelDate]=useState(new Date().toISOString().slice(0,10));
  const[attendance,setAttendance]=useState({});
  const[adjustments,setAdjustments]=useState([]);
  const[payments,setPayments]=useState([]);
  const[addStaffModal,setAddStaffModal]=useState(false);
  const[addAdjModal,setAddAdjModal]=useState(null);
  const[selStaff,setSelStaff]=useState(null);
  const[expandedStaff,setExpandedStaff]=useState(null);
  const[monthAttStaff,setMonthAttStaff]=useState(null); // staff for monthly attendance view

  useEffect(()=>{
    if(!restaurantId)return;
    const unsub=onValue(ref(db,`restaurants/${restaurantId}/mgr_staff`),(snap)=>{
      const d=snap.val();setStaffList(d?Object.values(d):[]);
    });return()=>unsub();
  },[restaurantId]);

  useEffect(()=>{
    if(!restaurantId)return;
    const unsub=onValue(ref(db,`restaurants/${restaurantId}/mgr_attendance`),(snap)=>{
      setAttendance(snap.val()||{});
    });return()=>unsub();
  },[restaurantId]);

  useEffect(()=>{
    if(!restaurantId)return;
    const unsub=onValue(ref(db,`restaurants/${restaurantId}/mgr_adjustments`),(snap)=>{
      const d=snap.val();setAdjustments(d?Object.values(d):[]);
    });return()=>unsub();
  },[restaurantId]);

  useEffect(()=>{
    if(!restaurantId)return;
    const unsub=onValue(ref(db,`restaurants/${restaurantId}/mgr_payments`),(snap)=>{
      const d=snap.val();setPayments(d?Object.values(d):[]);
    });return()=>unsub();
  },[restaurantId]);

  const saveStaff=(list)=>{
    const obj={};list.forEach(s=>{obj[s.id]=s;});
    set(ref(db,`restaurants/${restaurantId}/mgr_staff`),obj);
  };
  const saveAtt=(newAtt)=>{set(ref(db,`restaurants/${restaurantId}/mgr_attendance`),newAtt);};
  const saveAdj=(list)=>{const obj={};list.forEach(a=>{obj[a.id]=a;});set(ref(db,`restaurants/${restaurantId}/mgr_adjustments`),obj);};
  const savePay=(list)=>{const obj={};list.forEach(p=>{obj[p.id]=p;});set(ref(db,`restaurants/${restaurantId}/mgr_payments`),obj);};

  const markAttendance=(staffId,date,status)=>{
    const key=`${staffId}_${date}`;
    const newAtt={...attendance,[key]:{staffId,date,status,updatedAt:Date.now()}};
    setAttendance(newAtt);saveAtt(newAtt);
  };
  const markAll=(status)=>{
    const newAtt={...attendance};
    staffList.forEach(s=>{newAtt[`${s.id}_${selDate}`]={staffId:s.id,date:selDate,status,updatedAt:Date.now()};});
    setAttendance(newAtt);saveAtt(newAtt);showNotif(`All marked ${status} ✓`);
  };
  const getStatus=(sid,date)=>attendance[`${sid}_${date}`]?.status||null;

  const prevDay=()=>{const d=new Date(selDate);d.setDate(d.getDate()-1);setSelDate(d.toISOString().slice(0,10));};
  const nextDay=()=>{const d=new Date(selDate);d.setDate(d.getDate()+1);setSelDate(d.toISOString().slice(0,10));};
  const isToday=selDate===new Date().toISOString().slice(0,10);

  const getDIM=(yr,mo)=>new Date(yr,mo,0).getDate();
  const getMonthSummary=(sid,month)=>{
    const[yr,mo]=month.split("-").map(Number);
    let present=0,halfDay=0,absent=0;
    for(let d=1;d<=getDIM(yr,mo);d++){
      const st=getStatus(sid,`${month}-${String(d).padStart(2,"0")}`);
      if(st==="present")present++;else if(st==="half")halfDay++;else if(st==="absent")absent++;
    }
    return{present,halfDay,absent};
  };
  const calcNet=(staff,month)=>{
    const{present,halfDay}=getMonthSummary(staff.id,month);
    const[yr,mo]=month.split("-").map(Number);
    const dim=getDIM(yr,mo);
    const dr=staff.wageType==="daily"?staff.salary:(staff.salary/dim);
    const earned=(present*dr)+(halfDay*dr*0.5);
    const madj=adjustments.filter(a=>a.staffId===staff.id&&a.month===month);
    const totalOT=madj.filter(a=>a.isAddition).reduce((s,a)=>s+a.amount,0);
    const totalDed=madj.filter(a=>!a.isAddition).reduce((s,a)=>s+a.amount,0);
    const totalPaid=payments.filter(p=>p.staffId===staff.id&&p.month===month).reduce((s,p)=>s+p.amount,0);
    const net=earned+totalOT-totalDed;
    return{earned,totalOT,totalDed,net,due:net-totalPaid,dr,dim};
  };

  const curMonth=selDate.slice(0,7);
  const dateLabel=new Date(selDate+"T12:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const pc=staffList.filter(s=>getStatus(s.id,selDate)==="present").length;
  const hc=staffList.filter(s=>getStatus(s.id,selDate)==="half").length;
  const ac=staffList.filter(s=>getStatus(s.id,selDate)==="absent").length;

  return(<>
    <div className="ohdr"><button className="bbtn" onClick={onBack}>←</button>
      <div style={{flex:1}}><div className="otitle">Staff Manager</div><div className="osub">{curMonth}</div></div>
    </div>
    <div className="ftabs mb12">
      {[{id:"attendance",l:"📅 Attendance"},{id:"stafflist",l:"👥 Staff & Salary"},{id:"adjustments",l:"⚡ OT & Deductions"},{id:"payslip",l:"🧾 Pay Slip"}].map(p=>(
        <div key={p.id} className={`ftab ${page===p.id?"active":""}`} onClick={()=>setPage(p.id)}>{p.l}</div>
      ))}
    </div>

    {/* ATTENDANCE */}
    {page==="attendance"&&(<>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,background:T.surface,borderRadius:12,padding:"8px 12px",border:`1.5px solid ${T.border}`}}>
        <button className="btn btn-out btn-xs" onClick={prevDay}>‹</button>
        <div style={{flex:1,textAlign:"center",fontWeight:800,fontSize:13}}>{dateLabel}</div>
        {!isToday&&<button className="btn btn-g btn-xs" onClick={()=>setSelDate(new Date().toISOString().slice(0,10))}>Today</button>}
        <button className="btn btn-out btn-xs" onClick={nextDay}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
        {[{l:"Present",v:pc,c:T.green},{l:"Half",v:hc,c:T.orange},{l:"Absent",v:ac,c:T.red},{l:"Total",v:staffList.length,c:T.blue}].map(s=>(
          <div key={s.l} style={{background:T.surface,border:`1.5px solid ${s.c}30`,borderRadius:10,padding:"7px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.textMid,flexShrink:0}}>Mark All:</div>
        {[{s:"present",l:"✓ Present",c:T.green},{s:"half",l:"½ Half Day",c:T.orange},{s:"absent",l:"✕ Absent",c:T.red}].map(b=>(
          <button key={b.s} onClick={()=>markAll(b.s)} style={{flex:1,padding:"7px 4px",borderRadius:9,border:`2px solid ${b.c}40`,background:b.c+"15",color:b.c,fontSize:11,fontWeight:800,cursor:"pointer"}}>{b.l}</button>
        ))}
      </div>
      {staffList.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim}}>
        <div style={{fontSize:40,marginBottom:8}}>👥</div>
        <div style={{fontWeight:700}}>No staff added yet</div>
        <div style={{fontSize:12,marginTop:4}}>Go to "Staff & Salary" tab to add staff</div>
      </div>}
      {staffList.map(s=>{
        const st=getStatus(s.id,selDate);
        const{present,halfDay,absent}=getMonthSummary(s.id,curMonth);
        const isExp=expandedStaff===s.id;
        return(<div key={s.id} className="card mb8" style={{borderColor:st==="present"?`${T.green}60`:st==="half"?`${T.orange}60`:st==="absent"?`${T.red}60`:T.border}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:T.primaryL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:T.primary,flexShrink:0}}>
              {s.name?.[0]?.toUpperCase()||"?"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800}}>{s.name}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{s.role} · ₹{s.salary?.toLocaleString()}/{s.wageType==="daily"?"day":"mo"}</div>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {[{v:"present",l:"P",c:T.green},{v:"half",l:"½",c:T.orange},{v:"absent",l:"A",c:T.red}].map(b=>(
                <button key={b.v} onClick={()=>markAttendance(s.id,selDate,b.v)} style={{width:32,height:32,borderRadius:8,border:`2px solid ${st===b.v?b.c:T.border}`,background:st===b.v?b.c:"transparent",color:st===b.v?"#fff":T.textMuted,fontSize:11,fontWeight:900,cursor:"pointer",transition:"all .12s"}}>{b.l}</button>
              ))}
              <button onClick={()=>setExpandedStaff(isExp?null:s.id)} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:T.surfaceAlt,cursor:"pointer",fontSize:11,fontWeight:700,color:T.textMid}}>{isExp?"▲":"▼"}</button>
            </div>
          </div>
          {isExp&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {[{l:"Present",v:present,c:T.green},{l:"Half Day",v:halfDay,c:T.orange},{l:"Absent",v:absent,c:T.red}].map(x=>(
                <div key={x.l} style={{flex:1,textAlign:"center",background:x.c+"15",borderRadius:8,padding:"5px 4px"}}>
                  <div style={{fontSize:16,fontWeight:900,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-g btn-xs f1" onClick={()=>setAddAdjModal({staffId:s.id,type:"overtime"})}>+ OT</button>
              <button className="btn btn-xs f1" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>setAddAdjModal({staffId:s.id,type:"deduction"})}>− Fine</button>
              <button className="btn btn-out btn-xs f1" onClick={()=>setAddAdjModal({staffId:s.id,type:"bonus"})}>🎁 Bonus</button>
            </div>
          </div>}
        </div>);
      })}
    </>)}

    {/* STAFF LIST */}
    {page==="stafflist"&&(<>
      <div className="shdr">
        <div style={{fontSize:15,fontWeight:800}}>Staff ({staffList.length})</div>
        <button className="btn btn-g btn-sm" onClick={()=>setAddStaffModal(true)}>+ Add Staff</button>
      </div>
      {staffList.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:13}}>No staff yet. Add your first staff member!</div>}
      {staffList.map(s=>{
        const{net,due,earned,totalOT,totalDed}=calcNet(s,curMonth);
        const{present,halfDay,absent}=getMonthSummary(s.id,curMonth);
        const isExp=expandedStaff===s.id;
        return(<div key={s.id} className="card mb10">
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setExpandedStaff(isExp?null:s.id)}>
            <div style={{width:42,height:42,borderRadius:"50%",background:T.primaryL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:T.primary,flexShrink:0}}>
              {s.name?.[0]?.toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800}}>{s.name}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{s.role} · ₹{s.salary?.toLocaleString()}/{s.wageType==="daily"?"day":"mo"}</div>
              <div style={{display:"flex",gap:5,marginTop:3}}>
                <span style={{fontSize:10,background:T.greenL,color:T.green,borderRadius:20,padding:"1px 7px",fontWeight:700}}>P:{present}</span>
                <span style={{fontSize:10,background:T.orangeL,color:T.orange,borderRadius:20,padding:"1px 7px",fontWeight:700}}>H:{halfDay}</span>
                <span style={{fontSize:10,background:T.redL,color:T.red,borderRadius:20,padding:"1px 7px",fontWeight:700}}>A:{absent}</span>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:900,color:due>0?T.red:T.green,fontFamily:"'JetBrains Mono',monospace"}}>₹{Math.round(Math.abs(due)).toLocaleString()}</div>
              <div style={{fontSize:10,color:T.textMuted}}>{due>0?"Due":"Paid"}</div>
            </div>
          </div>
          {isExp&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              {[{l:"Earned",v:Math.round(earned),c:T.primary},{l:"OT/Bonus",v:Math.round(totalOT),c:T.green},{l:"Deductions",v:Math.round(totalDed),c:T.red}].map(x=>(
                <div key={x.l} style={{textAlign:"center",background:T.surfaceAlt,borderRadius:8,padding:"6px 4px"}}>
                  <div style={{fontSize:13,fontWeight:900,color:x.c}}>₹{x.v}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{x.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.primaryL,borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:800,color:T.primary,fontSize:13}}>Net Payable</span>
              <span style={{fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{Math.round(net)}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-g btn-sm f1" onClick={()=>{
                const amt=parseFloat(window.prompt(`Pay to ${s.name} (Due: ₹${Math.round(due)}):`)||"0");
                if(!amt||amt<=0)return;
                const p={id:`pay_${Date.now()}`,staffId:s.id,month:curMonth,amount:amt,type:"partial",paidOn:selDate,createdAt:Date.now()};
                const newPay=[...payments,p];setPayments(newPay);savePay(newPay);
                showNotif(`₹${amt} paid to ${s.name} ✓`);
              }}>💳 Pay Now</button>
              <button className="btn btn-b btn-sm f1" onClick={()=>setMonthAttStaff(s)}>📅 Attendance</button>
              <button className="btn btn-out btn-sm f1" onClick={()=>{setSelStaff(s);setPage("payslip");}}>🧾 Slip</button>
              <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:"none"}} onClick={()=>{
                if(!window.confirm(`Remove ${s.name}?`))return;
                const nl=staffList.filter(x=>x.id!==s.id);saveStaff(nl);showNotif("Removed ✓");
              }}>✕</button>
            </div>
          </div>}
        </div>);
      })}
    </>)}

    {/* ADJUSTMENTS */}
    {page==="adjustments"&&(<>
      <div className="shdr">
        <div style={{fontSize:15,fontWeight:800}}>OT & Deductions · {curMonth}</div>
        <button className="btn btn-g btn-sm" onClick={()=>setAddAdjModal({staffId:staffList[0]?.id||"",type:"overtime"})}>+ Add</button>
      </div>
      {adjustments.filter(a=>a.month===curMonth).length===0&&
        <div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:13}}>No adjustments for {curMonth}</div>}
      {adjustments.filter(a=>a.month===curMonth).sort((a,b)=>b.createdAt-a.createdAt).map(a=>{
        const s=staffList.find(x=>x.id===a.staffId);
        return(<div key={a.id} className="card mb8" style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:800,background:a.isAddition?T.greenL:T.redL,color:a.isAddition?T.green:T.red,borderRadius:20,padding:"2px 8px"}}>
                {a.type==="overtime"?"⏱ OT":a.type==="bonus"?"🎁 BONUS":a.type==="advance"?"💰 ADV":"💸 FINE"}
              </span>
              <span style={{fontSize:12,fontWeight:800}}>{s?.name||"?"}</span>
            </div>
            <div style={{fontSize:11,color:T.textMuted}}>{a.note||a.actionType} · {a.date}</div>
          </div>
          <div style={{fontSize:15,fontWeight:900,color:a.isAddition?T.green:T.red,fontFamily:"'JetBrains Mono',monospace"}}>{a.isAddition?"+":"-"}₹{a.amount}</div>
          <button style={{background:T.redL,color:T.red,border:"none",borderRadius:7,width:26,height:26,cursor:"pointer",fontWeight:900}} onClick={()=>{
            const nl=adjustments.filter(x=>x.id!==a.id);setAdjustments(nl);saveAdj(nl);showNotif("Deleted ✓");
          }}>✕</button>
        </div>);
      })}
      {adjustments.filter(a=>a.month===curMonth).length>0&&<div style={{background:T.primaryL,borderRadius:10,padding:"10px 14px",marginTop:6,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,color:T.primary,fontSize:13}}>Month Net Impact</span>
        <span style={{fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.primary}}>
          {(()=>{const n=adjustments.filter(a=>a.month===curMonth).reduce((s,a)=>a.isAddition?s+a.amount:s-a.amount,0);return(n>=0?"+":"")+"₹"+Math.round(n);})()}
        </span>
      </div>}
    </>)}

    {/* PAY SLIP */}
    {page==="payslip"&&(<>
      <div className="shdr mb8"><div style={{fontSize:15,fontWeight:800}}>Pay Slip · {curMonth}</div></div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,marginBottom:12}}>
        {staffList.map(s=>(<button key={s.id} onClick={()=>setSelStaff(s)} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:`2px solid ${selStaff?.id===s.id?T.primary:T.border}`,background:selStaff?.id===s.id?T.primaryL:T.surface,color:selStaff?.id===s.id?T.primary:T.textMid,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{s.name}</button>))}
      </div>
      {!selStaff&&<div style={{textAlign:"center",padding:30,color:T.textDim}}>Select a staff member above to view their slip</div>}
      {selStaff&&(()=>{
        const{net,due,earned,totalOT,totalDed,dr,dim}=calcNet(selStaff,curMonth);
        const{present,halfDay,absent}=getMonthSummary(selStaff.id,curMonth);
        const totalPaid=payments.filter(p=>p.staffId===selStaff.id&&p.month===curMonth).reduce((s,p)=>s+p.amount,0);
        const madj=adjustments.filter(a=>a.staffId===selStaff.id&&a.month===curMonth);
        return(<div style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:14,padding:16}}>
          <div style={{textAlign:"center",marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:17,fontWeight:900,color:T.primary,letterSpacing:1}}>SALARY SLIP</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{curMonth}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:800}}>{selStaff.name}</div>
              <div style={{fontSize:12,color:T.textMuted}}>{selStaff.role}</div>
              {selStaff.phone&&<div style={{fontSize:11,color:T.textMuted}}>📞 {selStaff.phone}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:T.textMuted}}>Base Salary</div>
              <div style={{fontSize:14,fontWeight:800,color:T.primary}}>₹{selStaff.salary?.toLocaleString()}/{selStaff.wageType==="daily"?"day":"mo"}</div>
              <div style={{fontSize:10,color:T.textMuted}}>₹{dr.toFixed(0)}/day</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:12,background:T.surfaceAlt,borderRadius:10,padding:9}}>
            {[{l:"Present",v:present,c:T.green},{l:"Half Day",v:halfDay,c:T.orange},{l:"Absent",v:absent,c:T.red},{l:"Work Days",v:(present+halfDay*0.5).toFixed(1),c:T.primary}].map(x=>(
              <div key={x.l} style={{textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:900,color:x.c}}>{x.v}</div>
                <div style={{fontSize:9,color:T.textMuted}}>{x.l}</div>
              </div>
            ))}
          </div>
          <div className="clbl">Earnings</div>
          <div className="rrow"><div className="rlbl">Basic ({present}d + {halfDay}×½d × ₹{dr.toFixed(0)})</div><div className="rval">₹{Math.round(earned)}</div></div>
          {madj.filter(a=>a.isAddition).map(a=>(<div key={a.id} className="rrow"><div className="rlbl">{a.type==="overtime"?"Overtime":a.type==="bonus"?"Bonus":"Addition"}{a.note?` · ${a.note}`:""}</div><div className="rval" style={{color:T.green}}>+₹{a.amount}</div></div>))}
          {madj.filter(a=>!a.isAddition).length>0&&<><div className="clbl" style={{marginTop:8}}>Deductions</div>
          {madj.filter(a=>!a.isAddition).map(a=>(<div key={a.id} className="rrow"><div className="rlbl">{a.note||"Deduction"}</div><div className="rval" style={{color:T.red}}>-₹{a.amount}</div></div>))}</>}
          {totalPaid>0&&<><div className="clbl" style={{marginTop:8}}>Payments Made</div>
          {payments.filter(p=>p.staffId===selStaff.id&&p.month===curMonth).map(p=>(<div key={p.id} className="rrow"><div className="rlbl">Paid on {p.paidOn}</div><div className="rval" style={{color:T.green}}>-₹{p.amount}</div></div>))}</>}
          <div style={{background:T.primaryL,borderRadius:10,padding:"12px 14px",marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1.5px solid ${T.primary}30`}}>
            <div><div style={{fontSize:13,color:T.primary,fontWeight:800}}>Net Payable</div><div style={{fontSize:10,color:T.textMuted}}>{curMonth}</div></div>
            <div style={{fontSize:22,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{Math.round(net).toLocaleString()}</div>
          </div>
          {due>0&&<div style={{background:T.redL,borderRadius:10,padding:"8px 14px",marginTop:6,display:"flex",justifyContent:"space-between",border:`1px solid ${T.red}30`}}>
            <span style={{fontSize:12,fontWeight:700,color:T.red}}>Still Due</span>
            <span style={{fontSize:16,fontWeight:900,color:T.red,fontFamily:"'JetBrains Mono',monospace"}}>₹{Math.round(due).toLocaleString()}</span>
          </div>}
          <div className="row" style={{marginTop:12}}>
            <button className="btn btn-g f1" onClick={()=>{
              if(due<=0){showNotif("Already fully paid!");return;}
              const p={id:`pay_${Date.now()}`,staffId:selStaff.id,month:curMonth,amount:Math.round(due),type:"full",paidOn:new Date().toISOString().slice(0,10),createdAt:Date.now()};
              const nl=[...payments,p];setPayments(nl);savePay(nl);
              showNotif(`₹${Math.round(due)} marked as paid ✓`);
            }}>✓ Mark as Paid</button>
            <button className="btn btn-out f1" onClick={()=>showNotif("PDF coming soon!")}>⬇ PDF</button>
          </div>
        </div>);
      })()}
    </>)}

    {/* MONTHLY ATTENDANCE MODAL */}
    {monthAttStaff&&<MonthAttModal staff={monthAttStaff} curMonth={curMonth} getStatus={getStatus} markAttendance={markAttendance} adjustments={adjustments} addAdjModal={addAdjModal} setAddAdjModal={setAddAdjModal} getDIM={getDIM} onClose={()=>setMonthAttStaff(null)}/>}

    {addStaffModal&&<AddStaffModal onSave={(s)=>{
      const nl=[...staffList,{...s,id:`staff_${Date.now()}`,createdAt:Date.now()}];
      saveStaff(nl);showNotif(`${s.name} added ✓`);setAddStaffModal(false);
    }} onClose={()=>setAddStaffModal(false)}/>}

    {addAdjModal&&<AddAdjModal staffList={staffList} initial={addAdjModal} curMonth={curMonth} selDate={selDate} onSave={(adj)=>{
      const nl=[...adjustments,{...adj,id:`adj_${Date.now()}`,month:curMonth,createdAt:Date.now()}];
      setAdjustments(nl);saveAdj(nl);showNotif("Saved ✓");setAddAdjModal(null);
    }} onClose={()=>setAddAdjModal(null)}/>}
  </>);
}


// ─── MONTHLY ATTENDANCE MODAL ─────────────────────────────────────────────────
function MonthAttModal({staff,curMonth,getStatus,markAttendance,adjustments,setAddAdjModal,getDIM,onClose}){
  const[yr,mo]=curMonth.split("-").map(Number);
  const days=getDIM(yr,mo);
  const[expandedDay,setExpandedDay]=useState(null);
  const dayAdjs=(d)=>adjustments.filter(a=>a.staffId===staff.id&&a.date===`${curMonth}-${String(d).padStart(2,"0")}`);

  const statusColor={present:T.green,half:T.orange,absent:T.red};
  const statusLabel={present:"P",half:"½",absent:"A"};

  let present=0,half=0,absent=0;
  for(let d=1;d<=days;d++){
    const st=getStatus(staff.id,`${curMonth}-${String(d).padStart(2,"0")}`);
    if(st==="present")present++;else if(st==="half")half++;else if(st==="absent")absent++;
  }

  return(<div className="overlay" onClick={onClose}>
    <div className="modal" style={{maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div className="mhdr">
        <div>
          <div className="mtitle">📅 {staff.name}</div>
          <div style={{fontSize:11,color:T.textMuted}}>{curMonth} · Monthly Attendance</div>
        </div>
        <button className="mclose" onClick={onClose}>✕</button>
      </div>

      {/* Month summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
        {[{l:"Present",v:present,c:T.green},{l:"Half Day",v:half,c:T.orange},{l:"Absent",v:absent,c:T.red}].map(x=>(
          <div key={x.l} style={{textAlign:"center",background:x.c+"15",borderRadius:10,padding:"8px 4px"}}>
            <div style={{fontSize:20,fontWeight:900,color:x.c}}>{x.v}</div>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700}}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Day by day */}
      {Array.from({length:days},(_,i)=>i+1).map(d=>{
        const dateStr=`${curMonth}-${String(d).padStart(2,"0")}`;
        const st=getStatus(staff.id,dateStr);
        const weekday=new Date(dateStr+"T12:00:00").toLocaleDateString("en-IN",{weekday:"short"});
        const adjs=dayAdjs(d);
        const isExp=expandedDay===d;
        const isSun=new Date(dateStr+"T12:00:00").getDay()===0;

        return(<div key={d} style={{borderBottom:`1px solid ${T.border}50`,padding:"8px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Date */}
            <div style={{width:40,flexShrink:0,textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:900,color:isSun?T.red:T.text}}>{d}</div>
              <div style={{fontSize:10,color:isSun?T.red:T.textMuted,fontWeight:700}}>{weekday}</div>
            </div>

            {/* Status buttons */}
            <div style={{display:"flex",gap:4,flex:1}}>
              {[{v:"present",l:"P",c:T.green},{v:"half",l:"½",c:T.orange},{v:"absent",l:"A",c:T.red}].map(b=>(
                <button key={b.v} onClick={()=>markAttendance(staff.id,dateStr,b.v)} style={{width:32,height:32,borderRadius:8,border:`2px solid ${st===b.v?b.c:T.border}`,background:st===b.v?b.c:"transparent",color:st===b.v?"#fff":T.textMuted,fontSize:11,fontWeight:900,cursor:"pointer",transition:"all .1s"}}>{b.l}</button>
              ))}
              {/* OT/adj indicator */}
              {adjs.length>0&&<div style={{display:"flex",gap:3,alignItems:"center",marginLeft:4}}>
                {adjs.map(a=>(<span key={a.id} style={{fontSize:9,background:a.isAddition?T.greenL:T.redL,color:a.isAddition?T.green:T.red,borderRadius:10,padding:"2px 6px",fontWeight:700}}>{a.isAddition?"+":"-"}₹{a.amount}</span>))}
              </div>}
            </div>

            {/* OT dropdown */}
            <button onClick={()=>setExpandedDay(isExp?null:d)} style={{width:26,height:26,borderRadius:7,border:`1px solid ${T.border}`,background:T.surfaceAlt,cursor:"pointer",fontSize:11,flexShrink:0,fontWeight:700,color:T.textMid}}>{isExp?"▲":"▼"}</button>
          </div>

          {/* Expanded OT section */}
          {isExp&&<div style={{marginTop:8,paddingLeft:48,paddingBottom:4}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button className="btn btn-g btn-xs" onClick={()=>{setAddAdjModal({staffId:staff.id,type:"overtime",date:dateStr});setExpandedDay(null);}}>+ OT</button>
              <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>{setAddAdjModal({staffId:staff.id,type:"deduction",date:dateStr});setExpandedDay(null);}}>− Fine</button>
              <button className="btn btn-out btn-xs" onClick={()=>{setAddAdjModal({staffId:staff.id,type:"bonus",date:dateStr});setExpandedDay(null);}}>🎁 Bonus</button>
            </div>
            {adjs.length>0&&<div style={{marginTop:6}}>
              {adjs.map(a=>(<div key={a.id} style={{fontSize:11,color:a.isAddition?T.green:T.red,fontWeight:700}}>{a.isAddition?"+":"-"}₹{a.amount} · {a.type}{a.note?` · ${a.note}`:""}</div>))}
            </div>}
          </div>}
        </div>);
      })}

      <button className="btn btn-g mt12" style={{width:"100%"}} onClick={onClose}>Done</button>
    </div>
  </div>);
}

// ─── ADD STAFF MODAL ──────────────────────────────────────────────────────────
function AddStaffModal({onSave,onClose}){
  const[name,setName]=useState("");
  const[role,setRole]=useState("Waiter");
  const[phone,setPhone]=useState("");
  const[wageType,setWageType]=useState("monthly");
  const[salary,setSalary]=useState("");
  return(<div className="overlay" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mhdr"><div className="mtitle">Add Staff Member</div><button className="mclose" onClick={onClose}>✕</button></div>
      <div className="ig"><div className="ilbl">Full Name</div><input className="inp" placeholder="e.g. Rahul Patil" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
      <div className="ig"><div className="ilbl">Phone (optional)</div><input className="inp" placeholder="9930405545" value={phone} onChange={e=>setPhone(e.target.value)} type="tel"/></div>
      <div className="ig"><div className="ilbl">Role</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Owner","Manager","Waiter","Cashier","Kitchen","Delivery","Other"].map(r=>(
            <button key={r} className={`sbtn ${role===r?"sel":""}`} style={{fontSize:12,padding:"6px 11px"}} onClick={()=>setRole(r)}>{r}</button>
          ))}
        </div>
      </div>
      <div className="ig"><div className="ilbl">Wage Type</div>
        <div style={{display:"flex",gap:8}}>
          {[{v:"monthly",l:"📅 Monthly"},{v:"daily",l:"📆 Daily Rate"}].map(w=>(
            <div key={w.v} onClick={()=>setWageType(w.v)} style={{flex:1,padding:10,borderRadius:10,border:`2px solid ${wageType===w.v?T.primary:T.border}`,background:wageType===w.v?T.primaryL:T.surfaceAlt,textAlign:"center",cursor:"pointer",fontSize:12,fontWeight:800,color:wageType===w.v?T.primary:T.textMid}}>{w.l}</div>
          ))}
        </div>
      </div>
      <div className="ig">
        <div className="ilbl">{wageType==="monthly"?"Monthly Salary (₹)":"Daily Rate (₹)"}</div>
        <input className="inp" type="number" placeholder={wageType==="monthly"?"e.g. 10000":"e.g. 400"} value={salary} onChange={e=>setSalary(e.target.value)}/>
      </div>
      <div className="row">
        <button className="btn btn-out f1" onClick={onClose}>Cancel</button>
        <button className="btn btn-g f1" onClick={()=>{if(!name.trim()||!salary)return;onSave({name:name.trim(),role,phone,wageType,salary:Number(salary)});}}>✓ Add Staff</button>
      </div>
    </div>
  </div>);
}

// ─── ADD ADJUSTMENT MODAL ─────────────────────────────────────────────────────
function AddAdjModal({staffList,initial,curMonth,selDate,onSave,onClose}){
  const[staffId,setStaffId]=useState(initial?.staffId||staffList[0]?.id||"");
  const[type,setType]=useState(initial?.type||"overtime");
  const[amount,setAmount]=useState("");
  const[note,setNote]=useState("");
  const[hours,setHours]=useState("");
  const[actionType,setActionType]=useState("fixed");
  const isAdd=type!=="deduction";
  const staff=staffList.find(s=>s.id===staffId);

  useEffect(()=>{
    if(actionType==="per_hour"&&hours&&staff){
      const[yr,mo]=curMonth.split("-").map(Number);
      const dr=staff.wageType==="daily"?staff.salary:staff.salary/new Date(yr,mo,0).getDate();
      setAmount(((dr/8)*Number(hours)).toFixed(0));
    }else if(actionType==="half_day"&&staff){
      const[yr,mo]=curMonth.split("-").map(Number);
      const dr=staff.wageType==="daily"?staff.salary:staff.salary/new Date(yr,mo,0).getDate();
      setAmount((dr*0.5).toFixed(0));
    }else if(actionType==="full_day"&&staff){
      const[yr,mo]=curMonth.split("-").map(Number);
      const dr=staff.wageType==="daily"?staff.salary:staff.salary/new Date(yr,mo,0).getDate();
      setAmount(dr.toFixed(0));
    }
  },[hours,actionType,staff,curMonth]);

  return(<div className="overlay" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mhdr"><div className="mtitle">Add Adjustment</div><button className="mclose" onClick={onClose}>✕</button></div>
      <div className="ig"><div className="ilbl">Staff Member</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {staffList.map(s=>(<button key={s.id} className={`sbtn ${staffId===s.id?"sel":""}`} style={{fontSize:12}} onClick={()=>setStaffId(s.id)}>{s.name}</button>))}
        </div>
      </div>
      <div className="ig"><div className="ilbl">Type</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{v:"overtime",l:"⏱ Overtime"},{v:"bonus",l:"🎁 Bonus"},{v:"deduction",l:"💸 Fine/Deduction"},{v:"advance",l:"💰 Advance"}].map(t=>(
            <button key={t.v} className={`sbtn ${type===t.v?"sel":""}`} style={{fontSize:11,padding:"6px 10px"}} onClick={()=>setType(t.v)}>{t.l}</button>
          ))}
        </div>
      </div>
      {(type==="overtime")&&<div className="ig"><div className="ilbl">Calculation Method</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{v:"fixed",l:"Fixed ₹"},{v:"per_hour",l:"Per Hour"},{v:"half_day",l:"Half Day"},{v:"full_day",l:"Full Day"}].map(a=>(
            <button key={a.v} className={`sbtn ${actionType===a.v?"sel":""}`} style={{fontSize:11,padding:"5px 9px"}} onClick={()=>setActionType(a.v)}>{a.l}</button>
          ))}
        </div>
      </div>}
      {actionType==="per_hour"&&<div className="ig"><div className="ilbl">Hours Worked</div><input className="inp" type="number" placeholder="e.g. 2.5" value={hours} onChange={e=>setHours(e.target.value)}/></div>}
      <div className="ig">
        <div className="ilbl">Amount (₹){amount?<span style={{color:T.primary,marginLeft:6,fontWeight:900,fontSize:14}}>= ₹{amount}</span>:""}</div>
        <input className="inp" type="number" placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)}/>
      </div>
      <div className="ig"><div className="ilbl">Note (optional)</div><input className="inp" placeholder="e.g. Sunday shift, late fine..." value={note} onChange={e=>setNote(e.target.value)}/></div>
      <div className="row">
        <button className="btn btn-out f1" onClick={onClose}>Cancel</button>
        <button className="btn btn-g f1" onClick={()=>{
          if(!staffId||!amount)return;
          onSave({staffId,type,actionType,hours:Number(hours)||0,amount:Number(amount),note,date:selDate,isAddition:isAdd});
        }}>✓ Save</button>
      </div>
    </div>
  </div>);
}



// ─── STAFF PERM MODAL ─────────────────────────────────────────────────────────
function StaffPermModal({person,onSave,onClose}){
  const[perms,setPerms]=useState({...person.perms});
  const[ks,setKs]=useState({...person.ks});
  const pc=[{k:"orders",l:"📋 Orders"},{k:"payment",l:"💳 Payment"},{k:"cancel",l:"❌ Cancel"},{k:"kitchen",l:"👨‍🍳 Kitchen"},{k:"reports",l:"📊 Reports"},{k:"settings",l:"⚙️ Settings"},{k:"font",l:"🔤 Font"}];
  return(<div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="mhdr"><div className="mtitle">{person.name}</div><button className="mclose" onClick={onClose}>✕</button></div>
    <div style={{display:"flex",gap:10,marginBottom:14,padding:"10px 12px",background:T.surfaceAlt,borderRadius:11,alignItems:"center"}}>
      <span style={{fontSize:26}}>{person.photo}</span><div><div style={{fontWeight:800}}>{person.name}</div><div style={{fontSize:12,color:T.textMuted}}>{person.role}</div></div>
    </div>
    <div className="sec-lbl mb8">Permissions</div>
    <div className="pgrid mb12">{pc.map(({k,l})=>(<div key={k} className={`pit ${perms[k]?"on":""}`} onClick={()=>setPerms(p=>({...p,[k]:!p[k]}))}>
      <div className={`pchk ${perms[k]?"on":""}`}>{perms[k]&&"✓"}</div><div className="plbl">{l}</div>
    </div>))}</div>
    <div className="sec-lbl mb8">Kitchen Sound</div>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
      <span style={{fontSize:12,fontWeight:700,color:T.textMid}}>Vol:</span>
      <button className="btn btn-out btn-xs" onClick={()=>setKs(p=>({...p,vol:Math.max(1,p.vol-1)}))}>−</button>
      <span style={{fontWeight:900,fontSize:16,color:T.primary,minWidth:20,textAlign:"center"}}>{ks.vol}</span>
      <button className="btn btn-out btn-xs" onClick={()=>setKs(p=>({...p,vol:Math.min(8,p.vol+1)}))}>+</button>
      <span style={{fontSize:12,fontWeight:700,color:T.textMid,marginLeft:8}}>Rings:</span>
      {[1,2,3,4].map(n=>(<button key={n} className={`sbtn ${ks.count===n?"sel":""}`} style={{padding:"4px 10px",fontSize:12}} onClick={()=>setKs(p=>({...p,count:n}))}>{n}×</button>))}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {RINGTONES.map(rt=>(<button key={rt.id} className={`sbtn ${ks.tone===rt.id?"sel":""}`} style={{fontSize:11,padding:"5px 10px"}} onClick={()=>setKs(p=>({...p,tone:rt.id}))}>{rt.name}</button>))}
    </div>
    <div className="row"><button className="btn btn-out f1" onClick={onClose}>Cancel</button><button className="btn btn-g f1" onClick={()=>onSave({...person,perms,ks})}>✓ Save</button></div>
  </div>);
}
