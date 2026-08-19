const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const summaryItemsEl = document.getElementById("summary-items");
const summarySubtotalEl = document.getElementById("summary-subtotal");
const cartSubtitleEl = document.getElementById("cart-subtitle");
const buyNowButton = document.getElementById("buy-now-button");
const summaryCard = document.getElementById("summary-card");
const emptyCartState = document.getElementById("empty-cart-state");
const clearCartLink = document.getElementById("clear-cart-link");

function updateCartUi() {
  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    emptyCartState.style.display = "block";
    summaryCard.style.display = "none";
    cartSubtitleEl.textContent = "0 items";
    return;
  }

  emptyCartState.style.display = "none";
  summaryCard.style.display = "block";

  const items = cartCount(cart);
  cartSubtitleEl.textContent = `${items} item${items === 1 ? "" : "s"} in your cart`;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-row";
    li.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-row-title-wrap">
        <p class="cart-row-title">${truncate(item.title, 60)}</p>
        <span class="cart-row-unit">${formatPrice(item.price)} each</span>
      </div>
      <div class="cart-row-controls">
        <div class="qty-stepper">
          <button type="button" class="decrement" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
          <input type="text" class="qty-input" value="${item.quantity}" data-id="${item.id}" inputmode="numeric" aria-label="Quantity" />
          <button type="button" class="increment" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div>
        <div class="cart-row-line">${formatPrice(item.price * item.quantity)}</div>
        <button type="button" class="btn-danger-text remove" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
        <button type="button" class="btn-save-later save-later" data-id="${item.id}">
          <i class="fa-regular fa-heart"></i> Save for later
        </button>
      </div>
    `;
    cartItemsEl.appendChild(li);
  });

  const total = cartTotal(cart);
  cartTotalEl.textContent = formatPrice(total);
  summaryItemsEl.textContent = items;
  summarySubtotalEl.textContent = formatPrice(total);

  wireRowEvents();
}

function wireRowEvents() {
  cartItemsEl.querySelectorAll(".increment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const item = getCart().find((i) => i.id === id);
      if (item) setQuantity(id, Math.min(99, item.quantity + 1));
      updateCartUi();
    });
  });

  cartItemsEl.querySelectorAll(".decrement").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const item = getCart().find((i) => i.id === id);
      if (item) setQuantity(id, item.quantity - 1);
      updateCartUi();
    });
  });

  cartItemsEl.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", () => {
      const id = Number(input.dataset.id);
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      setQuantity(id, Math.min(99, v));
      updateCartUi();
    });
  });

  cartItemsEl.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      removeFromCart(id);
      showToast("Item removed from cart", "success");
      updateCartUi();
    });
  });

  cartItemsEl.querySelectorAll(".save-later").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const item = getCart().find((entry) => entry.id === id);
      if (!item) return;
      toggleWishlist(item);
      removeFromCart(id);
      updateCartUi();
    });
  });
}

clearCartLink.addEventListener("click", (e) => {
  e.preventDefault();
  if (getCart().length === 0) return;
  clearCart();
  showToast("Cart cleared", "success");
  updateCartUi();
});

buyNowButton.addEventListener("click", handleBuy);

function handleBuy() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your cart is empty. Add items to buy.", "error");
    return;
  }
  const orderId = "CN-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const orderTotal = cartTotal(cart);
  clearCart();
  window.location.href = `orderSucess.html?order=${orderId}&total=${orderTotal.toFixed(2)}`;
}

updateCartUi();
