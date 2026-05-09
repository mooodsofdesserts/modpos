import { useState, useEffect, useCallback, useRef } from "react";
import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";

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
.oi{padding:8px 11px;border-bottom:1px solid ${T.border};display:flex;align-items:flex-start;gap:8px;}
.oi:last-child{border-bottom:none;}
.oi.new{border-left:3px solid ${T.green};}
.oi-left{flex:1;min-width:0;}
.oi-name{font-size:12px;font-weight:800;}
.oi-var{font-size:10px;color:${T.textMuted};margin-top:1px;}
.oi-addons{font-size:10px;color:${T.orange};margin-top:1px;font-weight:600;}
.oi-note-row{display:flex;align-items:center;gap:4px;margin-top:3px;}
.oi-note-text{font-size:10px;color:${T.blue};font-style:italic;flex:1;}
.oi-note-btn{background:none;border:1px dashed ${T.borderMid};border-radius:6px;padding:1px 6px;font-size:10px;color:${T.textMuted};cursor:pointer;white-space:nowrap;flex-shrink:0;}
.oi-note-btn:hover,.oi-note-btn:active{border-color:${T.blue};color:${T.blue};background:${T.blueL};}
.oi-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.oi-price{font-size:12px;font-weight:900;color:${T.primary};font-family:'JetBrains Mono',monospace;}
.qrow{display:flex;align-items:center;gap:3px;}
.qb{background:${T.border};border:none;color:${T.text};width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;font-weight:900;}
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
const CATS=[{id:"scoops",n:"Scoops"},{id:"mojito",n:"Mojito"},{id:"falooda",n:"Falooda"},{id:"cocktail",n:"Cocktail"},{id:"milkshake",n:"Shake"},{id:"sundae",n:"Sundae"},{id:"pizza",n:"Pizza"},{id:"burger",n:"Burger"},{id:"starter",n:"Starters"},{id:"dessert",n:"Desserts"}];
const ITEMS=[
  {id:1,cat:"scoops",name:"Vanilla Scoop",price:40,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:40},{n:"Triple",p:80}]},
  {id:2,cat:"scoops",name:"Strawberry Scoop",price:50,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:50}]},
  {id:3,cat:"scoops",name:"Mango Scoop",price:50,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:50}]},
  {id:4,cat:"scoops",name:"Butterscotch Scoop",price:50,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:50}]},
  {id:5,cat:"scoops",name:"Chocochips Scoop",price:50,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:50}]},
  {id:6,cat:"scoops",name:"Black Current",price:50,kitchen:"Kitchen 1",vars:[{n:"Single",p:0},{n:"Double",p:50}]},
  {id:7,cat:"mojito",name:"Blue Lagoon Mojito",price:120,kitchen:"Bar",vars:[{n:"Regular",p:0},{n:"Large",p:30}]},
  {id:8,cat:"mojito",name:"Lemon Mojito",price:100,kitchen:"Bar",vars:[{n:"Regular",p:0},{n:"Large",p:30}]},
  {id:9,cat:"mojito",name:"Virgin Mojito",price:120,kitchen:"Bar",vars:[{n:"Regular",p:0},{n:"Large",p:30}]},
  {id:10,cat:"mojito",name:"Watermelon Mojito",price:130,kitchen:"Bar",vars:[{n:"Regular",p:0},{n:"Large",p:30}]},
  {id:11,cat:"falooda",name:"Butterscotch Falooda",price:160,kitchen:"Kitchen 1",vars:[{n:"Regular",p:0},{n:"Large",p:50}]},
  {id:12,cat:"falooda",name:"Blackcurrent Falooda",price:160,kitchen:"Kitchen 1",vars:[{n:"Regular",p:0},{n:"Large",p:50}]},
  {id:13,cat:"falooda",name:"Kesar Falooda",price:180,kitchen:"Kitchen 1",vars:[]},
  {id:14,cat:"falooda",name:"Rose Falooda",price:160,kitchen:"Kitchen 1",vars:[{n:"Regular",p:0},{n:"Large",p:50}]},
  {id:15,cat:"cocktail",name:"Fruit Punch",price:140,kitchen:"Bar",vars:[{n:"Regular",p:0},{n:"Large",p:40}]},
  {id:16,cat:"cocktail",name:"Blue Ocean",price:150,kitchen:"Bar",vars:[]},
  {id:17,cat:"cocktail",name:"Green Apple Cooler",price:140,kitchen:"Bar",vars:[]},
  {id:18,cat:"milkshake",name:"Oreo Shake",price:140,kitchen:"Kitchen 1",vars:[{n:"Medium",p:0},{n:"Large",p:30}]},
  {id:19,cat:"milkshake",name:"KitKat Shake",price:150,kitchen:"Kitchen 1",vars:[{n:"Medium",p:0},{n:"Large",p:30}]},
  {id:20,cat:"milkshake",name:"Cold Coffee",price:120,kitchen:"Kitchen 1",vars:[{n:"Regular",p:0},{n:"Large",p:30}]},
  {id:21,cat:"sundae",name:"Hot Choco Sundae",price:180,kitchen:"Kitchen 1",vars:[]},
  {id:22,cat:"sundae",name:"Strawberry Sundae",price:170,kitchen:"Kitchen 1",vars:[]},
  {id:23,cat:"pizza",name:"Margherita Pizza",price:220,kitchen:"Kitchen 2",vars:[{n:"Small",p:0},{n:"Medium",p:80},{n:"Large",p:150}]},
  {id:24,cat:"pizza",name:"Farmhouse Pizza",price:280,kitchen:"Kitchen 2",vars:[{n:"Small",p:0},{n:"Medium",p:80},{n:"Large",p:150}]},
  {id:25,cat:"pizza",name:"Paneer Tikka Pizza",price:260,kitchen:"Kitchen 2",vars:[{n:"Small",p:0},{n:"Medium",p:80},{n:"Large",p:150}]},
  {id:26,cat:"burger",name:"Veg Burger",price:120,kitchen:"Kitchen 2",vars:[{n:"Regular",p:0},{n:"Large",p:40}]},
  {id:27,cat:"burger",name:"Chicken Crunchy Burger",price:160,kitchen:"Kitchen 4",vars:[{n:"Regular",p:0},{n:"Large",p:40}]},
  {id:28,cat:"burger",name:"Peri-Peri Fries",price:90,kitchen:"Kitchen 4",vars:[{n:"Small",p:0},{n:"Large",p:30}]},
  {id:29,cat:"starter",name:"Veg Spring Roll",price:110,kitchen:"Kitchen 3",vars:[]},
  {id:30,cat:"starter",name:"Crispy Corn",price:130,kitchen:"Kitchen 3",vars:[{n:"Regular",p:0},{n:"Large",p:40}]},
  {id:31,cat:"starter",name:"Paneer Tikka",price:180,kitchen:"Kitchen 3",vars:[]},
  {id:32,cat:"dessert",name:"Sizzling Brownie",price:160,kitchen:"Kitchen 1",vars:[]},
  {id:33,cat:"dessert",name:"Gulab Jamun",price:60,kitchen:"Kitchen 1",vars:[{n:"2 pcs",p:0},{n:"4 pcs",p:60}]},
];

const nowStr=()=>{const d=new Date();return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;};
const elapsed=(ms)=>{const m=Math.floor((Date.now()-ms)/60000);return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60}m`;};
const elapsedM=(ms)=>Math.floor((Date.now()-ms)/60000);
const uid=()=>Math.random().toString(36).slice(2,9);
const itemTotal=(it)=>(it.basePrice+(it.varPrice||0)+(it.addons||[]).reduce((s,a)=>s+a.price*a.qty,0))*it.qty;

function makeInitOrders(floors){
  const allTables=floors.flatMap(f=>f.tables);
  const t=(name)=>allTables.find(t=>t.name===name)?.id||null;
  const o={};
  const t1=t("Table 1"),t3=t("Table 3"),t7=t("Table 7");
  if(t1)o[t1]={items:[
    {uid:uid(),id:20,name:"Cold Coffee",basePrice:120,varName:"Regular",varPrice:0,addons:[],note:"",qty:1,kitchen:"Kitchen 1",cat:"milkshake",sent:true},
    {uid:uid(),id:11,name:"Butterscotch Falooda",basePrice:160,varName:"Regular",varPrice:0,addons:[{id:"f4",name:"Less Sweet",price:0,qty:1}],note:"Birthday guest",qty:2,kitchen:"Kitchen 1",cat:"falooda",sent:true},
    {uid:uid(),id:12,name:"Blackcurrent Falooda",basePrice:160,varName:"Regular",varPrice:0,addons:[{id:"s1",name:"Extra Scoop",price:50,qty:1}],note:"",qty:1,kitchen:"Kitchen 1",cat:"falooda",sent:true},
  ],time:"15:34",startMs:Date.now()-22*60000,status:"preparing",waiter:"Rahul",orderNote:"Window seat 🎂",paidAmount:0};
  if(t3)o[t3]={items:[
    {uid:uid(),id:7,name:"Blue Lagoon Mojito",basePrice:120,varName:"Regular",varPrice:0,addons:[{id:"m1",name:"No Ice",price:0,qty:1}],note:"",qty:1,kitchen:"Bar",cat:"mojito",sent:true},
    {uid:uid(),id:8,name:"Lemon Mojito",basePrice:100,varName:"Large",varPrice:30,addons:[],note:"Less sugar",qty:1,kitchen:"Bar",cat:"mojito",sent:true},
    {uid:uid(),id:29,name:"Veg Spring Roll",basePrice:110,varName:"",varPrice:0,addons:[{id:"st1",name:"Extra Crispy",price:0,qty:1}],note:"",qty:2,kitchen:"Kitchen 3",cat:"starter",sent:true},
  ],time:"15:38",startMs:Date.now()-18*60000,status:"waiting",waiter:"Priya",orderNote:"",paidAmount:0};
  if(t7)o[t7]={items:[
    {uid:uid(),id:23,name:"Margherita Pizza",basePrice:220,varName:"Large",varPrice:150,addons:[{id:"p1",name:"Extra Cheese",price:40,qty:2}],note:"Well done please",qty:1,kitchen:"Kitchen 2",cat:"pizza",sent:true},
    {uid:uid(),id:18,name:"Oreo Shake",basePrice:140,varName:"Large",varPrice:30,addons:[{id:"mk5",name:"Whipped Cream",price:20,qty:1}],note:"",qty:2,kitchen:"Kitchen 1",cat:"milkshake",sent:true},
  ],time:"16:02",startMs:Date.now()-8*60000,status:"preparing",waiter:"Rahul",orderNote:"",paidAmount:0};
  // Find Zomato-like
  const zomato=allTables.find(t=>t.name.toLowerCase().includes("zomato")||t.name.toLowerCase().includes("parcel 1"));
  if(zomato)o[zomato.id]={items:[
    {uid:uid(),id:27,name:"Chicken Crunchy Burger",basePrice:160,varName:"Regular",varPrice:0,addons:[{id:"b2",name:"Extra Cheese",price:30,qty:1}],note:"",qty:1,kitchen:"Kitchen 4",cat:"burger",sent:true},
    {uid:uid(),id:28,name:"Peri-Peri Fries",basePrice:90,varName:"Small",varPrice:0,addons:[{id:"b5",name:"Extra Spicy",price:0,qty:1}],note:"",qty:1,kitchen:"Kitchen 4",cat:"burger",sent:true},
  ],time:"16:08",startMs:Date.now()-4*60000,status:"waiting",waiter:"Online",platform:"zomato",orderNote:"",paidAmount:0};
  return o;
}

const DEF_STAFF=[
  {id:1,name:"Rahul Patil",role:"Waiter",email:"rahul@moods.in",photo:"👨",perms:{orders:true,payment:false,cancel:false,kitchen:false,reports:false,settings:false,font:true},ks:{vol:4,count:2,tone:"bell"}},
  {id:2,name:"Priya Sharma",role:"Manager",email:"priya@moods.in",photo:"👩",perms:{orders:true,payment:true,cancel:true,kitchen:true,reports:true,settings:false,font:true},ks:{vol:6,count:3,tone:"chime"}},
  {id:3,name:"Kiran Kumar",role:"Kitchen",email:"kiran@moods.in",photo:"👨‍🍳",perms:{orders:false,payment:false,cancel:false,kitchen:true,reports:false,settings:false,font:true},ks:{vol:8,count:4,tone:"alert"}},
];

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

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,(u)=>{setUser(u);setAuthLoading(false);});
    return()=>unsub();
  },[]);

  const signIn=()=>signInWithPopup(auth,googleProvider).catch(e=>console.log(e));
  const signOutUser=()=>signOut(auth);

  if(authLoading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",fontSize:18,color:"#1a7a4a",fontWeight:700}}>Loading MOD POS...</div>;

  if(!user)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Nunito,sans-serif",background:"#f2f5ff"}}>
      <div style={{fontSize:32,fontWeight:900,color:"#1a7a4a",marginBottom:8}}>MOD <span style={{color:"#1e2235"}}>POS</span></div>
      <div style={{fontSize:14,color:"#7a8aaa",marginBottom:40,fontWeight:600}}>Moods of Desserts</div>
      <button onClick={signIn} style={{background:"#ffffff",border:"2px solid #e2e8f5",borderRadius:14,padding:"14px 28px",fontSize:16,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
        <span style={{fontSize:20}}>G</span> Sign in with Google
      </button>
      <div style={{fontSize:12,color:"#b0bdd4",marginTop:20}}>Only authorized staff can access</div>
    </div>
  );

  const[floors,setFloors]=useState(initFloors);
  const allTables=floors.flatMap(f=>f.tables);
  const[activeFloor,setActiveFloor]=useState("f1");
  const[orders,setOrders]=useState({});

useEffect(()=>{
  const ordersRef=ref(db,"orders");
  onValue(ordersRef,(snapshot)=>{
    const data=snapshot.val();
    if(data)setOrders(data);
    else setOrders({});
  });
},[]);

  const saveOrders=useCallback((newOrders)=>{
    const resolved=typeof newOrders==='function'?newOrders(orders):newOrders;
    setOrders(resolved);
    set(ref(db,"orders"),resolved);
  },[orders]);
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
    ring(1);
    showNotif(`${configured.name} added ✓`);
  };

  const removeItem=(tid,uid_)=>{
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      const items=prev[tid].items.filter(i=>i.uid!==uid_);
      if(!items.length){const n={...prev};delete n[tid];return n;}
      return{...prev,[tid]:{...prev[tid],items}};
    });
    ring(1);
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
    ring(1);
    showNotif("Note saved ✓");
  };

  const sendKitchen=(tid)=>{
    saveOrders(prev=>{
      if(!prev[tid])return prev;
      return{...prev,[tid]:{...prev[tid],status:"waiting",items:prev[tid].items.map(it=>({...it,sent:true}))}};
    });
    ring(kss.count);
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
    ring(1);
    const toName=allTables.find(t=>t.id===toId)?.name||toId;
    showNotif(`Transferred → ${toName} · sent to kitchen ✓`);
    setTransferModal(null);
    if(itemUids==="all"){setSelTable(toId);}
  };

  const floorTables=floors.find(f=>f.id===activeFloor)?.tables||[];

  const printBill=(tid)=>{
    const ord=orders[tid];if(!ord)return;
    const tbl=allTables.find(t=>t.id===tid)?.name||tid;
    const total=ord.items.reduce((s,i)=>s+itemTotal(i),0);
    showNotif("Printing bill for "+tbl);
  };

  return(<>
    <style>{buildCss(fontSize)}</style>
    {notif&&<div className="notif">{notif}</div>}
    <div className="pos">
      <nav className="tnav">
        <div className="brand">MOD<span> POS</span></div>
        <span className="ntime">{clock}</span>
        <div className="nav-r">
          <button className="nibtn" title="Bill Printer" onClick={()=>showNotif("MPT-II ● Connected")}>🖨</button>
          <button className="nibtn" title="Label Printer" onClick={()=>showNotif("Shreyansh LP-50 ● Connected")}>🏷</button>
          <button className="nibtn" onClick={()=>showNotif("Syncing")}>☁☁️</button>
          <button className="nibtn" onClick={signOutUser} title="Sign Out">👤</button>
        </div>
      </nav>

      <div className="main">
        {tab==="orders"&&!selTable&&<OrdersTab floors={floors} activeFloor={activeFloor} setActiveFloor={setActiveFloor} tables={floorTables} orders={orders} allTables={allTables} onOpen={setSelTable} onEditFloor={setEditFloor}/>}
        {tab==="orders"&&selTable&&<OrderScreen tid={selTable} orders={orders} allTables={allTables} onBack={()=>{setSelTable(null);setMenuOpen(false);}} onOpenMenu={()=>setMenuOpen(true)} onRemove={removeItem} onUpdate={updateItem} onSend={sendKitchen} onPay={()=>setPayModal(true)} onNoteItem={setNoteModal} onTransfer={()=>setTransferModal({tid:selTable})} onPrint={printBill} showNotif={showNotif} stickerOn={getStickerOn(selTable)}/>}
        {tab==="kitchen"&&<KitchenTab kitchens={KITCHENS} active={activeKitchen} setActive={setActiveKitchen} orders={orders} allTables={allTables} itemDone={itemDone} onItemDone={markItemDone} onAllDone={markAllDone} dark={kitchenDark} setDark={setKitchenDark} cfg={kitchenCfg} kss={kss} setKss={setKss} playRing={playRing}/>}
        {tab==="online"&&<OnlineTab orders={orders} saveOrders={saveOrders} allTables={allTables} showNotif={showNotif}/>}
        {tab==="reports"&&<ReportsTab orders={orders} period={reportPeriod} setPeriod={setReportPeriod}/>}
        {tab==="settings"&&<SettingsTab floors={floors} setFloors={setFloors} staff={staff} setStaff={setStaff} fontSize={fontSize} setFontSize={setFontSize} printCfg={printCfg} setPrintCfg={setPrintCfg} kitchenCfg={kitchenCfg} setKitchenCfg={setKitchenCfg} onStaff={setStaffModal} showNotif={showNotif} allTables={allTables}/>}
      </div>

      <nav className="btab">
        {[{id:"orders",ic:"🍽",lb:"Orders"},{id:"kitchen",ic:"👨‍🍳",lb:"Kitchen"},{id:"online",ic:"📱",lb:"Online"},{id:"reports",ic:"📊",lb:"Reports"},{id:"settings",ic:"⚙️",lb:"Settings"}].map(t=>(
          <button key={t.id} className={`ti ${tab===t.id?"active":""}`} onClick={()=>{setTab(t.id);if(t.id!=="orders"){setSelTable(null);setMenuOpen(false);}}}>
            <span className="ti-ic">{t.ic}</span>{t.lb}
          </button>
        ))}
      </nav>
    </div>

    {selTable&&<SlideMenu open={menuOpen} onClose={()=>setMenuOpen(false)} onSelectItem={setVarModal}/>}
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
function OrderScreen({tid,orders,allTables,onBack,onOpenMenu,onRemove,onUpdate,onSend,onPay,onNoteItem,onTransfer,onPrint,showNotif,stickerOn}){
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
          {total>0&&<button className="btn btn-sm btn-o" onClick={onPay}>💳</button>}
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
                    <button className="qb del" onClick={()=>onRemove(tid,it.uid)}>✕</button>
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
            {total>0&&<button className="btn btn-o btn-sm" onClick={onPay}>💳 Pay</button>}
          </div>
        </div>
      </div>
      <button className="add-menu-btn" onClick={onOpenMenu}><span style={{fontSize:20}}>+</span> Add Items</button>
    </div>
  );
}

// ─── SLIDE-UP MENU ────────────────────────────────────────────────────────────
function SlideMenu({open,onClose,onSelectItem}){
  const[cat,setCat]=useState("scoops");const[q,setQ]=useState("");
  const filtered=q?ITEMS.filter(i=>i.name.toLowerCase().includes(q.toLowerCase())):ITEMS.filter(i=>i.cat===cat);
  return(
    <div className={`menu-overlay ${open?"open":""}`}>
      <div className="menu-backdrop" onClick={onClose}/>
      <div className="menu-panel">
        <div className="menu-panel-hdr"><div className="menu-panel-title">Add Items</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div className="menu-search"><input className="menu-sinp" placeholder="🔍 Search..." value={q} onChange={e=>setQ(e.target.value)} autoComplete="off"/></div>
        <div className="menu-body">
          {!q&&<div className="cat-list">{CATS.map(c=>(<div key={c.id} className={`cat-btn ${cat===c.id?"active":""}`} onClick={()=>setCat(c.id)}>{c.n}</div>))}</div>}
          <div className="item-list">
            {filtered.map(item=>(<div key={item.id} className="mitem" onClick={()=>onSelectItem(item)}>
              <div><div className="iname">{item.name}</div>{item.vars?.length>0&&<div className="ivars">+{item.vars.length} options</div>}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div className="ipr">₹{item.price}</div><button className="iadd" onClick={e=>{e.stopPropagation();onSelectItem(item);}}>+</button></div>
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
  const catAddons=ITEM_ADDONS[item.cat]||[];
  const varP=selVar?.p||0;
  const addonTotal=Object.entries(selAddons).reduce((s,[id,qty])=>{const a=catAddons.find(x=>x.id===id);return s+(a?a.price*qty:0);},0);
  const unitP=item.price+varP+addonTotal;
  const toggleAddon=(id)=>setSelAddons(p=>({...p,[id]:p[id]?0:1}));
  const aqChange=(id,d)=>setSelAddons(p=>({...p,[id]:Math.max(0,(p[id]||0)+d)}));
  const addonsList=Object.entries(selAddons).filter(([,q])=>q>0).map(([id,qty])=>{const a=catAddons.find(x=>x.id===id);return{...a,qty};});
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">{item.name}</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div className="modal-sum">
          <div className="modal-sum-lbl">₹{item.price}{selVar&&selVar.p>0?` + var ₹${selVar.p}`:""}{ addonTotal>0?` + add-ons ₹${addonTotal}`:""}</div>
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
          <button className="btn btn-g f1" onClick={()=>onConfirm({id:item.id,name:item.name,basePrice:item.price,varName:selVar?.n||"",varPrice:selVar?.p||0,addons:addonsList,note,qty:1,kitchen:item.kitchen,cat:item.cat})}>+ Add · ₹{unitP}</button>
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
              return(<div key={t.id} className={`tr-tbl-btn ${selTarget===t.id?"sel":""} ${occ&&!self?"occ":""} ${self?"self":""}`} onClick={()=>!self&&setSelTarget(t.id)}>
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
function KitchenTab({kitchens,active,setActive,orders,allTables,itemDone,onItemDone,onAllDone,dark,setDark,cfg,kss,setKss,playRing}){
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
        {kitchens.map(k=>(<div key={k} className={`ftab ${active===k?"active":""}`} style={dark&&active!==k?{background:"#22263a",borderColor:"#2e3352",color:"#8890b0",fontSize:12}:{fontSize:12}} onClick={()=>setActive(k)}>{k}</div>))}
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
function OnlineTab({orders,saveOrders,allTables,showNotif}){
  const[platform,setPlatform]=useState("zomato");
  const platforms=[{id:"zomato",n:"Zomato",color:"#e23744",ic:"🍽"},{id:"swiggy",n:"Swiggy",color:"#fc8019",ic:"🛵"},{id:"unbox",n:"Unbox",color:T.blue,ic:"📦"},{id:"grosav",n:"Grosav",color:T.purple,ic:"🛒"}];
  const onlineOrders=Object.entries(orders).filter(([,o])=>o.platform===platform);
  const pc=platforms.find(p=>p.id===platform);
  const getTblName=(tid)=>allTables.find(t=>t.id===tid)?.name||tid;
  return(<>
    <div className="shdr"><div className="stitle">Online Orders</div></div>
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
function SettingsTab({floors,setFloors,staff,setStaff,fontSize,setFontSize,printCfg,setPrintCfg,kitchenCfg,setKitchenCfg,onStaff,showNotif,allTables}){
  const[sub,setSub]=useState("general");
  return(<>
    <div className="shdr"><div className="stitle">Settings</div></div>
    <div className="ftabs mb12">
      {["general","tables","printers","print","kitchen","staff"].map(s=>(<div key={s} className={`ftab ${sub===s?"active":""}`} style={{textTransform:"capitalize"}} onClick={()=>setSub(s)}>{s}</div>))}
    </div>
    {sub==="general"&&(<>
      <div className="sg"><div className="sg-lbl">Restaurant</div>
        <div className="si"><div className="si-lbl">Name</div><div className="si-val">Moods of Desserts</div></div>
        <div className="si"><div className="si-lbl">Address</div><div className="si-val">Chiplun, 415605</div></div>
        <div className="si"><div className="si-lbl">GST</div><div className="si-val">5%</div></div>
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

    {sub==="staff"&&(<>
      <div className="card mb12" style={{background:T.blueL,borderColor:`${T.blue}40`}}>
        <div style={{fontSize:13,fontWeight:700,color:T.blue,marginBottom:3}}>👤 Google Sign-In</div>
        <div style={{fontSize:12,color:T.textMid}}>Staff log in with Google. Admin assigns permissions. Each staff sets their own kitchen sound from the Kitchen ⚙️ button.</div>
        <button className="btn btn-b btn-sm mt6" onClick={()=>showNotif("Google Sign-In...")} style={{gap:6,fontSize:12}}><span style={{fontWeight:900}}>G</span> Sign in with Google</button>
      </div>
      <div className="shdr" style={{marginBottom:8}}><div style={{fontSize:15,fontWeight:800}}>Staff</div><button className="btn btn-g btn-sm" onClick={()=>showNotif("Invite by Google email")}>+ Add</button></div>
      {staff.map(s=>(<div key={s.id} className="stcard">
        <div className="stav">{s.photo}</div>
        <div style={{flex:1}}>
          <div className="stnm">{s.name}</div>
          <div className="strl">{s.role}</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>🔔 Vol:{s.ks?.vol||4} · {s.ks?.count||2}× · {s.ks?.tone||"bell"}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>{Object.entries(s.perms).filter(([,v])=>v).map(([k])=>(<span key={k} style={{fontSize:9,background:T.primaryL,color:T.primary,borderRadius:20,padding:"2px 7px",fontWeight:700,textTransform:"capitalize"}}>{k}</span>))}</div>
        </div>
        <button className="btn btn-out btn-sm" onClick={()=>onStaff(s)}>Edit</button>
      </div>))}
    </>)}
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
