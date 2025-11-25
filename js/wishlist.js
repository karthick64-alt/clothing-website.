// Load Wishlist
function loadWishlist() {
    // Reload wishlist from localStorage
    wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    const container = document.getElementById('wishlistProducts');
    const emptyWishlist = document.getElementById('emptyWishlist');
    
    if (!wishlist || wishlist.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyWishlist) {
            emptyWishlist.style.display = 'flex';
        }
        return;
    }
    
    if (emptyWishlist) emptyWishlist.style.display = 'none';
    
    if (container) {
        container.innerHTML = wishlist.map(item => {
            // Escape special characters in item name for HTML
            const escapedName = item.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const escapedImage = item.image.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            return `
                <div class="product-card">
                    <div class="product-image">
                        <a href="product.html?id=${item.id}">
                            <img src="${escapedImage}" alt="${escapedName}">
                        </a>
                        <button class="remove-wishlist" onclick="removeFromWishlistPage(${item.id})" aria-label="Remove from wishlist" title="Remove from wishlist">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">
                            <a href="product.html?id=${item.id}">${escapedName}</a>
                        </h3>
                        <div class="product-price">
                            <span class="price-current">$${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                        <div class="product-actions">
                            <a href="product.html?id=${item.id}" class="btn btn-primary btn-small">View</a>
                            <button class="btn btn-outline btn-small" onclick="addToCartFromWishlist(${item.id}, '${escapedName}', ${item.price}, '${escapedImage}')">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Remove from wishlist (specific function for wishlist page)
function removeFromWishlistPage(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    loadWishlist();
    updateWishlistCount();
    showNotification('Removed from wishlist!', 'success');
}

// Add to cart from wishlist
function addToCartFromWishlist(id, name, price, image) {
    addToCart({
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1
    });
}

// Update wishlist count in navbar
function updateWishlistCount() {
    const wishlistCount = document.querySelector('.wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
        wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    updateWishlistCount();
});





