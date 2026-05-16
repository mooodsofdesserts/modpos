import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, reauthenticateWithPopup } from "firebase/auth";

const firebaseConfig={apiKey:"AIzaSyCoV5LkFJBTGYVkYiqEfGObG8ssFCHtagY",authDomain:"mod-pos.firebaseapp.com",databaseURL:"https://mod-pos-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"mod-pos",storageBucket:"mod-pos.firebasestorage.app",messagingSenderId:"305044305596",appId:"1:305044305596:web:51276b693010c784f542b9"};
const _app=getApps().length===0?initializeApp(firebaseConfig):getApps()[0];
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
body{zoom:${(fs/14).toFixed(3)};}
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
.tbadge{position:absolute;bottom:7px;right:7px;border-radius:8px;font-size:9px;font-weight:800;padding:2px 6px;color:#fff;background:${T.accent};}
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
.ord-screen{display:flex;flex-direction:column;height:calc(100vh - 78px);overflow:hidden;position:relative;}
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
.oi{padding:3px 8px;border-bottom:1px solid ${T.border};display:flex;align-items:center;gap:5px;}
.oi:last-child{border-bottom:none;}
.oi.new{border-left:3px solid ${T.green};}
.oi-left{flex:1;min-width:0;}
.oi-name{font-size:12px;font-weight:800;line-height:1.2;color:${T.text};}
.oi-var{font-size:12px;font-weight:800;color:${T.text};}
.oi-addons{font-size:11px;color:${T.blue};font-weight:800;}
.oi-note-row{display:flex;align-items:center;gap:4px;margin-top:1px;}
.oi-note-text{font-size:11px;font-weight:800;color:${T.blue};font-style:italic;flex:1;}
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

/* ADD MENU BTN (legacy, kept for compat) */
.add-menu-btn{display:none;}

/* SLIM ORDER HEADER */
.ohdr-slim{display:flex;align-items:center;gap:5px;padding:6px 8px;flex-shrink:0;background:${T.surface};border-bottom:1.5px solid ${T.border};}
.hbtn{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:9px;height:34px;width:34px;padding:0;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:3px;white-space:nowrap;flex-shrink:0;}
.hbtn-urg{border:1.5px solid ${T.border};}
.hbtn-urg.on{background:#dc2626;color:#fff;border-color:#dc2626;}
.hbtn-dot{font-size:18px;}

/* FULL-HEIGHT CART */
.cart-area{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;}
.cart-full{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;}
.oi{padding:2px 8px;border-bottom:1px solid ${T.border}40;display:flex;align-items:center;gap:3px;min-height:34px;}
.oi-name{flex:1;font-size:12px;font-weight:800;color:${T.text};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
.oi-note-btn{background:none;border:1px dashed ${T.borderMid};border-radius:5px;padding:1px 5px;font-size:10px;color:${T.textMuted};cursor:pointer;flex-shrink:0;line-height:1.4;}
.oi-note-btn.has{border-color:${T.blue}40;color:${T.blue};background:${T.blueL};}
.oi-price-r{font-size:12px;font-weight:900;color:${T.primary};min-width:34px;text-align:right;flex-shrink:0;}
.qb{background:${T.border};border:none;color:${T.text};width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0;}
.qb.del{background:${T.redL};color:${T.red};}
.qb.mv{background:${T.blueL};color:${T.blue};}
.qn{font-size:12px;font-weight:900;min-width:14px;text-align:center;}
.ord-bottom-bar{display:flex;align-items:center;gap:8px;padding:7px 10px;border-top:1.5px solid ${T.border};flex-shrink:0;}
.obb-pay{background:${T.orange};color:#fff;border:none;border-radius:10px;height:40px;padding:0 18px;font-size:13px;font-weight:800;cursor:pointer;flex:1;}
.obb-send{background:${T.primary};color:#fff;border:none;border-radius:10px;height:40px;padding:0 18px;font-size:13px;font-weight:800;cursor:pointer;flex:1;}
.fab-add{position:absolute;bottom:70px;right:14px;background:${T.primary};color:#fff;border:none;width:48px;height:48px;border-radius:50%;font-size:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(26,122,74,.38);z-index:10;font-weight:900;line-height:1;}

/* 3-DOT DROPDOWN */
.drop-menu{position:absolute;right:0;top:calc(100% + 4px);background:${T.surface};border:1.5px solid ${T.border};border-radius:14px;z-index:299;box-shadow:0 8px 28px rgba(0,0,0,.18);overflow:hidden;min-width:170px;}
.drop-item{padding:12px 16px;font-size:13px;font-weight:700;cursor:pointer;color:${T.text};}
.drop-item:active{background:${T.primaryL};}
.drop-div{height:1px;background:${T.border}50;}

/* HALF-SCREEN MENU PANEL — part of flex layout, not fixed */
.menu-half{height:52vh;background:${T.surface};border-radius:20px 20px 0 0;display:flex;flex-direction:column;box-shadow:0 -4px 16px rgba(0,0,0,.12);flex-shrink:0;border-top:1.5px solid ${T.border};}
.menu-act-bar{padding:7px 8px 5px;display:flex;align-items:center;gap:6px;border-bottom:1px solid ${T.border};flex-shrink:0;}
.mab{border:none;border-radius:9px;height:34px;padding:0 12px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;flex-shrink:0;}
.mab-close{background:${T.surfaceAlt};border:1.5px solid ${T.border};color:${T.textMid};width:34px;padding:0;justify-content:center;font-size:16px;}
.mab-search{background:${T.surfaceAlt};border:1.5px solid ${T.border};color:${T.textMid};width:34px;padding:0;justify-content:center;font-size:15px;}
.mab-send{background:${T.primary};color:#fff;}
.mab-pay{background:${T.orange};color:#fff;}
.menu-srch{padding:6px 10px;flex-shrink:0;border-bottom:1px solid ${T.border};}
.menu-srch-inp{background:${T.surfaceAlt};border:1.5px solid ${T.border};border-radius:9px;padding:7px 11px;color:${T.text};font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;width:100%;outline:none;}
.menu-srch-inp:focus{border-color:${T.primary};}
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
/* keep legacy mclose for modals */
.mclose{background:${T.surfaceAlt};border:1.5px solid ${T.border};color:${T.textMuted};width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;}

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
.kscreen{padding:14px;min-height:calc(100vh - 78px);}
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
    const comp=ac.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-6,ac.currentTime);
    comp.knee.setValueAtTime(3,ac.currentTime);
    comp.ratio.setValueAtTime(20,ac.currentTime);
    comp.attack.setValueAtTime(0,ac.currentTime);
    comp.release.setValueAtTime(0.05,ac.currentTime);
    comp.connect(ac.destination);
    const v=Math.min(1,(vol||6)/8);
    const playTone=(time,freq,dur,type="square",freqEnd)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.connect(g);g.connect(comp);
      o.type=type;o.frequency.setValueAtTime(freq,time);
      if(freqEnd)o.frequency.exponentialRampToValueAtTime(freqEnd,time+dur*0.8);
      g.gain.setValueAtTime(v,time);
      g.gain.setValueAtTime(v,time+dur*0.7);
      g.gain.exponentialRampToValueAtTime(0.001,time+dur);
      o.start(time);o.stop(time+dur+0.05);
    };
    for(let i=0;i<count;i++){
      const t=ac.currentTime+i*0.6;
      if(tone==="bell"){playTone(t,880,0.5,"square");playTone(t,1320,0.5,"sine");playTone(t+0.25,1100,0.35,"square");}
      else if(tone==="chime"){playTone(t,1047,0.18,"square");playTone(t+0.2,1319,0.18,"square");playTone(t+0.4,1568,0.28,"square");}
      else if(tone==="buzz"){playTone(t,150,0.55,"sawtooth");playTone(t,300,0.4,"square");playTone(t+0.18,200,0.3,"sawtooth");}
      else if(tone==="ping"){playTone(t,1600,0.12,"square");playTone(t+0.12,2100,0.22,"square");playTone(t+0.25,1600,0.15,"square");}
      else if(tone==="alert"){playTone(t,440,0.12,"square");playTone(t+0.14,550,0.12,"square");playTone(t+0.28,660,0.12,"square");playTone(t+0.42,880,0.18,"square");}
      else{playTone(t,523,0.28,"square");playTone(t+0.22,659,0.28,"square");playTone(t+0.44,784,0.28,"square");}
    }
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
  const[staffLoading,setStaffLoading]=useState(true); // wait for staff list to load
  const[selfOrders,setSelfOrders]=useState([]);
  const[selfOrderModal,setSelfOrderModal]=useState(null);
  const[orderHistory,setOrderHistory]=useState([]);
  const[showHistory,setShowHistory]=useState(false);
  const[cancelPinModal,setCancelPinModal]=useState(null); // {tid, uid}
  const[cancelPin,setCancelPin]=useState(""); // selected self order to view
  const[menuData,setMenuData]=useState({cats:[],items:[]});
  const[driveConnected,setDriveConnected]=useState(()=>{try{const d=JSON.parse(localStorage.getItem("modpos_drive_token")||"null");return d&&Date.now()<d.expiry?d:null;}catch{return null;}});
  const[lastBackupTs,setLastBackupTs]=useState(()=>parseInt(localStorage.getItem("modpos_last_backup")||"0"));
  const driveTokenRef=useRef(null);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,(u)=>{
      setUser(u);
      if(!u){setAuthLoading(false);setRestaurantId(null);return;}

      // Step 1: Check staffIndex FIRST — if this email is a staff member, use that restaurant
      const emailKey=u.email.toLowerCase().replace(/[.]/g,"_").replace(/@/g,"_at_");
      const staffLookupRef=ref(db,`staffIndex/${emailKey}`);
      onValue(staffLookupRef,(staffSnap)=>{
        if(staffSnap.exists()){
          // This user is a STAFF member — load owner's restaurant
          const rid=staffSnap.val().restaurantId;
          setRestaurantId(rid);
          setIsOwner(false);
          setAuthLoading(false);
        } else {
          // Not in staffIndex — check if they have their own restaurant (owner)
          const ownerRef=ref(db,`restaurants/${u.uid}/info`);
          onValue(ownerRef,(snap)=>{
            if(snap.exists()){
              // Existing owner
              setRestaurantId(u.uid);
              setIsOwner(true);
            } else {
              // Brand new user — create fresh restaurant
              set(ref(db,`restaurants/${u.uid}/info`),{
                name:"",owner:u.email,
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

  // Load order history
  useEffect(()=>{
    if(!restaurantId)return;
    const r=ref(db,`restaurants/${restaurantId}/order_history`);
    const unsub=onValue(r,(snap)=>{
      const d=snap.val();
      if(d)setOrderHistory(Object.values(d).sort((a,b)=>(b.closedAt||0)-(a.closedAt||0)));
      else setOrderHistory([]);
    });
    return()=>unsub();
  },[restaurantId]);

  // Load self orders (customer QR orders) - show notification + ring
  const prevSelfOrderCountRef=useRef(0);
  useEffect(()=>{
    if(!restaurantId)return;
    const r=ref(db,`restaurants/${restaurantId}/self_orders`);
    const unsub=onValue(r,(snap)=>{
      const d=snap.val();
      const pending=d?Object.values(d).filter(o=>o.status==="pending"):[];
      setSelfOrders(pending);
      // Ring when new self-orders arrive (not on initial load)
      if(prevSelfOrderCountRef.current>0&&pending.length>prevSelfOrderCountRef.current){
        playRing(3,kss.tone||"bell",kss.vol||6);
        showPushNotif("New Self Order","Customer placed a new order","self-order");
      }
      prevSelfOrderCountRef.current=pending.length;
    });
    return()=>unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if(!restaurantId){setStaffLoading(false);return;}
    const staffRef=ref(db,`restaurants/${restaurantId}/staff`);
    const unsub=onValue(staffRef,(snapshot)=>{
      const data=snapshot.val();
      if(!data){setStaffList([]);}
      else{const arr=Array.isArray(data)?data:Object.values(data);setStaffList(arr.filter(Boolean));}
      setStaffLoading(false); // staff list is now loaded
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
  // Load floors from Firebase
  useEffect(()=>{
    if(!RID)return;
    const floorsRef=ref(db,`restaurants/${RID}/floors`);
    onValue(floorsRef,(snap)=>{
      const d=snap.val();
      if(d&&Array.isArray(d)&&d.length>0)setFloors(d);
      else if(d&&typeof d==="object"){const arr=Object.values(d);if(arr.length>0)setFloors(arr);}
    },{onlyOnce:true});
  },[RID]);
  const saveFloors=(newFloors)=>{setFloors(newFloors);if(RID)set(ref(db,`restaurants/${RID}/floors`),newFloors);};
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
  const[menuOpen,setMenuOpen]=useState(false); // kept only for tab-switch reset
  const[varModal,setVarModal]=useState(null);
  const[noteModal,setNoteModal]=useState(null);
  const[payModal,setPayModal]=useState(false);
  const[transferModal,setTransferModal]=useState(null);
  const[mergeModal,setMergeModal]=useState(null);
  const[tab,setTab]=useState("orders");
  const[notif,setNotif]=useState(null);
  const[activeKitchen,setActiveKitchen]=useState("Kitchen 1");
  const[kitchenDark,setKitchenDark]=useState(false);
  const[kss,setKss]=useState({vol:6,count:2,tone:"bell"});
  const[editFloor,setEditFloor]=useState(null);
  const[staffModal,setStaffModal]=useState(null);
  const[staff,setStaff]=useState(DEF_STAFF);
  const[fontSize,setFontSize]=useState(14);
  useEffect(()=>{const saved=localStorage.getItem("modpos_fs");if(saved)setFontSize(Number(saved));},[]);
  const saveFontSize=(fs)=>{setFontSize(fs);localStorage.setItem("modpos_fs",fs);};
  const[itemDone,setItemDone]=useState({});
  const[reportPeriod,setReportPeriod]=useState("today");
  const[kitchenCfg,setKitchenCfg]=useState({waiterName:false,itemNotes:true,sortBy:"default"});
  const[printCfg,setPrintCfg]=useState(()=>{const def={companyName:true,header:"Opp. Redij Petrol Pump, Near D.B.J College, Chiplun, 415605",footer:"Thank You! Visit Again!!",time:true,qty:true,price:true,desc:true,tax:false,table:true,paperWidth:58,labelW:50,labelH:25,labelVShift:0,staffName:false,itemNotesPrint:false,labelFont:"Arial",labelShowName:true,labelShowVar:true,labelShowAddons:true,labelShowNotes:true,labelShowPrice:false,labelNameSize:11,labelNameBold:true,labelNameItalic:false,labelVarSize:9,labelVarBold:false,labelVarItalic:false,labelAddonSize:9,labelAddonBold:false,labelAddonItalic:false,labelNoteSize:9,labelNoteBold:false,labelNoteItalic:false,labelPriceSize:10,labelPriceBold:true,labelPriceItalic:false,labelDots:384};try{const s=localStorage.getItem("modpos_printcfg");if(s)return {...def,...JSON.parse(s)};}catch{}return def;});
  const savePrintCfg=(cfg)=>{setPrintCfg(cfg);try{localStorage.setItem("modpos_printcfg",JSON.stringify(cfg));}catch{}};
  const[btPrinter,setBtPrinter]=useState(null); // Web Bluetooth device
  const{notes:recentNotes,addNote}=useRecentNotes();
  const clock=useClock();
  useTick();

  const showNotif=useCallback((msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),2500);},[]);
  const showPushNotif=useCallback((title,body,tag="modpos")=>{if(navigator.serviceWorker?.controller)navigator.serviceWorker.controller.postMessage({type:"NOTIFY",title,body,tag});else if("Notification"in window&&Notification.permission==="granted")try{new Notification(title,{body,icon:"/modpos/icon.svg"})}catch{}},[]);

  // ── Drive backup ──────────────────────────────────────────────────────────────
  useEffect(()=>{driveTokenRef.current=driveConnected;},[driveConnected]);
  const connectDrive=useCallback(async()=>{
    if(!user)return;
    try{
      const dp=new GoogleAuthProvider();
      dp.addScope("https://www.googleapis.com/auth/drive.file");
      const result=await reauthenticateWithPopup(user,dp);
      const cred=GoogleAuthProvider.credentialFromResult(result);
      const token=cred?.accessToken;
      if(!token)throw new Error("No token");
      const expiry=Date.now()+3500000;
      const data={token,expiry};
      setDriveConnected(data);
      driveTokenRef.current=data;
      localStorage.setItem("modpos_drive_token",JSON.stringify(data));
      showNotif("Google Drive connected ✓");
      return token;
    }catch{showNotif("Drive connection failed ❌");return null;}
  },[user,showNotif]);
  const performDriveBackup=useCallback(async(token)=>{
    const h={"Authorization":`Bearer ${token}`,"Content-Type":"application/json"};
    const driveGet=async(url)=>{const r=await fetch(url,{headers:{"Authorization":`Bearer ${token}`}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||r.status);}return r.json();};
    try{
      const folderQ=`name='pos_backup' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const folderSearch=await driveGet(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQ)}&fields=files(id)`);
      let folderId=folderSearch.files?.[0]?.id;
      if(!folderId){const cr=await fetch("https://www.googleapis.com/drive/v3/files",{method:"POST",headers:h,body:JSON.stringify({name:"pos_backup",mimeType:"application/vnd.google-apps.folder"})});if(!cr.ok){const e=await cr.json().catch(()=>({}));throw new Error(e?.error?.message||"Folder create failed");}folderId=(await cr.json()).id;}
      const fileQ=`name='modpos-backup.json' and '${folderId}' in parents and trashed=false`;
      const fileSearch=await driveGet(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(fileQ)}&fields=files(id)`);
      const existingId=fileSearch.files?.[0]?.id;
      const backupData=JSON.stringify({restaurantId,timestamp:Date.now(),date:new Date().toISOString(),restInfo,orders,orderHistory,menuData,staffList},null,2);
      if(existingId){
        const upd=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`,{method:"PATCH",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},body:backupData});
        if(!upd.ok){const e=await upd.json().catch(()=>({}));throw new Error(e?.error?.message||"Update failed");}
      }else{
        const form=new FormData();
        form.append("metadata",new Blob([JSON.stringify({name:"modpos-backup.json",mimeType:"application/json",parents:[folderId]})],{type:"application/json"}));
        form.append("file",new Blob([backupData],{type:"application/json"}));
        const cr2=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",{method:"POST",headers:{"Authorization":`Bearer ${token}`},body:form});
        if(!cr2.ok){const e=await cr2.json().catch(()=>({}));throw new Error(e?.error?.message||"Create failed");}
      }
      const ts=Date.now();
      setLastBackupTs(ts);
      localStorage.setItem("modpos_last_backup",String(ts));
      showNotif("✅ Backed up to Google Drive › pos_backup");
      showPushNotif("Backup Complete","MOD POS data saved to pos_backup on Drive","backup");
    }catch(err){
      showNotif(`❌ Drive backup failed: ${err?.message||""}`);
      if(String(err?.message).includes("401")||String(err?.message).includes("nvalid")){setDriveConnected(null);localStorage.removeItem("modpos_drive_token");}
    }
  },[restaurantId,restInfo,orders,orderHistory,menuData,staffList,showNotif,showPushNotif]);
  const performDriveBackupRef=useRef(null);
  useEffect(()=>{performDriveBackupRef.current=performDriveBackup;},[performDriveBackup]);

  const ring=useCallback((n)=>playRing(n||kss.count,kss.tone,kss.vol),[kss]);
  const prevKOrdersRef=useRef(0);
  const prevPriorityRef=useRef(new Set());
  useEffect(()=>{
    const nowPriority=new Set(Object.entries(orders).filter(([,o])=>o.priority).map(([tid])=>tid));
    const newlyUrgent=[...nowPriority].filter(tid=>!prevPriorityRef.current.has(tid));
    if(newlyUrgent.length>0){ring(3);showNotif("🔴 URGENT order!");}
    prevPriorityRef.current=nowPriority;
  },[orders]);
  useEffect(()=>{
    if(tab!=="kitchen")return;
    const pending=Object.entries(orders).filter(([tid,ord])=>{
      const kitItems=ord.items?.filter(it=>it.kitchen===activeKitchen&&it.sent)||[];
      return kitItems.length>0&&kitItems.some(it=>!itemDone[`${tid}-${it.uid}`]);
    }).length;
    if(pending>prevKOrdersRef.current){ring(kss.count);showNotif(`New order in ${activeKitchen}!`);}
    prevKOrdersRef.current=pending;
  },[orders,tab,activeKitchen]);

  // ── 4am Drive backup timer ────────────────────────────────────────────────────
  const backupFiredRef=useRef({});
  useEffect(()=>{
    const iv=setInterval(()=>{
      const now=new Date();const h=now.getHours();const m=now.getMinutes();
      const key=`${now.toDateString()}_bkp`;
      if(h===4&&m<2&&!backupFiredRef.current[key]){
        backupFiredRef.current[key]=true;
        const dr=driveTokenRef.current;
        if(dr&&Date.now()<dr.expiry){performDriveBackupRef.current?.(dr.token);}
        else if(dr){showPushNotif("Backup Skipped","Re-connect Google Drive in Settings","backup");}
      }
    },60000);
    return()=>clearInterval(iv);
  },[showPushNotif]);

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
    // no popup — item appears immediately in cart
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

  const addExtraItem=(tid,baseItem)=>{
    const newItem={...baseItem,uid:uid(),sent:false,sentAt:undefined,qty:1};
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      return{...prev,[tid]:{...prev[tid],items:[...prev[tid].items,newItem]}};
    });
    showNotif(`+1 ${baseItem.name} added (unsent)`);
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
      const hasNewItems=prev[tid].items.some(it=>!it.sent);
      return{...prev,[tid]:{...prev[tid],
        status:hasNewItems?"waiting":prev[tid].status,
        items:prev[tid].items.map(it=>({...it,sent:true,sentAt:it.sentAt||(it.sent?it.sentAt:Date.now())}))
      }};
    });
    ring(kss.count);
    showNotif("Sent to kitchen! 🍳");
  };

  const markItemDone=(tid,uid_)=>{
    const key=`${tid}-${uid_}`;
    const newDone={...itemDone,[key]:true};
    setItemDone(newDone);
    const ord=orders[tid];if(!ord)return;
    // Only set "ready" when ALL sent items across ALL kitchens are done
    const allSentItems=(ord.items||[]).filter(it=>it.sent);
    if(allSentItems.length>0&&allSentItems.every(it=>newDone[`${tid}-${it.uid}`])){
      setTimeout(()=>{saveOrders(p=>p[tid]?{...p,[tid]:{...p[tid],status:"ready"}}:p);showNotif("Order fully ready! ✅");},300);
    } else {
      showNotif("Item done ✓");
    }
  };

  const markAllDone=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const nd={...itemDone};
    (ord.items||[]).filter(it=>it.kitchen===activeKitchen&&it.sent).forEach(it=>{nd[`${tid}-${it.uid}`]=true;});
    setItemDone(nd);
    const allSentItems=(ord.items||[]).filter(it=>it.sent);
    if(allSentItems.length>0&&allSentItems.every(it=>nd[`${tid}-${it.uid}`])){
      setTimeout(()=>{saveOrders(p=>p[tid]?{...p,[tid]:{...p[tid],status:"ready"}}:p);showNotif("Order fully ready! ✅");},300);
    } else {
      showNotif(`${activeKitchen} done ✅`);
      // Notify other kitchens that still have pending items for this table
      const tblName=allTables.find(t=>t.id===tid)?.name||tid;
      const otherPendingKitchens=[...new Set(
        (ord.items||[]).filter(it=>it.sent&&it.kitchen!==activeKitchen&&!nd[`${tid}-${it.uid}`]).map(it=>it.kitchen)
      )];
      if(otherPendingKitchens.length>0){
        ring(kss.count);
        showNotif(`⚡ ${activeKitchen} done for ${tblName}! Continue in ${otherPendingKitchens.join(", ")}`);
      }
    }
  };

  // Finish & Save: mark order as ready and clear from kitchen without closing it
  const finishAndSave=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const nd={...itemDone};
    (ord.items||[]).filter(it=>it.sent).forEach(it=>{nd[`${tid}-${it.uid}`]=true;});
    setItemDone(nd);
    saveOrders(p=>p[tid]?{...p,[tid]:{...p[tid],status:"ready"}}:p);
    showNotif("✅ Marked ready · order kept");
  };

  // Cancel entire order
  const cancelOrder=(tid)=>{
    saveOrders(prev=>{const n={...prev};delete n[tid];return n;});
    setSelTable(null);setMenuOpen(false);
    showNotif("Order cancelled");
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
  const kitchenLabels=KITCHENS.map((k,i)=>{
    const lb=restInfo?.kitchenLabels;
    if(!lb)return k;
    return lb[k]||lb[i]||k; // object key (new) or array index (old)
  });

  if(authLoading||(!restaurantId&&user)||(user&&restaurantId&&!isOwner&&staffLoading))return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",fontSize:18,color:"#1a7a4a",fontWeight:700}}>Loading MOD POS...</div>;

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
  // IMPORTANT: if not owner and staffAuth not yet resolved = restrict all (loading state handles this)
  const _allowedTabs=isManager||isOwner?null: // owner/manager = no restrictions
    staffAuth?{ // staff with loaded perms
      orders:true,
      kitchen:!!(staffAuth.perms?.kitchen||staffAuth.perms?.kitchen1||staffAuth.perms?.kitchen2||staffAuth.perms?.kitchen3||staffAuth.perms?.bar||staffAuth.perms?.kitchen4),
      reports:staffAuth.perms?.reports===true,
      settings:staffAuth.perms?.settings===true,
      more:staffAuth.perms?.more===true||staffAuth.perms?.orders===true,
    }:
    // Not owner, staffAuth not loaded yet = restrict everything
    {orders:false,kitchen:false,reports:false,settings:false,more:false};

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

  const buildReceiptHtml=(tid,cfg,ri)=>{
    const ord=orders[tid];if(!ord)return"";
    const tbl=allTables.find(t=>t.id===tid)?.name||tid;
    const items=ord.items||[];
    const total=items.reduce((s,i)=>s+itemTotal(i),0);
    const paid=ord.paidAmount||0;
    const due=Math.max(0,total-paid);
    const gstPct=ri?.gst?parseFloat(ri.gst):0;
    const gst=gstPct?Math.round(total*gstPct/(100+gstPct)):0;
    const date=new Date().toLocaleDateString("en-IN");
    const time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    const pw=(cfg.paperWidth||58)+"mm";
    const itemsHtml=items.map(it=>{
      const tot=itemTotal(it);
      const nm=it.name+(it.varName?` (${it.varName})`:"");
      const add=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");
      return`<tr><td style="padding:2px 0;font-size:11px">${it.qty}× ${nm}${add?`<br><span style="font-size:9px;color:#555">+ ${add}</span>`:""}</td><td style="text-align:right;white-space:nowrap;font-size:11px">₹${tot}</td></tr>`;
    }).join("");
    return`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      @page{size:${pw} auto;margin:2mm;}
      *{box-sizing:border-box;}
      body{font-family:'Courier New',monospace;font-size:12px;width:${pw};margin:0;padding:0;}
      h1{font-size:15px;font-weight:bold;text-align:center;margin:4px 0 2px;}
      .c{text-align:center;}
      .dash{border:none;border-top:1px dashed #000;margin:5px 0;}
      table{width:100%;border-collapse:collapse;}
      .tot td{font-weight:bold;font-size:13px;border-top:1px solid #000;padding-top:3px;}
      .foot{text-align:center;font-size:10px;margin-top:8px;padding-top:4px;border-top:1px dashed #000;}
    </style></head><body>
      ${cfg.companyName?`<h1>${ri?.name||"MOD POS"}</h1>`:""}
      ${cfg.header?`<p class="c" style="font-size:9px;margin:0 0 3px">${cfg.header}</p>`:""}
      <hr class="dash">
      ${cfg.table?`<div style="margin:2px 0;font-size:11px">Table: <b>${tbl}</b></div>`:""}
      ${cfg.time?`<div style="margin:2px 0;font-size:11px">${date} ${time}</div>`:""}
      ${cfg.staffName&&ord.waiter?`<div style="margin:2px 0;font-size:11px">Staff: ${ord.waiter}</div>`:""}
      <hr class="dash">
      <table><thead><tr style="border-bottom:1px solid #000"><th style="text-align:left;font-size:11px">Item</th><th style="text-align:right;font-size:11px">Amt</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr class="tot"><td>TOTAL</td><td style="text-align:right">₹${total}</td></tr>
        ${gstPct?`<tr><td style="font-size:10px">GST ${gstPct}% (incl.)</td><td style="text-align:right;font-size:10px">₹${gst}</td></tr>`:""}
        ${paid>0?`<tr><td style="font-size:11px">Paid (${ord.payMethod||""})</td><td style="text-align:right;font-size:11px">₹${paid}</td></tr>`:""}
        ${due>0?`<tr><td style="font-size:12px;font-weight:bold">DUE</td><td style="text-align:right;font-size:12px;font-weight:bold">₹${due}</td></tr>`:""}
      </tfoot></table>
      <div class="foot">${cfg.footer||"Thank You! Visit Again!"}</div>
    </body></html>`;
  };
  const printBill=(tid)=>{
    const html=buildReceiptHtml(tid,printCfg,restInfo);
    if(!html)return;
    const w=window.open("","_blank","width=400,height=650");
    if(!w){showNotif("⚠️ Allow popups to print");return;}
    w.document.write(html);
    w.document.close();
    w.addEventListener("load",()=>{setTimeout(()=>{w.print();},300);});
    showNotif("🖨 Opening print dialog...");
  };
  const connectBtPrinter=async()=>{
    if(!navigator.bluetooth){showNotif("❌ Web Bluetooth not supported in this browser");return;}
    try{
      const device=await navigator.bluetooth.requestDevice({
        filters:[{services:["000018f0-0000-1000-8000-00805f9b34fb"]},{services:["49535343-fe7d-4ae5-8fa9-9fafd205e455"]}],
        optionalServices:["000018f0-0000-1000-8000-00805f9b34fb","49535343-fe7d-4ae5-8fa9-9fafd205e455","ff00","fff0"]
      }).catch(()=>navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:["000018f0-0000-1000-8000-00805f9b34fb","49535343-fe7d-4ae5-8fa9-9fafd205e455"]}));
      await device.gatt.connect();
      setBtPrinter(device);
      showNotif(`✅ Connected: ${device.name}`);
    }catch(e){
      showNotif("❌ BLE connect failed. Pair via Android Bluetooth settings instead.");
    }
  };

  const printLabels=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const items=(ord.items||[]).filter(it=>(it.qty||0)>0);
    if(!items.length){showNotif("No items to label");return;}
    const cfg=printCfg;
    const lw=cfg.labelW||50,lh=cfg.labelH||25;
    const PPM=203/25.4; // px per mm at 203 DPI (thermal printer native)
    const W=cfg.labelDots||384; // print head width in dots; 384 = 48mm at 203 DPI (standard 50mm roll)
    const H=Math.round(lh*PPM);
    const paperWmm=Math.round(W/PPM); // actual printable width in mm for rawbt URL
    const PT=203/72; // px per point at 203 DPI
    const ff=`'${cfg.labelFont||"Arial"}',Arial,sans-serif`;
    const padX=Math.round(2*PPM);
    const padTop=Math.round(Math.max(0.5,1.5+(cfg.labelVShift||0))*PPM);
    const expanded=items.flatMap(it=>Array.from({length:it.qty||1},(_,i)=>({...it,_piece:i+1,_total:it.qty||1})));

    const mkFont=(sz,bold,italic)=>{
      const p=[];
      if(italic)p.push('italic');
      if(bold)p.push('bold');
      p.push(Math.round(sz*PT)+'px');
      p.push(ff);
      return p.join(' ');
    };

    // Word-wrap text in canvas; returns Y after last line
    const wrapText=(ctx,text,x,y,maxW,lineH)=>{
      const words=text.split(' ');let line='',cy=y;
      for(const w of words){
        const t=line?line+' '+w:w;
        if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,cy);line=w;cy+=lineH;}
        else line=t;
      }
      if(line)ctx.fillText(line,x,cy);
      return cy+lineH;
    };

    // Single tall canvas: all labels stacked, dashed tear-line between each.
    // Continuous roll mode prints top-to-bottom — no page breaks needed.
    const SEP=8; // px gap between labels (for tear-line)
    const totalH=expanded.length*H+(expanded.length-1)*SEP;
    const cv=document.createElement('canvas');
    cv.width=W;cv.height=totalH;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,W,totalH);

    expanded.forEach((it,idx)=>{
      const base=idx*(H+SEP);
      const mw=W-padX*2;

      // Dashed tear line between labels
      if(idx>0){
        ctx.save();
        ctx.setLineDash([6,5]);
        ctx.strokeStyle='#aaa';
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(4,base-SEP/2);
        ctx.lineTo(W-4,base-SEP/2);
        ctx.stroke();
        ctx.restore();
      }

      let y=base+padTop;

      if(cfg.labelShowName!==false){
        const sz=Math.round((cfg.labelNameSize||11)*PT);
        const lhv=Math.round(sz*1.2);
        ctx.font=mkFont(cfg.labelNameSize||11,cfg.labelNameBold!==false,cfg.labelNameItalic);
        ctx.fillStyle='#000';
        y=wrapText(ctx,it.name,padX,y+sz,mw,lhv);
      }
      if(cfg.labelShowVar!==false&&it.varName){
        const sz=Math.round((cfg.labelVarSize||9)*PT);
        ctx.font=mkFont(cfg.labelVarSize||9,cfg.labelVarBold,cfg.labelVarItalic);
        ctx.fillStyle='#555';y+=Math.round(0.4*PPM);
        y=wrapText(ctx,`(${it.varName})`,padX,y+sz,mw,Math.round(sz*1.15));
      }
      const addTxt=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(', ');
      if(cfg.labelShowAddons!==false&&addTxt){
        const sz=Math.round((cfg.labelAddonSize||9)*PT);
        ctx.font=mkFont(cfg.labelAddonSize||9,cfg.labelAddonBold,cfg.labelAddonItalic);
        ctx.fillStyle='#555';y+=Math.round(0.4*PPM);
        y=wrapText(ctx,`+ ${addTxt}`,padX,y+sz,mw,Math.round(sz*1.15));
      }
      if(cfg.labelShowNotes!==false&&it.note){
        const sz=Math.round((cfg.labelNoteSize||9)*PT);
        ctx.font=mkFont(cfg.labelNoteSize||9,cfg.labelNoteBold,cfg.labelNoteItalic);
        ctx.fillStyle='#c05000';y+=Math.round(0.4*PPM);
        y=wrapText(ctx,`Note: ${it.note}`,padX,y+sz,mw,Math.round(sz*1.15));
      }
      if(cfg.labelShowPrice){
        const sz=Math.round((cfg.labelPriceSize||10)*PT);
        ctx.font=mkFont(cfg.labelPriceSize||10,cfg.labelPriceBold!==false,cfg.labelPriceItalic);
        ctx.fillStyle='#000';y+=Math.round(0.4*PPM);
        ctx.fillText(`Rs.${itemTotal(it)}`,padX,y+sz);
      }
      if(it._total>1){
        const sz=Math.round(6*PT);
        ctx.font=`${sz}px ${ff}`;ctx.fillStyle='#888';
        const t=`${it._piece}/${it._total}`;
        ctx.fillText(t,W-padX-ctx.measureText(t).width,base+H-Math.round(2*PPM));
      }
    });

    // One image, continuous roll — RawBT prints top to bottom, user tears at dashed lines
    const png=cv.toDataURL('image/png');
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0}body{background:#fff;width:${paperWmm}mm}img{display:block;width:${paperWmm}mm}</style></head><body><img src="${png}"></body></html>`;
    const b64=btoa(unescape(encodeURIComponent(html)));
    const url=`rawbt://rawbt?format=html&paperWidth=${paperWmm}&data=${encodeURIComponent(b64)}`;
    const a=document.createElement('a');a.href=url;a.style.display='none';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    showNotif(`🏷️ Sent ${expanded.length} label${expanded.length>1?'s':''} to RawBT`);
  };

  const shareOnWhatsApp=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const tbl=allTables.find(t=>t.id===tid)?.name||tid;
    const items=ord.items||[];
    const nl=String.fromCharCode(10);
    const lines=items.map(it=>{
      const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");
      return "  "+it.name+(it.varName?" ("+it.varName+")":"")+(addonStr?" + "+addonStr:"")+" x"+it.qty+"  Rs."+itemTotal(it);
    }).join(nl);
    const total=items.reduce((s,i)=>s+itemTotal(i),0);
    const paid=ord.paidAmount||0;
    const text="*MOD POS - Bill*"+nl+"*Table: "+tbl+"*"+nl+"*Date: "+new Date().toLocaleDateString("en-IN")+"*"+nl+nl+lines+nl+nl+"*Total: Rs."+total+"*"+(paid>0?nl+"*Paid: Rs."+paid+"*"+nl+"*Due: Rs."+(total-paid)+"*":"")+nl+nl+"Thank You! Visit Again!";
    const url="https://wa.me/?text="+encodeURIComponent(text);
    window.open(url,"_blank");
  };

  const shareBillAsText=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const tbl=allTables.find(t=>t.id===tid)?.name||tid;
    const items=ord.items||[];
    const nl=String.fromCharCode(10);
    const lines=items.map(it=>{
      const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");
      return it.name+(it.varName?" ("+it.varName+")":"")+(addonStr?" + "+addonStr:"")+" x"+it.qty+"  Rs."+itemTotal(it);
    }).join(nl);
    const total=items.reduce((s,i)=>s+itemTotal(i),0);
    const paid=ord.paidAmount||0;
    const text="MOD POS - Bill"+nl+"Table: "+tbl+nl+"Date: "+new Date().toLocaleDateString("en-IN")+nl+nl+lines+nl+nl+"Total: Rs."+total+(paid>0?nl+"Paid: Rs."+paid+nl+"Due: Rs."+(total-paid):"")+nl+nl+"Thank You! Visit Again!";
    const blob=new Blob([text],{type:"text/plain"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="bill-"+tbl+"-"+Date.now()+".txt";
    a.click();
    showNotif("Bill saved as text file ✓");
  };


  return(<>
    <style>{buildCss(fontSize)}</style>
    {notif&&<div className="notif">{notif}</div>}
    <div className="pos">


      <div className="main" style={{paddingTop:8}}>
        {tab==="orders"&&!selTable&&showHistory&&<OrderHistoryScreen orderHistory={orderHistory} onBack={()=>setShowHistory(false)} showNotif={showNotif} onPrint={printBill} onShareWhatsApp={shareOnWhatsApp} restaurantId={RID}/>}
        {tab==="orders"&&!selTable&&!showHistory&&<OrdersTab floors={floors} activeFloor={activeFloor} setActiveFloor={setActiveFloor} tables={floorTables} orders={orders} allTables={allTables} onOpen={(tid)=>{setSelTable(tid);}} onEditFloor={setEditFloor} onHistory={()=>setShowHistory(true)} saveFloors={saveFloors}/>}
        {tab==="orders"&&selTable&&<OrderScreen tid={selTable} orders={orders} allTables={allTables} onBack={()=>{setSelTable(null);}} onRemove={removeItem} onUpdate={updateItem} onAddExtra={addExtraItem} onSend={sendKitchen} onPay={()=>setPayModal(true)} onNoteItem={setNoteModal} onTransfer={()=>setTransferModal({tid:selTable})} onTogglePriority={(tid)=>saveOrders(p=>({...p,[tid]:{...p[tid],priority:!p[tid]?.priority}}))} onPrint={printBill} onPrintLabels={printLabels} onShareWhatsApp={shareOnWhatsApp} onShareText={shareBillAsText} onFinishSave={finishAndSave} onCancelOrder={cancelOrder} showNotif={showNotif} stickerOn={getStickerOn(selTable)} staffAuth={staffAuth} cancelPin={restInfo?.cancelPin} isOwner={isOwner} menuData={menuData} onSelectItem={setVarModal}/>}
        {tab==="kitchen"&&<KitchenTab kitchens={KITCHENS} kitchenLabels={kitchenLabels} active={activeKitchen} setActive={setActiveKitchen} orders={orders} allTables={allTables} itemDone={itemDone} onItemDone={markItemDone} onAllDone={markAllDone} dark={kitchenDark} setDark={setKitchenDark} cfg={kitchenCfg} kss={kss} setKss={setKss} playRing={playRing} staffAuth={staffAuth}/>}
        {tab==="more"&&<MoreTab orders={orders} saveOrders={saveOrders} allTables={allTables} showNotif={showNotif} staffAuth={staffAuth} user={user} staffList={staffList} restaurantId={RID}/>}
        {tab==="reports"&&(isOwner||isManager||_allowedTabs?.reports?<ReportsTab orders={orders} orderHistory={orderHistory} period={reportPeriod} setPeriod={setReportPeriod} menuData={menuData} floors={floors} allTables={allTables}/>:<div style={{textAlign:"center",padding:60,color:T.textDim}}><div style={{fontSize:40}}>🚫</div><div style={{fontWeight:800,marginTop:8}}>No Access</div></div>)}
        {tab==="settings"&&(isOwner||isManager||_allowedTabs?.settings?<SettingsTab floors={floors} setFloors={saveFloors} staff={staff} setStaff={setStaff} fontSize={fontSize} setFontSize={saveFontSize} printCfg={printCfg} setPrintCfg={savePrintCfg} kitchenCfg={kitchenCfg} setKitchenCfg={setKitchenCfg} onStaff={setStaffModal} showNotif={showNotif} allTables={allTables} staffList={staffList} setStaffList={setStaffList} restaurantId={RID} menuData={menuData} restInfo={restInfo} kitchenLabels={kitchenLabels} onSignOut={signOutUser} btPrinter={btPrinter} onConnectBt={connectBtPrinter} onTestPrint={()=>printBill(Object.keys(orders)[0]||"")} buildReceiptHtml={buildReceiptHtml} driveConnected={driveConnected} lastBackupTs={lastBackupTs} onConnectDrive={connectDrive} onBackupNow={()=>{const dr=driveTokenRef.current;if(dr&&Date.now()<dr.expiry)performDriveBackup(dr.token);else{connectDrive().then(t=>{if(t)performDriveBackup(t);});}}} onDisconnectDrive={()=>{setDriveConnected(null);driveTokenRef.current=null;localStorage.removeItem("modpos_drive_token");showNotif("Drive disconnected");}}/>:<div style={{textAlign:"center",padding:60,color:T.textDim}}><div style={{fontSize:40}}>🚫</div><div style={{fontWeight:800,marginTop:8}}>No Access</div></div>)}
      </div>

      <nav className="btab">
        {[
          {id:"orders",ic:"🍽",lb:"Orders",perm:null},
          {id:"kitchen",ic:"👨‍🍳",lb:"Kitchen",perm:"kitchen"},
          {id:"more",ic:"📱",lb:"More",perm:null},
          {id:"reports",ic:"📊",lb:"Reports",perm:"reports"},
          {id:"settings",ic:"⚙️",lb:"Settings",perm:"settings"},
        ].filter(t=>{
          if(isOwner||isManager)return true;
          if(!_allowedTabs)return false;
          // kitchen-only staff: hide orders and more
          const perms=staffAuth?.perms||{};
          const hasKitchenOnly=!perms.orders&&(perms.kitchen||perms.kitchen1||perms.kitchen2||perms.kitchen3||perms.bar||perms.kitchen4);
          if(hasKitchenOnly&&(t.id==="orders"||t.id==="more"))return false;
          return _allowedTabs[t.id]===true;
        }).map(t=>(
          <button key={t.id} className={`ti ${tab===t.id?"active":""}`} onClick={()=>{setTab(t.id);if(t.id!=="orders"){setSelTable(null);setMenuOpen(false);}}}>
            <span className="ti-ic">{t.ic}</span>{t.lb}
          </button>
        ))}
      </nav>
    </div>

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

    {payModal&&selTable&&<PaymentModal tid={selTable} allTables={allTables} orders={orders} saveOrders={saveOrders} stickerOn={getStickerOn(selTable)} restaurantId={RID} onClose={()=>setPayModal(false)} onDone={(msg,fullyClosed)=>{
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

    {mergeModal&&<div className="overlay" onClick={()=>setMergeModal(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Merge Tables</div><button className="mclose" onClick={()=>setMergeModal(null)}>✕</button></div>
        <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Select a table to merge INTO current table ({allTables.find(t=>t.id===mergeModal.tid)?.name}):</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:300,overflowY:"auto"}}>
          {Object.entries(orders).filter(([tid])=>tid!==mergeModal.tid).map(([tid,ord])=>{
            const tName=allTables.find(t=>t.id===tid)?.name||tid;
            const tot=(ord.items||[]).reduce((s,i)=>s+itemTotal(i),0);
            return(<div key={tid} style={{padding:"10px 12px",borderRadius:10,border:`1.5px solid ${T.orange}40`,background:T.orangeL,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>{
              saveOrders(prev=>{
                const from=prev[tid];const to=prev[mergeModal.tid];
                if(!from||!to)return prev;
                const merged={...to,items:[...to.items,...from.items.map(i=>({...i,uid:uid()}))],status:"waiting"};
                const n={...prev,[mergeModal.tid]:merged};
                delete n[tid];
                return n;
              });
              showNotif(`Merged ${tName} → ${allTables.find(t=>t.id===mergeModal.tid)?.name} ✓`);
              setMergeModal(null);
            }}>
              <div><div style={{fontSize:13,fontWeight:800}}>{tName}</div><div style={{fontSize:11,color:T.textMuted}}>{(ord.items||[]).length} items</div></div>
              <div style={{fontSize:14,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{tot}</div>
            </div>);
          })}
          {Object.keys(orders).filter(t=>t!==mergeModal.tid).length===0&&<div style={{textAlign:"center",padding:20,color:T.textDim}}>No other occupied tables</div>}
        </div>
        <button className="btn btn-out mt8" style={{width:"100%"}} onClick={()=>setMergeModal(null)}>Cancel</button>
      </div>
    </div>}

    {editFloor&&<div className="overlay" onClick={()=>setEditFloor(null)}>
      <EditFloorModal floor={editFloor} onSave={(fid,name)=>{saveFloors(floors.map(f=>f.id===fid?{...f,name}:f));setEditFloor(null);showNotif("Floor renamed ✓");}} onClose={()=>setEditFloor(null)}/>
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
            if(!tableId){showNotif(`Table "${selfOrderModal.tableName}" not found!`);return;}
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


// ─── ORDER HISTORY SCREEN ─────────────────────────────────────────────────────
function OrderHistoryScreen({orderHistory,onBack,showNotif,onPrint,onShareWhatsApp,restaurantId}){
  const[selOrder,setSelOrder]=useState(null);
  const[search,setSearch]=useState("");

  const filtered=(orderHistory||[]).filter(o=>
    !search||(o.tableName||"").toLowerCase().includes(search.toLowerCase())
  );

  const deleteOrder=(orderId)=>{
    if(!window.confirm("Delete this order from history?"))return;
    if(restaurantId)set(ref(db,`restaurants/${restaurantId}/order_history/${orderId}`),null);
    showNotif("Deleted ✓");
    setSelOrder(null);
  };

  const shareOrderWA=(o)=>{
    const nl=String.fromCharCode(10);
    const items=(o.items||[]).map(it=>"  "+it.name+(it.varName?" ("+it.varName+")":"")+" x"+it.qty+"  Rs."+itemTotal(it)).join(nl);
    const total=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);
    const text="*MOD POS - Bill*"+nl+"*Table: "+(o.tableName||"")+"*"+nl+"*Date: "+new Date(o.closedAt||Date.now()).toLocaleDateString("en-IN")+"*"+nl+nl+items+nl+nl+"*Total: Rs."+total+"*"+nl+nl+"Thank You!";
    window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank");
  };

  return(<>
    <div className="ohdr">
      <button className="bbtn" onClick={onBack}>←</button>
      <div style={{flex:1}}><div className="otitle">Order History</div><div className="osub">{(orderHistory||[]).length} closed orders</div></div>
    </div>
    <input className="inp mb12" placeholder="🔍 Search by table..." value={search} onChange={e=>setSearch(e.target.value)}/>

    {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:T.textDim}}>
      <div style={{fontSize:40,marginBottom:8}}>📋</div>
      <div style={{fontWeight:700}}>No order history yet</div>
      <div style={{fontSize:12,marginTop:4}}>Closed orders will appear here</div>
    </div>}

    {filtered.map((o,i)=>{
      const total=(o.items||[]).reduce((s,it)=>s+itemTotal(it),0);
      const closedTime=o.closedAt?new Date(o.closedAt).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"";
      const orderId=o.id||("ORD-"+String(i+1).padStart(4,"0"));
      const isExp=selOrder===i;
      return(<div key={i} className="card mb8" style={{borderColor:isExp?`${T.primary}50`:T.border}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setSelOrder(isExp?null:i)}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:800}}>{o.tableName||"Table"}</div>
              <span style={{fontSize:9,background:T.primaryL,color:T.primary,borderRadius:20,padding:"1px 7px",fontWeight:700}}>{orderId}</span>
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{closedTime} · {(o.items||[]).length} items</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{total}</div>
            <div style={{fontSize:9,color:T.textMuted}}>{o.payMethod||"paid"}</div>
          </div>
        </div>
        {isExp&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
          {(o.items||[]).map((it,j)=>{
            const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");
            return(<div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px dashed ${T.border}50`}}>
              <span style={{fontWeight:700}}>×{it.qty} {it.name}{it.varName?` (${it.varName})`:""}{addonStr?` + ${addonStr}`:""}</span>
              <span style={{fontWeight:800,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{itemTotal(it)}</span>
            </div>);
          })}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:4,borderTop:`2px solid ${T.border}`}}>
            <span style={{fontWeight:800}}>Total</span>
            <span style={{fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{total}</span>
          </div>
          {o.startMs&&<div style={{fontSize:10,color:T.textMuted,marginTop:4}}>
            Order started: {new Date(o.startMs).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
            {o.closedAt&&" · Closed: "+new Date(o.closedAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
          </div>}
          <div className="row mt8" style={{gap:6}}>
            <button className="btn btn-out btn-xs f1" onClick={()=>shareOrderWA(o)}>📲 WA</button>
            <button className="btn btn-out btn-xs f1" onClick={()=>showNotif("Printing...")}>🖨 Print</button>
            <button className="btn btn-xs" style={{background:T.redL,color:T.red,border:`1px solid ${T.red}30`}} onClick={()=>deleteOrder(o.id||("ord_"+i))}>🗑 Delete</button>
          </div>
        </div>}
      </div>);
    })}
  </>);
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab({floors,activeFloor,setActiveFloor,tables,orders,allTables,onOpen,onEditFloor,onHistory}){
  useTick();
  const occ=Object.keys(orders).length;
  const total=Object.values(orders).reduce((s,o)=>s+(o.items||[]).reduce((ss,i)=>ss+itemTotal(i),0),0);
  return(<>
    <div className="shdr">
      <div className="stitle">Tables</div>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <div className="chip">{occ} active</div>
        <span style={{fontSize:13,fontWeight:900,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>₹{total.toLocaleString()}</span>
        <button className="btn btn-out btn-xs" onClick={onHistory}>🕐 History</button>
      </div>
    </div>
    <div className="ftabs">
      {floors.map(f=>(<div key={f.id} className="ftab-wrap"><div className={`ftab ${activeFloor===f.id?"active":""}`} onClick={()=>setActiveFloor(f.id)}>{f.name}</div>{activeFloor===f.id&&<button className="fedit" onClick={()=>onEditFloor(f)}>✏️</button>}</div>))}
    </div>
    <div className="tgrid">
      {tables.map(tbl=>{
        const ord=orders[tbl.id];const occ=!!ord;
        const tot=occ?(ord.items||[]).reduce((s,i)=>s+itemTotal(i),0):0;
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
                <div className="tmeta"><span>🕐{ord.time}</span><span>🛒{(ord.items||[]).length}</span></div>
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
function OrderScreen({tid,orders,allTables,onBack,onRemove,onUpdate,onAddExtra,onSend,onPay,onNoteItem,onTransfer,onTogglePriority,onPrint,onPrintLabels,onShareWhatsApp,onShareText,onFinishSave,onCancelOrder,showNotif,stickerOn,staffAuth,cancelPin,isOwner,menuData,onSelectItem}){
  const[pinModal,setPinModal]=useState(null);
  const[cancelOrderPin,setCancelOrderPin]=useState(false);
  const[showDrop,setShowDrop]=useState(false);
  const[menuOpen,setMenuOpen]=useState(true);
  const cartRef=useRef(null);
  useTick(10000);
  const ord=orders[tid];
  const items=ord?.items||[];
  const total=items.reduce((s,i)=>s+itemTotal(i),0);
  const paid=ord?.paidAmount||0;
  const due=total-paid;
  const unsent=items.filter(i=>!i.sent).length;
  const tblName=allTables.find(t=>t.id===tid)?.name||tid;

  const prevLenRef=useRef(items.length);
  useEffect(()=>{
    if(items.length>prevLenRef.current&&cartRef.current){
      cartRef.current.scrollTop=cartRef.current.scrollHeight;
    }
    prevLenRef.current=items.length;
  },[items.length]);

  const changeQty=(uid_,d)=>{
    const it=items.find(i=>i.uid===uid_);if(!it)return;
    if(d>0&&it.sent){onAddExtra(tid,it);return;}
    onUpdate(tid,uid_,{qty:Math.max(1,it.qty+d)});
  };

  return(
    <div className="ord-screen">
      {/* Slim header: back | name | 🏷 | 🔴 | ⋮ */}
      <div className="ohdr-slim">
        <button className="bbtn" onClick={onBack}>←</button>
        <div className="otitle" style={{flex:1,marginLeft:4,fontSize:15,fontWeight:800}}>{tblName}</div>
        {total>0&&<button className="hbtn" onClick={()=>onPrintLabels(tid)}>🏷</button>}
        <button className={`hbtn hbtn-urg${ord?.priority?" on":""}`} onClick={()=>onTogglePriority(tid)}>🔴</button>
        <div style={{position:"relative"}}>
          <button className="hbtn hbtn-dot" onClick={()=>setShowDrop(p=>!p)}>⋮</button>
          {showDrop&&<>
            <div style={{position:"fixed",inset:0,zIndex:298}} onClick={()=>setShowDrop(false)}/>
            <div className="drop-menu">
              <div className="drop-item" onClick={()=>{setShowDrop(false);onPrint(tid);}}>🖨 Print Bill</div>
              <div className="drop-item" onClick={()=>{setShowDrop(false);onPrintLabels(tid);}}>🏷 Print Labels</div>
              <div className="drop-item" onClick={()=>{setShowDrop(false);onShareWhatsApp(tid);}}>📲 WhatsApp</div>
              <div className="drop-item" onClick={()=>{setShowDrop(false);onShareText(tid);}}>📄 Share Text</div>
              <div className="drop-div"/>
              <div className="drop-item" onClick={()=>{setShowDrop(false);onTransfer();}}>⇄ Move Items</div>
              <div className="drop-div"/>
              <div className="drop-item" onClick={()=>{setShowDrop(false);onFinishSave(tid);}}>✅ Finish & Save</div>
              {staffAuth?.perms?.cancel&&<div className="drop-item" style={{color:T.red}} onClick={()=>{setShowDrop(false);
                if(isOwner||!cancelPin){onCancelOrder(tid);}else{setCancelOrderPin(true);}
              }}>🗑 Cancel Order</div>}
            </div>
          </>}
        </div>
      </div>

      {/* Cart area */}
      <div className="cart-area">
        <div className="cart-full" ref={cartRef} onClick={!menuOpen?()=>setMenuOpen(true):undefined}>
          {items.length===0&&<div style={{textAlign:"center",padding:"30px 16px",color:T.textDim,fontSize:13}}>No items · tap here to add</div>}
          {items.map(it=>{
            const tot=itemTotal(it);
            return(
              <div key={it.uid} className="oi" onClick={e=>e.stopPropagation()}>
                <span className="oi-name">{it.name}</span>
                <button className={`oi-note-btn ${it.note?"has":""}`} onClick={()=>onNoteItem({uid:it.uid,name:it.name,note:it.note||"",cat:it.cat,catName:"",tid})}>📝</button>
                <button className="qb" onClick={()=>changeQty(it.uid,-1)}>−</button>
                <span className="qn">{it.qty}</span>
                <button className="qb" onClick={()=>changeQty(it.uid,1)}>+</button>
                <span className="oi-price-r">₹{tot}</span>
                {staffAuth?.perms?.cancel&&<button className="qb del" onClick={()=>{
                  if(isOwner||!cancelPin){onRemove(tid,it.uid);}
                  else{setPinModal(it.uid);}
                }}>✕</button>}
              </div>
            );
          })}
        </div>

        {/* Bottom bar: Pay + Send — visible when menu is closed */}
        {!menuOpen&&<div className="ord-bottom-bar">
          {staffAuth?.perms?.payment&&due>0&&<button className="obb-pay" onClick={onPay}>💳 Pay ₹{due}</button>}
          {unsent>0&&<button className="obb-send" onClick={()=>onSend(tid)}>🍳 Send ({unsent})</button>}
        </div>}

        {/* FAB to reopen menu */}
        {!menuOpen&&<button className="fab-add" onClick={()=>setMenuOpen(true)}>+</button>}
      </div>

      {/* Integrated half-screen menu */}
      {menuOpen&&<SlideMenu
        onClose={()=>setMenuOpen(false)}
        onSelectItem={onSelectItem}
        menuData={menuData}
        onSend={()=>onSend(tid)}
        onPay={onPay}
        due={due}
        unsent={unsent}
        staffAuth={staffAuth}
      />}

      {/* Item cancel PIN */}
      {pinModal&&<div className="overlay" onClick={()=>setPinModal(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhdr"><div className="mtitle">🔐 Cancel PIN</div><button className="mclose" onClick={()=>setPinModal(null)}>✕</button></div>
          <input className="inp" type="password" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit PIN" autoFocus
            onKeyDown={e=>{if(e.key==="Enter"){if(e.target.value===cancelPin){onRemove(tid,pinModal);setPinModal(null);showNotif("Item cancelled ✓");}else{showNotif("Wrong PIN ❌");e.target.value="";}}}}/>
          <div className="row mt8">
            <button className="btn btn-out f1" onClick={()=>setPinModal(null)}>Cancel</button>
            <button className="btn btn-r f1" onClick={e=>{const i=e.target.closest('.modal').querySelector('input');if(i.value===cancelPin){onRemove(tid,pinModal);setPinModal(null);showNotif("Item cancelled ✓");}else{showNotif("Wrong PIN ❌");i.value="";}}}>✓ Confirm</button>
          </div>
        </div>
      </div>}
      {cancelOrderPin&&<div className="overlay" onClick={()=>setCancelOrderPin(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="mhdr"><div className="mtitle">🔐 Cancel Order PIN</div><button className="mclose" onClick={()=>setCancelOrderPin(false)}>✕</button></div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Enter manager PIN to cancel entire order</div>
          <input className="inp" type="password" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit PIN" autoFocus
            onKeyDown={e=>{if(e.key==="Enter"){if(e.target.value===cancelPin){onCancelOrder(tid);setCancelOrderPin(false);}else{showNotif("Wrong PIN ❌");e.target.value="";}}}}/>
          <div className="row mt8">
            <button className="btn btn-out f1" onClick={()=>setCancelOrderPin(false)}>Cancel</button>
            <button className="btn btn-r f1" onClick={e=>{const i=e.target.closest('.modal').querySelector('input');if(i.value===cancelPin){onCancelOrder(tid);setCancelOrderPin(false);}else{showNotif("Wrong PIN ❌");i.value="";}}}>✓ Confirm</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─── SLIDE-UP MENU (half-screen, integrated into OrderScreen layout) ─────────
function SlideMenu({onClose,onSelectItem,menuData,onSend,onPay,due,unsent,staffAuth}){
  const dynCats=menuData?.cats?.length>0
    ?[...menuData.cats].sort((a,b)=>(a.priority||0)-(b.priority||0))
    :[];
  const dynItems=menuData?.items?.length>0?menuData.items:[];
  const hasDynMenu=dynCats.length>0;

  const[cat,setCat]=useState(dynCats[0]?.id||"");
  const[q,setQ]=useState("");
  const[showSearch,setShowSearch]=useState(false);
  const itemListRef=useRef(null);

  useEffect(()=>{if(itemListRef.current)itemListRef.current.scrollTop=0;},[cat]);

  const filtered=q
    ?dynItems.filter(i=>i.name.toLowerCase().includes(q.toLowerCase()))
    :dynItems.filter(i=>(i.catId||i.cat)===cat);

  const handleSelect=(item)=>{
    const c=dynCats.find(x=>x.id===(item.catId||item.cat));
    const catAddons=c?.addons||[];
    const itemAddons=item.itemAddons||[];
    const mergedAddons=[...catAddons,...itemAddons.filter(a=>!catAddons.find(ca=>ca.id===a.id))];
    onSelectItem({
      ...item,
      basePrice:item.basePrice||item.price,
      cat:item.catId||item.cat,
      kitchen:item.kitchen||c?.kitchen||"Kitchen 1",
      vars:item.vars||[],
      addons:mergedAddons,
    });
  };

  return(
    <div className="menu-half">
      {/* Action bar: ✕ | 🔍 | [spacer] | 💳 Pay | 🍳 Send */}
      <div className="menu-act-bar">
        <button className="mab mab-close" onClick={onClose}>✕</button>
        <button className="mab mab-search" onClick={()=>{setShowSearch(p=>!p);setQ("");}}>🔍</button>
        <div style={{flex:1}}/>
        {due>0&&staffAuth?.perms?.payment&&onPay&&<button className="mab mab-pay" onClick={onPay}>💳 ₹{due}</button>}
        {unsent>0&&onSend&&<button className="mab mab-send" onClick={onSend}>🍳 Send ({unsent})</button>}
      </div>
      {showSearch&&<div className="menu-srch">
        <input className="menu-srch-inp" placeholder="Search items..." value={q} onChange={e=>setQ(e.target.value)} autoFocus autoComplete="off"/>
      </div>}
      <div className="menu-body">
        {!q&&<div className="cat-list">
          {dynCats.map(c=>(<div key={c.id} className={`cat-btn ${cat===c.id?"active":""}`} onClick={()=>{setCat(c.id);setShowSearch(false);setQ("");}}>
            {c.icon&&<div style={{fontSize:14,marginBottom:1}}>{c.icon}</div>}
            <div>{c.name||c.n}</div>
          </div>))}
        </div>}
        <div className="item-list" ref={itemListRef}>
          {filtered.length===0&&<div style={{textAlign:"center",padding:20,color:T.textDim,fontSize:12}}>
            {q?"No items found":"No items in this category yet"}
          </div>}
          {!hasDynMenu&&!q&&<div style={{textAlign:"center",padding:24,color:T.textDim,fontSize:12,lineHeight:1.7}}>
            <div style={{fontSize:28,marginBottom:6}}>🍽</div>
            <div style={{fontWeight:800,color:T.textMid,marginBottom:3}}>Menu not set up</div>
            <div>Settings → Menu to add items</div>
          </div>}
          {filtered.map(item=>(<div key={item.id} className="mitem" onClick={()=>handleSelect(item)}>
            <div className="iname" style={{flex:1}}>{item.name}</div>
            <div className="ipr">₹{item.basePrice||item.price}</div>
            <button className="iadd" onClick={e=>{e.stopPropagation();handleSelect(item);}}>+</button>
          </div>))}
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
  const catAddons=item.addons||[];
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
              <div style={{flex:1}} onClick={()=>toggleAddon(a.id)}><div style={{fontSize:12,fontWeight:800}}>{a.name}</div>
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
function PaymentModal({tid,allTables,orders,saveOrders,stickerOn,restaurantId,onClose,onDone,onPrint}){
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
  // Expand items with qty>1 into individual single-unit rows for per-item selection
  const splitItems=items.flatMap(it=>it.qty===1?[it]:Array.from({length:it.qty},(_,idx)=>({...it,uid:`${it.uid}__s${idx}`,qty:1})));
  const unitPrice=(it)=>(it.basePrice||it.price||0)+(it.varPrice||0)+(it.addons||[]).filter(a=>a.qty>0).reduce((s,a)=>s+a.price,0);
  const selectedTotal=splitItems.reduce((s,it)=>s+(selItems[it.uid]?unitPrice(it):0),0);
  const payNow=mode==="full"?grandRemaining:mode==="items"?selectedTotal:parseFloat(partialAmt)||0;
  if(!ord)return null;
  const collect=()=>{
    if(payNow<=0)return;
    const newPaid=alreadyPaid+payNow;
    if(newPaid>=grandTotal){
      const closedOrder={...ord,tableName:tblName,closedAt:Date.now(),totalPaid:newPaid,payMethod};
      saveOrders(prev=>{const n={...prev};delete n[tid];return n;});
      // Save to history
      if(restaurantId){set(ref(db,`restaurants/${restaurantId}/order_history/ord_${Date.now()}`),closedOrder);}
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
          {splitItems.map((it,idx)=>{const up=unitPrice(it);const sel=!!selItems[it.uid];const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");const isExtra=it.uid.includes("__s");return(
            <div key={it.uid} className={`pay-item ${sel?"sel":""}`} onClick={()=>setSelItems(p=>({...p,[it.uid]:!p[it.uid]}))}>
              <div className={`pcheck ${sel?"on":""}`}>{sel&&"✓"}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700}}>{it.name}{isExtra&&<span style={{fontSize:10,color:T.textMuted,fontWeight:600,marginLeft:4}}>#{(idx-splitItems.findIndex(x=>x.uid.startsWith(it.uid.split("__s")[0])))+1}</span>}</div>
                {addonStr&&<div style={{fontSize:10,color:T.blue,fontWeight:700}}>{addonStr}</div>}
              </div>
              <div style={{fontSize:13,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.primary}}>₹{up}</div>
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
function KitchenTab({kitchens,kitchenLabels,active,setActive,orders,allTables,itemDone,onItemDone,onAllDone,dark,setDark,cfg,kss,setKss,playRing,staffAuth}){
  // Filter kitchens based on staff permissions
  const kitchenPermMap={"Kitchen 1":"kitchen1","Kitchen 2":"kitchen2","Kitchen 3":"kitchen3","Bar":"bar","Kitchen 4":"kitchen4"};
  const allowedKitchens=staffAuth?.perms?.kitchen
    ? kitchens  // full kitchen access
    : kitchens.filter(k=>{
        const permKey=kitchenPermMap[k];
        return permKey&&staffAuth?.perms?.[permKey];
      });
  const visibleKitchens=allowedKitchens.length>0?allowedKitchens:kitchens;
  const labelOf=(k)=>{const i=kitchens.indexOf(k);return(kitchenLabels||[])[i]||k;};
  useTick(10000);
  const[showKss,setShowKss]=useState(false);
  const pendingOrders=Object.entries(orders).filter(([tid,ord])=>{
    const kitItems=(ord.items||[]).filter(it=>it.kitchen===active&&it.sent);
    return kitItems.length>0&&kitItems.some(it=>!itemDone[`${tid}-${it.uid}`]);
  }).sort((a,b)=>cfg.sortBy==="new"?b[1].startMs-a[1].startMs:a[1].startMs-b[1].startMs);
  const kBg=dark?"#0f1117":T.bg;const kCol=dark?"#f0f4ff":T.text;
  const getTblName=(tid)=>allTables.find(t=>t.id===tid)?.name||tid;
  return(
    <div className={`kscreen ${dark?"dark":""}`} style={{margin:"-14px",padding:"8px",background:kBg,color:kCol,minHeight:"calc(100vh - 68px)"}}>
      {/* Compact kitchen header - no top nav bar */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
          {visibleKitchens.map(k=>(<button key={k} onClick={()=>setActive(k)} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${active===k?T.primary:dark?"#2e3352":T.border}`,background:active===k?T.primary:dark?"#22263a":T.surface,color:active===k?"#fff":dark?"#8890b0":T.textMid,fontSize:11,fontWeight:800,cursor:"pointer"}}>{labelOf(k)}</button>))}
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
          <span style={{fontSize:10,fontWeight:700,color:dark?"#a8f0c8":T.primary,background:dark?"#22263a":T.primaryL,padding:"3px 8px",borderRadius:20}}>{pendingOrders.length} pending</span>
          <button style={{background:dark?"#22263a":T.surfaceAlt,border:`1px solid ${dark?"#2e3352":T.border}`,color:dark?"#f0f4ff":T.textMid,borderRadius:7,width:26,height:26,cursor:"pointer",fontSize:13}} onClick={()=>setDark(!dark)}>{dark?"☀️":"🌙"}</button>
          <button style={{background:dark?"#22263a":T.surfaceAlt,border:`1px solid ${dark?"#2e3352":T.border}`,color:dark?"#f0f4ff":T.textMid,borderRadius:7,width:26,height:26,cursor:"pointer",fontSize:12}} onClick={()=>setShowKss(true)}>⚙️</button>
        </div>
      </div>
      {pendingOrders.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:dark?"#555e80":T.textDim}}><div style={{fontSize:56,marginBottom:10}}>✅</div><div style={{fontSize:17,fontWeight:800}}>All clear!</div></div>
      ):pendingOrders.map(([tid,ord])=>{
        const kitItems=(ord.items||[]).filter(it=>it.kitchen===active&&it.sent);
        const pendingItems=kitItems.filter(it=>!itemDone[`${tid}-${it.uid}`]);
        const urgent=elapsedM(ord.startMs)>(ord.prepEst||20);
        return(
          <div key={tid} className={`krow ${dark?"dark":""}`}>
            <div className={`kstrip ${urgent?"waiting":"normal"}`} style={ord.priority?{background:dark?"#856404":"#f59e0b"}:undefined}/>
            <div className="kbody" style={{...(ord.priority?{background:dark?"#2a2200":"#fffbeb"}:{}),zoom:(kss.kfs||12)/12}}>
              <div className="khead">
                <span className="ktbl">{ord.priority&&<span style={{fontSize:10,background:"#dc2626",color:"#fff",borderRadius:6,padding:"1px 5px",marginRight:4,fontWeight:800}}>🔴</span>}{getTblName(tid)}</span>
                {cfg.waiterName&&ord.waiter&&ord.waiter!=="Online"&&<span style={{fontSize:10,color:dark?"#8890b0":T.textMuted,fontWeight:600}}>👤{ord.waiter}</span>}
                {(()=>{const otherKitchenItems=(ord.items||[]).filter(it=>it.kitchen!==active&&it.sent&&!itemDone[`${tid}-${it.uid}`]);return otherKitchenItems.length>0&&<div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>{[...new Set(otherKitchenItems.map(it=>it.kitchen))].map(k=>(<span key={k} style={{fontSize:9,background:"#dc2626",color:"#fff",borderRadius:20,padding:"2px 6px",fontWeight:800}}>⏳{labelOf(k)}</span>))}</div>;})()}
                <div className={`kmeta ${urgent?"urgent":""}`}><span>🕐{ord.time}</span><span>⏱{elapsed(ord.startMs)}</span></div>
              </div>
              {ord.orderNote&&<div style={{fontSize:10,color:T.orange,fontStyle:"italic",marginBottom:4}}>📝{ord.orderNote}</div>}
              {pendingItems.map(it=>{
                const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>`${a.qty>1?a.qty+"×":""}${a.name}`).join(", ");
                const varStr=it.varName?`(${it.varName})`:"";
                return(
                  <div key={it.uid} className="kline" style={{padding:"3px 0"}}>
                    <span className="kqty" style={{fontSize:13,minWidth:22}}>×{it.qty}</span>
                    <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
                      <div style={{display:"flex",flexWrap:"wrap",alignItems:"baseline",gap:"0 4px"}}>
                        <span className="knm" style={{fontSize:12,textAlign:"left"}}>{it.name}</span>
                        {varStr&&<span style={{fontSize:12,fontWeight:800,color:dark?"#f0f4ff":"#1e2235"}}>{varStr}</span>}
                      </div>
                      {(addonStr||(it.note&&cfg.itemNotes))&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:1}}>
                        {addonStr&&<span style={{fontSize:12,fontWeight:800,color:dark?"#f0f4ff":"#1e2235"}}>{addonStr}</span>}
                        {it.note&&cfg.itemNotes&&<span style={{fontSize:10,color:dark?"#88aaff":T.blue}}>📝{it.note}</span>}
                      </div>}
                    </div>
                    {it.sentAt&&<span style={{fontSize:9,fontWeight:800,color:dark?"#ff9966":T.orange,background:dark?"#2a1a00":"#fff7ed",borderRadius:8,padding:"1px 5px",flexShrink:0,marginRight:4}}>{elapsed(it.sentAt)}</span>}
                    <div className={`icheck ${itemDone[`${tid}-${it.uid}`]?"done":""}`} style={{width:22,height:22,borderRadius:6,...(dark&&!itemDone[`${tid}-${it.uid}`]?{background:"#22263a",borderColor:"#3e4660"}:{})}} onClick={()=>onItemDone(tid,it.uid)}>{itemDone[`${tid}-${it.uid}`]?"✓":""}</div>
                  </div>
                );
              })}
            </div>
            <div className="kactions" style={ord.priority?{background:dark?"#2a2200":"#fef3c7"}:undefined}>
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
          <div className="sec-lbl mb8">Item Font Size</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
            {[10,11,12,13,14,15,16].map(s=>(<button key={s} className={`sbtn ${(kss.kfs||12)===s?"sel":""}`} onClick={()=>setKss(p=>({...p,kfs:s}))}>{s}px</button>))}
          </div>
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
      const tot=(ord.items||[]).reduce((s,i)=>s+itemTotal(i),0);
      return(<div key={tid} className="card mb12">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div>
            <div style={{fontSize:10,fontWeight:900,color:pc?.color,textTransform:"uppercase",letterSpacing:1}}>{platform} · {getTblName(tid)}</div>
            {(ord.items||[]).map((it,i)=>{const addonStr=(it.addons||[]).filter(a=>a.qty>0).map(a=>a.name).join(", ");return(<div key={i} style={{fontSize:12,fontWeight:600,marginTop:2}}>×{it.qty} {it.name}{it.varName?` (${it.varName})`:""}{addonStr?<span style={{color:T.orange,fontSize:10}}> +{addonStr}</span>:""}{it.note?<span style={{color:T.blue,fontSize:10}}> 📝{it.note}</span>:""}</div>);})}
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
function ReportsTab({orders,orderHistory,period,setPeriod,menuData,floors,allTables}){
  const[sub,setSub]=useState("overview");
  const[customDate,setCustomDate]=useState("");
  const[customDateTo,setCustomDateTo]=useState("");
  const[expandedCat,setExpandedCat]=useState(null);
  const[showPeriodDrop,setShowPeriodDrop]=useState(false);
  const now=new Date();
  const COLORS=[T.primary,T.blue,T.orange,"#8b5cf6","#ec4899",T.green,T.red,"#0891b2"];
  const PERIODS=[
    {id:"today",l:"Today"},{id:"yesterday",l:"Yesterday"},
    {id:"thisweek",l:"This Week"},{id:"lastweek",l:"Last Week"},
    {id:"thismonth",l:"This Month"},{id:"lastmonth",l:"Last Month"},
    {id:"last3months",l:"Last 3 Months"},{id:"last6months",l:"Last 6 Months"},
    {id:"all",l:"All Time"},{id:"custom",l:"Custom Range"},
  ];

  const allOrders=[...Object.values(orders),...(orderHistory||[])];
  const ms_=(o)=>o.closedAt||o.startMs||Date.now();
  const filterOrds=(list)=>{
    if(period==="today"){const s=new Date(now);s.setHours(0,0,0,0);return list.filter(o=>new Date(ms_(o))>=s);}
    if(period==="yesterday"){const s=new Date(now);s.setDate(s.getDate()-1);s.setHours(0,0,0,0);const e=new Date(s);e.setHours(23,59,59,999);return list.filter(o=>{const d=new Date(ms_(o));return d>=s&&d<=e;});}
    if(period==="thisweek"){const s=new Date(now);s.setDate(now.getDate()-now.getDay());s.setHours(0,0,0,0);return list.filter(o=>new Date(ms_(o))>=s);}
    if(period==="lastweek"){const s=new Date(now);s.setDate(now.getDate()-now.getDay()-7);s.setHours(0,0,0,0);const e=new Date(s);e.setDate(s.getDate()+6);e.setHours(23,59,59,999);return list.filter(o=>{const d=new Date(ms_(o));return d>=s&&d<=e;});}
    if(period==="thismonth")return list.filter(o=>{const d=new Date(ms_(o));return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
    if(period==="lastmonth"){const lm=new Date(now.getFullYear(),now.getMonth()-1,1);return list.filter(o=>{const d=new Date(ms_(o));return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear();});}
    if(period==="last3months")return list.filter(o=>now-new Date(ms_(o))<91*86400000);
    if(period==="last6months")return list.filter(o=>now-new Date(ms_(o))<183*86400000);
    if(period==="custom")return list.filter(o=>{
      if(!customDate)return true;
      const d=new Date(ms_(o));const from=new Date(customDate);from.setHours(0,0,0,0);
      if(customDateTo){const to=new Date(customDateTo);to.setHours(23,59,59,999);return d>=from&&d<=to;}
      return d.toDateString()===from.toDateString();
    });
    return list;
  };
  const filtered=filterOrds(allOrders);
  const revenue=filtered.reduce((s,o)=>s+(o.items||[]).reduce((ss,i)=>ss+itemTotal(i),0),0);
  const orderCount=filtered.length;
  const avgBill=orderCount?Math.round(revenue/orderCount):0;
  const itemsSold=filtered.reduce((s,o)=>s+(o.items||[]).reduce((ss,i)=>ss+(i.qty||1),0),0);

  // ── Item analytics ──
  const itemMap={};
  filtered.forEach(o=>(o.items||[]).forEach(it=>{
    const key=it.name+(it.varName?` (${it.varName})`:"");
    if(!itemMap[key])itemMap[key]={qty:0,amt:0};
    itemMap[key].qty+=(it.qty||1);
    itemMap[key].amt+=itemTotal(it);
  }));
  const itemList=Object.entries(itemMap).map(([n,d])=>({n,...d})).sort((a,b)=>b.qty-a.qty);
  const topSellers=itemList.slice(0,10);
  const topRevenue=[...itemList].sort((a,b)=>b.amt-a.amt).slice(0,10);
  const bottomN=Math.max(5,Math.floor(itemList.length*0.25));
  const slowMovers=itemList.length>5?[...itemList].sort((a,b)=>a.qty-b.qty).slice(0,bottomN):[];
  const orderedNames=new Set(Object.keys(itemMap));
  const deadStock=(menuData?.items||[]).filter(mi=>!orderedNames.has(mi.name));

  // ── Category analytics ──
  const resolveCat=(raw)=>{if(!raw||raw==="Other")return"Other";const f=menuData?.cats?.find(c=>c.id===raw||c.name===raw);return f?.name||raw;};
  const catMap={};
  filtered.forEach(o=>(o.items||[]).forEach(it=>{
    const cat=resolveCat(it.cat||it.catId||"Other");
    if(!catMap[cat])catMap[cat]={qty:0,amt:0,items:{}};
    catMap[cat].qty+=(it.qty||1);catMap[cat].amt+=itemTotal(it);
    const key=it.name+(it.varName?` (${it.varName})`:"");
    if(!catMap[cat].items[key])catMap[cat].items[key]={qty:0,amt:0};
    catMap[cat].items[key].qty+=(it.qty||1);catMap[cat].items[key].amt+=itemTotal(it);
  }));
  const catList=Object.entries(catMap).map(([n,d])=>({n,...d})).sort((a,b)=>b.amt-a.amt);
  const maxCatAmt=Math.max(...catList.map(c=>c.amt),1);

  // ── Floor & Table analytics ──
  const tblFloorMap={};
  (floors||[]).forEach(fl=>(fl.tables||[]).forEach(t=>{tblFloorMap[t.name]=fl.name;}));
  const floorMap={};
  const tableMap={};
  filtered.forEach(o=>{
    const fl=tblFloorMap[o.tableName||""]||"Other";
    const tbl=o.tableName||"Unknown";
    const amt=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);
    if(!floorMap[fl])floorMap[fl]={orders:0,amt:0};
    floorMap[fl].orders++;floorMap[fl].amt+=amt;
    if(!tableMap[tbl])tableMap[tbl]={orders:0,amt:0};
    tableMap[tbl].orders++;tableMap[tbl].amt+=amt;
  });
  const floorList=Object.entries(floorMap).map(([n,d])=>({n,...d})).sort((a,b)=>b.amt-a.amt);
  const tableList=Object.entries(tableMap).map(([n,d])=>({n,...d})).sort((a,b)=>b.amt-a.amt).slice(0,10);

  // ── Hour analytics ──
  const hourMap={};for(let h=0;h<24;h++)hourMap[h]={amt:0,orders:0};
  filtered.forEach(o=>{const h=new Date(o.closedAt||o.startMs||Date.now()).getHours();hourMap[h].orders++;hourMap[h].amt+=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);});
  const hourList=Object.values(hourMap).map((d,h)=>({h,...d}));
  const maxHourAmt=Math.max(...hourList.map(h=>h.amt),1);
  const peakHour=hourList.reduce((a,b)=>b.amt>a.amt?b:a,{h:12,amt:0});

  // ── Day of week ──
  const dowMap={0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  filtered.forEach(o=>{const d=new Date(o.closedAt||o.startMs||Date.now()).getDay();dowMap[d]+=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);});
  const maxDow=Math.max(...Object.values(dowMap),1);
  const dowNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // ── Dynamic trend (based on period) ──
  const ordAmt_=(o)=>(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);
  const buildTrend=()=>{
    // today/yesterday → show whole current month day by day
    if(period==="today"||period==="yesterday"){
      const yr=now.getFullYear(),mo=now.getMonth();
      const days=new Date(yr,mo+1,0).getDate();
      return Array.from({length:days},(_,i)=>{
        const d=new Date(yr,mo,i+1);const e=new Date(yr,mo,i+1,23,59,59,999);
        const amt=allOrders.filter(o=>{const od=new Date(ms_(o));return od>=d&&od<=e;}).reduce((s,o)=>s+ordAmt_(o),0);
        const isActive=period==="today"?d.toDateString()===now.toDateString():d.getDate()===now.getDate()-1;
        return{amt,label:String(i+1),isActive};
      });
    }
    // thisweek/lastweek → last 14 days daily
    if(period==="thisweek"||period==="lastweek"){
      return Array.from({length:14},(_,i)=>{
        const d=new Date(now);d.setDate(d.getDate()-(13-i));d.setHours(0,0,0,0);
        const e=new Date(d);e.setHours(23,59,59,999);
        const amt=allOrders.filter(o=>{const od=new Date(ms_(o));return od>=d&&od<=e;}).reduce((s,o)=>s+ordAmt_(o),0);
        const isActive=d.toDateString()===now.toDateString()||(period==="lastweek"&&i===6);
        return{amt,label:d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}),isActive};
      });
    }
    // thismonth/lastmonth/last3months → last 24 weeks
    if(period==="thismonth"||period==="lastmonth"||period==="last3months"){
      return Array.from({length:24},(_,i)=>{
        const wkStart=new Date(now);wkStart.setDate(now.getDate()-(23-i)*7);wkStart.setHours(0,0,0,0);
        const wkEnd=new Date(wkStart);wkEnd.setDate(wkStart.getDate()+6);wkEnd.setHours(23,59,59,999);
        const amt=allOrders.filter(o=>{const od=new Date(ms_(o));return od>=wkStart&&od<=wkEnd;}).reduce((s,o)=>s+ordAmt_(o),0);
        const isActive=period==="thismonth"&&now>=wkStart&&now<=wkEnd;
        return{amt,label:wkStart.toLocaleDateString("en-IN",{day:"numeric",month:"short"}),isActive};
      });
    }
    // last6months → all-time monthly
    if(period==="last6months"){
      if(allOrders.length===0)return[];
      const earliest=allOrders.reduce((a,o)=>{const d=new Date(ms_(o));return d<a?d:a;},new Date());
      const buckets=[];const cur=new Date(earliest.getFullYear(),earliest.getMonth(),1);
      while(cur<=now){
        const d=new Date(cur);const e=new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59,999);
        const amt=allOrders.filter(o=>{const od=new Date(ms_(o));return od>=d&&od<=e;}).reduce((s,o)=>s+ordAmt_(o),0);
        buckets.push({amt,label:d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"}),isActive:d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()});
        cur.setMonth(cur.getMonth()+1);
      }
      return buckets;
    }
    // all/custom → all-time yearly
    {
      if(allOrders.length===0)return[];
      const isMonth=["thismonth","lastmonth","last3months"].includes(period);
      const isBig=["last6months"].includes(period);
      if(isMonth||isBig){} // handled above
      // year/all: build yearly buckets from earliest order
      const earliest=allOrders.reduce((a,o)=>{const d=new Date(ms_(o));return d<a?d:a;},new Date());
      const buckets=[];
      for(let yr2=earliest.getFullYear();yr2<=now.getFullYear();yr2++){
        const d=new Date(yr2,0,1);const e=new Date(yr2,11,31,23,59,59,999);
        const amt=allOrders.filter(o=>{const od=new Date(ms_(o));return od>=d&&od<=e;}).reduce((s,o)=>s+ordAmt_(o),0);
        buckets.push({amt,label:String(yr2),isActive:yr2===now.getFullYear()});
      }
      return buckets;
    }
    return[];
  };
  const trend=buildTrend();
  const maxTrend=Math.max(...trend.map(d=>d.amt),1);

  // ── Staff analytics ──
  const staffMap={};
  filtered.forEach(o=>{const w=o.waiter||"Unknown";if(!staffMap[w])staffMap[w]={orders:0,amt:0};staffMap[w].orders++;staffMap[w].amt+=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);});
  const staffList2=Object.entries(staffMap).map(([n,d])=>({n,...d})).sort((a,b)=>b.amt-a.amt);

  // ── Payment analytics ──
  const payMap={cash:0,upi:0,other:0};const payCountMap={cash:0,upi:0,other:0};
  let totalCollected=0,totalDue=0;
  filtered.forEach(o=>{
    const amt=(o.items||[]).reduce((s,i)=>s+itemTotal(i),0);
    const paid=o.paidAmount||0;const m=(o.payMethod||"").toLowerCase();
    totalCollected+=paid;totalDue+=Math.max(0,amt-paid);
    if(m==="upi"){payMap.upi+=paid;payCountMap.upi++;}
    else if(m==="cash"){payMap.cash+=paid;payCountMap.cash++;}
    else{payMap.other+=paid;payCountMap.other++;}
  });

  const periodLabel=PERIODS.find(p=>p.id===period)?.l||(period==="custom"&&customDate?(customDateTo?`${customDate} → ${customDateTo}`:customDate):"Custom Range")||"All Time";

  const Bar=({pct,color,h=7})=>(<div style={{flex:1,background:T.border,borderRadius:4,overflow:"hidden",height:h}}><div style={{width:`${Math.min(100,pct||0)}%`,height:"100%",background:color||T.primary,borderRadius:4,transition:"width .4s"}}/></div>);
  const KPI=({label,val,color,sub})=>(<div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 12px",flex:1,minWidth:0}}><div style={{fontSize:9,fontWeight:800,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:2}}>{label}</div><div style={{fontSize:17,fontWeight:900,color:color||T.textH,lineHeight:1}}>{val}</div>{sub&&<div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{sub}</div>}</div>);
  const Sh=({children})=>(<div style={{fontSize:10,fontWeight:900,color:T.textMuted,textTransform:"uppercase",letterSpacing:0.8,margin:"14px 0 7px"}}>{children}</div>);

  const SUBTABS=[
    {id:"overview",ic:"📊",l:"Overview"},{id:"items",ic:"🍽",l:"Items"},
    {id:"categories",ic:"📁",l:"Categories"},{id:"floors",ic:"🏢",l:"Floors"},
    {id:"time",ic:"⏰",l:"Time"},{id:"staff",ic:"👤",l:"Staff"},{id:"payments",ic:"💳",l:"Payments"},
  ];

  return(<>
    {/* ── Header & period dropdown ── */}
    <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 14px 10px",marginBottom:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:15,fontWeight:900,color:T.textH}}>Reports</div>
        <div style={{fontSize:11,color:T.textMuted}}>{orderCount} orders</div>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setShowPeriodDrop(p=>!p)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",border:`2px solid ${T.primary}`,borderRadius:10,background:T.primaryL,color:T.primary,fontSize:13,fontWeight:800,cursor:"pointer"}}>
          <span>📅 {periodLabel}</span>
          <span style={{fontSize:11}}>{showPeriodDrop?"▲":"▼"}</span>
        </button>
        {showPeriodDrop&&<>
          <div style={{position:"fixed",inset:0,zIndex:98}} onClick={()=>setShowPeriodDrop(false)}/>
          <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",overflow:"hidden"}}>
            {PERIODS.map((p,i)=>(<div key={p.id} onClick={()=>{setPeriod(p.id);setShowPeriodDrop(false);}} style={{padding:"11px 14px",background:period===p.id?T.primaryL:undefined,color:period===p.id?T.primary:T.text,fontWeight:period===p.id?800:600,fontSize:13,cursor:"pointer",borderBottom:i<PERIODS.length-1?`1px solid ${T.border}`:undefined}}>{period===p.id?"✓ ":""}{p.l}</div>))}
          </div>
        </>}
      </div>
      {period==="custom"&&<div style={{display:"flex",gap:6,marginTop:8,alignItems:"center"}}>
        <input type="date" className="inp" value={customDate} onChange={e=>setCustomDate(e.target.value)} style={{fontSize:12,flex:1}}/>
        <span style={{fontSize:11,color:T.textMuted}}>→</span>
        <input type="date" className="inp" value={customDateTo} onChange={e=>setCustomDateTo(e.target.value)} style={{fontSize:12,flex:1}}/>
      </div>}
    </div>

    {/* ── Report type tabs ── */}
    <div style={{display:"flex",gap:4,overflowX:"auto",padding:"0 10px 10px",marginBottom:10,flexWrap:"wrap"}}>
      {SUBTABS.map(t=>(<button key={t.id} onClick={()=>setSub(t.id)} style={{padding:"6px 12px",border:`2px solid ${sub===t.id?T.primary:T.border}`,borderRadius:20,background:sub===t.id?T.primary:T.surface,color:sub===t.id?"#fff":T.textMid,fontSize:11,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>{t.ic} {t.l}</button>))}
    </div>

    <div style={{paddingBottom:16}}>

    {/* ══════════ OVERVIEW ══════════ */}
    {sub==="overview"&&(<>
      <div style={{display:"flex",gap:7,marginBottom:7,flexWrap:"wrap"}}>
        <KPI label="Revenue" val={`₹${revenue.toLocaleString()}`} color={T.green}/>
        <KPI label="Orders" val={orderCount} color={T.blue}/>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
        <KPI label="Avg Bill" val={`₹${avgBill}`} color={T.orange}/>
        <KPI label="Items Sold" val={itemsSold} color={T.primary}/>
      </div>

      <Sh>{["today","yesterday"].includes(period)?"Monthly Day-by-Day":["thisweek","lastweek"].includes(period)?"14-Day Trend":["thismonth","lastmonth","last3months"].includes(period)?"24-Week Trend":period==="last6months"?"All-Time Monthly":"All-Time Yearly"}</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 10px",marginBottom:12,overflowX:"auto"}}>
        {trend.length===0?<div style={{textAlign:"center",padding:20,color:T.textDim,fontSize:12}}>No data yet</div>:(()=>{
          const isNarrow=["today","yesterday"].includes(period)||trend.length>20;
          const bw=isNarrow?16:trend.length>14?24:36;
          return(
            <div style={{display:"flex",alignItems:"flex-end",gap:isNarrow?2:4,minWidth:trend.length*(bw+4)}}>
              {trend.map((d,i)=>{
                const barH=Math.round(Math.max(d.amt>0?6:2,(d.amt/maxTrend)*80));
                return(<div key={i} style={{flex:"0 0 auto",width:bw,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  {d.amt>0&&<div style={{fontSize:6,color:d.isActive?T.primary:T.textMuted,fontWeight:700,lineHeight:1,whiteSpace:"nowrap"}}>₹{d.amt>=1000?Math.round(d.amt/1000)+"k":d.amt}</div>}
                  <div style={{width:"100%",height:barH,background:d.isActive?T.primary:`${T.primary}55`,borderRadius:"3px 3px 0 0"}}/>
                  <div style={{fontSize:6,color:d.isActive?T.primary:T.textMuted,fontWeight:d.isActive?800:500,whiteSpace:"nowrap",textAlign:"center"}}>{d.label}</div>
                </div>);
              })}
            </div>
          );
        })()}
      </div>

      <Sh>Insights</Sh>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        {topSellers[0]&&<div style={{background:T.greenL,border:`1px solid ${T.green}40`,borderRadius:10,padding:"8px 12px",fontSize:12}}>🏆 <b>Best seller:</b> {topSellers[0].n} — {topSellers[0].qty} sold · ₹{topSellers[0].amt.toLocaleString()}</div>}
        {peakHour.amt>0&&<div style={{background:T.blueL,border:`1px solid ${T.blue}40`,borderRadius:10,padding:"8px 12px",fontSize:12}}>⏰ <b>Peak hour:</b> {peakHour.h}:00–{peakHour.h+1}:00 · ₹{peakHour.amt.toLocaleString()} revenue</div>}
        {catList[0]&&<div style={{background:T.primaryL,border:`1px solid ${T.primary}40`,borderRadius:10,padding:"8px 12px",fontSize:12}}>📁 <b>Top category:</b> {catList[0].n} — ₹{catList[0].amt.toLocaleString()} ({revenue>0?Math.round(catList[0].amt/revenue*100):0}% of revenue)</div>}
        {deadStock.length>0&&<div style={{background:"#fef3c7",border:"1px solid #f59e0b50",borderRadius:10,padding:"8px 12px",fontSize:12}}>⚠️ <b>{deadStock.length} items</b> not ordered this period — check Items → Dead Stock</div>}
        {slowMovers.length>0&&<div style={{background:"#fef2f2",border:"1px solid #dc262640",borderRadius:10,padding:"8px 12px",fontSize:12}}>📉 <b>{slowMovers.length} slow movers</b> — low sales, consider promotion or removal</div>}
        {totalDue>0&&<div style={{background:"#fef2f2",border:"1px solid #dc262640",borderRadius:10,padding:"8px 12px",fontSize:12}}>💸 <b>₹{totalDue.toLocaleString()} outstanding</b> — unpaid bills pending</div>}
      </div>

      <Sh>Top 5 Items</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {topSellers.length===0&&<div style={{padding:20,textAlign:"center",color:T.textDim,fontSize:12}}>No orders yet</div>}
        {topSellers.slice(0,5).map((it,i)=>(<div key={it.n} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<4&&topSellers.length>i+1?`1px solid ${T.border}`:undefined}}>
          <div style={{width:20,height:20,borderRadius:6,background:["#f59e0b","#94a3b8","#b45309"][i]||T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:i<3?"#fff":T.textMuted,flexShrink:0}}>{i+1}</div>
          <div style={{flex:1,fontSize:12,fontWeight:700,minWidth:0}}>{it.n}</div>
          <div style={{fontSize:11,color:T.textMuted,flexShrink:0}}>×{it.qty}</div>
          <div style={{fontSize:12,fontWeight:900,color:T.green,flexShrink:0}}>₹{it.amt.toLocaleString()}</div>
        </div>))}
      </div>
    </>)}

    {/* ══════════ ITEMS ══════════ */}
    {sub==="items"&&(<>
      <Sh>🏆 Top Sellers (by quantity)</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {topSellers.length===0&&<div style={{padding:20,textAlign:"center",color:T.textDim,fontSize:12}}>No data</div>}
        {topSellers.map((it,i)=>{const mx=topSellers[0]?.qty||1;return(<div key={it.n} style={{padding:"8px 12px",borderBottom:i<topSellers.length-1?`1px solid ${T.border}`:undefined}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
            <span style={{fontSize:10,fontWeight:900,color:["#f59e0b","#94a3b8","#b45309"][i]||T.textMuted,minWidth:18}}>#{i+1}</span>
            <span style={{flex:1,fontSize:12,fontWeight:700}}>{it.n}</span>
            <span style={{fontSize:11,color:T.textMuted}}>×{it.qty}</span>
            <span style={{fontSize:12,fontWeight:900,color:T.green,minWidth:50,textAlign:"right"}}>₹{it.amt.toLocaleString()}</span>
          </div>
          <Bar pct={(it.qty/mx)*100} color={i===0?T.primary:`${T.primary}70`} h={5}/>
        </div>);})}
      </div>

      <Sh>💰 Top Revenue Generators</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {topRevenue.map((it,i)=>{const mx=topRevenue[0]?.amt||1;return(<div key={it.n} style={{padding:"8px 12px",borderBottom:i<topRevenue.length-1?`1px solid ${T.border}`:undefined}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
            <span style={{fontSize:10,fontWeight:900,color:T.textMuted,minWidth:18}}>#{i+1}</span>
            <span style={{flex:1,fontSize:12,fontWeight:700}}>{it.n}</span>
            <span style={{fontSize:11,color:T.textMuted}}>×{it.qty}</span>
            <span style={{fontSize:12,fontWeight:900,color:T.green,minWidth:50,textAlign:"right"}}>₹{it.amt.toLocaleString()}</span>
          </div>
          <Bar pct={(it.amt/mx)*100} color={T.green} h={5}/>
        </div>);})}
      </div>

      <Sh>📉 Slow Movers (bottom sellers)</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {slowMovers.length===0&&<div style={{padding:16,textAlign:"center",color:T.textDim,fontSize:12}}>All items selling well ✓</div>}
        {slowMovers.map((it,i)=>(<div key={it.n} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<slowMovers.length-1?`1px solid ${T.border}`:undefined}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700}}>{it.n}</div>
            <div style={{fontSize:10,color:T.orange,marginTop:1}}>Only ×{it.qty} sold — low demand, review price or placement</div>
          </div>
          <div style={{fontSize:9,fontWeight:800,background:`${T.orange}20`,color:T.orange,borderRadius:8,padding:"2px 7px",flexShrink:0}}>SLOW</div>
        </div>))}
      </div>

      <Sh>🚫 Dead Stock — not ordered this period</Sh>
      <div style={{background:"#fffbeb",border:"1px solid #f59e0b40",borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {deadStock.length===0&&<div style={{padding:16,textAlign:"center",color:"#92400e",fontSize:12}}>All menu items ordered ✓</div>}
        {deadStock.map((it,i)=>(<div key={it.id||it.name} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<deadStock.length-1?"1px solid #f59e0b25":undefined}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:"#92400e"}}>{it.name}</div>
            <div style={{fontSize:10,color:"#b45309",marginTop:1}}>Zero orders — remove from menu or promote actively</div>
          </div>
          <div style={{fontSize:9,fontWeight:800,background:"#f59e0b",color:"#fff",borderRadius:8,padding:"2px 7px",flexShrink:0}}>DEAD</div>
        </div>))}
      </div>
    </>)}

    {/* ══════════ CATEGORIES ══════════ */}
    {sub==="categories"&&(<>
      <Sh>Revenue by Category</Sh>
      {catList.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:12}}>No data for this period</div>}
      {catList.map((cat,i)=>(<div key={cat.n} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:6,overflow:"hidden"}}>
        <div style={{padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}} onClick={()=>setExpandedCat(expandedCat===cat.n?null:cat.n)}>
          <div style={{width:9,height:9,borderRadius:2,background:COLORS[i%COLORS.length],flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:800}}>{cat.n}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:4}}>
              <Bar pct={(cat.amt/maxCatAmt)*100} color={COLORS[i%COLORS.length]} h={6}/>
              <span style={{fontSize:10,color:T.textMuted,flexShrink:0,minWidth:28}}>{revenue>0?Math.round(cat.amt/revenue*100):0}%</span>
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginRight:4}}>
            <div style={{fontSize:13,fontWeight:900,color:COLORS[i%COLORS.length]}}>₹{cat.amt.toLocaleString()}</div>
            <div style={{fontSize:10,color:T.textMuted}}>×{cat.qty}</div>
          </div>
          <span style={{fontSize:10,color:T.textMuted}}>{expandedCat===cat.n?"▲":"▼"}</span>
        </div>
        {expandedCat===cat.n&&<div style={{borderTop:`1px solid ${T.border}`,background:T.surfaceAlt}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 38px 58px",fontSize:10,fontWeight:800,color:T.textMuted,padding:"4px 12px",borderBottom:`1px solid ${T.border}`}}>
            <span>Item</span><span style={{textAlign:"right"}}>Qty</span><span style={{textAlign:"right"}}>Rev</span>
          </div>
          {Object.entries(cat.items).sort((a,b)=>b[1].amt-a[1].amt).map(([nm,d])=>(<div key={nm} style={{display:"grid",gridTemplateColumns:"1fr 38px 58px",padding:"5px 12px",borderBottom:`1px solid ${T.border}50`}}>
            <span style={{fontSize:11,fontWeight:600}}>{nm}</span>
            <span style={{fontSize:11,fontWeight:700,color:T.textMid,textAlign:"right"}}>×{d.qty}</span>
            <span style={{fontSize:11,fontWeight:800,color:COLORS[i%COLORS.length],textAlign:"right"}}>₹{d.amt}</span>
          </div>))}
        </div>}
      </div>))}
    </>)}

    {/* ══════════ FLOORS ══════════ */}
    {sub==="floors"&&(<>
      <Sh>Revenue by Floor</Sh>
      {floorList.length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:12}}>No data</div>}
      {floorList.map((fl,i)=>(<div key={fl.n} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 12px",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
          <div style={{flex:1,fontSize:13,fontWeight:800}}>{fl.n}</div>
          <div style={{fontSize:13,fontWeight:900,color:COLORS[i%COLORS.length]}}>₹{fl.amt.toLocaleString()}</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
          <Bar pct={revenue>0?(fl.amt/revenue)*100:0} color={COLORS[i%COLORS.length]}/>
          <span style={{fontSize:10,color:T.textMuted,flexShrink:0,minWidth:28}}>{revenue>0?Math.round(fl.amt/revenue*100):0}%</span>
        </div>
        <div style={{display:"flex",gap:12,fontSize:10,color:T.textMuted}}>
          <span>{fl.orders} orders</span><span>Avg ₹{fl.orders?Math.round(fl.amt/fl.orders):0}/order</span>
        </div>
      </div>))}
      <Sh>Top Tables by Revenue</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {tableList.length===0&&<div style={{padding:16,textAlign:"center",color:T.textDim,fontSize:12}}>No data</div>}
        {tableList.map((t,i)=>(<div key={t.n} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",borderBottom:i<tableList.length-1?`1px solid ${T.border}`:undefined}}>
          <span style={{fontSize:10,fontWeight:900,color:T.textMuted,minWidth:18}}>#{i+1}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700}}>{t.n}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{t.orders} orders · avg ₹{t.orders?Math.round(t.amt/t.orders):0}</div>
          </div>
          <div style={{fontSize:13,fontWeight:900,color:T.primary}}>₹{t.amt.toLocaleString()}</div>
        </div>))}
      </div>
    </>)}

    {/* ══════════ TIME ══════════ */}
    {sub==="time"&&(<>
      <Sh>Revenue by Hour (8am–11pm)</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 8px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:2}}>
          {hourList.filter(h=>h.h>=8&&h.h<=23).map(h=>{
            const barH=Math.round(Math.max(h.amt>0?6:2,(h.amt/maxHourAmt)*90));
            const isPeak=h.h===peakHour.h&&peakHour.amt>0;
            return(<div key={h.h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              {h.amt>0&&<div style={{fontSize:7,color:isPeak?T.orange:T.textMuted,fontWeight:700,lineHeight:1}}>{h.amt>=1000?Math.round(h.amt/1000)+"k":Math.round(h.amt)}</div>}
              <div style={{width:"100%",height:barH,background:isPeak?T.orange:T.primary,borderRadius:"3px 3px 0 0",opacity:isPeak?1:0.7}}/>
              <div style={{fontSize:7,color:isPeak?T.orange:T.textMuted,fontWeight:isPeak?800:500,lineHeight:1}}>{h.h}</div>
            </div>);
          })}
        </div>
        {peakHour.amt>0&&<div style={{fontSize:11,color:T.orange,fontWeight:700,marginTop:10,textAlign:"center",background:`${T.orange}15`,borderRadius:8,padding:"5px 8px"}}>⏰ Peak: {peakHour.h}:00–{peakHour.h+1}:00 · ₹{peakHour.amt.toLocaleString()}</div>}
      </div>
      <Sh>Revenue by Day of Week</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 10px",marginBottom:12}}>
        <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
          {dowNames.map((d,i)=>{
            const barH=Math.round(Math.max(dowMap[i]>0?6:2,(dowMap[i]/maxDow)*90));
            const isBest=dowMap[i]===Math.max(...Object.values(dowMap))&&dowMap[i]>0;
            return(<div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              {dowMap[i]>0&&<div style={{fontSize:8,color:isBest?T.primary:T.textMuted,fontWeight:700,lineHeight:1}}>{dowMap[i]>=1000?Math.round(dowMap[i]/1000)+"k":Math.round(dowMap[i])}</div>}
              <div style={{width:"100%",height:barH,background:isBest?T.primary:`${T.primary}70`,borderRadius:"3px 3px 0 0"}}/>
              <div style={{fontSize:10,color:isBest?T.primary:T.textMuted,fontWeight:isBest?800:600}}>{d}</div>
            </div>);
          })}
        </div>
      </div>
    </>)}

    {/* ══════════ STAFF ══════════ */}
    {sub==="staff"&&(<>
      <Sh>Performance by Staff Member</Sh>
      {staffList2.filter(s=>s.n!=="Unknown"&&s.n!=="Self Order").length===0&&<div style={{textAlign:"center",padding:30,color:T.textDim,fontSize:12}}>No staff data — add waiter names to orders</div>}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {staffList2.filter(s=>s.n!=="Unknown"&&s.n!=="Self Order").map((s,i)=>{const mx=staffList2[0]?.amt||1;return(<div key={s.n} style={{padding:"8px 12px",borderBottom:i<staffList2.length-1?`1px solid ${T.border}`:undefined}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{flex:1,fontSize:12,fontWeight:700}}>👤 {s.n}</span>
            <span style={{fontSize:11,color:T.textMuted}}>{s.orders} orders</span>
            <span style={{fontSize:13,fontWeight:900,color:COLORS[i%COLORS.length]}}>₹{s.amt.toLocaleString()}</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Bar pct={(s.amt/mx)*100} color={COLORS[i%COLORS.length]}/>
            <span style={{fontSize:10,color:T.textMuted,flexShrink:0}}>avg ₹{s.orders?Math.round(s.amt/s.orders):0}</span>
          </div>
        </div>);})}
      </div>
    </>)}

    {/* ══════════ PAYMENTS ══════════ */}
    {sub==="payments"&&(<>
      <div style={{display:"flex",gap:7,marginBottom:7}}>
        <KPI label="Total Billed" val={`₹${revenue.toLocaleString()}`} color={T.primary}/>
        <KPI label="Collected" val={`₹${totalCollected.toLocaleString()}`} color={T.green}/>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:12}}>
        <KPI label="Outstanding" val={`₹${totalDue.toLocaleString()}`} color={totalDue>0?T.red:T.textMuted}/>
        <KPI label="Collection %" val={`${revenue>0?Math.round(totalCollected/revenue*100):0}%`} color={T.blue}/>
      </div>
      <Sh>Payment Method Breakdown</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        {[{k:"cash",label:"💵 Cash",color:"#16a34a"},{k:"upi",label:"📲 UPI",color:"#7c3aed"},{k:"other",label:"🏦 Other",color:T.textMuted}].map((m,i)=>{
          const pct=totalCollected>0?Math.round(payMap[m.k]/totalCollected*100):0;
          return(<div key={m.k} style={{padding:"10px 12px",borderBottom:i<2?`1px solid ${T.border}`:undefined}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <span style={{flex:1,fontSize:12,fontWeight:700}}>{m.label}</span>
              <span style={{fontSize:11,color:T.textMuted}}>{payCountMap[m.k]} orders</span>
              <span style={{fontSize:13,fontWeight:900,color:m.color}}>₹{payMap[m.k].toLocaleString()}</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Bar pct={pct} color={m.color}/>
              <span style={{fontSize:11,fontWeight:700,color:m.color,minWidth:28}}>{pct}%</span>
            </div>
          </div>);
        })}
      </div>
      <Sh>Collection Progress</Sh>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",marginBottom:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
          <Bar pct={revenue>0?(totalCollected/revenue)*100:0} color={T.green} h={10}/>
          <span style={{fontSize:12,fontWeight:800,color:T.green,flexShrink:0}}>{revenue>0?Math.round(totalCollected/revenue*100):0}%</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted}}>
          <span>Billed ₹{revenue.toLocaleString()}</span>
          <span style={{color:T.green}}>Collected ₹{totalCollected.toLocaleString()}</span>
          <span style={{color:totalDue>0?T.red:T.green}}>Due ₹{totalDue.toLocaleString()}</span>
        </div>
      </div>
    </>)}

    </div>
  </>);
}

// ─── BACKUP HELPERS ───────────────────────────────────────────────────────────
async function exportBackup(rid,showNotif){
  if(!rid)return;
  const snap=await new Promise(res=>onValue(ref(db,`restaurants/${rid}`),res,{onlyOnce:true}));
  const data=snap.val();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`modpos_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  showNotif("Backup downloaded ✓");
}
async function importBackup(e,rid,showNotif){
  if(!rid||!e.target.files[0])return;
  const text=await e.target.files[0].text();
  try{
    const data=JSON.parse(text);
    await set(ref(db,`restaurants/${rid}`),data);
    showNotif("Backup restored ✓ — refresh page");
  }catch{showNotif("Invalid backup file ✗");}
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function buildLabelPreviewHtml(cfg){
  const lw=cfg.labelW||50,lh=cfg.labelH||25,font=cfg.labelFont||"Arial";
  const ptop=Math.max(0.5,1.5+(cfg.labelVShift||0));
  const pt=(px)=>Math.round((px||9)*0.75);
  const fs=(sz,bold,italic)=>"font-size:"+pt(sz)+"pt;font-weight:"+(bold?"bold":"normal")+";font-style:"+(italic?"italic":"normal")+";";
  const demo=[{name:"Strawberry Milkshake",varName:"Large",addons:[{name:"Extra Cream",qty:1}],note:"Less sugar",_piece:1,_total:2},{name:"Butterscotch Falooda",varName:"",addons:[],note:"",_piece:1,_total:1}];
  const rows=demo.map(it=>{
    const nm=cfg.labelShowName!==false?"<div class='nm' style='"+fs(cfg.labelNameSize||11,cfg.labelNameBold!==false,cfg.labelNameItalic)+"'>"+it.name+"</div>":"";
    const vr=cfg.labelShowVar!==false&&it.varName?"<div class='sub' style='"+fs(cfg.labelVarSize||9,cfg.labelVarBold,cfg.labelVarItalic)+"'>("+it.varName+")</div>":"";
    const ad=cfg.labelShowAddons!==false&&it.addons&&it.addons.length?"<div class='sub' style='"+fs(cfg.labelAddonSize||9,cfg.labelAddonBold,cfg.labelAddonItalic)+"'>+ "+it.addons.map(a=>a.name).join(", ")+"</div>":"";
    const nt=cfg.labelShowNotes!==false&&it.note?"<div class='nt' style='"+fs(cfg.labelNoteSize||9,cfg.labelNoteBold,cfg.labelNoteItalic)+"'>📝 "+it.note+"</div>":"";
    const pcs=it._total>1?"<div class='pcs'>"+it._piece+"/"+it._total+"</div>":"";
    return "<div class='lbl'>"+nm+vr+ad+nt+pcs+"</div>";
  }).join("");
  return"<!DOCTYPE html><html><head><meta charset='UTF-8'><style>"
    +"@page{size:"+lw+"mm "+lh+"mm;margin:0;}"
    +"*{box-sizing:border-box;margin:0;padding:0;}"
    +"html,body{width:"+lw+"mm;margin:0;padding:0;background:#fff;font-family:'"+font+"',Arial,sans-serif;}"
    +".lbl{width:"+lw+"mm;height:"+lh+"mm;padding:"+ptop+"mm 2mm 1mm 2mm;overflow:hidden;"
      +"page-break-after:always;break-after:page;page-break-inside:avoid;break-inside:avoid;"
      +"display:flex;flex-direction:column;justify-content:flex-start;"
      +"border:1px dashed #bbb;}"
    +".lbl:last-child{page-break-after:auto;break-after:auto;}"
    +".nm{line-height:1.15;color:#000;word-wrap:break-word;word-break:break-word;}"
    +".sub{color:#444;margin-top:0.4mm;line-height:1.1;word-wrap:break-word;}"
    +".nt{color:#c05000;margin-top:0.4mm;}"
    +".pcs{font-size:6pt;margin-top:0.5mm;text-align:right;color:#666;}"
    +"</style></head><body>"+rows+"</body></html>";
}

function SettingsTab({floors,setFloors,staff,setStaff,fontSize,setFontSize,printCfg,setPrintCfg,kitchenCfg,setKitchenCfg,onStaff,showNotif,allTables,staffList,setStaffList,restaurantId,menuData,restInfo,kitchenLabels,onSignOut,btPrinter,onConnectBt,onTestPrint,driveConnected,lastBackupTs,onConnectDrive,onBackupNow,onDisconnectDrive,buildReceiptHtml}){
  const[sub,setSub]=useState("general");
  return(<>
    <div className="shdr"><div className="stitle">Settings</div></div>
    <div className="ftabs mb12">
      {["general","menu","tables","printers","kitchen","staff"].map(s=>(<div key={s} className={`ftab ${sub===s?"active":""}`} style={{textTransform:"capitalize"}} onClick={()=>setSub(s)}>{s}</div>))}
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
      <div className="sg"><div className="sg-lbl">Cancel Order PIN</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>Staff need this PIN to cancel placed orders. Owner can always cancel.</div>
        <div className="ig"><div className="ilbl">Set PIN (4 digits)</div>
          <input className="inp" type="password" inputMode="numeric" maxLength={4} placeholder="e.g. 1234"
            defaultValue={restInfo?.cancelPin||""} onBlur={e=>{if(restaurantId)set(ref(db,`restaurants/${restaurantId}/info/cancelPin`),e.target.value);showNotif("PIN saved ✓");}}/>
        </div>
      </div>
      <div className="sg"><div className="sg-lbl">Backup & Restore</div>
        <div className="row">
          <button className="btn btn-g btn-sm f1" onClick={()=>exportBackup(restaurantId,showNotif)}>⬇️ Export JSON</button>
          <label className="btn btn-out btn-sm f1" style={{cursor:"pointer"}}>
            ⬆️ Import JSON
            <input type="file" accept=".json" style={{display:"none"}} onChange={e=>importBackup(e,restaurantId,showNotif)}/>
          </label>
        </div>
      </div>
      <div className="sg"><div className="sg-lbl">Account</div>
        <button className="btn" style={{background:"#dc2626",color:"#fff",border:"none",width:"100%",fontWeight:800,fontSize:14}} onClick={onSignOut}>🚪 Logout</button>
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
      {floors.map(fl=>(<FloorTableEditor key={fl.id} floor={fl} onUpdate={(updatedFloor)=>setFloors(p=>p.map(f=>f.id===fl.id?updatedFloor:f))} onDeleteFloor={(fid)=>{setFloors(p=>p.filter(f=>f.id!==fid));showNotif("Floor removed ✓");}} showNotif={showNotif}/>))}
      <button className="btn btn-g btn-sm mt8" style={{width:"100%"}} onClick={()=>{const name=window.prompt("New floor name:");if(name){setFloors(p=>[...p,{id:`f${Date.now()}`,name,tables:[],stickerTables:[]}]);showNotif(`${name} added ✓`);}}}>+ Add Floor</button>
    </>)}

    {sub==="printers"&&(<>
      <div className="card mb12" style={{background:T.blueL,borderColor:`${T.blue}40`}}>
        <div style={{fontSize:13,fontWeight:700,color:T.blue,marginBottom:4}}>🖨 How to connect your printer</div>
        <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>
          <b>Step 1:</b> On your Android device go to <b>Settings → Bluetooth</b> and pair your printer.<br/>
          <b>Step 2:</b> Install <b>RawBT Print Service</b> from Play Store (free) or your printer's app.<br/>
          <b>Step 3:</b> Press <b>Test Print</b> below — the Android print dialog will open.<br/>
          <b>Step 4:</b> Select your printer and set paper size to <b>58mm</b> or <b>80mm</b>.
        </div>
      </div>
      <div className="printer-card" style={{borderColor:btPrinter?`${T.green}60`:`${T.primary}40`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div className="printer-dot" style={{background:btPrinter?T.green:T.border}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800}}>🧾 Bill Printer</div>
            <div style={{fontSize:11,color:T.textMuted}}>{btPrinter?btPrinter.name+" · BLE Connected":"Not connected via BLE"}</div>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:btPrinter?T.green:T.textMuted,background:btPrinter?T.greenL:T.surfaceAlt,padding:"3px 9px",borderRadius:20}}>{btPrinter?"Connected":"Paired via OS"}</span>
        </div>
        <div style={{fontSize:12,color:T.textMid,marginBottom:8}}>Bills print when you press 🖨 in the order/payment screen. Paper size is set in Android print dialog.</div>
        <div className="row">
          <button className="btn btn-g btn-sm f1" onClick={onConnectBt}>📶 BLE Connect</button>
          <button className="btn btn-out btn-sm f1" onClick={onTestPrint}>🖨 Test Print</button>
        </div>
      </div>
      <div className="card mb12" style={{background:T.surfaceAlt}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>🧾 Bill Paper Width</div>
        <div style={{display:"flex",gap:8}}>
          {[58,80].map(w=>(<button key={w} className={`sbtn ${(printCfg.paperWidth||58)===w?"sel":""}`} onClick={()=>setPrintCfg(p=>({...p,paperWidth:w}))}>{w}mm</button>))}
        </div>
      </div>
      {/* Label printer settings */}
      <div className="card mb12" style={{background:T.surfaceAlt}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:8}}>🏷️ Label Printer Settings</div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Label Size</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {[{w:40,h:25,l:"40×25"},{w:50,h:25,l:"50×25"},{w:57,h:32,l:"57×32"},{w:100,h:50,l:"100×50"}].map(p=>(
            <button key={p.l} className={`sbtn ${(printCfg.labelW||50)===p.w&&(printCfg.labelH||25)===p.h?"sel":""}`}
              onClick={()=>setPrintCfg(c=>({...c,labelW:p.w,labelH:p.h}))}>{p.l}mm</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:11,color:T.textMuted}}>Custom:</span>
          <input className="inp" style={{width:60}} type="number" placeholder="W" value={printCfg.labelW||50}
            onChange={e=>setPrintCfg(p=>({...p,labelW:+e.target.value}))}/>
          <span style={{fontSize:11}}>×</span>
          <input className="inp" style={{width:60}} type="number" placeholder="H" value={printCfg.labelH||25}
            onChange={e=>setPrintCfg(p=>({...p,labelH:+e.target.value}))}/>
          <span style={{fontSize:11,color:T.textMuted}}>mm</span>
        </div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Vertical Shift (mm) · 0 = −12mm from edge</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
          {[-28,-24,-20,-16,-12,-8,-4,0,4,8,12].map(v=>(
            <button key={v} className={`sbtn ${(printCfg.labelVShift??-12)===v?"sel":""}`} onClick={()=>setPrintCfg(p=>({...p,labelVShift:v}))}>{v>=0?`+${v}`:v}</button>
          ))}
        </div>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:8}}>Negative shifts content up. Default (0) = −12mm from label top.</div>
      </div>

      {/* Label content & style settings */}
      <div className="card mb12" style={{background:T.surfaceAlt}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:8}}>🏷️ Label Print Content</div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Font Family</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {["Arial","Courier New","Times New Roman","Verdana","Georgia"].map(f=>(
            <button key={f} className={`sbtn ${(printCfg.labelFont||"Arial")===f?"sel":""}`} style={{fontSize:10,padding:"4px 8px"}} onClick={()=>setPrintCfg(p=>({...p,labelFont:f}))}>{f}</button>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Fields to Print</div>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:8}}>Toggle · Size · B · I per field</div>
        {[
          {showKey:"labelShowName",szKey:"labelNameSize",boldKey:"labelNameBold",italicKey:"labelNameItalic",label:"Item Name",defSz:11,defBold:true,defShow:true},
          {showKey:"labelShowVar",szKey:"labelVarSize",boldKey:"labelVarBold",italicKey:"labelVarItalic",label:"Variation",defSz:9,defBold:false,defShow:true},
          {showKey:"labelShowAddons",szKey:"labelAddonSize",boldKey:"labelAddonBold",italicKey:"labelAddonItalic",label:"Add-ons",defSz:9,defBold:false,defShow:true},
          {showKey:"labelShowNotes",szKey:"labelNoteSize",boldKey:"labelNoteBold",italicKey:"labelNoteItalic",label:"Notes",defSz:9,defBold:false,defShow:true},
          {showKey:"labelShowPrice",szKey:"labelPriceSize",boldKey:"labelPriceBold",italicKey:"labelPriceItalic",label:"Price",defSz:10,defBold:true,defShow:false},
        ].map(({showKey,szKey,boldKey,italicKey,label,defSz,defBold,defShow})=>{
          const shown=printCfg[showKey]??defShow;
          const bold=printCfg[boldKey]??defBold;
          const italic=printCfg[italicKey]??false;
          return(<div key={showKey} style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,flexWrap:"wrap"}}>
            <div onClick={()=>setPrintCfg(p=>({...p,[showKey]:!shown}))} style={{width:34,height:20,borderRadius:10,background:shown?T.primary:T.border,display:"flex",alignItems:"center",padding:"0 3px",cursor:"pointer",flexShrink:0,transition:"background .15s"}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",marginLeft:shown?14:0,transition:"margin .15s"}}/>
            </div>
            <div style={{fontSize:12,width:68,flexShrink:0,color:shown?T.text:T.textMuted}}>{label}</div>
            <input type="number" className="inp" min={6} max={24} value={printCfg[szKey]??defSz} onChange={e=>setPrintCfg(p=>({...p,[szKey]:+e.target.value}))} style={{width:46,textAlign:"center",fontSize:11,opacity:shown?1:0.4}}/>
            <button className={`sbtn ${bold?"sel":""}`} style={{width:30,padding:"2px 0",fontWeight:"bold",fontSize:12,opacity:shown?1:0.4}} onClick={()=>setPrintCfg(p=>({...p,[boldKey]:!bold}))}>B</button>
            <button className={`sbtn ${italic?"sel":""}`} style={{width:30,padding:"2px 0",fontStyle:"italic",fontSize:12,opacity:shown?1:0.4}} onClick={()=>setPrintCfg(p=>({...p,[italicKey]:!italic}))}>I</button>
          </div>);
        })}
        <div className="row mt8" style={{gap:8}}>
          <button className="btn btn-out btn-sm f1" onClick={()=>{const w=window.open("","_blank","width=320,height=400");if(w){w.document.write(buildLabelPreviewHtml(printCfg));w.document.close();}}}>👁 Preview</button>
          <button className="btn btn-g btn-sm f1" onClick={()=>{localStorage.setItem("modpos_printcfg",JSON.stringify(printCfg));showNotif("Label settings saved ✓");}}>💾 Save</button>
        </div>
      </div>

      {/* Thermal / Bill printer settings — merged from Print tab */}
      <div className="card mb12" style={{background:T.surfaceAlt}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:8}}>🧾 Thermal Printer Settings</div>
        <div className="ig"><div className="ilbl">Header / Address</div><textarea className="inp" rows={2} defaultValue={printCfg.header} style={{resize:"none"}} onChange={e=>setPrintCfg(p=>({...p,header:e.target.value}))}/></div>
        <div className="ig"><div className="ilbl">Footer Text</div><input className="inp" defaultValue={printCfg.footer} onChange={e=>setPrintCfg(p=>({...p,footer:e.target.value}))}/></div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Paper Width</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {[58,80].map(w=>(<button key={w} className={`sbtn ${(printCfg.paperWidth||58)===w?"sel":""}`} onClick={()=>setPrintCfg(p=>({...p,paperWidth:w}))}>{w}mm</button>))}
        </div>
        <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Include on Bill</div>
        {[{k:"companyName",l:"Company Name"},{k:"time",l:"Time"},{k:"table",l:"Table"},{k:"qty",l:"Quantity"},{k:"price",l:"Price"},{k:"desc",l:"Descriptions"},{k:"tax",l:"GST"},{k:"staffName",l:"Staff Name"},{k:"itemNotesPrint",l:"Item Notes"}].map(({k,l})=>(<div key={k} className="prow" onClick={()=>setPrintCfg(p=>({...p,[k]:!p[k]}))}>
          <div className={`pbox ${printCfg[k]?"on":""}`}>{printCfg[k]&&<span style={{color:"#fff",fontSize:12}}>✓</span>}</div>
          <div className="plbl2">{l}</div>
        </div>))}
        <div className="row mt8" style={{gap:8}}>
          <button className="btn btn-out btn-sm f1" onClick={onTestPrint}>👁 Preview</button>
          <button className="btn btn-g btn-sm f1" onClick={()=>{localStorage.setItem("modpos_printcfg",JSON.stringify(printCfg));showNotif("Print settings saved ✓");}}>💾 Save</button>
        </div>
      </div>
    </>)}

    {sub==="kitchen"&&(<>
      <div className="card mb12"><div className="clbl">Kitchen Names</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>Rename each kitchen station as shown in the Kitchen tab and menu editor.</div>
        {KITCHENS.map((k,i)=>(<div key={k} className="ig" style={{marginBottom:6}}>
          <div className="ilbl">{k}</div>
          <input className="inp" defaultValue={kitchenLabels?.[i]||k} placeholder={k}
            onBlur={e=>{
              const v=e.target.value.trim()||k;
              if(restaurantId){
                set(ref(db,`restaurants/${restaurantId}/info/kitchenLabels/${k}`),v);
                set(ref(db,`restaurants/${restaurantId}/info/kitchenLabels/${i}`),v);
              }
              showNotif("Kitchen name saved ✓");
            }}/>
        </div>))}
      </div>
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
function FloorTableEditor({floor,onUpdate,onDeleteFloor,showNotif}){
  const[editing,setEditing]=useState(null);
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
          {onDeleteFloor&&<button className="btn btn-xs" style={{background:"#fee2e2",color:"#dc2626",border:"1px solid #dc262630"}} onClick={()=>{if(window.confirm(`Delete floor "${floor.name}"? All its tables will be removed.`))onDeleteFloor(floor.id);}}>🗑</button>}
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
  const[kitchen,setKitchen]=useState(cat?.kitchen||"Kitchen 1");
  const[addons,setAddons]=useState(cat?.addons||[]);
  const[vars,setVars]=useState(cat?.vars||[]);
  const[newAddon,setNewAddon]=useState({name:"",price:""});
  const[newVar,setNewVar]=useState({n:"",p:""});
  const KITCHENS=["Kitchen 1","Kitchen 2","Kitchen 3","Bar","Kitchen 4"];
  return(<>
    <div className="ohdr mb12">
      <button className="bbtn" onClick={onBack}>←</button>
      <div className="otitle">{cat?"Edit Category":"Add Category"}</div>
    </div>
    <div className="ig"><div className="ilbl">Category Name</div><input className="inp" placeholder="e.g. Ice Cream, Mojito..." value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
    <div className="ig"><div className="ilbl">Default Kitchen</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Preset for all items in this category · changeable per item</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {KITCHENS.map(k=>(<button key={k} className={`sbtn ${kitchen===k?"sel":""}`} style={{fontSize:12}} onClick={()=>setKitchen(k)}>{k}</button>))}
      </div>
    </div>
    <div className="ig"><div className="ilbl">Default Variations ({vars.length})</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Preset for all items · changeable per item</div>
      {vars.map((v,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
        <input className="inp" style={{flex:2}} value={v.n} placeholder="e.g. Small, Large" onChange={e=>setVars(p=>p.map((x,j)=>j===i?{...x,n:e.target.value}:x))}/>
        <input className="inp" style={{flex:1}} value={v.p} placeholder="+₹" type="number" onChange={e=>setVars(p=>p.map((x,j)=>j===i?{...x,p:Number(e.target.value)}:x))}/>
        <button className="btn btn-xs" style={{background:T.redL,color:T.red}} onClick={()=>setVars(p=>p.filter((_,j)=>j!==i))}>✕</button>
      </div>))}
      <div style={{display:"flex",gap:6}}>
        <input className="inp" style={{flex:2}} value={newVar.n} placeholder="Variation name" onChange={e=>setNewVar(p=>({...p,n:e.target.value}))}/>
        <input className="inp" style={{flex:1}} value={newVar.p} placeholder="+₹" type="number" onChange={e=>setNewVar(p=>({...p,p:e.target.value}))}/>
        <button className="btn btn-g btn-sm" onClick={()=>{if(!newVar.n)return;setVars(p=>[...p,{n:newVar.n,p:Number(newVar.p)||0}]);setNewVar({n:"",p:""});}}>+</button>
      </div>
    </div>
    <div className="ig"><div className="ilbl">Default Add-ons ({addons.length})</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Preset for all items · changeable per item</div>
      {addons.map((a,i)=>(<div key={i} style={{display:"flex",gap:4,marginBottom:5,alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          <button className="btn btn-xs" style={{padding:"1px 4px",fontSize:10,opacity:i===0?.3:1}} disabled={i===0} onClick={()=>setAddons(p=>{const a=[...p];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}>↑</button>
          <button className="btn btn-xs" style={{padding:"1px 4px",fontSize:10,opacity:i===addons.length-1?.3:1}} disabled={i===addons.length-1} onClick={()=>setAddons(p=>{const a=[...p];[a[i],a[i+1]]=[a[i+1],a[i]];return a;})}>↓</button>
        </div>
        <input className="inp" style={{flex:2}} value={a.name} placeholder="e.g. Extra Scoop" onChange={e=>setAddons(p=>p.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/>
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
      <button className="btn btn-g f1" onClick={()=>{if(!name.trim()){return;}onSave({...cat,name:name.trim(),kitchen,vars,addons});}}>✓ Save</button>
    </div>
  </>);
}

// ─── ITEM FORM ────────────────────────────────────────────────────────────────
function ItemForm({item,cats,kitchens,onSave,onBack,defaultCatId}){
  const[name,setName]=useState(item?.name||"");
  const[price,setPrice]=useState(item?.price||"");
  const[catId,setCatId]=useState(item?.catId||defaultCatId||(cats.length>0?cats[0].id:""));
  const[newVar,setNewVar]=useState({n:"",p:""});
  const[newAddon,setNewAddon]=useState({name:"",price:""});

  // Category defaults — preloaded but editable per item
  const selCat=cats.find(c=>c.id===catId);
  const KITCHENS=["Kitchen 1","Kitchen 2","Kitchen 3","Bar","Kitchen 4"];
  // Kitchen: item overrides category
  const[kitchen,setKitchen]=useState(item?.kitchen||selCat?.kitchen||kitchens[0]||"Kitchen 1");
  // Addons: start with category addons merged with any saved item addons
  const initAddons=()=>{
    if(item?.addons?.length>0)return item.addons;
    return selCat?.addons||[];
  };
  const[addons,setAddons]=useState(initAddons);
  const initVars=()=>{
    if(item?.vars?.length>0)return item.vars;
    return selCat?.vars||[];
  };
  const[vars,setVars]=useState(initVars);

  // When category changes, update kitchen+addons only if not already customized
  const prevCatId=useState(catId)[0];

  return(<>
    <div className="ohdr mb8">
      <button className="bbtn" onClick={onBack}>←</button>
      <div className="otitle">{item?"Edit Item":"Add Item"}</div>
    </div>
    <div className="ig"><div className="ilbl">Item Name</div><input className="inp" placeholder="e.g. Vanilla Scoop" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
    <div className="ig"><div className="ilbl">Base Price (₹)</div><input className="inp" type="number" placeholder="0" value={price} onChange={e=>setPrice(e.target.value)}/></div>
    <div className="ig"><div className="ilbl">Category</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {cats.map(c=>(<button key={c.id} className={`sbtn ${catId===c.id?"sel":""}`} style={{fontSize:12}} onClick={()=>{
          setCatId(c.id);
          setKitchen(c.kitchen||kitchens[0]||"Kitchen 1");
          setAddons(c.addons||[]);
          setVars(c.vars||[]);
        }}>{c.name}</button>))}
      </div>
    </div>

    <div className="ig"><div className="ilbl">Kitchen</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Preset from category · change per item if needed</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {KITCHENS.map(k=>(<button key={k} className={`sbtn ${kitchen===k?"sel":""}`} style={{fontSize:12}} onClick={()=>setKitchen(k)}>{k}</button>))}
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
      <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Preset from category · edit prices or add/remove per item</div>
      {addons.map((a,i)=>(<div key={i} style={{display:"flex",gap:4,marginBottom:5,alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          <button className="btn btn-xs" style={{padding:"1px 4px",fontSize:10,opacity:i===0?.3:1}} disabled={i===0} onClick={()=>setAddons(p=>{const a=[...p];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}>↑</button>
          <button className="btn btn-xs" style={{padding:"1px 4px",fontSize:10,opacity:i===addons.length-1?.3:1}} disabled={i===addons.length-1} onClick={()=>setAddons(p=>{const a=[...p];[a[i],a[i+1]]=[a[i+1],a[i]];return a;})}>↓</button>
        </div>
        <input className="inp" style={{flex:2}} value={a.name} placeholder="e.g. Extra Scoop" onChange={e=>setAddons(p=>p.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/>
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
        onSave({...item,name:name.trim(),price:p,basePrice:p,catId,kitchen,
          vars:vars.filter(v=>v.n&&v.n.trim()),
          addons:addons.filter(a=>a.name&&a.name.trim()).map((a,i)=>({...a,id:a.id||`a${Date.now()}${i}`}))});
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
    {k:"more",l:"📱 More Section"},
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

  const baseUrl=window.location.origin+window.location.pathname.replace(/\/$/,"");
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
