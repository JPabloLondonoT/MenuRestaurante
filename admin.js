/* ============================================================
   VARIABLES
   ============================================================ */
let dishes = [];
const MAX_IMG_MB = 4;
const MAX_BG_MB = 6;

/* ============================================================
   UTILIDADES
   ============================================================ */
function normalizeDish(d) {
  return {
    ...d,
    img: d.img || "img/no-image.png",
    background: d.background || "img/default-bg.jpg",
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   LOAD JSON
   ============================================================ */
async function loadAdminDishes() {
  try {
    const resp = await fetch("dishes.json", { cache: "no-store" });
    dishes = (await resp.json()).map(normalizeDish);
  } catch (e) {
    alert("⚠ No se pudo cargar dishes.json");
    dishes = [];
  }

  adminRenderList();
}

/* ============================================================
   RENDER LISTA
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

/* ============================================================
   CARGAR EN FORM
   ============================================================ */
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

/* ============================================================
   LIMPIAR
   ============================================================ */
function adminClearForm() {
  document.getElementById("dishForm").reset();
  document.getElementById("dishIndex").value = -1;
  document.getElementById("imgPreview").src = "";
  document.getElementById("bgPreview").src = "";
}

/* ============================================================
   ELIMINAR
   ============================================================ */
function adminDelete(i) {
  if (!confirm("¿Eliminar plato?")) return;
  dishes.splice(i, 1);
  adminRenderList();
}

/* ============================================================
   GUARDAR
   ============================================================ */
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
      alert("Fondo demasiado grande.");
      return;
    }
    d.background = await fileToBase64(bgFile);
  }

  if (i === -1) dishes.push(d);
  else dishes[i] = d;

  adminClearForm();
  adminRenderList();
}

/* ============================================================
   DESCARGAR
   ============================================================ */
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
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadAdminDishes();

  document.getElementById("addDish").onclick = adminSave;
  document.getElementById("clearForm").onclick = adminClearForm;
  document.getElementById("downloadJSON").onclick = adminDownload;
});
