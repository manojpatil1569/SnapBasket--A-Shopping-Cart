let products = [];
let state = { search: "", category: "all", sort: "default" };
const wishlistOnly = new URLSearchParams(window.location.search).get("wishlist") === "1";

const productContainer = document.getElementById("product-container");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const categoryChips = document.getElementById("category-chips");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");

/* ---------------- skeleton loading state ---------------- */
function renderSkeletons(count) {
  productContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.innerHTML = `<div class="skeleton skeleton-card"></div>`;
    productContainer.appendChild(card);
  }
}
renderSkeletons(8);

/* ---------------- fetch data ---------------- */
fetch("https://fakestoreapi.com/products")
  .then((response) => {
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  })
  .then((data) => {
    products = data;
    buildCategoryChips(data);

    const preselectedCategory = new URLSearchParams(window.location.search).get("category");
    if (preselectedCategory) {
      state.category = preselectedCategory;
      categoryChips.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.category === preselectedCategory);
      });
    }

    applyFiltersAndRender();
  })
  .catch(() => {
    productContainer.innerHTML = "";
    emptyState.style.display = "block";
    emptyState.querySelector("h3").textContent = "Couldn't load products";
    emptyState.querySelector("p").textContent = "Check your connection and refresh the page.";
    document.getElementById("clear-filters-btn").style.display = "none";
    resultCount.textContent = "";
  });

/* ---------------- category chips ---------------- */
function buildCategoryChips(data) {
  const categories = ["all", ...new Set(data.map((p) => p.category))];
  categoryChips.innerHTML = categories
    .map(
      (cat) =>
        `<button class="chip ${cat === "all" ? "active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  categoryChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      categoryChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.category = chip.dataset.category;
      applyFiltersAndRender();
    });
  });
}

/* ---------------- search + sort listeners ---------------- */
let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value.trim().toLowerCase();
    applyFiltersAndRender();
  }, 180);
});

sortSelect.addEventListener("change", (e) => {
  state.sort = e.target.value;
  applyFiltersAndRender();
});

document.getElementById("clear-filters-btn").addEventListener("click", () => {
  state = { search: "", category: "all", sort: "default" };
  searchInput.value = "";
  sortSelect.value = "default";
  categoryChips.querySelectorAll(".chip").forEach((c, i) => c.classList.toggle("active", i === 0));
  applyFiltersAndRender();
});

/* ---------------- filter + sort + render ---------------- */
function applyFiltersAndRender() {
  let list = products.filter((p) => {
    const matchesSearch = !state.search || p.title.toLowerCase().includes(state.search);
    const matchesCategory = state.category === "all" || p.category === state.category;
    const matchesWishlist = !wishlistOnly || isWishlisted(p.id);
    return matchesSearch && matchesCategory && matchesWishlist;
  });

  if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (state.sort === "rating-desc") list = [...list].sort((a, b) => b.rating.rate - a.rating.rate);

  renderProducts(list);
}

function renderProducts(list) {
  productContainer.innerHTML = "";

  if (list.length === 0) {
    emptyState.style.display = "block";
    resultCount.textContent = "";
    document.getElementById("clear-filters-btn").style.display = "inline-flex";
    return;
  }
  emptyState.style.display = "none";
  resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

  list.forEach(({ id, image, title, category, price, rating }) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");

    const saved = isWishlisted(id);
    card.innerHTML = `
      <div class="product-thumb">
        <span class="product-category">${category}</span>
        <button class="save-btn ${saved ? "saved" : ""}" data-id="${id}" aria-label="${saved ? "Remove from saved items" : "Save for later"}" title="${saved ? "Remove from saved items" : "Save for later"}">
          <i class="fa-${saved ? "solid" : "regular"} fa-heart"></i>
        </button>
        <img src="${image}" alt="${title}" loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-title">${title}</h3>
        <div class="product-rating">
          ${renderStars(rating.rate)}
          <span>${rating.rate} (${rating.count})</span>
        </div>
        <div class="product-footer">
          <span class="price-tag">${formatPrice(price)}</span>
          <button class="add-btn" data-id="${id}" aria-label="Add to cart" title="Add to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => showProductDetails(id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") showProductDetails(id);
    });

    const addBtn = card.querySelector(".add-btn");
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const product = products.find((item) => item.id === id);
      addToCart(product, 1);
      addBtn.classList.add("added");
      addBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        addBtn.classList.remove("added");
        addBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
      }, 900);
    });

    card.querySelector(".save-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlist(products.find((item) => item.id === id));
      if (wishlistOnly) applyFiltersAndRender();
      else {
        const button = card.querySelector(".save-btn");
        const nowSaved = isWishlisted(id);
        button.classList.toggle("saved", nowSaved);
        button.setAttribute("aria-label", nowSaved ? "Remove from saved items" : "Save for later");
        button.title = nowSaved ? "Remove from saved items" : "Save for later";
        button.innerHTML = `<i class="fa-${nowSaved ? "solid" : "regular"} fa-heart"></i>`;
      }
    });

    productContainer.appendChild(card);
  });
}

window.addEventListener("wishlistupdated", () => {
  if (products.length && wishlistOnly) applyFiltersAndRender();
});

function showProductDetails(id) {
  window.location.href = `product.html?id=${id}`;
}

/* ---------------- hero carousel (vanilla, no jQuery/slick) ---------------- */
(function initHero() {
  const track = document.getElementById("hero-track");
  const slides = track.children;
  const dotsWrap = document.getElementById("hero-dots");
  const prevBtn = document.getElementById("hero-prev");
  const nextBtn = document.getElementById("hero-next");
  let index = 0;
  let timer;

  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 4000);
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  resetTimer();
})();
