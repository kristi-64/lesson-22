const productForm = document.getElementById("add-form");
const formTitleHeader = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");

const inputTitle = document.getElementById("title");
const inputPrice = document.getElementById("price");
const inputDiscount = document.getElementById("discount");
const inputCategory = document.getElementById("category");
const inputImage = document.getElementById("image");

const listContainer = document.querySelector(".products-list");

let activeEditId = null;

function buildProductCard(product) {
  const card = document.createElement("li");
  card.className = "product-item";
  card.dataset.id = product.id;

  const discount = Number(product.discountPercentage) || 0;
  const discountedPrice = (product.price * (1 - discount / 100)).toFixed(2);

  card.innerHTML = `
    <img src="${product.thumbnail}" alt="${product.title}" />
    <div class="product-details">
      <h3>${product.title}</h3>
      <span class="product-category">${product.category}</span>
      <div>
        <strong class="product-price">$${discountedPrice}</strong>
        <del class="product-original-price">$${Number(product.price).toFixed(2)}</del>
      </div>
    </div>
    <div class="product-actions">
      <button class="edit-button">რედაქტირება</button>
      <button class="delete-button">წაშლა</button>
    </div>
  `;

  const editBtn = card.querySelector(".edit-button");
  const deleteBtn = card.querySelector(".delete-button");

  editBtn.addEventListener("click", () => handleEditClick(product.id));
  deleteBtn.addEventListener("click", () =>
    handleDeleteClick(product.id, card),
  );

  return card;
}

async function loadProducts() {
  try {
    const res = await fetch("https://dummyjson.com/products?limit=5");
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const data = await res.json();
    listContainer.innerHTML = "";

    data.products.forEach((prod) => {
      listContainer.appendChild(buildProductCard(prod));
    });
  } catch (err) {
    console.error("პროდუქტების ჩატვირთვა ვერ მოხერხდა:", err);
  }
}

async function handleDeleteClick(id, cardElement) {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("წაშლის შეცდომა");

    cardElement.remove();
  } catch (err) {
    console.error(err.message);
  }
}

async function handleEditClick(id) {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`);
    if (!res.ok) throw new Error("მონაცემები ვერ მოიძებნა");

    const product = await res.json();

    inputTitle.value = product.title;
    inputPrice.value = product.price;
    inputDiscount.value = product.discountPercentage || 0;
    inputCategory.value = product.category;
    inputImage.value = product.thumbnail;

    activeEditId = id;
    formTitleHeader.textContent = "პროდუქტის რედაქტირება";
    submitBtn.textContent = "განახლება";
  } catch (err) {
    console.error(err.message);
  }
}

async function createProduct(payload) {
  try {
    const res = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("დამატება ვერ მოხერხდა");

    const createdProduct = await res.json();
    listContainer.appendChild(buildProductCard(createdProduct));
    resetFormState();
  } catch (err) {
    console.error(err.message);
  }
}

async function editProduct(id, payload) {
  try {
    const res = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("განახლება ვერ მოხერხდა");

    const updatedData = await res.json();
    const existingCard = listContainer.querySelector(`[data-id="${id}"]`);

    if (existingCard) {
      existingCard.replaceWith(buildProductCard({ ...updatedData, id }));
    }

    resetFormState();
  } catch (err) {
    console.error(err.message);
  }
}

function resetFormState() {
  productForm.reset();
  activeEditId = null;
  formTitleHeader.textContent = "ახალი პროდუქტის დამატება";
  submitBtn.textContent = "პროდუქტის დამატება";
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    title: inputTitle.value.trim(),
    price: Number(inputPrice.value),
    discountPercentage: Number(inputDiscount.value) || 0,
    category: inputCategory.value,
    thumbnail: inputImage.value.trim(),
    rating: 5,
    stock: 10,
  };

  if (activeEditId) {
    editProduct(activeEditId, formData);
  } else {
    createProduct(formData);
  }
});

loadProducts();
