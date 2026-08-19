/* =========================================================
   cart-utils.js
   Single source of truth for cart storage + shared UI bits
   (nav toggle, cart badge, toast notifications) used on
   every page. Fixes the old bug where product.js mutated a
   single fetched product object's quantity instead of
   tracking quantity per cart line.
   ========================================================= */

const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";
const THEME_KEY = "theme";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  window.dispatchEvent(new Event("cartupdated"));
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function isWishlisted(id) {
  return getWishlist().some((item) => item.id === id);
}

function toggleWishlist(product) {
  const wishlist = getWishlist();
  const index = wishlist.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    wishlist.splice(index, 1);
    showToast(`Removed "${truncate(product.title, 36)}" from saved items`, "success");
  } else {
    wishlist.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
    });
    showToast(`Saved "${truncate(product.title, 36)}" for later`, "success");
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  updateWishlistBadge();
  window.dispatchEvent(new Event("wishlistupdated"));
  return index < 0;
}

function cartCount(cart) {
  cart = cart || getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal(cart) {
  cart = cart || getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Adds a product to the cart (or bumps its quantity).
 * Always stores a clean plain copy of the product so we never
 * accidentally reuse/mutate a shared object across pages.
 */
function addToCart(product, qty) {
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: qty,
    });
  }

  saveCart(cart);
  showToast(`Added "${truncate(product.title, 40)}" to cart`, "success");
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

function setQuantity(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (qty <= 0) {
    removeFromCart(id);
    return;
  }
  item.quantity = qty;
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  window.dispatchEvent(new Event("cartupdated"));
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len).trim() + "\u2026" : str;
}

function formatPrice(n) {
  return "$" + Number(n).toFixed(2);
}

function renderStars(rate) {
  rate = rate || 0;
  const full = Math.round(rate);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += `<i class="fa-${i < full ? "solid" : "regular"} fa-star"></i>`;
  }
  return html;
}

/* ---------- badge ---------- */
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = cartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-count");
  if (!badge) return;
  const count = getWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const dark = theme === "dark";
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.title = dark ? "Switch to light theme" : "Switch to dark theme";
    button.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}"></i>`;
  });
}

// keep badge in sync across tabs
window.addEventListener("storage", (e) => {
  if (e.key === CART_KEY) updateCartBadge();
  if (e.key === WISHLIST_KEY) updateWishlistBadge();
  if (e.key === THEME_KEY) applyTheme(e.newValue || "light");
});

/* ---------- toast ---------- */
function showToast(message, type) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : ""}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === "error" ? "fa-circle-exclamation" : "fa-circle-check"}"></i>
    <span class="toast-msg">${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2600);
}

/* ---------- nav toggle + active link + badge init on every page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const navbarToggler = document.getElementById("navbar-toggler");
  const navbarCollapse = document.getElementById("navbar");
  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener("click", () => {
      navbarCollapse.classList.toggle("show");
    });
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });

  const here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const linkPage = link.getAttribute("href").replace("./", "");
    link.classList.toggle("active", linkPage === here);
  });

  updateCartBadge();
  updateWishlistBadge();
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
});
