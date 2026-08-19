const productDetail = document.getElementById("product-detail");
const breadcrumb = document.getElementById("breadcrumb");

const urlParams = new URLSearchParams(window.location.search);
const productId = Number(urlParams.get("id"));

let currentProduct = null;
let qty = 1;

if (!productId) {
  renderNotFound();
} else {
  productDetail.innerHTML = `
    <div class="detail-wrap">
      <div class="skeleton skeleton-card" style="height:420px;"></div>
      <div>
        <div class="skeleton skeleton-line" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:80%; height:26px; margin-top:16px;"></div>
        <div class="skeleton skeleton-line" style="width:60%;"></div>
        <div class="skeleton skeleton-line" style="width:100%; margin-top:20px;"></div>
        <div class="skeleton skeleton-line" style="width:100%;"></div>
        <div class="skeleton skeleton-line" style="width:70%;"></div>
      </div>
    </div>
  `;

  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((response) => {
      if (!response.ok) throw new Error("not found");
      return response.json();
    })
    .then((data) => {
      if (!data) return renderNotFound();
      currentProduct = data;
      renderProduct(data);
    })
    .catch(renderNotFound);
}

function renderProduct(data) {
  breadcrumb.innerHTML = `
    <a href="./index.html">Home</a>
    <span class="sep">/</span>
    <a href="./index.html?category=${encodeURIComponent(data.category)}">${data.category}</a>
    <span class="sep">/</span>
    <span class="current">${truncate(data.title, 40)}</span>
  `;

  productDetail.innerHTML = `
    <div class="detail-wrap">
      <div class="detail-media">
        <div class="detail-image">
          <img id="detail-main-image" src="${data.image}" alt="${data.title}" />
        </div>
        <div class="detail-thumbs" aria-label="Product image gallery">
          ${[1, 2, 3].map((item, index) => `<button class="detail-thumb ${index === 0 ? "active" : ""}" data-image="${data.image}" aria-label="View product image ${item}"><img src="${data.image}" alt="" /></button>`).join("")}
        </div>
      </div>
      <div class="detail-info">
        <span class="detail-category">${data.category}</span>
        <h1 class="detail-title">${data.title}</h1>
        <div class="detail-rating">
          ${renderStars(data.rating.rate)}
          <span>${data.rating.rate} rating &middot; ${data.rating.count} reviews</span>
        </div>
        <div class="detail-price">${formatPrice(data.price)}</div>
        <div class="stock-status"><i class="fa-solid fa-circle-check"></i> In stock <span>Ships in 2&ndash;3 business days</span></div>
        <p class="detail-desc">${data.description}</p>
        <div class="detail-specs">
          <h2>Product specifications</h2>
          <dl>
            <div><dt>Category</dt><dd>${data.category}</dd></div>
            <div><dt>Customer rating</dt><dd>${data.rating.rate} / 5</dd></div>
            <div><dt>Reviews</dt><dd>${data.rating.count} verified ratings</dd></div>
            <div><dt>Availability</dt><dd>Ready to ship</dd></div>
          </dl>
        </div>
        <div class="detail-actions">
          <div class="qty-stepper">
            <button type="button" id="qty-minus" aria-label="Decrease quantity">&minus;</button>
            <input type="text" id="qty-input" value="1" inputmode="numeric" aria-label="Quantity" />
            <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-primary" id="add-to-cart-btn">
            <i class="fa-solid fa-cart-plus"></i> Add to cart
          </button>
          <button class="btn btn-outline save-detail-btn ${isWishlisted(data.id) ? "saved" : ""}" id="save-product-btn">
            <i class="fa-${isWishlisted(data.id) ? "solid" : "regular"} fa-heart"></i> ${isWishlisted(data.id) ? "Saved" : "Save for later"}
          </button>
          <a class="btn btn-outline" href="./index.html"><i class="fa-solid fa-arrow-left"></i> Continue shopping</a>
        </div>
      </div>
    </div>
    <section class="review-panel container">
      <div><span class="eyebrow">Customer feedback</span><h2>Reviews you can trust</h2></div>
      <div class="review-summary"><strong>${data.rating.rate}</strong><span>${renderStars(data.rating.rate)}<small>${data.rating.count} ratings</small></span></div>
      <div class="review-bars">${renderReviewBars(data.rating.rate)}</div>
    </section>
  `;

  document.querySelectorAll(".detail-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("detail-main-image").src = thumb.dataset.image;
      document.querySelectorAll(".detail-thumb").forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  const qtyInput = document.getElementById("qty-input");
  document.getElementById("qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyInput.value = qty;
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty = Math.min(99, qty + 1);
    qtyInput.value = qty;
  });
  qtyInput.addEventListener("change", () => {
    let v = parseInt(qtyInput.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    qty = Math.min(99, v);
    qtyInput.value = qty;
  });

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    addToCart(currentProduct, qty);
  });

  document.getElementById("save-product-btn").addEventListener("click", (event) => {
    const saved = toggleWishlist(currentProduct);
    const button = event.currentTarget;
    button.classList.toggle("saved", saved);
    button.innerHTML = `<i class="fa-${saved ? "solid" : "regular"} fa-heart"></i> ${saved ? "Saved" : "Save for later"}`;
  });
}

function renderReviewBars(rate) {
  return [5, 4, 3, 2, 1].map((stars) => {
    const width = Math.max(8, Math.min(100, (rate - (5 - stars) + 1) * 68));
    return `<div><span>${stars} <i class="fa-solid fa-star"></i></span><b><i style="width:${width}%"></i></b></div>`;
  }).join("");
}

function renderNotFound() {
  productDetail.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-box-open"></i>
      <h3>We couldn't find that product</h3>
      <p>It may have been removed, or the link is incorrect.</p>
      <a class="btn btn-outline" href="./index.html">Back to shop</a>
    </div>
  `;
}
