# SnapBasket

A modern glassmorphism shopping cart experience built with vanilla HTML, CSS, and JavaScript.

SnapBasket includes product discovery, filtering, sorting, product details, cart management, wishlist support, theme switching, and a responsive mobile layout.

## Features

- Product catalog powered by the [Fake Store API](https://fakestoreapi.com/)
- Search, category filters, and price/rating sorting
- Product detail pages with:
  - Image gallery
  - Product specifications
  - Stock status
  - Rating and review summary
- Add to cart, quantity controls, remove, clear cart, and checkout simulation
- Save products to a wishlist
- Save cart items for later
- Persistent cart, wishlist, and theme settings with `localStorage`
- Light and dark glass themes
- Responsive mobile navigation
- Loading skeletons and animated transitions
- Toast notifications for cart and wishlist actions
- Order confirmation screen with generated order ID

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Fake Store API
- Font Awesome
- Google Fonts

No build step or package installation is required.

## Getting Started

### Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/snapbasket.git
   cd snapbasket
   ```

2. Start a local static server. For Python:

   ```bash
   python -m http.server 5500
   ```

3. Open the app at:

   ```text
   http://localhost:5500
   ```

You can also open `index.html` directly in a browser, but a local server is recommended for consistent browser behavior.

## Project Structure

```text
.
├── index.html          # Product catalog and hero carousel
├── product.html        # Product detail page
├── cart.html           # Shopping cart page
├── orderSucess.html    # Simulated order confirmation page
├── style.css           # Shared responsive glassmorphism styles
├── app.js              # Catalog, filtering, sorting, and wishlist view
├── product.js          # Product detail rendering and interactions
├── cart.js             # Cart page rendering and actions
├── cart-utils.js       # Shared cart, wishlist, theme, toast, and nav logic
└── assets/             # Hero images and order animation
```

## Data and Storage

Products are loaded from:

```text
https://fakestoreapi.com/products
```

The app uses browser `localStorage` for:

- `cart` - current cart items
- `wishlist` - saved products
- `theme` - selected light or dark theme

No account, payment, or backend service is required. Checkout is a front-end simulation.

## Deploy With GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings > Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and the `/root` folder.
6. Click **Save**.
7. GitHub will provide the deployed site URL after the workflow completes.

Because this is a static project, GitHub Pages can serve it without additional configuration.

## Browser Support

Use a modern browser with support for ES6 JavaScript, CSS backdrop filters, and `localStorage`.

## License

This project is intended for learning and demonstration purposes.
