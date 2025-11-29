/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */
let dishes = [];
let currentPage = 0;
let filtered = [];
let lang = "es";
const MAX_IMG_MB = 4;
const MAX_BG_MB = 6;

let touchStartX = 0;
let touchEndX = 0;

const flipSound = document.getElementById("flipSound");

/* ============================================================
   UTILIDADES: Convertir imágenes a Base64
   ============================================================ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   CARGAR dishes.json AUTOMÁTICAMENTE
   ============================================================ */
async function loadDishes() {
  try {
    const resp = await fetch("dishes.json", { cache: "no-store" });
    dishes = await resp.json();
  } catch (e) {
    alert("⚠ No se pudo cargar dishes.json del servidor");
    dishes = [];
  }

  // Menú
  if (document.getElementById("book")) {
    initCategories();
    initSidebarCategories();
    filtered = dishes;
    renderPage();
    updateCounter();
  }

  // Admin
  if (document.getElementById("adminList")) {
    adminRenderList();
  }
}

/* ============================================================
   MENU: CATEGORÍAS (select)
   ============================================================ */
function initCategories() {
  const select = document.getElementById("catFilter");
  if (!select) return;

  select.innerHTML = `
    <option value="all">${lang === "es" ? "Todas" : "All"}</option>
  `;

  const cats = [...new Set(dishes.map(d => d.category))];

  cats.forEach(c => {
    const op = document.createElement("option");
    op.value = c;
    op.textContent = c;
    select.appendChild(op);
  });

  select.onchange = applyFilter;
}

/* ============================================================
   MENU: Filtrar platos
   ============================================================ */
function applyFilter() {
  const cat = document.getElementById("catFilter").value;

  filtered = cat === "all"
    ? dishes
    : dishes.filter(d => d.category === cat);

  currentPage = 0;
  renderPage();
  updateCounter();
}

/* ============================================================
   MENU: Lightbox
   ============================================================ */
function openLightbox(d) {
  document.getElementById("lbImg").src = d.img;
  document.getElementById("lbTitle").textContent = lang === "es" ? d.title_es : d.title_en;
  document.getElementById("lbDesc").textContent = lang === "es" ? d.desc_es : d.desc_en;
  document.getElementById("lbPrice").textContent = "$ " + Number(d.price).toLocaleString();

  document.getElementById("lightbox").classList.remove("hidden");
}

if (document.getElementById("closeLb")) {
  document.getElementById("closeLb").onclick = () =>
    document.getElementById("lightbox").classList.add("hidden");
}

/* ============================================================
   BOTONES DE PÁGINAS
   ============================================================ */

function playPageSound() {
  const flipSound = new Audio("sounds/page-flip.mp3");
  flipSound.currentTime = 0;
  flipSound.play();
}

function nextPage() {
  if (currentPage < filtered.length - 1) {
    playPageSound();
    currentPage++;
    renderPage(1);
    updateCounter();
  }
}

function prevPage() {
  if (currentPage > 0) {
    playPageSound();
    currentPage--;
    renderPage(-1);
    updateCounter();
  }
}

if (document.getElementById("nextBtn")) {
  document.getElementById("nextBtn").onclick = nextPage;
}

if (document.getElementById("prevBtn")) {
  document.getElementById("prevBtn").onclick = prevPage;
}

function updateCounter() {
  const el = document.getElementById("pageCounter");
  if (el) el.textContent = `${currentPage + 1} / ${filtered.length}`;
}

/* ============================================================
   CAMBIO DE IDIOMA (categorías, títulos, sidebar)
   ============================================================ */
if (document.getElementById("langSelect")) {
  document.getElementById("langSelect").onchange = (e) => {
    lang = e.target.value;
    document.getElementById("catTitle").textContent =
      lang === "es" ? "Categorías" : "Categories";

    initCategories();
    initSidebarCategories();
    renderPage();
  };
}

/* ============================================================
   MODO OSCURO
   ============================================================ */
if (document.getElementById("toggleDark")) {
  document.getElementById("toggleDark").onclick = () => {
    document.body.classList.toggle("dark");
  };
}

/* ============================================================
   ANIMACIÓN PASO PÁGINA + SONIDO + SWIPE
   ============================================================ */
function addSwipeEvents(layer) {
  layer.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  layer.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  layer.addEventListener("mousedown", e => {
    touchStartX = e.screenX;
  });
  layer.addEventListener("mouseup", e => {
    touchEndX = e.screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) < 40) return;

  if (diff < 0) nextPage();
  else prevPage();
}

/* ============================================================
   RENDER PÁGINA DOBLE (libro real con GSAP)
   ============================================================ */
function renderPage(direction = 0) {
  const book = document.getElementById("book");
  if (!book) return;

  book.innerHTML = "";

  if (filtered.length === 0) {
    book.innerHTML = "<p>No hay platos disponibles.</p>";
    return;
  }

  const d = filtered[currentPage];

  const pageDouble = document.createElement("div");
  pageDouble.className = "page-double";

  const shadow = document.createElement("div");
  shadow.className = "page-shadow";

  const left = document.createElement("div");
  left.className = "left-page";

  const right = document.createElement("div");
  right.className = "right-page";

  right.innerHTML = `
      <h2>${lang === "es" ? d.title_es : d.title_en}</h2>
      <p>${lang === "es" ? d.desc_es : d.desc_en}</p>
      <p class="price">$ ${Number(d.price).toLocaleString()}</p>
  `;
  right.style.backgroundImage = `url('${d.background}')`;
  right.style.backgroundSize = "cover";

  right.onclick = () => openLightbox(d);

  pageDouble.appendChild(left);
  pageDouble.appendChild(right);
  pageDouble.appendChild(shadow);

  // Eventos táctiles en toda la página
  addSwipeEvents(document.getElementById("touchLeft"));
  addSwipeEvents(document.getElementById("touchRight"));

  book.appendChild(pageDouble);

  // Animación estilo libro + sonido
  if (direction !== 0) {
    flipSound.currentTime = 0;
    flipSound.play();

    gsap.fromTo(
      pageDouble,
      { rotateY: direction > 0 ? -90 : 90, opacity: 0 },
      { rotateY: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  } else {
    gsap.fromTo(
      pageDouble,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 }
    );
  }
}

/* ============================================================
   ==================== ADMIN SIN CAMBIOS ======================
   ============================================================ */
function adminRenderList() {
  const cont = document.getElementById("adminList");
  if (!cont) return;

  cont.innerHTML = "";

  dishes.forEach((d, i) => {
    const div = document.createElement("div");
    div.className = "admin-item";

    div.innerHTML = `
      <img src="${d.img}" class="thumb-small">
      <div class="info">
        <strong>${d.title_es}</strong><br>
        <small>${d.category} – $${d.price}</small>
      </div>
      <button class="editBtn" data-i="${i}">✏️</button>
      <button class="delBtn" data-i="${i}">🗑</button>
    `;

    cont.appendChild(div);
  });

  document.querySelectorAll(".editBtn").forEach(b =>
    b.onclick = () => adminLoadToForm(b.dataset.i)
  );

  document.querySelectorAll(".delBtn").forEach(b =>
    b.onclick = () => adminDelete(b.dataset.i)
  );
}

function adminLoadToForm(i) {
  const d = dishes[i];

  document.getElementById("dishIndex").value = i;
  document.getElementById("title_es").value = d.title_es;
  document.getElementById("title_en").value = d.title_en;
  document.getElementById("desc_es").value = d.desc_es;
  document.getElementById("desc_en").value = d.desc_en;
  document.getElementById("category").value = d.category;
  document.getElementById("price").value = d.price;

  document.getElementById("imgPreview").src = d.img;
  document.getElementById("bgPreview").src = d.background;
}

function adminClearForm() {
  document.getElementById("dishForm").reset();
  document.getElementById("dishIndex").value = -1;
  document.getElementById("imgPreview").src = "";
  document.getElementById("bgPreview").src = "";
}

function adminDelete(i) {
  if (!confirm("¿Eliminar plato?")) return;
  dishes.splice(i, 1);
  adminRenderList();
}

async function adminSave() {
  const i = Number(document.getElementById("dishIndex").value);

  const d = {
    title_es: document.getElementById("title_es").value,
    title_en: document.getElementById("title_en").value,
    desc_es: document.getElementById("desc_es").value,
    desc_en: document.getElementById("desc_en").value,
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value),
    img: document.getElementById("imgPreview").src,
    background: document.getElementById("bgPreview").src,
  };

  const imgFile = document.getElementById("imgFile").files[0];
  const bgFile = document.getElementById("bgFile").files[0];

  if (imgFile) {
    if (imgFile.size > MAX_IMG_MB * 1024 * 1024) {
      alert("Miniatura demasiado grande.");
      return;
    }
    d.img = await fileToBase64(imgFile);
  }

  if (bgFile) {
    if (bgFile.size > MAX_BG_MB * 1024 * 1024) {
      alert("Imagen de fondo demasiado grande.");
      return;
    }
    d.background = await fileToBase64(bgFile);
  }

  if (i === -1) dishes.push(d);
  else dishes[i] = d;

  adminClearForm();
  adminRenderList();
}

function adminDownload() {
  const blob = new Blob([JSON.stringify(dishes, null, 2)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dishes.json";
  a.click();
}

/* ============================================================
   SIDEBAR CATEGORÍAS
   ============================================================ */
function initSidebarCategories() {
  const list = document.getElementById("catList");
  if (!list) return;

  list.innerHTML = "";

  const liAll = document.createElement("li");
  liAll.textContent = lang === "es" ? "Todas" : "All";
  liAll.className = "cat-item";
  liAll.onclick = () => {
    filtered = dishes;
    currentPage = 0;
    renderPage();
    updateCounter();
    closeSidebar();
  };
  list.appendChild(liAll);

  const cats = [...new Set(dishes.map(d => d.category))];

  cats.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat;
    li.className = "cat-item";
    li.onclick = () => {
      filtered = dishes.filter(d => d.category === cat);
      currentPage = 0;
      renderPage();
      updateCounter();
      closeSidebar();
    };
    list.appendChild(li);
  });
}

function openSidebar() {
  document.getElementById("sidebar").classList.remove("hidden");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.add("hidden");
}

if (document.getElementById("openSidebar")) {
  document.getElementById("openSidebar").onclick = openSidebar;
}

if (document.getElementById("closeSidebar")) {
  document.getElementById("closeSidebar").onclick = closeSidebar;
}

/* ============================================================
   INICIO
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await loadDishes();

  if (document.getElementById("addDish")) {
    document.getElementById("addDish").onclick = adminSave;
    document.getElementById("clearForm").onclick = adminClearForm;
    document.getElementById("downloadJSON").onclick = adminDownload;
  }
});
