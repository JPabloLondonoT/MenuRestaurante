/* ============================================================
   MENU INTERACTIVO – script.js
   Compatible con pages grandes con background + miniatura en popup
   ============================================================ */

let dishes = [];
let currentPage = 0;
let filtered = [];
let lang = "es";

/* ============================
   Cargar el JSON de platos
   ============================ */
fetch("dishes.json")
  .then(r => r.json())
  .then(data => {
    dishes = data;
    initCategories();
    applyFilter();
  });

/* ============================
   Generar categorías dinámicas
   ============================ */
function initCategories() {
  const cats = [...new Set(dishes.map(d => d.category))];
  const select = document.getElementById("catFilter");

  cats.forEach(c => {
    const op = document.createElement("option");
    op.value = c;
    op.textContent = c;
    select.appendChild(op);
  });
}

/* ============================
   Filtrar platos por categoría
   ============================ */
function applyFilter() {
  const cat = document.getElementById("catFilter").value;

  filtered = cat === "all"
    ? dishes
    : dishes.filter(d => d.category === cat);

  currentPage = 0;
  renderPage();
  updateCounter();
}

/* ============================
   Renderizar una página grande
   ============================ */
function renderPage() {
  const book = document.getElementById("book");
  book.innerHTML = "";

  if (filtered.length === 0) {
    book.innerHTML = "<p>No hay platos disponibles.</p>";
    return;
  }

  const d = filtered[currentPage];

  const page = document.createElement("div");
  page.className = "page";

  // Imagen grande de fondo
  page.style.backgroundImage = `url('${d.background}')`;
  page.style.backgroundSize = "cover";
  page.style.backgroundPosition = "center";

  // Contenido textual en la página
  const content = document.createElement("div");
  content.className = "page-content";

  const title = document.createElement("h2");
  title.textContent = lang === "es" ? d.title_es : d.title_en;

  const desc = document.createElement("p");
  desc.textContent = lang === "es" ? d.desc_es : d.desc_en;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = `$ ${d.price.toLocaleString()}`;

  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(price);
  page.appendChild(content);

  // Click → Lightbox miniatura
  page.addEventListener("click", () => openLightbox(d));

  book.appendChild(page);
}

/* ============================
   Lightbox con miniatura real
   ============================ */
function openLightbox(dish) {
  document.getElementById("lbImg").src = dish.img;
  document.getElementById("lbTitle").textContent = ""; // sin texto
  document.getElementById("lbDesc").textContent = "";
  document.getElementById("lbPrice").textContent = "";

  document.getElementById("lightbox").classList.remove("hidden");
}

document.getElementById("closeLb").onclick = () =>
  document.getElementById("lightbox").classList.add("hidden");


/* ============================
   Paginación
   ============================ */
document.getElementById("nextBtn").onclick = () => {
  if (currentPage < filtered.length - 1) {
    currentPage++;
    renderPage();
    updateCounter();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
    updateCounter();
  }
};

function updateCounter() {
  document.getElementById("pageCounter").textContent =
    `${currentPage + 1} / ${filtered.length}`;
}

/* ============================
   Cambiar idioma
   ============================ */
document.getElementById("langSelect").onchange = (e) => {
  lang = e.target.value;
  renderPage();
};

/* ============================
   Modo oscuro
   ============================ */
document.getElementById("toggleDark").onclick = () => {
  document.body.classList.toggle("dark");
};
