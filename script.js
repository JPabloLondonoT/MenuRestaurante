/* ============================================================
   SCRIPT UNIFICADO: MENU + ADMIN
   ============================================================ */

let dishes = [];
let currentPage = 0;
let filtered = [];
let lang = "es";
const MAX_IMG_MB = 4;   // tamaño máximo aceptado
const MAX_BG_MB  = 6;   // para background más grande


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

  if (document.getElementById("book")) {
    initCategories();
    applyFilter();
  }

  if (document.getElementById("adminList")) {
    adminRenderList();
  }
}


/* ============================================================
   MENU: CATEGORÍAS
   ============================================================ */
function initCategories() {
  const select = document.getElementById("catFilter");
  const cats = [...new Set(dishes.map(d => d.category))];

  cats.forEach(c => {
    const op = document.createElement("option");
    op.value = c;
    op.textContent = c;
    select.appendChild(op);
  });
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
   MENU: Página grande con background
   ============================================================ */
function renderPage() {
  const book = document.getElementById("book");
  if (!book) return;

  book.innerHTML = "";

  if (filtered.length === 0) {
    book.innerHTML = "<p>No hay platos disponibles.</p>";
    return;
  }

  const d = filtered[currentPage];

  const page = document.createElement("div");
  page.className = "page";

  page.style.backgroundImage = `url('${d.background}')`;
  page.style.backgroundSize = "cover";
  page.style.backgroundPosition = "center";

  const content = document.createElement("div");
  content.className = "page-content";

  content.innerHTML = `
      <h2>${lang === "es" ? d.title_es : d.title_en}</h2>
      <p>${lang === "es" ? d.desc_es : d.desc_en}</p>
      <p class="price">$ ${Number(d.price).toLocaleString()}</p>
  `;

  page.appendChild(content);

  page.addEventListener("click", () => openLightbox(d));

  book.appendChild(page);
}


/* ============================================================
   MENU: Lightbox con miniatura real
   ============================================================ */
function openLightbox(d) {
  document.getElementById("lbImg").src = d.img;
  document.getElementById("lbTitle").textContent = "";
  document.getElementById("lbDesc").textContent = "";
  document.getElementById("lbPrice").textContent = "";
  document.getElementById("lightbox").classList.remove("hidden");
}

if (document.getElementById("closeLb")) {
  document.getElementById("closeLb").onclick = () =>
    document.getElementById("lightbox").classList.add("hidden");
}


/* ============================================================
   MENU: Paginación
   ============================================================ */
if (document.getElementById("nextBtn")) {
  document.getElementById("nextBtn").onclick = () => {
    if (currentPage < filtered.length - 1) {
      currentPage++;
      renderPage();
      updateCounter();
    }
  };
}

if (document.getElementById("prevBtn")) {
  document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage();
      updateCounter();
    }
  };
}

function updateCounter() {
  const el = document.getElementById("pageCounter");
  if (el) el.textContent = `${currentPage + 1} / ${filtered.length}`;
}


/* ============================================================
   MENU: Cambiar idioma
   ============================================================ */
if (document.getElementById("langSelect")) {
  document.getElementById("langSelect").onchange = (e) => {
    lang = e.target.value;
    renderPage();
  };
}


/* ============================================================
   MENU: Modo oscuro
   ============================================================ */
if (document.getElementById("toggleDark")) {
  document.getElementById("toggleDark").onclick = () => {
    document.body.classList.toggle("dark");
  };
}


/* ============================================================
   ==================== ADMIN SYSTEM ============================
   ============================================================ */

/* --------------------- Mostrar lista --------------------- */
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


/* --------------------- Cargar a formulario --------------------- */
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


/* --------------------- Limpiar formulario --------------------- */
function adminClearForm() {
  document.getElementById("dishForm").reset();
  document.getElementById("dishIndex").value = -1;
  document.getElementById("imgPreview").src = "";
  document.getElementById("bgPreview").src = "";
}


/* --------------------- Eliminar --------------------- */
function adminDelete(i) {
  if (!confirm("¿Eliminar plato?")) return;
  dishes.splice(i, 1);
  adminRenderList();
}


/* --------------------- Guardar / editar --------------------- */
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
  const bgFile  = document.getElementById("bgFile").files[0];

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


/* --------------------- Descargar JSON --------------------- */
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
