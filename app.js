/* app.js - Menú + Panel admin simple (base64 uploads) - No carrito */

const SAMPLE = [
  {
    title_es: "Ceviche Tropical",
    title_en: "Tropical Ceviche",
    desc_es: "Mariscos frescos, leche de tigre cítrica y mango.",
    desc_en: "Fresh seafood, citrus leche de tigre and mango.",
    category: "Mariscos",
    price: 32000,
    img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+7LJIAAAAASUVORK5CYII="
  },
  {
    title_es: "Lomo a la Parrilla",
    title_en: "Grilled Loin",
    desc_es: "Corte jugoso con papas rústicas y chimichurri.",
    desc_en: "Juicy cut with rustic potatoes and chimichurri.",
    category: "Carnes",
    price: 45000,
    img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+7LJIAAAAASUVORK5CYII="
  },
  {
    title_es: "Ensalada de Quinoa",
    title_en: "Quinoa Salad",
    desc_es: "Quinoa orgánica, aguacate y semillas tostadas.",
    desc_en: "Organic quinoa, avocado and toasted seeds.",
    category: "Ensaladas",
    price: 22000,
    img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+7LJIAAAAASUVORK5CYII="
  }
];

const STORAGE_KEY = "menu_dishes_v1";

let dishes = loadDishes();        // all dishes
let filtered = [];                // current filtered list by category
let index = 0;

// DOM
const book = document.getElementById("book");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const counter = document.getElementById("pageCounter");
const catFilter = document.getElementById("catFilter");
const langSelect = document.getElementById("langSelect");
const toggleDark = document.getElementById("toggleDark");
const openAdmin = document.getElementById("openAdmin");
const admin = document.getElementById("admin");
const closeAdmin = document.getElementById("closeAdmin");
const adminList = document.getElementById("adminList");
const addDishBtn = document.getElementById("addDish");
const clearFormBtn = document.getElementById("clearForm");
const downloadJSON = document.getElementById("downloadJSON");
const uploadJSON = document.getElementById("uploadJSON");
const resetSample = document.getElementById("resetSample");

// Lightbox
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbDesc = document.getElementById("lbDesc");
const lbPrice = document.getElementById("lbPrice");
const closeLb = document.getElementById("closeLb");

document.addEventListener("DOMContentLoaded", init);

function init(){
  populateCategoryFilter();
  loadLang();
  applyThemeOnLoad();
  renderPages();
  setupEvents();
}

/* STORAGE */
function loadDishes(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SAMPLE.slice();
  }catch(e){ return SAMPLE.slice(); }
}
function saveDishes(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
}

/* CATEGORIES */
function populateCategoryFilter(){
  const cats = Array.from(new Set(dishes.map(d=>d.category))).sort();
  catFilter.innerHTML = `<option value="all">Todas</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join("");
}

/* RENDER PAGES */
function renderPages(){
  filtered = (catFilter.value === "all") ? dishes.slice() : dishes.filter(d=>d.category === catFilter.value);
  if(filtered.length === 0){
    book.innerHTML = `<div class="page active"><div class="page-inner"><h2>No hay platos</h2></div></div>`;
    counter.textContent = "0 / 0";
    return;
  }
  book.innerHTML = "";
  filtered.forEach((dish, idx) => {
    const page = document.createElement("article");
    page.className = "page";
    page.dataset.index = idx;
    page.innerHTML = `
      <div class="page-inner">
        <h2 class="dish-title">${getText(dish,'title')}</h2>
        <div class="dish-card">
          <img class="dish-img" src="${dish.img}" alt="${getText(dish,'title')}" />
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
  counter.textContent = `${index+1} / ${filtered.length}`;
}

/* Update classes for left/active/right */
function updatePageClasses(){
  const pages = Array.from(document.querySelectorAll(".page"));
  pages.forEach((p,i)=>{
    p.classList.remove("left","active","right","flip");
    if(i < index) p.classList.add("left");
    else if(i > index) p.classList.add("right");
    else p.classList.add("active");
  });
}

/* Navigation */
prevBtn.addEventListener("click", ()=>{ index = Math.max(0, index - 1); updatePageClasses(); counter.textContent = `${index+1} / ${filtered.length}`; });
nextBtn.addEventListener("click", ()=>{ index = Math.min(filtered.length - 1, index + 1); updatePageClasses(); counter.textContent = `${index+1} / ${filtered.length}`; });

/* Image click -> flip + lightbox */
function attachImageHandlers(){
  document.querySelectorAll(".dish-img").forEach(img => {
    img.onclick = ()=>{
      const page = img.closest(".page");
      page.classList.add("flip");
      setTimeout(()=>page.classList.remove("flip"),900);
      const dish = filtered[parseInt(page.dataset.index)];
      lbImg.src = dish.img;
      lbTitle.textContent = getText(dish,'title');
      lbDesc.textContent = getText(dish,'desc');
      lbPrice.textContent = formatPrice(dish.price);
      lightbox.classList.remove("hidden");
    };
  });
}
closeLb.onclick = ()=>lightbox.classList.add("hidden");
lightbox.onclick = e=>{ if(e.target === lightbox) lightbox.classList.add("hidden"); };

/* Language */
function getText(dish, field){
  const lang = localStorage.getItem('menu_lang') || 'es';
  if(field === 'title') return lang === 'es' ? dish.title_es : dish.title_en;
  if(field === 'desc')  return lang === 'es' ? dish.desc_es  : dish.desc_en;
  return '';
}
function loadLang(){ const l = localStorage.getItem('menu_lang') || 'es'; langSelect.value = l; }
langSelect.onchange = ()=>{ localStorage.setItem('menu_lang', langSelect.value); renderPages(); };

/* Theme */
function applyThemeOnLoad(){
  const saved = localStorage.getItem('menu_theme');
  if(saved) document.documentElement.dataset.theme = saved;
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }
  toggleDark.onclick = ()=>{
    const cur = document.documentElement.dataset.theme;
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('menu_theme', next);
  };
}

/* Utilities */
function formatPrice(n){ return (typeof n === 'number') ? '$' + n.toLocaleString('es-CO') : ('$' + n); }

/* ADMIN: open/close and bindings */
openAdmin.onclick = ()=>{ admin.classList.remove('hidden'); renderAdminList(); populateCategoryFilter(); };
closeAdmin.onclick = ()=>{ admin.classList.add('hidden'); };

function renderAdminList(){
  adminList.innerHTML = "";
  dishes.forEach((d,i)=>{
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <img src="${d.img}" alt="${d.title_es}" />
      <h4>${d.title_es} / ${d.title_en}</h4>
      <div>Cat: ${d.category} — ${formatPrice(d.price)}</div>
      <div style="margin-top:8px">
        <button data-i="${i}" class="edit">Editar</button>
        <button data-i="${i}" class="del">Eliminar</button>
      </div>
    `;
    adminList.appendChild(div);
  });

  // bind edit/delete
  adminList.querySelectorAll('.edit').forEach(b=>{
    b.onclick = ()=>{ loadDishToForm(Number(b.dataset.i)); };
  });
  adminList.querySelectorAll('.del').forEach(b=>{
    b.onclick = ()=>{ if(confirm('Eliminar plato?')){ dishes.splice(Number(b.dataset.i),1); saveDishes(); populateCategoryFilter(); renderPages(); renderAdminList(); } };
  });
}

/* Form helpers */
function loadDishToForm(i){
  const d = dishes[i];
  document.getElementById('dishIndex').value = i;
  document.getElementById('title_es').value = d.title_es;
  document.getElementById('title_en').value = d.title_en;
  document.getElementById('desc_es').value = d.desc_es;
  document.getElementById('desc_en').value = d.desc_en;
  document.getElementById('category').value = d.category;
  document.getElementById('price').value = d.price;
  // image file cannot be set programmatically; keep in mind user can re-upload to replace
}

/* Add / Update dish with base64 image support */
document.getElementById('addDish').onclick = async ()=>{
  const idx = Number(document.getElementById('dishIndex').value);
  const title_es = document.getElementById('title_es').value || 'Sin título';
  const title_en = document.getElementById('title_en').value || title_es;
  const desc_es = document.getElementById('desc_es').value || '';
  const desc_en = document.getElementById('desc_en').value || desc_es;
  const category = document.getElementById('category').value || 'General';
  const price = Number(document.getElementById('price').value) || 0;
  const file = document.getElementById('imgFile').files[0];

  let imgData = null;
  if(file){
    imgData = await fileToDataURL(file);
  }

  const newDish = {
    title_es, title_en, desc_es, desc_en, category, price,
    img: imgData || (idx >=0 ? dishes[idx].img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+7LJIAAAAASUVORK5CYII=")
  };

  if(idx >= 0){
    dishes[idx] = newDish;
  } else {
    dishes.push(newDish);
  }
  saveDishes();
  populateCategoryFilter();
  renderPages();
  renderAdminList();
  clearForm();
  alert('Plato guardado en el navegador (localStorage). Descarga JSON si quieres persistirlo fuera.');
};

function clearForm(){
  document.getElementById('dishForm').reset();
  document.getElementById('dishIndex').value = -1;
}
document.getElementById('clearForm').onclick = clearForm;

/* File to base64 */
function fileToDataURL(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = ()=>res(reader.result);
    reader.onerror = ()=>rej(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

/* JSON import/export */
downloadJSON.onclick = ()=>{
  const blob = new Blob([JSON.stringify(dishes, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'dishes.json'; a.click();
};
uploadJSON.onchange = (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const imported = JSON.parse(reader.result);
      if(Array.isArray(imported)){
        dishes = imported;
        saveDishes();
        populateCategoryFilter();
        renderPages();
        renderAdminList();
        alert('JSON cargado.');
      } else alert('JSON inválido: se espera un arreglo.');
    }catch(err){ alert('JSON inválido.'); }
  };
  reader.readAsText(f);
};
resetSample.onclick = ()=>{
  dishes = SAMPLE.slice();
  saveDishes();
  populateCategoryFilter();
  renderPages();
  renderAdminList();
  alert('Ejemplo restaurado.');
};

/* load dish on init, render admin list if open */
function setupEvents(){
  catFilter.onchange = ()=>{ renderPages(); index = 0; updatePageClasses(); counter.textContent = `${index+1} / ${filtered.length}`; };
}

/* helper to set initial saved dishes and initial UI */
if(!localStorage.getItem(STORAGE_KEY)){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE));
  dishes = SAMPLE.slice();
}
populateCategoryFilter();
renderPages();
