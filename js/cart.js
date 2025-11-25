// Load Cart
function loadCart() {
    // Reload cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cart || cart.length === 0) {
        if (cartItems) cartItems.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartSummary) cartSummary.style.display = 'none';
        
        // Disable checkout button
        const checkoutBtn = document.querySelector('.cart-summary .btn-primary');
        if (checkoutBtn) {
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
            checkoutBtn.style.cursor = 'not-allowed';
        }
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    // Enable checkout button
    const checkoutBtn = document.querySelector('.cart-summary .btn-primary');
    if (checkoutBtn) {
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';
        checkoutBtn.style.cursor = 'pointer';
    }
    
    if (cartItems) {
        cartItems.innerHTML = cart.map((item, index) => {
            // Escape special characters
            const escapedName = item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedImage = item.image.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const size = item.size || 'N/A';
            const color = item.color || 'N/A';
            
            return `
                <div class="cart-item">
                    <a href="product.html?id=${item.id}">
                        <img src="${escapedImage}" alt="${escapedName}" class="cart-item-image">
                    </a>
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">
                            <a href="product.html?id=${item.id}">${escapedName}</a>
                        </h3>
                        <div class="cart-item-details">
                            Size: ${size} | Color: ${color}
                        </div>
                        <div class="cart-item-price">$${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="qty-btn-small" onclick="updateQuantity(${index}, ${parseInt(item.quantity) - 1})" aria-label="Decrease quantity">-</button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" onchange="updateQuantity(${index}, parseInt(this.value) || 1)">
                            <button class="qty-btn-small" onclick="updateQuantity(${index}, ${parseInt(item.quantity) + 1})" aria-label="Increase quantity">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${index})" aria-label="Remove item">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateCartSummary();
}

// Update Quantity
function updateQuantity(index, newQuantity) {
    // Reload cart from localStorage to ensure we have the latest data
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (index < 0 || index >= cart.length) return;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Cart updated!', 'success');
}

// Apply Coupon
let couponApplied = false;
let discountAmount = 0;

function applyCoupon() {
    const couponCode = document.getElementById('couponCode');
    if (!couponCode) return;
    
    const code = couponCode.value.trim().toUpperCase();
    if (code === 'SAVE10') {
        couponApplied = true;
        discountAmount = 0.1; // 10% discount
        showNotification('Coupon applied! 10% discount added.', 'success');
        updateCartSummary();
        couponCode.disabled = true;
        couponCode.style.backgroundColor = '#d4edda';
    } else if (code === '') {
        showNotification('Please enter a coupon code.', 'error');
    } else {
        showNotification('Invalid coupon code.', 'error');
    }
}

// Update Cart Summary
function updateCartSummary() {
    // Reload cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const discount = couponApplied ? subtotal * discountAmount : 0;
    const subtotalAfterDiscount = subtotal - discount;
    const shipping = subtotalAfterDiscount > 100 ? 0 : 10;
    const tax = subtotalAfterDiscount * 0.08; // 8% tax
    const total = subtotalAfterDiscount + shipping + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    
    // Show discount if applied
    let discountRow = document.getElementById('discountRow');
    if (couponApplied && discount > 0) {
        if (!discountRow) {
            const taxRow = document.getElementById('tax');
            if (taxRow && taxRow.parentElement) {
                discountRow = document.createElement('div');
                discountRow.id = 'discountRow';
                discountRow.className = 'summary-row';
                discountRow.innerHTML = `
                    <span style="color: #27ae60;">Discount (10%):</span>
                    <span style="color: #27ae60; font-weight: 600;">-$${discount.toFixed(2)}</span>
                `;
                taxRow.parentElement.insertBefore(discountRow, taxRow);
            }
        } else {
            discountRow.innerHTML = `
                <span style="color: #27ae60;">Discount (10%):</span>
                <span style="color: #27ae60; font-weight: 600;">-$${discount.toFixed(2)}</span>
            `;
        }
    } else if (discountRow) {
        discountRow.remove();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    
    // Enable Enter key for coupon input
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCoupon();
            }
        });
    }
});





