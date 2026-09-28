import { productApi, authApi, getStoredUser, clearSession } from "./api.js";

import {
  escapeHTML,
  money,
  productImage,
  showToast,
  setupTheme,
} from "./ui.js";

let products = [];
let editingId = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupTheme();

  try {
    /*
     * Verify that the user is actually authenticated.
     * api.js will automatically attempt refresh-token
     * authentication if the short-lived access token expired.
     */
    const user = await authApi.me();

    if (!user) {
      redirectToLogin();
      return;
    }

    setupAccountButton(user);

    products = await productApi.list();

    renderTable();

    bindTabs();
    bindForm();

    updateProductCount();
  } catch (error) {
    console.error("Studio initialization failed:", error);

    clearSession();
    redirectToLogin();
  }
});

function redirectToLogin() {
  location.href = "login.html";
}

function setupAccountButton(user) {
  const account = document.getElementById("studioAccount");

  if (!account) return;

  account.textContent = "Sign out";
  account.href = "#";

  account.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    location.href = "index.html";
  });
}

function bindTabs() {
  document.querySelectorAll(".studio-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".studio-tab")
        .forEach((element) => element.classList.remove("active"));

      document
        .querySelectorAll(".studio-panel")
        .forEach((element) => element.classList.remove("active"));

      button.classList.add("active");

      document
        .getElementById(`${button.dataset.tab}Panel`)
        .classList.add("active");
    });
  });

  /*
   * "Add listing" always means a NEW product,
   * so this is where the form should be reset.
   */
  document.querySelector("[data-open-create]").addEventListener("click", () => {
    resetForm();

    document.querySelector('[data-tab="create"]').click();
  });

  document.getElementById("cancelEdit").addEventListener("click", () => {
    resetForm();

    document.querySelector('[data-tab="products"]').click();
  });

  document
    .getElementById("resetProductForm")
    .addEventListener("click", resetForm);
}

function renderTable() {
  const rows = document.getElementById("adminProductRows");

  rows.innerHTML = products
    .map(
      (product) => `
        <tr>

          <td>
            <div class="table-product">

              <img
                src="${productImage(product)}"
                alt=""
              >

              <span>
                ${escapeHTML(product.name)}
              </span>

            </div>
          </td>

          <td>
            ${escapeHTML(product.category)}
          </td>

          <td>
            ${money(product.price)}
          </td>

          <td>
            ${product.stock}
          </td>

          <td>
            <span
              class="availability ${product.stock > 0 ? "in" : "out"}"
            >
              ${product.stock > 0 ? "In stock" : "Sold out"}
            </span>
          </td>

          <td>
            <div class="row-actions">

              <button
                data-edit="${product.id}"
              >
                Edit
              </button>

              <button
                data-delete="${product.id}"
              >
                Delete
              </button>

            </div>
          </td>

        </tr>
      `,
    )
    .join("");

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editProduct(button.dataset.edit));
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () =>
      deleteProduct(button.dataset.delete),
    );
  });
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) return;

  editingId = id;

  const form = document.getElementById("productForm");

  /*
   * Populate every matching form field.
   */
  for (const [key, value] of Object.entries(product)) {
    if (!form.elements[key]) continue;

    form.elements[key].value = Array.isArray(value)
      ? value.join(", ")
      : (value ?? "");
  }

  document.getElementById("productFormEyebrow").textContent = `Editing / ${id}`;

  document.getElementById("productFormTitle").textContent = "Edit listing";

  document.getElementById("productSubmitText").textContent = "Save changes";

  /*
   * IMPORTANT:
   * Do NOT call resetForm() here.
   * The old bug happened because clicking the
   * create tab immediately reset everything.
   */
  document.querySelector('[data-tab="create"]').click();
}

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);

  if (!product) return;

  const confirmed = confirm(`Delete "${product.name}"?`);

  if (!confirmed) return;

  try {
    await productApi.remove(id);

    products = products.filter((item) => item.id !== id);

    renderTable();
    updateProductCount();

    showToast("Product deleted.");
  } catch (error) {
    console.error(error);

    if (error.status === 401) {
      clearSession();
      redirectToLogin();
      return;
    }

    showToast(error.message || "Could not delete product.");
  }
}

function bindForm() {
  document
    .getElementById("productForm")
    .addEventListener("submit", handleProductSubmit);
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const error = document.getElementById("productError");

  error.textContent = "";

  const raw = Object.fromEntries(new FormData(form));

  if (raw.name.trim().length < 2) {
    return showFormError("Product name must contain at least 2 characters.");
  }

  if (raw.description.trim().length < 2) {
    return showFormError("Product description is required.");
  }

  if (raw.price === "" || Number(raw.price) < 0) {
    return showFormError("Price must be a non-negative number.");
  }

  if (
    raw.stock === "" ||
    Number(raw.stock) < 0 ||
    !Number.isInteger(Number(raw.stock))
  ) {
    return showFormError("Stock must be a non-negative whole number.");
  }

  if (!/^https?:\/\//.test(raw.image.trim())) {
    return showFormError("Image URL must start with http:// or https://.");
  }

  const body = {
    name: raw.name.trim(),

    description: raw.description.trim(),

    price: Number(raw.price),

    stock: Number(raw.stock),

    category: raw.category,

    condition: raw.condition,

    type: raw.type,

    image: raw.image.trim(),

    tags: raw.tags
      ? raw.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  };

  try {
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    if (editingId) {
      const updated = await productApi.update(editingId, body);

      products = products.map((product) =>
        product.id === editingId ? updated : product,
      );

      showToast("Product updated.");
    } else {
      const created = await productApi.create(body);

      products.unshift(created);

      showToast("Product created.");
    }

    renderTable();
    updateProductCount();

    resetForm();

    document.querySelector('[data-tab="products"]').click();

    submitButton.disabled = false;
  } catch (error) {
    console.error(error);

    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = false;

    if (error.status === 401) {
      clearSession();
      redirectToLogin();
      return;
    }

    showFormError(getReadableError(error));
  }
}

function showFormError(message) {
  document.getElementById("productError").textContent = message;
}

function getReadableError(error) {
  if (error?.errors?.length) {
    return error.errors
      .map((item) => `${item.field}: ${item.message}`)
      .join(" | ");
  }

  return error?.message || "Something went wrong.";
}

function resetForm() {
  editingId = null;

  const form = document.getElementById("productForm");

  form.reset();

  form.elements.id.value = "";

  document.getElementById("productFormEyebrow").textContent = "New listing";

  document.getElementById("productFormTitle").textContent = "Add listing";

  document.getElementById("productSubmitText").textContent = "Create product";

  document.getElementById("productError").textContent = "";
}

function updateProductCount() {
  document.getElementById("studioProductCount").textContent = products.length;
}
