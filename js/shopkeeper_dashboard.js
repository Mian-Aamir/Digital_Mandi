// shopkeeper_dashboard.js - Shopkeeper Dashboard CRUD

// Load products when page opens
window.addEventListener('load', function () {

    fetch('../api/auth/check_auth.php')
        .then(function (r) { return r.text(); })
        .then(function (result) {
            if (result.trim() === 'unauthorized') {
                window.location.href = '../pages/login.html';
                return;
            }
            loadProducts();
        });
});

// Sidebar Navigation
function showSection(sectionId, el) {
    document.querySelectorAll('.section-content').forEach(function (s) {
        s.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.sidebar-item').forEach(function (item) {
        item.classList.remove('active');
    });
    if (el) el.classList.add('active');
    if (sectionId === 'section-products') loadProducts();
}

// Show Add Form
function showAddForm() {
    document.getElementById('product-form-card').style.display = 'block';
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('product_id').value = '';
    document.getElementById('product_name').value = '';
    document.getElementById('category').value = '';
    document.getElementById('brand').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('unit').value = 'kg';
    document.getElementById('price').value = '';
    document.getElementById('status').value = 'available';
    document.getElementById('description').value = '';
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
    document.getElementById('product-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Show Edit Form - fills form with existing product data
function showEditForm(id, productName, category, brand, quantity, unit, price, status, description) {
    document.getElementById('product-form-card').style.display = 'block';
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('product_id').value = id;
    document.getElementById('product_name').value = productName;
    document.getElementById('category').value = category;
    document.getElementById('brand').value = brand;
    document.getElementById('quantity').value = quantity;
    document.getElementById('unit').value = unit;
    document.getElementById('price').value = price;
    document.getElementById('status').value = status;
    document.getElementById('description').value = description;
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-pen"></i> Update Product';
    document.getElementById('product-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Hide Form
function hideForm() {
    document.getElementById('product-form-card').style.display = 'none';
}

// Reset Form Message
function resetFormMsg() {
    var msg = document.getElementById('form-msg');
    msg.className = 'msg-box';
    msg.textContent = '';
}

// CREATE / UPDATE - Add or Edit product
async function handleProductSubmit(event) {
    event.preventDefault();

    var btn = document.getElementById('form-btn');
    var productId = document.getElementById('product_id').value;

    // If product_id exists = edit mode, else = add mode
    var apiUrl = productId ? '../api/products/product_update.php' : '../api/products/product_add.php';

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    var formData = new FormData(document.getElementById('productForm'));

    try {
        var response = await fetch(apiUrl, { method: 'POST', body: formData });
        var text = (await response.text()).trim();

        if (text === 'success') {
            showFormMsg('Product saved successfully!', 'success');
            loadProducts();
            setTimeout(function () { hideForm(); }, 1000);

        } else if (text === 'unauthorized') {
            showFormMsg('Session expired. Please login again.', 'error');
        } else {
            showFormMsg('Something went wrong. Please try again.', 'error');
        }

    } catch (err) {
        showFormMsg('Network error. Check connection.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = productId
        ? '<i class="fa-solid fa-pen"></i> Update Product'
        : '<i class="fa-solid fa-floppy-disk"></i> Save Product';
}

// READ - Load all products from database
async function loadProducts() {
    var container = document.getElementById('products-container');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>';

    try {
        var response = await fetch('../api/products/product_read.php');
        var text = await response.text();

        if (text.trim() === 'unauthorized') {
            container.innerHTML = '<div class="empty-state"><p>Session expired. Please login again.</p></div>';
            return;
        }

        var products = JSON.parse(text);

        // Update stat cards on overview
        updateStats(products);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-boxes-stacked"></i>
                    <p>No products listed yet. Add your first product!</p>
                    <button class="btn btn-primary btn-sm" onclick="showAddForm()">
                        <i class="fa-solid fa-plus"></i> Add Product
                    </button>
                </div>`;
            return;
        }

        // Build HTML table
        var html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Quantity</th>
                        <th>Price / Unit</th>
                        <th>Status</th>
                        <th>Added On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>`;

        products.forEach(function (product, index) {
            var badgeClass = product.status === 'available' ? 'badge-green' : 'badge-red';
            var statusText = product.status === 'available' ? 'Available' : 'Out of Stock';
            var catBadge = product.category === 'fertilizer' ? 'badge-gold' : 'badge-blue';
            var catLabel = product.category === 'fertilizer' ? 'Fertilizer' : 'Seed';
            var date = new Date(product.created_at).toLocaleDateString('en-PK');
            var desc = product.description ? product.description.replace(/'/g, "\\'") : '';
            var brand = product.brand ? product.brand.replace(/'/g, "\\'") : '';

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${product.product_name}</strong></td>
                    <td><span class="badge ${catBadge}">${catLabel}</span></td>
                    <td>${product.brand || '—'}</td>
                    <td>${product.quantity} ${product.unit}</td>
                    <td>Rs. ${Number(product.price).toLocaleString()} / ${product.unit}</td>
                    <td><span class="badge ${badgeClass}">${statusText}</span></td>
                    <td>${date}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline"
                                onclick="showEditForm('${product.id}','${product.product_name}','${product.category}','${brand}','${product.quantity}','${product.unit}','${product.price}','${product.status}','${desc}')">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger"
                                onclick="deleteProduct('${product.id}','${product.product_name}')">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading products. Please refresh.</p></div>';
    }
}

// Update overview stat numbers
function updateStats(products) {
    var total = products.length;
    var fertilizers = products.filter(function (p) { return p.category === 'fertilizer'; }).length;
    var seeds = products.filter(function (p) { return p.category === 'seed'; }).length;
    var outOfStock = products.filter(function (p) { return p.status === 'out_of_stock'; }).length;

    var elTotal = document.getElementById('stat-total');
    var elFert = document.getElementById('stat-fertilizers');
    var elSeeds = document.getElementById('stat-seeds');
    var elOos = document.getElementById('stat-outofstock');

    if (elTotal) elTotal.textContent = total;
    if (elFert) elFert.textContent = fertilizers;
    if (elSeeds) elSeeds.textContent = seeds;
    if (elOos) elOos.textContent = outOfStock;
}

// DELETE - Remove a product
async function deleteProduct(productId, productName) {

    if (!confirm('Are you sure you want to delete "' + productName + '"?')) return;

    var formData = new FormData();
    formData.append('product_id', productId);

    try {
        var response = await fetch('../api/products/product_delete.php', { method: 'POST', body: formData });
        var text = (await response.text()).trim();

        if (text === 'success') {
            loadProducts();  // Reload table after delete
        } else {
            alert('Could not delete product. Please try again.');
        }

    } catch (err) {
        alert('Network error. Please check connection.');
    }
}

// Show form message
function showFormMsg(text, type) {
    var msg = document.getElementById('form-msg');
    msg.textContent = text;
    msg.className = type === 'success' ? 'msg-box msg-success' : 'msg-box msg-error';
}
