/* App that:
 - loads dishes from localStorage or sample
 - renders pages with 3D flip effect
 - category filter
 - dark mode auto + toggle
 - language selector ES/EN
 - PWA install prompt
 - simple cart (localStorage)
 - admin panel to add/edit/download JSON
*/

const SAMPLE = [
  {
    "title_es":"Ceviche Tropical",
    "title_en":"Tropical Ceviche",
    "desc_es":"Mariscos frescos, leche de tigre cítrica y mango.",
    "desc_en":"Fresh seafood, citrus leche de tigre and mango.",
    "category":"Mariscos",
    "price":32000,
    "img":"images/ceviche.jpg"
  },
  {
    "title_es":"Lomo a la Parrilla",
    "title_en":"Grilled Loin",
    "desc_es":"Corte jugoso con papas rústicas y chimichurri.",
    "desc_en":"Juicy cut with rustic potatoes and chimichurri.",
    "category":"Carnes",
    "price":45000,
    "img":"images/lomo.jpg"
  },
  {
    "title_es":"Ensalada de Quinoa",
    "title_en":"Quinoa Salad",
    "desc_es":"Quinoa orgánica, aguacate y semillas tostadas.",
    "desc_en":"Organic quinoa, avocado and toasted seeds.",
    "category":"Ensaladas",
    "price":22000,
    "img":"images/quinoa.jpg"
  }
];

let dishes = loadDishes();
let filtered = [...dishes];
let index = 0;
let deferredPrompt = null;

// elements
const book = document.getElementById('book');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const counter = document.getElementById('pageCounter');
const catFilter = document.getElementById('catFilter');
const langSelect = document.getElementById('langSelect');
const toggleDark = document.getElementById('toggleDark');
const openAdmin = document.getElementById('openAdmin');
const admin = document.getElementById('admin');
const closeAdmin = document.getElementById('closeAdmin');
const adminList = document.getElementById('adminList');
const downloadJSON = document.getElementById('downloadJSON');
const uploadJSON = document.getElementById('uploadJSON');
const resetSample = document.getElementById('resetSample');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const checkout = document.getElementById('checkout');

const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbDesc = document.getElementById('lbDesc');
const lbPrice = document.getElementById('lbPrice');
const addToCartLb = document.getElementById('addToCartLb');
const closeLb = document.getElementById('closeLb');

const pwaPrompt = document.getElementById('pwaPrompt');
const installBtn = document.getElementById('installBtn');
const dismissPwa = document.getElementById('dismissPwa');

// initialization
init();

function init(){
  populateCategoryFilter();
  renderPages();
  applyThemeOnLoad();
  loadLang();
  setupEvents();
  renderCart();
  setupPWA();
}

function loadDishes(){
  try{
    const raw = localStorage.getItem('menu_dishes_v1');
    return raw ? JSON.parse(raw) : SAMPLE.slice();
  }catch(e){
    return SAMPLE.slice();
  }
}

function saveDishes(){
  localStorage.setItem('menu_dishes_v1', JSON.stringify(dishes));
}

function populateCategoryFilter(){
  const cats = Array.from(new Set(dishes.map(d=>d.category))).sort();
  catFilter.innerHTML = '<option value="all">Todas</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function renderPages(){
  filtered = (catFilter.value==='all') ? dishes.slice() : dishes.filter(d=>d.category===catFilter.value);
  if(filtered.length===0){ book.innerHTML = '<p>No hay platos para la categoría seleccionada.</p>'; counter.textContent='0 / 0'; return;}
  book.innerHTML = '';
  filtered.forEach((dish, idx)=>{
    const page = document.createElement('article');
    page.className = 'page';
    page.dataset.index = idx;
    page.innerHTML = `
      <div class="page-inner">
        <h2 class="dish-title">${getText(dish,'title')}</h2>
        <div class="dish-card">
          <img class="dish-img animated-img" src="${dish.img}" alt="${getText(dish,'title')}" />
        </div>
        <p class="desc">${getText(dish,'desc')}</p>
        <p class="price">${formatPrice(dish.price)}</p>
      </div>
    `;
    book.appendChild(page);
  });
  index = Math.min(index, filtered.length-1);
  updatePageClasses();
  attachImageHandlers();
  counter.textContent = (index+1) + ' / ' + filtered.length;
}

function updatePageClasses(){
  const pages = Array.from(document.querySelectorAll('.page'));
  pages.forEach((p,i)=>{
    p.classList.remove('left','active','right','flip');
    if(i<index) p.classList.add('left');
    else if(i>index) p.classList.add('right');
    else p.classList.add('active');
  });
}

prevBtn.addEventListener('click', ()=>{ index = Math.max(0,index-1); updatePageClasses(); counter.textContent=(index+1)+' / '+filtered.length;});
nextBtn.addEventListener('click', ()=>{ index = Math.min(filtered.length-1,index+1); updatePageClasses(); counter.textContent=(index+1)+' / '+filtered.length;});

// image click -> lightbox with pop and flip effect
function attachImageHandlers(){
  document.querySelectorAll('.dish-img').forEach(img=>{
    img.onclick = (e)=>{
      const page = img.closest('.page');
      page.classList.add('flip');
      setTimeout(()=>page.classList.remove('flip'),900);
      lbImg.src = img.src;
      const dish = filtered[parseInt(page.dataset.index)];
      lbTitle.textContent = getText(dish,'title');
      lbDesc.textContent = getText(dish,'desc');
      lbPrice.textContent = formatPrice(dish.price);
      addToCartLb.onclick = ()=>{ addToCart(dish); renderCart(); };
      lightbox.classList.remove('hidden');
    };
  });
}
closeLb.onclick = ()=>lightbox.classList.add('hidden');
lightbox.onclick = e=>{ if(e.target===lightbox) lightbox.classList.add('hidden'); };

// category filter change
catFilter.onchange = ()=>{ renderPages(); };

// language
function getText(dish,field){
  const lang = localStorage.getItem('menu_lang') || 'es';
  if(field==='title') return lang==='es' ? dish.title_es : dish.title_en;
  return lang==='es' ? dish.desc_es : dish.desc_en;
}
langSelect.onchange = ()=>{ localStorage.setItem('menu_lang', langSelect.value); renderPages(); };
function loadLang(){ const l = localStorage.getItem('menu_lang') || 'es'; langSelect.value = l; }

// theme
function applyThemeOnLoad(){
  const saved = localStorage.getItem('menu_theme');
  if(saved) document.documentElement.dataset.theme = saved;
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }
  toggleDark.onclick = ()=>{
    const cur = document.documentElement.dataset.theme;
    const next = cur==='dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('menu_theme', next);
  };
}

// cart
function addToCart(dish){
  const cart = JSON.parse(localStorage.getItem('menu_cart')||'[]');
  cart.push(dish);
  localStorage.setItem('menu_cart', JSON.stringify(cart));
  cartCount.textContent = cart.length;
}
function renderCart(){
  const cart = JSON.parse(localStorage.getItem('menu_cart')||'[]');
  cartCount.textContent = cart.length;
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach((it, i)=>{
    total += Number(it.price||0);
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${getText(it,'title')}</strong><div>${formatPrice(it.price)}</div></div>
      <button data-i="${i}" class="remove">Eliminar</button>`;
    cartList.appendChild(li);
  });
  cartTotal.textContent = 'Total: ' + formatPrice(total);
  document.querySelectorAll('#cartList .remove').forEach(btn=>{
    btn.onclick = ()=>{ removeFromCart(Number(btn.dataset.i)); };
  });
}
function removeFromCart(i){
  const cart = JSON.parse(localStorage.getItem('menu_cart')||'[]');
  cart.splice(i,1);
  localStorage.setItem('menu_cart', JSON.stringify(cart));
  renderCart();
}
openCart.onclick = ()=>{ cartDrawer.classList.remove('hidden'); cartDrawer.setAttribute('aria-hidden','false'); renderCart(); };
closeCart.onclick = ()=>{ cartDrawer.classList.add('hidden'); cartDrawer.setAttribute('aria-hidden','true'); };
checkout.onclick = ()=>{ alert('Pedido simulado. Total: ' + cartTotal.textContent); localStorage.removeItem('menu_cart'); renderCart(); cartDrawer.classList.add('hidden'); };

// admin
openAdmin.onclick = ()=>{ admin.classList.remove('hidden'); renderAdminList(); };
closeAdmin.onclick = ()=>{ admin.classList.add('hidden'); };
document.getElementById('addDish').onclick = addOrUpdateDish;
document.getElementById('clearForm').onclick = ()=>{ document.getElementById('dishForm').reset(); document.getElementById('dishIndex').value='-1'; };
downloadJSON.onclick = ()=>{ const blob = new Blob([JSON.stringify(dishes,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='dishes.json'; a.click(); };
uploadJSON.onchange = (e)=>{ const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ()=>{ try{ dishes = JSON.parse(reader.result); saveDishes(); populateCategoryFilter(); renderPages(); alert('JSON cargado'); }catch(err){ alert('JSON inválido'); } }; reader.readAsText(f); };
resetSample.onclick = ()=>{ dishes = SAMPLE.slice(); saveDishes(); populateCategoryFilter(); renderPages(); alert('Ejemplo restaurado'); };

function renderAdminList(){
  adminList.innerHTML = '';
  dishes.forEach((d,idx)=>{
    const div = document.createElement('div');
    div.className='admin-item';
    div.innerHTML = `<strong>${d.title_es} / ${d.title_en}</strong>
      <div>Cat: ${d.category} — ${formatPrice(d.price)}</div>
      <div class="admin-item-actions">
        <button data-i="${idx}" class="edit">Editar</button>
        <button data-i="${idx}" class="del">Eliminar</button>
      </div>`;
    adminList.appendChild(div);
  });
  document.querySelectorAll('.admin-item .edit').forEach(b=>b.onclick=()=>editDish(Number(b.dataset.i)));
  document.querySelectorAll('.admin-item .del').forEach(b=>{ b.onclick=()=>{ if(confirm('Eliminar plato?')){ dishes.splice(Number(b.dataset.i),1); saveDishes(); populateCategoryFilter(); renderPages(); renderAdminList(); } };});
}

function editDish(i){
  const d = dishes[i];
  document.getElementById('dishIndex').value = i;
  document.getElementById('title_es').value = d.title_es;
  document.getElementById('title_en').value = d.title_en;
  document.getElementById('desc_es').value = d.desc_es;
  document.getElementById('desc_en').value = d.desc_en;
  document.getElementById('category').value = d.category;
  document.getElementById('price').value = d.price;
  document.getElementById('img').value = d.img;
}

function addOrUpdateDish(){
  const idx = Number(document.getElementById('dishIndex').value);
  const newDish = {
    title_es: document.getElementById('title_es').value || 'Sin título',
    title_en: document.getElementById('title_en').value || 'No title',
    desc_es: document.getElementById('desc_es').value || '',
    desc_en: document.getElementById('desc_en').value || '',
    category: document.getElementById('category').value || 'General',
    price: Number(document.getElementById('price').value) || 0,
    img: document.getElementById('img').value || 'images/placeholder.jpg'
  };
  if(idx>=0){ dishes[idx]=newDish; } else { dishes.push(newDish); }
  saveDishes(); populateCategoryFilter(); renderPages(); renderAdminList();
  document.getElementById('dishForm').reset();
  document.getElementById('dishIndex').value='-1';
  alert('Guardado localmente. Descarga JSON para subir al repo si quieres persistir en GitHub.');
}

// utilities
function formatPrice(n){ return n==0 ? '$0' : (typeof n==='number' ? '$' + n.toLocaleString('es-CO') : n); }

// theme dark styles via data-theme
const style = document.createElement('style');
style.innerHTML = `[data-theme="dark"]{ --bg:#111; --card:#161616; color:#eee } [data-theme="dark"] body{background:var(--bg)} [data-theme="dark"] .topbar{background:rgba(255,255,255,0.02)}`;
document.head.appendChild(style);

// persistence for theme and lang
window.addEventListener('storage', (e)=>{ if(e.key==='menu_dishes_v1'){ dishes = loadDishes(); populateCategoryFilter(); renderPages(); } });

// cart render on load
function renderCartInit(){ renderCart(); }
renderCartInit();

// helpers
function getAllCategories(){ return Array.from(new Set(dishes.map(d=>d.category))).sort(); }

// populate category select
function populateCategoryOptions(){
  const cats = getAllCategories();
  catFilter.innerHTML = '<option value="all">Todas</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
populateCategoryOptions();
catFilter.onchange = ()=>{ renderPages(); };

// load theme/lang selections UI
(function(){
  const savedTheme = localStorage.getItem('menu_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark':'light');
  document.documentElement.dataset.theme = savedTheme;
})();

// cart UI update
function setupEvents(){
  // admin close
  document.getElementById('closeAdmin').onclick = ()=>admin.classList.add('hidden');
  // download handled above
  // cart close
  document.getElementById('closeCart').onclick = ()=>cartDrawer.classList.add('hidden');
  // pwa install
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; pwaPrompt.classList.remove('hidden'); });
  installBtn.onclick = async ()=>{ if(deferredPrompt){ deferredPrompt.prompt(); const choice = await deferredPrompt.userChoice; deferredPrompt = null; pwaPrompt.classList.add('hidden'); } };
  dismissPwa.onclick = ()=>pwaPrompt.classList.add('hidden');
}

// PWA setup
function setupPWA(){ /* nothing else required here */ }

// format price helper used earlier

// initial save if none
if(!localStorage.getItem('menu_dishes_v1')){ localStorage.setItem('menu_dishes_v1', JSON.stringify(dishes)); }

// helper to render pages initially
renderPages();
