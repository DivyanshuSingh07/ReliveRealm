import { productApi, authApi, getStoredUser, clearSession } from "./api.js";

import { CONFIG } from "./config.js";

import {
  escapeHTML,
  money,
  productImage,
  revealOnScroll,
  showToast,
  setupTheme,
} from "./ui.js";

let products = [];
let activeCategory = "all";

let cart = JSON.parse(localStorage.getItem(CONFIG.CART_KEY) || "[]");

const grid = document.getElementById("productGrid");

const countAll = document.getElementById("countAll");

document.addEventListener("DOMContentLoaded", async () => {
  setTimeout(() => {
    document.getElementById("pageLoader")?.classList.add("done");
  }, 450);

  setupTheme();

  /*
   * Product API
   */
  try {
    products = await productApi.list();

    countAll.textContent = products.length;

    renderProducts();
    renderCart();
  } catch (error) {
    console.error("Product loading failed:", error);

    grid.innerHTML = `
        <div class="no-results">
          <span>!</span>
          <h3>Could not load products.</h3>
          <p>
            Please refresh the page
            and try again.
          </p>
        </div>
      `;
  }

  /*
   * Authentication/account state
   */
  setupAccount();

  revealOnScroll();

  bindShopEvents();
});

async function setupAccount() {
  const accountLink = document.getElementById("accountLink");

  if (!accountLink) return;

  /*
   * Start from a clean logged-out state.
   */
  setLoggedOutAccount(accountLink);

  /*
   * No stored session means no need
   * to contact the API.
   */
  if (!localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY)) {
    return;
  }

  try {
    /*
     * /me verifies the session.
     * api.js can refresh an expired access
     * token automatically.
     */
    const user = await authApi.me();

    if (user) {
      setLoggedInAccount(accountLink, user);
    }
  } catch (error) {
    console.warn("Session check failed:", error);

    clearSession();

    setLoggedOutAccount(accountLink);
  }
}

function setLoggedOutAccount(accountLink) {
  accountLink.textContent = "Account";

  accountLink.href = "login.html";

  accountLink.onclick = null;

  accountLink.classList.remove("account-authenticated");

  removeAccountMenu();
}

function setLoggedInAccount(accountLink, user) {
  /*
   * Show the user's name in the header.
   */
  accountLink.textContent = user.name || "Account";

  accountLink.href = "#";

  accountLink.classList.add("account-authenticated");

  accountLink.onclick = (event) => {
    event.preventDefault();

    toggleAccountMenu(accountLink, user);
  };
}

function toggleAccountMenu(accountLink, user) {
  const existing = document.getElementById("accountMenu");

  if (existing) {
    removeAccountMenu();
    return;
  }

  const menu = document.createElement("div");

  menu.id = "accountMenu";

  menu.className = "account-menu";

  menu.innerHTML = `
    <div class="account-menu-heading">
      <span class="eyebrow">
        Signed in as
      </span>

      <strong>
        ${escapeHTML(user.name || "ReliveRealm Member")}
      </strong>

      <small>
        ${escapeHTML(user.email || "")}
      </small>
    </div>

    <div class="account-menu-divider"></div>

    <a
      href="admin.html"
      class="account-menu-link"
    >
      <span>Open Studio</span>
      <span>↗</span>
    </a>

    <button
      type="button"
      class="account-menu-link account-logout"
      id="accountLogout"
    >
      <span>Sign out</span>
      <span>→</span>
    </button>
  `;

  document.body.appendChild(menu);

  /*
   * Position menu under Account button.
   */
  const rect = accountLink.getBoundingClientRect();

  menu.style.top = `${rect.bottom + 12}px`;

  menu.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;

  requestAnimationFrame(() => {
    menu.classList.add("open");
  });

  document
    .getElementById("accountLogout")
    .addEventListener("click", handleLogout);

  /*
   * Close when clicking elsewhere.
   */
  setTimeout(() => {
    document.addEventListener("click", handleOutsideAccountClick, {
      once: true,
    });
  }, 0);
}

function handleOutsideAccountClick(event) {
  const menu = document.getElementById("accountMenu");

  const account = document.getElementById("accountLink");

  if (menu && !menu.contains(event.target) && event.target !== account) {
    removeAccountMenu();
  }
}

async function handleLogout() {
  try {
    await authApi.logout();

    removeAccountMenu();

    const accountLink = document.getElementById("accountLink");

    if (accountLink) {
      setLoggedOutAccount(accountLink);
    }

    showToast("You have been signed out.");
  } catch (error) {
    console.error("Logout failed:", error);

    clearSession();

    const accountLink = document.getElementById("accountLink");

    if (accountLink) {
      setLoggedOutAccount(accountLink);
    }

    showToast("Session cleared.");
  }
}

function removeAccountMenu() {
  const menu = document.getElementById("accountMenu");

  if (menu) {
    menu.remove();
  }
}

function bindShopEvents() {
  document
    .getElementById("categoryFilters")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");

      if (!button) return;

      activeCategory = button.dataset.category;

      document
        .querySelectorAll(".filter-chip")
        .forEach((element) =>
          element.classList.toggle("active", element === button),
        );

      document
        .querySelectorAll(".category-tile")
        .forEach((element) =>
          element.classList.toggle(
            "active",
            element.dataset.category === activeCategory,
          ),
        );

      renderProducts();
    });

  document
    .getElementById("sortProducts")
    .addEventListener("change", renderProducts);

  document.querySelectorAll(".category-tile").forEach((button) =>
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;

      document
        .querySelectorAll(".category-tile")
        .forEach((element) =>
          element.classList.toggle("active", element === button),
        );

      document
        .querySelectorAll(".filter-chip")
        .forEach((element) =>
          element.classList.toggle(
            "active",
            element.dataset.category === activeCategory,
          ),
        );

      renderProducts();

      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }),
  );

  document.getElementById("productGrid").addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");

    if (!add) return;

    const product = products.find((item) => item.id === add.dataset.add);

    if (product) {
      addToCart(product);
    }
  });

  document.getElementById("cartTrigger").addEventListener("click", openCart);

  document.getElementById("cartClose").addEventListener("click", closeCart);

  document
    .getElementById("drawerBackdrop")
    .addEventListener("click", closeCart);

  document.getElementById("emptyShop").addEventListener("click", closeCart);

  document.getElementById("cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");

    if (!button) return;

    updateCart(button.dataset.id, button.dataset.cartAction);
  });

  document.getElementById("searchToggle").addEventListener("click", openSearch);

  document.getElementById("searchClose").addEventListener("click", closeSearch);

  document.getElementById("searchPanel").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      closeSearch();
    }
  });

  document
    .getElementById("searchInput")
    .addEventListener("input", (event) => renderSearch(event.target.value));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
      removeAccountMenu();
    }
  });

  document
    .getElementById("checkoutButton")
    .addEventListener("click", () =>
      showToast("Checkout will be connected after the core API phase."),
    );
}

function filteredProducts() {
  const list =
    activeCategory === "all"
      ? [...products]
      : products.filter((product) => product.category === activeCategory);

  const sort = document.getElementById("sortProducts").value;

  if (sort === "price-low") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-high") {
    list.sort((a, b) => b.price - a.price);
  }

  if (sort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

function renderProducts() {
  const list = filteredProducts();

  grid.innerHTML = list.length
    ? list
        .map(
          (product, index) => `
              <article class="product-card ${
                index === 0 ? "featured-card" : ""
              }">

                <div class="product-media">

                  <img
                    src="${productImage(product)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                  >

                  <span class="product-number">
                    ${String(products.indexOf(product) + 1).padStart(2, "0")}
                  </span>

                  <span class="condition-badge">
                    ${escapeHTML(product.condition || "Checked")}
                  </span>

                  <button
                    class="add-object"
                    data-add="${product.id}"
                    aria-label="Add ${escapeHTML(product.name)} to bag"
                  >
                    +
                  </button>

                  ${
                    product.stock < 4
                      ? '<span class="stock-note">Only a few left</span>'
                      : ""
                  }

                </div>

                <div class="product-info">

                  <div>
                    <span class="product-category">
                      ${escapeHTML(product.type || "Pre-owned")}
                      ·
                      ${escapeHTML(product.category)}
                    </span>

                    <h3>
                      ${escapeHTML(product.name)}
                    </h3>
                  </div>

                  <strong>
                    ${money(product.price)}
                  </strong>

                </div>

                <p class="product-description">
                  ${escapeHTML(product.description)}
                </p>

              </article>
            `,
        )
        .join("")
    : `
          <div class="no-results">
            <span>∅</span>
            <h3>No objects found.</h3>
            <p>Try another category.</p>
          </div>
        `;

  const applied = document.getElementById("appliedFilters");

  applied.hidden = activeCategory === "all";

  applied.innerHTML =
    activeCategory === "all"
      ? ""
      : `
        <span>Applied</span>
        <button data-clear-filter>
          ${escapeHTML(activeCategory)} ×
        </button>
      `;

  applied.onclick = () => {
    activeCategory = "all";

    document.querySelector('[data-category="all"]').click();
  };

  revealOnScroll();
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage(product),
      quantity: 1,
    });
  }

  persistCart();

  renderCart();

  openCart();

  showToast(`${product.name} added to your bag.`);
}

function updateCart(id, action) {
  const item = cart.find((entry) => entry.id === id);

  if (!item) return;

  if (action === "increase") {
    item.quantity++;
  }

  if (action === "decrease") {
    item.quantity--;
  }

  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  }

  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  document.getElementById("cartCount").textContent = totalQty;

  document.getElementById("drawerCount").textContent = totalQty;

  document.getElementById("cartSubtotal").textContent = money(subtotal);

  document.getElementById("cartEmpty").hidden = cart.length > 0;

  document.getElementById("cartFooter").hidden = cart.length === 0;

  document.getElementById("cartItems").innerHTML = cart
    .map(
      (item) => `
          <article class="cart-item">

            <img
              src="${item.image}"
              alt=""
            >

            <div>

              <span>
                ${escapeHTML(item.name)}
              </span>

              <strong>
                ${money(item.price)}
              </strong>

              <div class="qty">

                <button
                  data-cart-action="decrease"
                  data-id="${item.id}"
                >
                  −
                </button>

                <b>
                  ${item.quantity}
                </b>

                <button
                  data-cart-action="increase"
                  data-id="${item.id}"
                >
                  +
                </button>

                <button
                  data-cart-action="remove"
                  data-id="${item.id}"
                  class="remove"
                >
                  Remove
                </button>

              </div>

            </div>

          </article>
        `,
    )
    .join("");
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");

  document.getElementById("drawerBackdrop").classList.add("open");

  document.body.classList.add("drawer-open");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");

  document.getElementById("drawerBackdrop").classList.remove("open");

  document.body.classList.remove("drawer-open");
}

function openSearch() {
  const panel = document.getElementById("searchPanel");

  panel.classList.add("open");

  panel.setAttribute("aria-hidden", "false");

  document.body.classList.add("search-open");

  renderSearch("");

  requestAnimationFrame(() => document.getElementById("searchInput")?.focus());
}

function closeSearch() {
  const panel = document.getElementById("searchPanel");

  panel.classList.remove("open");

  panel.setAttribute("aria-hidden", "true");

  document.body.classList.remove("search-open");

  document.getElementById("searchToggle")?.focus();
}

function renderSearch(query) {
  const q = query.trim().toLowerCase();

  const results = products
    .filter(
      (product) =>
        !q ||
        `${product.name} ${product.category} ${(product.tags || []).join(" ")}`
          .toLowerCase()
          .includes(q),
    )
    .slice(0, 6);

  document.getElementById("searchResults").innerHTML =
    results
      .map(
        (product) => `
          <button
            class="search-result"
            data-search-add="${product.id}"
          >

            <img
              src="${productImage(product)}"
              alt=""
            >

            <span>
              <small>
                ${escapeHTML(product.category)}
              </small>

              ${escapeHTML(product.name)}
            </span>

            <strong>
              ${money(product.price)}
            </strong>

          </button>
        `,
      )
      .join("") ||
    `
      <p class="search-none">
        No object matches
        “${escapeHTML(query)}”.
      </p>
    `;

  document
    .getElementById("searchResults")
    .querySelectorAll("[data-search-add]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const product = products.find(
          (item) => item.id === button.dataset.searchAdd,
        );

        if (product) {
          addToCart(product);
        }

        closeSearch();
      }),
    );
}

/*
import { productApi } from "./api.js";
import { CONFIG } from "./config.js";
import {
  escapeHTML,
  money,
  productImage,
  revealOnScroll,
  showToast,
  setupTheme,
} from "./ui.js";

let products = [];
let activeCategory = "all";
let cart = JSON.parse(localStorage.getItem(CONFIG.CART_KEY) || "[]");

const grid = document.getElementById("productGrid");
const countAll = document.getElementById("countAll");

document.addEventListener("DOMContentLoaded", async () => {
  setTimeout(
    () => document.getElementById("pageLoader")?.classList.add("done"),
    450,
  );
  setupTheme();
  products = await productApi.list();
  countAll.textContent = products.length;
  renderProducts();
  renderCart();
  revealOnScroll();
  bindShopEvents();
});

function bindShopEvents() {
  document
    .getElementById("categoryFilters")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      document
        .querySelectorAll(".filter-chip")
        .forEach((el) => el.classList.toggle("active", el === button));
      document
        .querySelectorAll(".category-tile")
        .forEach((el) =>
          el.classList.toggle("active", el.dataset.category === activeCategory),
        );
      renderProducts();
    });

  document
    .getElementById("sortProducts")
    .addEventListener("change", renderProducts);

  document.querySelectorAll(".category-tile").forEach((button) =>
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document
        .querySelectorAll(".category-tile")
        .forEach((el) => el.classList.toggle("active", el === button));
      document
        .querySelectorAll(".filter-chip")
        .forEach((el) =>
          el.classList.toggle("active", el.dataset.category === activeCategory),
        );
      renderProducts();
      document
        .getElementById("catalog")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }),
  );

  document.getElementById("productGrid").addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (!add) return;
    const product = products.find((item) => item.id === add.dataset.add);
    if (product) addToCart(product);
  });

  document.getElementById("cartTrigger").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document
    .getElementById("drawerBackdrop")
    .addEventListener("click", closeCart);
  document.getElementById("emptyShop").addEventListener("click", closeCart);

  document.getElementById("cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    updateCart(button.dataset.id, button.dataset.cartAction);
  });

  document.getElementById("searchToggle").addEventListener("click", openSearch);
  document.getElementById("searchClose").addEventListener("click", closeSearch);
  document.getElementById("searchPanel").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeSearch();
  });
  document
    .getElementById("searchInput")
    .addEventListener("input", (event) => renderSearch(event.target.value));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearch();
  });
  document
    .getElementById("checkoutButton")
    .addEventListener("click", () =>
      showToast("Checkout will be connected after the core API phase."),
    );
}

function filteredProducts() {
  const list =
    activeCategory === "all"
      ? [...products]
      : products.filter((product) => product.category === activeCategory);
  const sort = document.getElementById("sortProducts").value;
  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderProducts() {
  const list = filteredProducts();
  grid.innerHTML = list.length
    ? list
        .map(
          (product, index) => `
    <article class="product-card ${index === 0 ? "featured-card" : ""}">
      <div class="product-media">
        <img src="${productImage(product)}" alt="${escapeHTML(product.name)}" loading="lazy">
        <span class="product-number">${String(products.indexOf(product) + 1).padStart(2, "0")}</span>
        <span class="condition-badge">${escapeHTML(product.condition || "Checked")}</span>
        <button class="add-object" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to bag">+</button>
        ${product.stock < 4 ? '<span class="stock-note">Only a few left</span>' : ""}
      </div>
      <div class="product-info">
        <div><span class="product-category">${escapeHTML(product.type || "Pre-owned")} · ${escapeHTML(product.category)}</span><h3>${escapeHTML(product.name)}</h3></div>
        <strong>${money(product.price)}</strong>
      </div>
      <p class="product-description">${escapeHTML(product.description)}</p>
    </article>`,
        )
        .join("")
    : `<div class="no-results"><span>∅</span><h3>No objects found.</h3><p>Try another category.</p></div>`;
  document.getElementById("appliedFilters").hidden = activeCategory === "all";
  document.getElementById("appliedFilters").innerHTML =
    activeCategory === "all"
      ? ""
      : `<span>Applied</span><button data-clear-filter>${activeCategory} ×</button>`;
  document.getElementById("appliedFilters").onclick = () => {
    activeCategory = "all";
    document.querySelector('[data-category="all"]').click();
  };
  revealOnScroll();
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImage(product),
      quantity: 1,
    });
  persistCart();
  renderCart();
  openCart();
  showToast(`${product.name} added to your bag.`);
}

function updateCart(id, action) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  if (action === "increase") item.quantity++;
  if (action === "decrease") item.quantity--;
  if (action === "remove" || item.quantity <= 0)
    cart = cart.filter((entry) => entry.id !== id);
  persistCart();
  renderCart();
}

function persistCart() {
  localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  document.getElementById("cartCount").textContent = totalQty;
  document.getElementById("drawerCount").textContent = totalQty;
  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("cartEmpty").hidden = cart.length > 0;
  document.getElementById("cartFooter").hidden = cart.length === 0;
  document.getElementById("cartItems").innerHTML = cart
    .map(
      (item) => `
    <article class="cart-item">
      <img src="${item.image}" alt="">
      <div><span>${escapeHTML(item.name)}</span><strong>${money(item.price)}</strong><div class="qty"><button data-cart-action="decrease" data-id="${item.id}">−</button><b>${item.quantity}</b><button data-cart-action="increase" data-id="${item.id}">+</button><button data-cart-action="remove" data-id="${item.id}" class="remove">Remove</button></div></div>
    </article>`,
    )
    .join("");
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("drawerBackdrop").classList.add("open");
  document.body.classList.add("drawer-open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.body.classList.remove("drawer-open");
}

function openSearch() {
  const panel = document.getElementById("searchPanel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  renderSearch("");
  requestAnimationFrame(() => document.getElementById("searchInput")?.focus());
}

function closeSearch() {
  const panel = document.getElementById("searchPanel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  document.getElementById("searchToggle")?.focus();
}

function renderSearch(query) {
  const q = query.trim().toLowerCase();
  const results = products
    .filter(
      (product) =>
        !q ||
        `${product.name} ${product.category} ${product.tags.join(" ")}`
          .toLowerCase()
          .includes(q),
    )
    .slice(0, 6);
  document.getElementById("searchResults").innerHTML =
    results
      .map(
        (product) => `
    <button class="search-result" data-search-add="${product.id}">
      <img src="${productImage(product)}" alt=""><span><small>${escapeHTML(product.category)}</small>${escapeHTML(product.name)}</span><strong>${money(product.price)}</strong>
    </button>`,
      )
      .join("") ||
    `<p class="search-none">No object matches “${escapeHTML(query)}”.</p>`;
  document
    .getElementById("searchResults")
    .querySelectorAll("[data-search-add]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const product = products.find(
          (item) => item.id === button.dataset.searchAdd,
        );
        addToCart(product);
        closeSearch();
      }),
    );
}
*/
