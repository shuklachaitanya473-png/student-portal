/* ============================================
   E-COMMERCE SCRIPT
   ============================================ */

// ─── PRODUCT DATA ───────────────────────────
// Each product has: id, name, price, original price (null = no discount),
// category, emoji, star rating, review count, and optional badge label
const PRODUCTS = [
  { id:1,  name:'Wireless Noise-Cancelling Headphones', price:4999, original:7999,  category:'electronics', emoji:'🎧', rating:4.5, reviews:128, badge:'Best Seller' },
  { id:2,  name:'Mechanical Gaming Keyboard',           price:2499, original:3499,  category:'electronics', emoji:'⌨️', rating:4.3, reviews:87,  badge:'Hot Deal' },
  { id:3,  name:'Ultra-Slim Laptop Stand',              price:1299, original:1899,  category:'accessories', emoji:'💻', rating:4.7, reviews:203, badge:'Top Rated' },
  { id:4,  name:'Premium Notebook Set (5-pack)',        price:399,  original:null,   category:'stationery',  emoji:'📓', rating:4.2, reviews:56,  badge:null },
  { id:5,  name:'Ergonomic Mouse',                      price:1799, original:2499,  category:'electronics', emoji:'🖱️', rating:4.6, reviews:145, badge:'Sale' },
  { id:6,  name:'Cable Management Kit',                 price:649,  original:null,   category:'accessories', emoji:'🔌', rating:4.1, reviews:39,  badge:null },
  { id:7,  name:'Desk Organizer Set',                   price:899,  original:1299,  category:'accessories', emoji:'🗂️', rating:4.4, reviews:72,  badge:'New' },
  { id:8,  name:'Study Planner 2025',                   price:349,  original:null,   category:'stationery',  emoji:'📅', rating:4.8, reviews:301, badge:'Popular' },
  { id:9,  name:'USB-C Hub (7-in-1)',                   price:2199, original:2999,  category:'electronics', emoji:'🔗', rating:4.5, reviews:189, badge:'Deal' },
  { id:10, name:'Highlighter Pack (12 Colors)',          price:299,  original:null,   category:'stationery',  emoji:'🖊️', rating:4.3, reviews:91,  badge:null },
  { id:11, name:'Monitor Light Bar',                    price:1599, original:2199,  category:'electronics', emoji:'💡', rating:4.6, reviews:167, badge:'Sale' },
  { id:12, name:'Sticky Notes Mega Pack',               price:199,  original:null,   category:'stationery',  emoji:'📌', rating:4.0, reviews:44,  badge:null },
];

// ─── STATE ──────────────────────────────────
// Loaded from localStorage so data persists across page refreshes
let cart        = JSON.parse(localStorage.getItem('ssp_cart')     || '[]');
let wishlist    = JSON.parse(localStorage.getItem('ssp_wishlist')  || '[]');
let currentUser = JSON.parse(localStorage.getItem('ssp_user')     || 'null');

// Current category filter and search text
let currentCat   = 'all';
let searchQuery  = '';

// ─── CHECK AUTH ─────────────────────────────
// Decides whether to show the login modal or the store
function checkAuth() {
  if (!currentUser) {
    // Not logged in: show modal, hide store
    document.getElementById('loginModal').style.display   = 'flex';
    document.getElementById('storeContent').style.display = 'none';
    document.getElementById('cartFab').style.display      = 'none';
  } else {
    // Logged in: hide modal, show store
    document.getElementById('loginModal').style.display   = 'none';
    document.getElementById('storeContent').style.display = 'block';
    document.getElementById('cartFab').style.display      = 'flex';

    // Show the user's name in the header
    document.getElementById('userDisplay').textContent = currentUser.name;

    renderProducts();
    renderCart();
  }
}

// ─── LOGIN ──────────────────────────────────
// Validates the email and password, then logs the user in
function login() {
  const email = document.getElementById('loginEmail');
  const pass  = document.getElementById('loginPass');
  const eerr  = document.getElementById('loginEmailErr');
  const perr  = document.getElementById('loginPassErr');
  let valid   = true;

  // Check email format
  if (!validateField(email, eerr, rules.email))    valid = false;
  // Check password length (min 6 characters)
  if (!validateField(pass,  perr, rules.minLen(6))) valid = false;

  if (valid) {
    // Create a simple user object using the email prefix as the name
    currentUser = {
      name:  email.value.split('@')[0],
      email: email.value
    };
    localStorage.setItem('ssp_user', JSON.stringify(currentUser));
    checkAuth();
    showToast('👋 Welcome, ' + currentUser.name + '!');
  }
}

// ─── LOGOUT ─────────────────────────────────
function logout() {
  currentUser = null;
  localStorage.removeItem('ssp_user');
  checkAuth();
}

// ─── SWITCH FORM ────────────────────────────
// Toggles the modal between "Log In" and "Sign Up" mode
// (Both actually use the same login() function — it's a cosmetic switch)
function switchForm(type) {
  const title    = document.getElementById('modalTitle');
  const sub      = document.getElementById('modalSub');
  const btn      = document.getElementById('authBtn');
  const footLink = document.getElementById('footLink');
  const footText = document.getElementById('footText');

  if (type === 'signup') {
    title.textContent    = 'Create Account';
    sub.textContent      = 'Join to start shopping.';
    btn.textContent      = 'Sign Up';
    footText.textContent = 'Already have an account? ';
    footLink.textContent = 'Log In';
    footLink.onclick     = () => switchForm('login');
  } else {
    title.textContent    = 'Welcome Back';
    sub.textContent      = 'Log in to continue shopping.';
    btn.textContent      = 'Log In';
    footText.textContent = "Don't have an account? ";
    footLink.textContent = 'Sign Up';
    footLink.onclick     = () => switchForm('signup');
  }
}

// ─── RENDER PRODUCTS ────────────────────────
// Filters the product list and builds the product cards HTML
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Apply category filter
  let list = PRODUCTS;
  if (currentCat !== 'all') list = list.filter(p => p.category === currentCat);

  // Apply search filter (case-insensitive)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.includes(q)
    );
  }

  // No results
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
      <div style="font-size:2rem;">🔍</div>
      <p>No products found.</p>
    </div>`;
    return;
  }

  // Build HTML for each product card
  grid.innerHTML = list.map(p => {
    const inCart = cart.some(c => c.id === p.id);         // Is this product in the cart?
    const inWish = wishlist.includes(p.id);               // Is it wishlisted?
    const stars  = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 ? '½' : '');

    // Price display: show strikethrough original if there's a discount
    const priceHtml = p.original
      ? `<span class="price-orig">₹${p.original.toLocaleString()}</span> ₹${p.price.toLocaleString()}`
      : `₹${p.price.toLocaleString()}`;

    return `
      <div class="product-card">

        <!-- Emoji image area -->
        <div class="product-image">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <button class="wish-btn" onclick="toggleWishlist(${p.id}, event)" title="Wishlist">
            ${inWish ? '❤️' : '🤍'}
          </button>
          ${p.emoji}
        </div>

        <!-- Info area -->
        <div class="product-info">
          <div class="product-cat">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">
            <span class="stars">${stars}</span> ${p.rating} (${p.reviews})
          </div>
          <div class="product-footer">
            <div class="price">${priceHtml}</div>
            <button class="add-btn ${inCart ? 'added' : ''}" onclick="addToCart(${p.id}, event)" title="${inCart ? 'In cart' : 'Add to cart'}">
              ${inCart ? '✓' : '+'}
            </button>
          </div>
        </div>

      </div>`;
  }).join('');
}

// ─── ADD TO CART ────────────────────────────
// Adds a product to the cart, or increments quantity if already there
function addToCart(id, e) {
  if (e) e.stopPropagation();  // Prevent event bubbling

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;  // Already in cart: just increase quantity
  } else {
    const p = PRODUCTS.find(p => p.id === id);
    cart.push({ id, name: p.name, price: p.price, emoji: p.emoji, qty: 1 });
  }

  saveCart();
  renderProducts();
  renderCart();
  showToast('🛒 Added to cart!');
}

// ─── REMOVE FROM CART ───────────────────────
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
  renderProducts();
}

// ─── CHANGE QUANTITY ────────────────────────
// delta = +1 or -1; removes item if quantity reaches 0
function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

// ─── SAVE CART ──────────────────────────────
// Saves cart to localStorage and updates the FAB badge count
function saveCart() {
  localStorage.setItem('ssp_cart', JSON.stringify(cart));

  const badge = document.getElementById('cartCount');
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent    = totalItems;
    badge.style.display  = totalItems ? 'flex' : 'none';
  }
}

// ─── RENDER CART ────────────────────────────
// Builds the cart drawer content
function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">Cart is empty</div>
        <p>Add some products!</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-emoji">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
        </div>

        <!-- Quantity controls: minus, number, plus -->
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
        </div>

        <!-- Remove button -->
        <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="removeFromCart(${item.id})">✕</button>
      </div>
    `).join('');
  }

  // Calculate and display total price
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const el    = document.getElementById('cartTotal');
  if (el) el.textContent = '₹' + total.toLocaleString();

  saveCart();
}

// ─── CHECKOUT ───────────────────────────────
// Simulates placing an order by clearing the cart
function checkout() {
  if (!cart.length) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  cart = [];
  saveCart();
  renderCart();
  renderProducts();
  closeCart();
  showToast('🎉 Order placed successfully!');
}

// ─── OPEN / CLOSE CART DRAWER ───────────────
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('show');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('show');
}

// ─── TOGGLE WISHLIST ────────────────────────
// Adds or removes a product from the wishlist
function toggleWishlist(id, e) {
  if (e) e.stopPropagation();

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
    showToast('💔 Removed from wishlist.');
  } else {
    wishlist.push(id);
    showToast('❤️ Added to wishlist!');
  }

  localStorage.setItem('ssp_wishlist', JSON.stringify(wishlist));
  renderProducts();
}

// ─── SET CATEGORY ───────────────────────────
// Changes the active category pill and re-renders products
function setCategory(cat) {
  currentCat = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
  renderProducts();
}

// ─── SEARCH ─────────────────────────────────
// Re-renders products as the user types in the search box
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  renderProducts();
});

// ─── INIT ────────────────────────────────────
// On page load: check if user is already logged in
checkAuth();
