// =====================================
// CONFIG
// =====================================
const STORAGE_KEY = "dishesData";
let dishes = [];
let selectedDishId = null;

// =====================================
// LOAD JSON or LOCALSTORAGE
// =====================================

async function loadInitialDishes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        dishes = JSON.parse(stored);
        return;
    }

    try {
        const res = await fetch("dishes.json");
        dishes = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
    } catch (err) {
        console.error("Error cargando dishes.json", err);
        dishes = [];
    }
}

// =====================================
// SAVE
// =====================================

function saveDishes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
}

// =====================================
// MENU RENDER
// =====================================

function renderMenu() {
    const container = document.getElementById("menuContainer");
    if (!container) return;

    container.innerHTML = "";

    if (dishes.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No hay platos aún.</p>`;
        return;
    }

    dishes.forEach((dish) => {
        const card = document.createElement("div");
        card.className = "dish-card";

        card.innerHTML = `
            <img class="dish-thumb" src="${dish.image}" alt="${dish.name}">
            <h3>${dish.name}</h3>
            <p>${dish.description}</p>
            <span class="price">$ ${dish.price}</span>
        `;

        container.appendChild(card);

        // animación al hacer clic ampliando la imagen
        card.querySelector(".dish-thumb").addEventListener("click", () => {
            showImagePopup(dish.image);
        });
    });
}

// =====================================
// POPUP DE IMAGEN AMPLIADA
// =====================================

function showImagePopup(imgBase64) {
    const popup = document.createElement("div");
    popup.className = "image-popup";
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">&times;</span>
            <img src="${imgBase64}">
        </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-btn").onclick = () => popup.remove();
    popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
    };
}

// =====================================
// ADMIN PANEL
// =====================================

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    dishes.forEach((dish) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${dish.name}</td>
            <td>${dish.price}</td>
            <td><img src="${dish.image}" style="width:50px; height:50px; object-fit:cover;"></td>
            <td>
                <button onclick="editDish(${dish.id})">Editar</button>
                <button onclick="deleteDish(${dish.id})" class="danger">Eliminar</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// =====================================
// ADD / EDIT / DELETE DISH
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    loadInitialDishes().then(() => {
        renderMenu();
        renderAdminTable();
    });

    const form = document.getElementById("dishForm");
    if (form) {
        form.addEventListener("submit", saveDishFromForm);
    }

    const imageInput = document.getElementById("imageInput");
    if (imageInput) {
        imageInput.addEventListener("change", handleImageUpload);
    }
});

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
        // edit
        const index = dishes.findIndex((d) => d.id === selectedDishId);
        dishes[index] = {
            ...dishes[index],
            name,
            description,
            price,
            image
        };
    } else {
        // new
        const newDish = {
            id: Date.now(),
            name,
            description,
            price,
            image
        };
        dishes.push(newDish);
    }

    saveDishes();
    renderAdminTable();
    renderMenu();
    clearForm();
}

function editDish(id) {
    const dish = dishes.find((d) => d.id === id);
    selectedDishId = id;

    document.getElementById("dishName").value = dish.name;
    document.getElementById("dishDescription").value = dish.description;
    document.getElementById("dishPrice").value = dish.price;
    document.getElementById("previewImg").src = dish.image;

    document.getElementById("formTitle").innerText = "Editar Plato";
}

function deleteDish(id) {
    if (!confirm("¿Eliminar este plato?")) return;

    dishes = dishes.filter((d) => d.id !== id);
    saveDishes();
    renderAdminTable();
    renderMenu();
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
