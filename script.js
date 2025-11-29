// =====================================
// CONFIG
// =====================================
let dishes = [];
let selectedDishId = null;

const PAGE_SIZE = 4; // 4 platos por página del libro
let currentPage = 1;

// =====================================
// LOAD JSON
// =====================================

async function loadInitialDishes() {
    try {
        const res = await fetch("dishes.json");
        dishes = await res.json();
        console.log("Platos cargados desde dishes.json", dishes);
    } catch (err) {
        console.error("Error cargando dishes.json", err);
        dishes = [];
    }
}

// =====================================
// ADMIN SAVE
// =====================================
// Nota: Solo afecta a la tabla y al menú en vivo.
// No se guarda en dishes.json (GitHub Pages no permite escribir).
function saveDishes() {
    console.warn("⚠️ En GitHub Pages los cambios NO se guardan en dishes.json.");
}

// =====================================
// MENU (MODE MENU.HTML - BOOK STYLE)
// =====================================

function renderBook() {
    const book = document.getElementById("book");
    if (!book) return;

    book.innerHTML = "";

    if (dishes.length === 0) {
        book.innerHTML = `<p class="empty">No hay platos aún.</p>`;
        return;
    }

    const totalPages = Math.ceil(dishes.length / PAGE_SIZE);
    document.getElementById("pageCounter").innerText =
        `${currentPage} / ${totalPages}`;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageDishes = dishes.slice(start, start + PAGE_SIZE);

    pageDishes.forEach(d => {
        const card = document.createElement("div");
        card.className = "page";

        card.innerHTML = `
            <img src="${d.img || d.image}" class="dish-img" alt="">
            <h3>${d.title_es || d.name}</h3>
            <p>${d.desc_es || d.description}</p>
            <strong>$ ${d.price}</strong>
        `;

        book.appendChild(card);
    });
}

// =====================================
// CONTROLES DE PÁGINA
// =====================================

function setupPagination() {
    const prev = document.getElementById("prevBtn");
    const next = document.getElementById("nextBtn");

    if (prev) {
        prev.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderBook();
            }
        };
    }

    if (next) {
        next.onclick = () => {
            const totalPages = Math.ceil(dishes.length / PAGE_SIZE);
            if (currentPage < totalPages) {
                currentPage++;
                renderBook();
            }
        };
    }
}

// =====================================
// MENU (MODE ADMIN.HTML - LIST STYLE)
// =====================================

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    dishes.forEach((dish) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${dish.title_es || dish.name}</td>
            <td>${dish.price}</td>
            <td><img src="${dish.img || dish.image}" style="width:50px; height:50px; object-fit:cover;"></td>
            <td>
                <button onclick="editDish('${dish.id}')">Editar</button>
                <button onclick="deleteDish('${dish.id}')" class="danger">Eliminar</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =====================================
// ADD / EDIT / DELETE DISH
// =====================================

function saveDishFromForm(e) {
    e.preventDefault();

    const name = document.getElementById("dishName").value.trim();
    const description = document.getElementById("dishDescription").value.trim();
    const price = document.getElementById("dishPrice").value.trim();
    const image = document.getElementById("previewImg").src;

    if (!name || !price || !image) {
        alert("Nombre, precio e imagen son obligatorios.");
        return;
    }

    if (selectedDishId) {
        const index = dishes.findIndex((d) => d.id === selectedDishId);
        dishes[index] = {
            ...dishes[index],
            name,
            description,
            price,
            image
        };
    } else {
        dishes.push({
            id: Date.now(),
            name,
            description,
            price,
            image
        });
    }

    saveDishes();
    renderAdminTable();
    renderBook();
    clearForm();
}

function editDish(id) {
    const dish = dishes.find((d) => d.id == id);
    if (!dish) return;

    selectedDishId = id;

    document.getElementById("dishName").value = dish.name || dish.title_es;
    document.getElementById("dishDescription").value = dish.description || dish.desc_es;
    document.getElementById("dishPrice").value = dish.price;
    document.getElementById("previewImg").src = dish.image || dish.img;

    document.getElementById("formTitle").innerText = "Editar Plato";
}

function deleteDish(id) {
    if (!confirm("¿Eliminar este plato?")) return;

    dishes = dishes.filter((d) => d.id != id);
    saveDishes();
    renderAdminTable();
    renderBook();
}

function clearForm() {
    selectedDishId = null;
    document.getElementById("dishForm").reset();
    document.getElementById("previewImg").src = "";
    document.getElementById("formTitle").innerText = "Nuevo Plato";
}

// =====================================
// IMAGE UPLOAD → BASE64
// =====================================

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById("previewImg").src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// =====================================
// INIT
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    loadInitialDishes().then(() => {
        renderBook();
        renderAdminTable();
        setupPagination();
    });

    const form = document.getElementById("dishForm");
    if (form) form.addEventListener("submit", saveDishFromForm);

    const imageInput = document.getElementById("imageInput");
    if (imageInput) imageInput.addEventListener("change", handleImageUpload);
});
