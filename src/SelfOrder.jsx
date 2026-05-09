import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";

const firebaseConfig={apiKey:"AIzaSyCoV5LkFJBTGYVkYiqEfGObG8ssFCHtagY",authDomain:"mod-pos.firebaseapp.com",databaseURL:"https://mod-pos-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"mod-pos",storageBucket:"mod-pos.firebasestorage.app",messagingSenderId:"305044305596",appId:"1:305044305596:web:51276b693010c784f542b9"};
const _app=initializeApp(firebaseConfig);
const db=getDatabase(_app);

const GREEN="#1a7a4a";

// Get URL params
const getParams=()=>{
  const p=new URLSearchParams(window.location.search);
  return{rid:p.get("rid"),table:p.get("table")};
};

export default function SelfOrder(){
  const{rid,table:tableName}=getParams();
  const[menuData,setMenuData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[cart,setCart]=useState({});
  const[view,setView]=useState("menu"); // menu | cart | confirmed
  const[popup,setPopup]=useState(null);
  const[popupVariant,setPopupVariant]=useState(null);
  const[popupAddons,setPopupAddons]=useState([]);
  const[popupInstruction,setPopupInstruction]=useState("");
  const[specialNote,setSpecialNote]=useState("");
  const[activeCategory,setActiveCategory]=useState(null);
  const[submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    if(!rid){setLoading(false);return;}
    const menuRef=ref(db,`restaurants/${rid}/menu`);
    onValue(menuRef,(snap)=>{
      const d=snap.val();
      if(d){
        const cats=d.cats?Object.values(d.cats).sort((a,b)=>(a.priority||0)-(b.priority||0)):[];
        const items=d.items?Object.values(d.items):[];
        setMenuData({cats,items});
        if(cats.length>0)setActiveCategory(cats[0].id);
      }
      setLoading(false);
    },{onlyOnce:true});
  },[rid]);

  if(!rid||!tableName)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"sans-serif",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>❌</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Invalid QR Code</div>
      <div style={{fontSize:14,color:"#888"}}>Please scan the QR code at your table</div>
    </div>
  );

  if(loading)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"sans-serif",color:GREEN,fontSize:16,fontWeight:700}}>
      Loading menu...
    </div>
  );

  if(!menuData||menuData.cats.length===0)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"sans-serif",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🍽</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Menu not available</div>
      <div style={{fontSize:14,color:"#888"}}>Please ask staff for assistance</div>
    </div>
  );

  const catItems=menuData.items.filter(i=>i.catId===activeCategory).sort((a,b)=>(a.priority||0)-(b.priority||0));

  // Cart helpers
  const cartEntries=Object.values(cart);
  const totalItems=cartEntries.reduce((s,e)=>s+e.qty,0);
  const totalPrice=cartEntries.reduce((s,e)=>s+(e.item.price+(e.variantPrice||0)+(e.addons||[]).reduce((a,x)=>a+x.price,0))*e.qty,0);

  const openPopup=(item)=>{
    setPopup(item);
    setPopupVariant(item.vars?.[0]||null);
    setPopupAddons([]);
    setPopupInstruction("");
  };

  const addToCart=()=>{
    if(!popup)return;
    const key=`${popup.id}_${popupVariant?.n||""}_${popupAddons.map(a=>a.id).join(",")}`;
    setCart(prev=>({
      ...prev,
      [key]:{
        item:popup,qty:(prev[key]?.qty||0)+1,
        variantLabel:popupVariant?.n||"",variantPrice:popupVariant?.p||0,
        addons:popupAddons,instruction:popupInstruction
      }
    }));
    setPopup(null);
  };

  const placeOrder=async()=>{
    if(submitting)return;
    setSubmitting(true);
    const orderItems=Object.values(cart).map(e=>({
      id:e.item.id,name:e.item.name,price:e.item.price,
      variantLabel:e.variantLabel,variantPrice:e.variantPrice,
      addons:e.addons,instruction:e.instruction,qty:e.qty,
      catId:e.item.catId,kitchen:e.item.kitchen
    }));
    const selfOrder={
      id:`so_${Date.now()}`,
      tableName,restaurantId:rid,
      items:orderItems,total:totalPrice,
      note:specialNote,status:"pending",
      createdAt:Date.now()
    };
    await set(ref(db,`restaurants/${rid}/self_orders/${selfOrder.id}`),selfOrder);
    setView("confirmed");
    setSubmitting(false);
  };

  // CONFIRMED
  if(view==="confirmed")return(
    <div style={S.root}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 24px 40px",textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:16}}>✅</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>Order Placed!</div>
        <div style={{fontSize:14,color:"#6b7280",marginBottom:24}}>
          Your order for <strong>{tableName}</strong> has been sent to the restaurant.<br/>
          Staff will confirm shortly.
        </div>
        <div style={{background:"#fff",borderRadius:16,padding:18,width:"100%",boxShadow:"0 4px 16px rgba(0,0,0,0.07)",textAlign:"left",marginBottom:20}}>
          {Object.values(cart).map((e,i)=>{
            const lp=(e.item.price+(e.variantPrice||0)+(e.addons||[]).reduce((a,x)=>a+x.price,0))*e.qty;
            return(<div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f3f4f6"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:700,fontSize:14}}>{e.item.name} ×{e.qty}</span>
                <span style={{fontWeight:700}}>₹{lp}</span>
              </div>
              {e.variantLabel&&<div style={{fontSize:12,color:"#9ca3af"}}>{e.variantLabel}</div>}
              {e.addons?.length>0&&<div style={{fontSize:12,color:"#9ca3af"}}>+ {e.addons.map(a=>a.name||a.label).join(", ")}</div>}
              {e.instruction&&<div style={{fontSize:12,color:"#d97706"}}>📝 {e.instruction}</div>}
            </div>);
          })}
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:16,paddingTop:4}}>
            <span>Total</span><span style={{color:GREEN}}>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
        <div style={{fontSize:13,color:"#aaa"}}>Sit back and relax 🙌</div>
      </div>
    </div>
  );

  // CART
  if(view==="cart")return(
    <div style={S.root}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={()=>setView("menu")}>←</button>
        <div><div style={S.headerTitle}>Your Order</div><div style={S.headerSub}>🪑 {tableName}</div></div>
        <div style={{width:36}}/>
      </div>
      <div style={{padding:"14px 14px 130px"}}>
        {cartEntries.length===0?(
          <div style={{textAlign:"center",paddingTop:80}}>
            <div style={{fontSize:52}}>🛒</div>
            <div style={{color:"#aaa",marginTop:12,fontSize:14}}>Your cart is empty</div>
            <button style={{marginTop:16,background:GREEN,color:"#fff",border:"none",borderRadius:12,padding:"10px 24px",fontWeight:700,cursor:"pointer",fontSize:14}} onClick={()=>setView("menu")}>Browse Menu</button>
          </div>
        ):(
          <>
            {Object.entries(cart).map(([key,e])=>{
              const up=e.item.price+(e.variantPrice||0)+(e.addons||[]).reduce((a,x)=>a+x.price,0);
              return(<div key={key} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:10,display:"flex",gap:10,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{e.item.name}</div>
                  {e.variantLabel&&<div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{e.variantLabel}</div>}
                  {e.addons?.length>0&&<div style={{fontSize:11,color:"#9ca3af"}}>+ {e.addons.map(a=>a.name||a.label).join(", ")}</div>}

                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <div style={{fontWeight:800,fontSize:14}}>₹{up*e.qty}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <button style={S.qtyBtn} onClick={()=>setCart(p=>{const n={...p};if(n[key].qty>1)n[key]={...n[key],qty:n[key].qty-1};else delete n[key];return n;})}>−</button>
                    <span style={{fontWeight:700,fontSize:15,minWidth:18,textAlign:"center"}}>{e.qty}</span>
                    <button style={{...S.qtyBtn,background:GREEN,color:"#fff",border:"none"}} onClick={()=>setCart(p=>({...p,[key]:{...p[key],qty:p[key].qty+1}}))}>+</button>
                  </div>
                </div>
              </div>);
            })}

          </>
        )}
      </div>
      {cartEntries.length>0&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #f3f4f6",padding:"14px 20px 18px",zIndex:200}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <span style={{color:"#888"}}>Total ({totalItems} items)</span>
          <span style={{fontWeight:700,fontSize:18}}>₹{totalPrice.toLocaleString()}</span>
        </div>
        <button style={{width:"100%",background:submitting?"#aaa":GREEN,color:"#fff",border:"none",borderRadius:14,padding:14,fontWeight:800,fontSize:16,cursor:"pointer"}} onClick={placeOrder} disabled={submitting}>
          {submitting?"Placing order...":"Place Order →"}
        </button>
      </div>}
    </div>
  );

  // MENU
  return(
    <div style={S.root}>
      {/* Popup */}
      {popup&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setPopup(null)}>
        <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:430,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
          <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:4,margin:"10px auto 0",flexShrink:0}}/>
          <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:17}}>{popup.name}</div>
              <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Base ₹{popup.price}</div>
            </div>
            <button style={{background:"#f3f4f6",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontWeight:700,fontSize:13,color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPopup(null)}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"0 16px 10px"}}>
            {popup.vars?.length>0&&<div style={{marginTop:16}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
                Choose Size / Type <span style={{background:"#fee2e2",color:"#dc2626",fontSize:10,fontWeight:700,borderRadius:6,padding:"2px 7px"}}>Required</span>
              </div>
              {popup.vars.map(v=>{
                const act=popupVariant?.n===v.n;
                return(<div key={v.n} onClick={()=>setPopupVariant(v)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",border:`1.5px solid ${act?GREEN:"#e5e7eb"}`,borderRadius:12,marginBottom:8,cursor:"pointer",background:act?"#f0fdf4":"#fff"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${act?GREEN:"#d1d5db"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {act&&<div style={{width:9,height:9,borderRadius:"50%",background:GREEN}}/>}
                  </div>
                  <span style={{flex:1,fontSize:14,color:"#374151",fontWeight:600}}>{v.n}</span>
                  <span style={{fontSize:13,fontWeight:700,color:act?GREEN:"#6b7280"}}>{v.p>0?`+₹${v.p}`:"Included"}</span>
                </div>);
              })}
            </div>}
            {popup.addons?.length>0&&<div style={{marginTop:16}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
                Add-ons <span style={{background:"#f3f4f6",color:"#6b7280",fontSize:10,fontWeight:700,borderRadius:6,padding:"2px 7px"}}>Optional</span>
              </div>
              {popup.addons.map(a=>{
                const chk=!!popupAddons.find(x=>x.id===a.id);
                return(<div key={a.id} onClick={()=>setPopupAddons(p=>chk?p.filter(x=>x.id!==a.id):[...p,a])} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",border:`1.5px solid ${chk?GREEN:"#e5e7eb"}`,borderRadius:12,marginBottom:8,cursor:"pointer",background:chk?"#f0fdf4":"#fff"}}>
                  <div style={{width:18,height:18,borderRadius:5,background:chk?GREEN:"#fff",border:`2px solid ${chk?GREEN:"#d1d5db"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {chk&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{flex:1,fontSize:14,color:"#374151",fontWeight:600}}>{a.name}</span>
                  <span style={{fontSize:13,fontWeight:700,color:chk?GREEN:"#6b7280"}}>+₹{a.price}</span>
                </div>);
              })}
            </div>}

          </div>
          <div style={{padding:"12px 16px 20px",borderTop:"1px solid #f3f4f6",flexShrink:0}}>
            <button style={{width:"100%",background:GREEN,color:"#fff",border:"none",borderRadius:14,padding:14,fontWeight:800,fontSize:16,cursor:"pointer"}} onClick={addToCart}>
              Add to Cart · ₹{popup.price+(popupVariant?.p||0)+popupAddons.reduce((s,a)=>s+a.price,0)}
            </button>
          </div>
        </div>
      </div>}

      {/* Header */}
      <div style={S.header}>
        <div style={{flex:1}}>
          <div style={S.headerTitle}>MOD POS</div>
          <div style={S.headerSub}>🪑 {tableName}</div>
        </div>
        {totalItems>0&&<button style={{background:"#fff",color:GREEN,border:"none",borderRadius:20,padding:"7px 14px",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>setView("cart")}>
          🛒 {totalItems} · ₹{totalPrice.toLocaleString()}
        </button>}
      </div>

      {/* Welcome banner */}
      <div style={{background:"#ecfdf5",border:"1px solid #d1fae5",margin:"14px 14px 4px",borderRadius:14,padding:"12px 14px",display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:26}}>👋</span>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>Welcome! Order directly from here.</div>
          <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Tap any item to choose size, add-ons & more.</div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{display:"flex",gap:8,padding:"14px 14px 10px",overflowX:"auto",scrollbarWidth:"none"}}>
        {menuData.cats.map(c=>{
          const act=activeCategory===c.id;
          return(<button key={c.id} onClick={()=>setActiveCategory(c.id)} style={{borderRadius:22,border:`2px solid ${act?GREEN:"#e5e7eb"}`,padding:"8px 16px",fontWeight:act?800:600,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",background:act?GREEN:"#fff",color:act?"#fff":"#6b7280",boxShadow:act?`0 4px 14px ${GREEN}55`:"none",display:"flex",alignItems:"center",gap:5,transition:"all .15s",transform:act?"scale(1.05)":"scale(1)"}}>
            {c.icon&&<span style={{fontSize:15}}>{c.icon}</span>}{c.name}
          </button>);
        })}
      </div>

      {/* Items grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"0 14px",paddingBottom:80}}>
        {catItems.map(item=>{
          const qty=Object.values(cart).filter(e=>e.item.id===item.id).reduce((s,e)=>s+e.qty,0);
          return(<div key={item.id} style={{background:"#fff",borderRadius:16,padding:14,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",cursor:"pointer"}} onClick={()=>openPopup(item)}>
            <div style={{fontWeight:700,fontSize:14,color:"#111",marginBottom:3}}>{item.name}</div>
            {item.vars?.length>0&&<div style={{fontSize:10,color:"#6b7280",background:"#f3f4f6",borderRadius:6,padding:"2px 6px",display:"inline-block",marginBottom:6}}>⚙ {item.vars.length} sizes</div>}
            {item.addons?.length>0&&<div style={{fontSize:10,color:"#6b7280",background:"#f3f4f6",borderRadius:6,padding:"2px 6px",display:"inline-block",marginBottom:6,marginLeft:4}}>✦ {item.addons.length} add-ons</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
              <span style={{fontWeight:800,fontSize:15,color:"#111"}}>₹{item.price}</span>
              {qty>0?(
                <div style={{display:"flex",alignItems:"center",gap:4}} onClick={e=>e.stopPropagation()}>
                  <button style={{width:28,height:28,borderRadius:8,border:`2px solid ${GREEN}`,background:"#fff",color:GREEN,fontWeight:900,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{
                    e.stopPropagation();
                    // Remove one from cart - find last matching entry
                    const entries=Object.entries(cart).filter(([k,v])=>v.item.id===item.id);
                    if(entries.length===0)return;
                    const [lastKey,lastEntry]=entries[entries.length-1];
                    setCart(p=>{const n={...p};if(n[lastKey].qty>1)n[lastKey]={...n[lastKey],qty:n[lastKey].qty-1};else delete n[lastKey];return n;});
                  }}>−</button>
                  <span style={{fontWeight:800,fontSize:14,minWidth:18,textAlign:"center",color:"#111"}}>{qty}</span>
                  <button style={{width:28,height:28,borderRadius:8,background:GREEN,border:"none",color:"#fff",fontWeight:900,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{e.stopPropagation();openPopup(item);}}>+</button>
                </div>
              ):(
                <button style={{background:GREEN,border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,padding:"6px 12px",cursor:"pointer"}} onClick={e=>{e.stopPropagation();openPopup(item);}}>+ Add</button>
              )}
            </div>
          </div>);
        })}
        {catItems.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:30,color:"#aaa",fontSize:13}}>No items in this category</div>}
      </div>

      {totalItems>0&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:GREEN,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",cursor:"pointer",zIndex:200,fontSize:14}} onClick={()=>setView("cart")}>
        <span>🛒 {totalItems} item{totalItems>1?"s":""} added</span>
        <span style={{fontWeight:700}}>View Cart · ₹{totalPrice.toLocaleString()} →</span>
      </div>}
    </div>
  );
}

const S={
  root:{fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#f9fafb",minHeight:"100vh",maxWidth:430,margin:"0 auto",position:"relative"},
  header:{background:GREEN,color:"#fff",padding:"16px 16px 14px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:100},
  headerTitle:{fontWeight:800,fontSize:18,letterSpacing:0.3},
  headerSub:{fontSize:12,color:"#a7f3d0",marginTop:1},
  backBtn:{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:36,height:36,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  qtyBtn:{width:28,height:28,borderRadius:8,border:"1px solid #e5e7eb",background:"#f3f4f6",fontWeight:700,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
};
