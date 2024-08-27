// Dummy product data (in a real application, this would come from a server)
const products = [
    { id: 1, name: 'Chocolate Cake', price: 25.99, image: 'chocolate-cake.jpg' },
    { id: 2, name: 'Croissant', price: 2.99, image: 'croissant.jpg' },
    { id: 3, name: 'Baguette', price: 3.99, image: 'baguette.jpg' },
    { id: 4, name: 'Cupcake', price: 1.99, image: 'cupcake.jpg' },
];

function displayProducts() {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productGrid.appendChild(productCard);
    });
}

function addToCart(productId) {
    // In a real application, this would send a request to the server
    // For now, we'll just log to the console
    console.log(`Added product ${productId} to cart`);
    alert('Product added to cart!');
}

// Load products when the page loads
window.addEventListener('load', displayProducts);
