/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */
let dishes = [];
let currentPage = 0;
let filtered = [];
let lang = "es";

let touchStartX = 0;
let touchEndX = 0;

/* ============================================================
   UTILIDADES
   ============================================================ */
function normalizeDish(d) {
  return {
    ...d,
    img: d.img || "img/no-image.png",
    background: d.background || "img/default-bg.jpg",
    title_es: d.title_es || "",
    title_en: d.title_en || "",
    desc_es: d.desc_es || "",
    desc_en: d.desc_en || "",
    category: d.category || "OTROS",
    price: d.price || 0,
  };
}

async function loadDishes() {
  try {
    const resp = await fetch("dishes.json", { cache: "no-store" });
    dishes = (await resp.json()).map(normalizeDish);
    filtered = dishes;
  } catch (e) {
    alert("⚠ No se pudo cargar dishes.json");
    dishes = [];
    filtered = [];
  }

  if (document.getElementById("book")) {
    initCategories();
    initSidebarCategories();
    renderPage();
    updateCounter();
  }
}

/* ============================================================
   CATEGORÍAS
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

function applyFilter() {
  const cat = document.getElementById("catFilter").value;
  filtered = cat === "all" ? dishes : dishes.filter(d => d.category === cat);
  currentPage = 0;
  renderPage();
  updateCounter();
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function openLightbox(d) {
  document.getElementById("lbImg").src = d.img;
  document.getElementById("lbTitle").textContent = lang === "es" ? d.title_es : d.title_en;
  document.getElementById("lbDesc").textContent = lang === "es" ? d.desc_es : d.desc_en;
  document.getElementById("lbPrice").textContent = d.price ? "$ " + Number(d.price).toLocaleString() : "";
  document.getElementById("lightbox").classList.remove("hidden");
}

if (document.getElementById("closeLb")) {
  document.getElementById("closeLb").onclick = () =>
    document.getElementById("lightbox").classList.add("hidden");
}

/* ============================================================
   BOTONES DE PÁGINA
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
   CAMBIO DE IDIOMA
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
   SWIPE
   ============================================================ */
function addSwipeEvents(layer) {
  layer.addEventListener("touchstart", e => (touchStartX = e.changedTouches[0].screenX));
  layer.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  layer.addEventListener("mousedown", e => (touchStartX = e.screenX));
  layer.addEventListener("mouseup", e => {
    touchEndX = e.screenX;
    handleSwipe();
  });
}

function handleSwipe() {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) < 40) return;

  diff < 0 ? nextPage() : prevPage();
}

/* ============================================================
   RENDER
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
  const page = document.createElement("div");
  page.className = "single-page";

  let bg = d.background || d.img || "img/default-bg.jpg";

  if (bg === "img/default-bg.jpg") {
    page.style.background = "#000";
  } else {
    page.style.backgroundImage = `url('${bg}')`;
  }

  page.style.backgroundSize = "cover";
  page.style.backgroundPosition = "center";
  page.style.width = "100%";
  page.style.height = "100%";
  page.style.display = "flex";
  page.style.flexDirection = "column";
  page.style.justifyContent = "flex-end";
  page.style.padding = "20px";

  let hasText = d.title_es || d.desc_es || d.price;

  if (hasText) {
    const box = document.createElement("div");
    box.className = "info-box";
    box.style.background = "rgba(0,0,0,0.55)";
    box.style.color = "white";
    box.style.padding = "15px";
    box.style.borderRadius = "10px";
    box.style.maxWidth = "90%";

    box.innerHTML = `
      <h2>${lang === "es" ? d.title_es : d.title_en}</h2>
      <p>${lang === "es" ? d.desc_es : d.desc_en}</p>
      ${d.price ? `<p class="price">$ ${Number(d.price).toLocaleString()}</p>` : ""}
    `;

    page.appendChild(box);
    page.onclick = () => openLightbox(d);
  }

  addSwipeEvents(document.getElementById("touchLeft"));
  addSwipeEvents(document.getElementById("touchRight"));

  book.appendChild(page);

  gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 0.5 });
}

/* ============================================================
   SIDEBAR
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
document.addEventListener("DOMContentLoaded", loadDishes);
