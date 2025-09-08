  // User Authentication & Data
        let currentUser = null;
        let cartItems = [];
        let products = [];
        let wishlistItems = [];
        let orders = [];
        let appliedCoupon = null;

        // DOM Elements
        const pageSections = document.querySelectorAll('.page-section');
        const userIcon = document.getElementById('user-icon');
        const wishlistIcon = document.getElementById('wishlist-icon');
        const cartIcon = document.getElementById('cart-icon');
        const loginModal = document.getElementById('login-modal');
        const closeModal = document.querySelector('.close-modal');
        const modalTabs = document.querySelectorAll('.modal-tab');
        const modalForms = document.querySelectorAll('.modal-form');
        const userDashboard = document.getElementById('user-dashboard');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const logoutBtn = document.getElementById('logout-btn');
        const myOrdersBtn = document.getElementById('my-orders-btn');
        const myWishlistBtn = document.getElementById('my-wishlist-btn');
        const orderList = document.getElementById('order-list');
        const wishlistPage = document.getElementById('wishlist-page');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        const cartCount = document.querySelector('.cart-count');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');
        const applyCouponBtn = document.getElementById('apply-coupon');
        const couponCodeInput = document.getElementById('coupon-code');
        const couponMessage = document.getElementById('coupon-message');
        const body = document.body;

        // Coupon codes
        const validCoupons = [
            { code: 'SUMMER20', discount: 20, message: '20% off on all summer items' },
            { code: 'WELCOME10', discount: 10, message: '10% off on your first order' },
            { code: 'FREESHIP', discount: 0, message: 'Free shipping on your order', freeShipping: true }
        ];

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function () {
            initializeApp();
            setupEventListeners();
            loadProducts();
        });

        // Initialize the application
        function initializeApp() {
            // Check if user is logged in
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateUserInterface();
            }

            // Load cart items
            const savedCart = localStorage.getItem('cartItems');
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
                updateCartCount();
            }

            // Load wishlist items
            const savedWishlist = localStorage.getItem('wishlistItems');
            if (savedWishlist) {
                wishlistItems = JSON.parse(savedWishlist);
            }

            // Load orders
            const savedOrders = localStorage.getItem('orders');
            if (savedOrders) {
                orders = JSON.parse(savedOrders);
            }
        }

        // Set up event listeners
        function setupEventListeners() {
            // Page navigation
            const pageLinks = document.querySelectorAll('[data-page]');
            pageLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetPage = this.getAttribute('data-page');
                    navigateToPage(targetPage);
                });
            });

            // User icon click
            userIcon.addEventListener('click', function (e) {
                e.preventDefault();
                if (currentUser) {
                    userDashboard.style.display = userDashboard.style.display === 'block' ? 'none' : 'block';
                    orderList.style.display = 'none';
                    wishlistPage.style.display = 'none';
                } else {
                    loginModal.style.display = 'flex';
                }
            });

            // Wishlist icon click
            wishlistIcon.addEventListener('click', function (e) {
                e.preventDefault();
                if (currentUser) {
                    displayWishlist();
                } else {
                    showNotification('Please login to view your wishlist');
                    loginModal.style.display = 'flex';
                }
            });

            // Cart icon click
            cartIcon.addEventListener('click', function (e) {
                e.preventDefault();
                showNotification('Cart functionality will be implemented soon');
            });

            // My Orders button
            myOrdersBtn.addEventListener('click', function (e) {
                e.preventDefault();
                displayOrders();
            });

            // My Wishlist button
            myWishlistBtn.addEventListener('click', function (e) {
                e.preventDefault();
                displayWishlist();
            });

            // Close modal
            closeModal.addEventListener('click', function () {
                loginModal.style.display = 'none';
            });

            // Modal tabs
            modalTabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const tabId = this.getAttribute('data-tab');

                    // Update active tab
                    modalTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    // Show corresponding form
                    modalForms.forEach(form => {
                        form.classList.remove('active');
                        if (form.id === `${tabId}-form`) {
                            form.classList.add('active');
                        }
                    });
                });
            });

            // Form submission
            document.getElementById('login-form').addEventListener('submit', function (e) {
                e.preventDefault();
                handleLogin();
            });

            document.getElementById('register-form').addEventListener('submit', function (e) {
                e.preventDefault();
                handleRegister();
            });

            // Logout
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handleLogout();
            });

            // Mobile menu
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);

            // Apply coupon
            applyCouponBtn.addEventListener('click', function (e) {
                e.preventDefault();
                applyCoupon();
            });

            // Add to cart buttons
            document.addEventListener('click', function (e) {
                if (e.target.classList.contains('add-to-cart')) {
                    e.preventDefault();
                    const productCard = e.target.closest('.product-card');
                    const productId = productCard.getAttribute('data-product-id');
                    addToCart(productId);
                }
            });

            // Wishlist buttons
            document.addEventListener('click', function (e) {
                if (e.target.closest('.wishlist')) {
                    e.preventDefault();
                    if (!currentUser) {
                        showNotification('Please login to add items to your wishlist');
                        loginModal.style.display = 'flex';
                        return;
                    }

                    const wishlistBtn = e.target.closest('.wishlist');
                    const productCard = wishlistBtn.closest('.product-card');
                    const productId = productCard.getAttribute('data-product-id');

                    toggleWishlist(productId, wishlistBtn);
                }
            });

            // Close modal when clicking outside
            window.addEventListener('click', function (e) {
                if (e.target === loginModal) {
                    loginModal.style.display = 'none';
                }

                // Close mobile menu when clicking outside
                if (mobileNav.classList.contains('active') && 
                    !e.target.closest('.mobile-nav') && 
                    !e.target.closest('.mobile-menu-btn')) {
                    toggleMobileMenu();
                }
            });

            // Filter options
            const filterOptions = document.querySelectorAll('.filter-option');
            filterOptions.forEach(option => {
                option.addEventListener('click', function () {
                    filterOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    // Here you would normally filter products
                    showNotification('Filter applied: ' + this.textContent);
                });
            });
        }

        // Toggle mobile menu function
        function toggleMobileMenu() {
            mobileNav.classList.toggle('active');
            body.classList.toggle('mobile-menu-open');
            
            const menuIcon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        }

        // Navigation function
        function navigateToPage(pageId) {
            // Hide all pages and sections
            pageSections.forEach(page => {
                page.classList.remove('active');
            });

            userDashboard.style.display = 'none';
            orderList.style.display = 'none';
            wishlistPage.style.display = 'none';
            
            // Close mobile menu if open
            if (mobileNav.classList.contains('active')) {
                toggleMobileMenu();
            }

            // Show target page
            document.getElementById(pageId).classList.add('active');

            // Scroll to top
            window.scrollTo(0, 0);

            // Render products for the page
            renderProducts();
        }

        // Handle user login
        function handleLogin() {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Simple validation
            if (!email || !password) {
                showNotification('Please fill in all fields');
                return;
            }

            // Check if user exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUserInterface();
                loginModal.style.display = 'none';
                showNotification('Login successful!');

                // Clear form
                document.getElementById('login-form').reset();
            } else {
                showNotification('Invalid email or password');
            }
        }

        // Handle user registration
        function handleRegister() {
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;

            // Simple validation
            if (!name || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match');
                return;
            }

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(user => user.email === email)) {
                showNotification('User with this email already exists');
                return;
            }

            // Create new user
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Auto login after registration
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInterface();

            // Switch to login tab and show success message
            modalTabs.forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="login"]').classList.add('active');
            modalForms.forEach(form => form.classList.remove('active'));
            document.getElementById('login-form').classList.add('active');

            showNotification('Registration successful! You are now logged in.');
            loginModal.style.display = 'none';

            // Clear form
            document.getElementById('register-form').reset();
        }

        // Handle user logout
        function handleLogout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            userDashboard.style.display = 'none';
            orderList.style.display = 'none';
            wishlistPage.style.display = 'none';
            showNotification('You have been logged out');
            updateUserInterface();
        }

        // Update UI based on user state
        function updateUserInterface() {
            if (currentUser) {
                userName.textContent = currentUser.name;
                userEmail.textContent = currentUser.email;
                userIcon.querySelector('span').textContent = currentUser.name.split(' ')[0];
            } else {
                userName.textContent = 'Guest User';
                userEmail.textContent = 'guest@example.com';
                userIcon.querySelector('span').textContent = 'Profile';
            }
        }

        // Display user orders
        function displayOrders() {
            userDashboard.style.display = 'none';
            wishlistPage.style.display = 'none';
            orderList.style.display = 'block';

            const ordersContainer = document.getElementById('orders-container');
            ordersContainer.innerHTML = '';

            if (orders.length === 0) {
                ordersContainer.innerHTML = '<p class="no-orders">You haven\'t placed any orders yet.</p>';
                return;
            }

            orders.forEach(order => {
                const orderEl = document.createElement('div');
                orderEl.className = 'order-card';

                orderEl.innerHTML = `
                    <img src="${order.image}" alt="${order.name}" class="order-image">
                    <div class="order-details">
                        <h3>${order.name}</h3>
                        <p>Quantity: ${order.quantity}</p>
                        <p>Price: ₹${order.price * order.quantity}</p>
                        <p>Order Date: ${order.date}</p>
                        <p>Status: <span class="status">${order.status}</span></p>
                    </div>
                `;

                ordersContainer.appendChild(orderEl);
            });
        }

        // Display user wishlist
        function displayWishlist() {
            userDashboard.style.display = 'none';
            orderList.style.display = 'none';
            wishlistPage.style.display = 'block';

            const wishlistContainer = document.getElementById('wishlist-container');
            wishlistContainer.innerHTML = '';

            if (wishlistItems.length === 0) {
                wishlistContainer.innerHTML = '<p class="no-wishlist">Your wishlist is empty.</p>';
                return;
            }

            wishlistItems.forEach(itemId => {
                const product = products.find(p => p.id == itemId);
                if (!product) return;

                const wishlistItem = document.createElement('div');
                wishlistItem.className = 'wishlist-item';

                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

                wishlistItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="wishlist-image">
                    <div class="wishlist-details">
                        <h3>${product.name}</h3>
                        <p class="product-brand">${product.brand}</p>
                        <div class="product-price">
                            <span class="current-price">₹${product.price}</span>
                            <span class="original-price">₹${product.originalPrice}</span>
                            <span class="discount">${discount}% off</span>
                        </div>
                        <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                    </div>
                    <div class="wishlist-remove" data-product-id="${product.id}">
                        <i class="fas fa-times"></i>
                    </div>
                `;

                wishlistContainer.appendChild(wishlistItem);
            });

            // Add event listener for remove buttons
            const removeButtons = document.querySelectorAll('.wishlist-remove');
            removeButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const productId = this.getAttribute('data-product-id');
                    removeFromWishlist(productId);
                });
            });
        }

        // Toggle product in wishlist
        function toggleWishlist(productId, wishlistBtn) {
            const icon = wishlistBtn.querySelector('i');
            const index = wishlistItems.indexOf(parseInt(productId));

            if (index === -1) {
                // Add to wishlist
                wishlistItems.push(parseInt(productId));
                icon.classList.remove('far');
                icon.classList.add('fas');
                wishlistBtn.style.color = "var(--primary)";
                showNotification('Added to wishlist');
            } else {
                // Remove from wishlist
                wishlistItems.splice(index, 1);
                icon.classList.remove('fas');
                icon.classList.add('far');
                wishlistBtn.style.color = "";
                showNotification('Removed from wishlist');
            }

            // Save to localStorage
            localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        }

        // Remove from wishlist
        function removeFromWishlist(productId) {
            const index = wishlistItems.indexOf(parseInt(productId));

            if (index !== -1) {
                wishlistItems.splice(index, 1);
                localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
                displayWishlist();
                showNotification('Removed from wishlist');
            }
        }

        // Add product to cart
        function addToCart(productId) {
            if (!currentUser) {
                showNotification('Please login to add items to cart');
                loginModal.style.display = 'flex';
                return;
            }

            const product = products.find(p => p.id == productId);
            if (!product) return;

            // Check if product is already in cart
            const existingItem = cartItems.find(item => item.id == productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }

            // Save to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));

            // Update UI
            updateCartCount();
            showNotification('Product added to cart');

            // Animation for button
            const addButton = document.querySelector(`[data-product-id="${productId}"] .add-to-cart`);
            if (addButton) {
                addButton.textContent = "Added!";
                addButton.style.backgroundColor = "var(--success)";

                setTimeout(() => {
                    addButton.textContent = "Add to Cart";
                    addButton.style.backgroundColor = "var(--primary)";
                }, 1500);
            }
        }

        // Apply coupon
        function applyCoupon() {
            const code = couponCodeInput.value.trim();

            if (!code) {
                couponMessage.textContent = 'Please enter a coupon code';
                couponMessage.style.color = 'var(--discount)';
                return;
            }

            const coupon = validCoupons.find(c => c.code === code);

            if (coupon) {
                appliedCoupon = coupon;
                couponMessage.textContent = `Coupon applied: ${coupon.message}`;
                couponMessage.style.color = 'var(--success)';
                showNotification('Coupon applied successfully!');
            } else {
                appliedCoupon = null;
                couponMessage.textContent = 'Invalid coupon code';
                couponMessage.style.color = 'var(--discount)';
                showNotification('Invalid coupon code');
            }
        }

        // Update cart count
        function updateCartCount() {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        // Show notification
        function showNotification(message) {
            notificationText.textContent = message;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        // Load products
        function loadProducts() {
            // Simulate loading from an API
            products = [
                // Men's products
                {
                    id: 1,
                    name: "Men's Pure Cotton T-Shirt",
                    brand: "H&M",
                    price: 599,
                    originalPrice: 999,
                    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
                    category: "men"
                },
                {
                    id: 2,
                    name: "Men's Formal Shirt",
                    brand: "Van Heusen",
                    price: 1299,
                    originalPrice: 1999,
                    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1925&q=80",
                    category: "men"
                },
                {
                    id: 3,
                    name: "Men's Jeans",
                    brand: "Levi's",
                    price: 1799,
                    originalPrice: 2999,
                    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80",
                    category: "men"
                },
                {
                    id: 4,
                    name: "Men's Air Max Sneakers",
                    brand: "Nike",
                    price: 4999,
                    originalPrice: 7999,
                    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80",
                    category: "men"
                },

                // Women's products
                {
                    id: 5,
                    name: "Women's Floral Print Dress",
                    brand: "ZARA",
                    price: 1499,
                    originalPrice: 2499,
                    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80",
                    category: "women"
                },
                {
                    id: 6,
                    name: "Women's Skinny Fit Jeans",
                    brand: "Levi's",
                    price: 1799,
                    originalPrice: 2999,
                    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
                    category: "women"
                },
                {
                    id: 7,
                    name: "Women's Handbag",
                    brand: "H&M",
                    price: 1299,
                    originalPrice: 1999,
                    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80",
                    category: "women"
                },
                {
                    id: 8,
                    name: "Women's Running Shoes",
                    brand: "Nike",
                    price: 3999,
                    originalPrice: 5999,
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                    category: "women"
                },

                // Kids products
                {
                    id: 9,
                    name: "Boys T-Shirt",
                    brand: "H&M",
                    price: 499,
                    originalPrice: 799,
                    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
                    category: "kids"
                },
                {
                    id: 10,
                    name: "Girls Dress",
                    brand: "ZARA",
                    price: 999,
                    originalPrice: 1499,
                    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80",
                    category: "kids"
                },

                // Home & Living products
                {
                    id: 11,
                    name: "Decorative Cushion",
                    brand: "Home Centre",
                    price: 799,
                    originalPrice: 1299,
                    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2158&q=80",
                    category: "home-living"
                },
                {
                    id: 12,
                    name: "Table Lamp",
                    brand: "IKEA",
                    price: 1299,
                    originalPrice: 1999,
                    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                    category: "home-living"
                },

                // Beauty products
                {
                    id: 13,
                    name: "Lipstick Set",
                    brand: "Maybelline",
                    price: 899,
                    originalPrice: 1299,
                    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
                    category: "beauty"
                },
                {
                    id: 14,
                    name: "Face Moisturizer",
                    brand: "Nivea",
                    price: 499,
                    originalPrice: 699,
                    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                    category: "beauty"
                },

                // Studio products
                {
                    id: 15,
                    name: "Designer Blouse",
                    brand: "Studio",
                    price: 1999,
                    originalPrice: 2999,
                    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                    category: "studio"
                },
                {
                    id: 16,
                    name: "Premium Suit",
                    brand: "Studio",
                    price: 4999,
                    originalPrice: 7999,
                    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80",
                    category: "studio"
                }
            ];

            // Add some sample orders
            if (orders.length === 0) {
                orders.push({
                    id: 1,
                    name: "Men's Pure Cotton T-Shirt",
                    price: 599,
                    quantity: 2,
                    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
                    date: "2023-06-15",
                    status: "Delivered"
                });

                localStorage.setItem('orders', JSON.stringify(orders));
            }

            // Render products on the page
            renderProducts();
        }

        // Render products
        function renderProducts() {
            const productGrids = document.querySelectorAll('.product-grid');

            productGrids.forEach(grid => {
                // Clear existing content
                grid.innerHTML = '';

                // Get category from parent page
                const pageId = grid.closest('.page-section').id;
                let category = 'all';

                if (pageId !== 'home') {
                    category = pageId;
                }

                // Filter products by category
                let filteredProducts = products;
                if (category !== 'all') {
                    filteredProducts = products.filter(product => product.category === category);
                }

                // For offers page, show products with good discounts
                if (pageId === 'offers') {
                    filteredProducts = products.filter(product => {
                        const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
                        return discount >= 30;
                    });
                }

                // For new arrivals page, show the latest products
                if (pageId === 'new-arrivals') {
                    filteredProducts = products.slice().reverse();
                }

                // Render products
                filteredProducts.forEach(product => {
                    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.setAttribute('data-product-id', product.id);

                    // Check if product is in wishlist
                    const isInWishlist = wishlistItems.includes(product.id);
                    const heartIcon = isInWishlist ? 'fas' : 'far';
                    const heartColor = isInWishlist ? 'style="color: var(--primary)"' : '';

                    productCard.innerHTML = `
                        <div class="product-img">
                            <img src="${product.image}" alt="${product.name}">
                            ${discount > 30 ? `<div class="product-badge">${discount}% OFF</div>` : ''}
                        </div>
                        <div class="product-info">
                            <div class="product-brand">${product.brand}</div>
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">
                                <span class="current-price">₹${product.price}</span>
                                <span class="original-price">₹${product.originalPrice}</span>
                                <span class="discount">${discount}% off</span>
                            </div>
                            <div class="product-actions">
                                <button class="add-to-cart">Add to Cart</button>
                                <div class="wishlist" ${heartColor}>
                                    <i class="${heartIcon} fa-heart"></i>
                                </div>
                            </div>
                        </div>
                    `;

                    grid.appendChild(productCard);
                });

                // If no products found
                if (filteredProducts.length === 0) {
                    grid.innerHTML = '<p class="no-products">No products found in this category.</p>';
                }
            });
        }
       