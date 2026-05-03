// delivery_dashboard.js - Delivery Man Dashboard CRUD

// Load routes when page opens
window.addEventListener('load', function () {

    fetch('../api/auth/check_auth.php')
        .then(function (r) { return r.text(); })
        .then(function (result) {
            if (result.trim() === 'unauthorized') {
                window.location.href = '../pages/login.html';
                return;
            }
            loadRoutes();
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
    if (sectionId === 'section-routes') loadRoutes();
}

// Show Add Form
function showAddForm() {
    document.getElementById('route-form-card').style.display = 'block';
    document.getElementById('form-title').textContent = 'Add New Route';
    document.getElementById('route_id').value = '';
    document.getElementById('pickup_area').value = '';
    document.getElementById('drop_area').value = '';
    document.getElementById('vehicle_type').value = '';
    document.getElementById('cargo_type').value = 'crops';
    document.getElementById('capacity_kg').value = '';
    document.getElementById('price_per_trip').value = '';
    document.getElementById('contact').value = '';
    document.getElementById('status').value = 'available';
    document.getElementById('description').value = '';
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Route';
    document.getElementById('route-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Show Edit Form - fills form with existing route data
function showEditForm(id, pickupArea, dropArea, vehicleType, cargoType, capacityKg, pricePerTrip, contact, status, description) {
    document.getElementById('route-form-card').style.display = 'block';
    document.getElementById('form-title').textContent = 'Edit Route';
    document.getElementById('route_id').value = id;
    document.getElementById('pickup_area').value = pickupArea;
    document.getElementById('drop_area').value = dropArea;
    document.getElementById('vehicle_type').value = vehicleType;
    document.getElementById('cargo_type').value = cargoType;
    document.getElementById('capacity_kg').value = capacityKg;
    document.getElementById('price_per_trip').value = pricePerTrip;
    document.getElementById('contact').value = contact;
    document.getElementById('status').value = status;
    document.getElementById('description').value = description;
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-pen"></i> Update Route';
    document.getElementById('route-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Hide Form
function hideForm() {
    document.getElementById('route-form-card').style.display = 'none';
}

// Reset Form Message
function resetFormMsg() {
    var msg = document.getElementById('form-msg');
    msg.className = 'msg-box';
    msg.textContent = '';
}

// CREATE / UPDATE - Add or Edit route
async function handleRouteSubmit(event) {
    event.preventDefault();

    var btn = document.getElementById('form-btn');
    var routeId = document.getElementById('route_id').value;

    var apiUrl = routeId ? '../api/routes/route_update.php' : '../api/routes/route_add.php';

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    var formData = new FormData(document.getElementById('routeForm'));

    try {
        var response = await fetch(apiUrl, { method: 'POST', body: formData });
        var text = (await response.text()).trim();

        if (text === 'success') {
            showFormMsg('Route saved successfully!', 'success');
            loadRoutes();
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
    btn.innerHTML = routeId
        ? '<i class="fa-solid fa-pen"></i> Update Route'
        : '<i class="fa-solid fa-floppy-disk"></i> Save Route';
}

// Vehicle label helper
function vehicleLabel(type) {
    var map = {
        'motorcycle': 'Motorcycle',
        'rickshaw': 'Rickshaw',
        'pickup_truck': 'Pickup Truck',
        'tractor_trolley': 'Tractor Trolley',
        'mini_truck': 'Mini Truck',
        'large_truck': 'Large Truck'
    };
    return map[type] || type;
}

// Vehicle icon helper
function vehicleIcon(type) {
    var icons = {
        'motorcycle': 'fa-motorcycle',
        'rickshaw': 'fa-van-shuttle',
        'pickup_truck': 'fa-truck-pickup',
        'tractor_trolley': 'fa-tractor',
        'mini_truck': 'fa-truck',
        'large_truck': 'fa-truck-moving'
    };
    return icons[type] || 'fa-truck';
}

// READ - Load all routes from database
async function loadRoutes() {
    var container = document.getElementById('routes-container');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>';

    try {
        var response = await fetch('../api/routes/route_read.php');
        var text = await response.text();

        if (text.trim() === 'unauthorized') {
            container.innerHTML = '<div class="empty-state"><p>Session expired. Please login again.</p></div>';
            return;
        }

        var routes = JSON.parse(text);

        // Update overview stat cards
        updateStats(routes);

        if (routes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-truck"></i>
                    <p>No routes listed yet. Add your first delivery route!</p>
                    <button class="btn btn-primary btn-sm" onclick="showAddForm()">
                        <i class="fa-solid fa-plus"></i> Add Route
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
                        <th>Pickup Area</th>
                        <th>Drop Area</th>
                        <th>Vehicle</th>
                        <th>Cargo Type</th>
                        <th>Capacity</th>
                        <th>Price / Trip</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Added On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>`;

        routes.forEach(function (route, index) {
            var statusClass = {
                'available': 'badge-green',
                'busy': 'badge-red',
                'on_leave': 'badge-gold'
            }[route.status] || 'badge-green';

            var statusText = {
                'available': 'Available',
                'busy': 'Busy',
                'on_leave': 'On Leave'
            }[route.status] || 'Available';

            var cargoClass = route.cargo_type === 'crops' ? 'badge-green'
                : route.cargo_type === 'fertilizer' ? 'badge-gold'
                    : route.cargo_type === 'seeds' ? 'badge-blue'
                        : 'badge-blue';

            var cargoLabel = route.cargo_type.charAt(0).toUpperCase() + route.cargo_type.slice(1);
            var date = new Date(route.created_at).toLocaleDateString('en-PK');
            var desc = route.description ? route.description.replace(/'/g, "\\'") : '';
            var contact = route.contact.replace(/'/g, "\\'");
            var pickup = route.pickup_area.replace(/'/g, "\\'");
            var drop = route.drop_area.replace(/'/g, "\\'");

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${route.pickup_area}</strong></td>
                    <td>${route.drop_area}</td>
                    <td>
                        <span style="display:flex;align-items:center;gap:6px;">
                            <i class="fa-solid ${vehicleIcon(route.vehicle_type)}"></i>
                            ${vehicleLabel(route.vehicle_type)}
                        </span>
                    </td>
                    <td><span class="badge ${cargoClass}">${cargoLabel}</span></td>
                    <td>${Number(route.capacity_kg).toLocaleString()} kg</td>
                    <td>Rs. ${Number(route.price_per_trip).toLocaleString()}</td>
                    <td>${route.contact}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>${date}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline"
                                onclick="showEditForm('${route.id}','${pickup}','${drop}','${route.vehicle_type}','${route.cargo_type}','${route.capacity_kg}','${route.price_per_trip}','${contact}','${route.status}','${desc}')">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger"
                                onclick="deleteRoute('${route.id}','${route.pickup_area} → ${route.drop_area}')">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading routes. Please refresh.</p></div>';
    }
}

// Update overview stat numbers
function updateStats(routes) {
    var total = routes.length;
    var available = routes.filter(function (r) { return r.status === 'available'; }).length;
    var busy = routes.filter(function (r) { return r.status === 'busy'; }).length;
    var earnings = routes.reduce(function (sum, r) { return sum + Number(r.price_per_trip); }, 0);

    var elTotal = document.getElementById('stat-total');
    var elAvailable = document.getElementById('stat-available');
    var elBusy = document.getElementById('stat-busy');
    var elEarnings = document.getElementById('stat-earnings');

    if (elTotal) elTotal.textContent = total;
    if (elAvailable) elAvailable.textContent = available;
    if (elBusy) elBusy.textContent = busy;
    if (elEarnings) elEarnings.textContent = 'Rs. ' + earnings.toLocaleString();
}

// DELETE - Remove a route
async function deleteRoute(routeId, routeLabel) {

    if (!confirm('Are you sure you want to delete "' + routeLabel + '"?')) return;

    var formData = new FormData();
    formData.append('route_id', routeId);

    try {
        var response = await fetch('../api/routes/route_delete.php', { method: 'POST', body: formData });
        var text = (await response.text()).trim();

        if (text === 'success') {
            loadRoutes();  // Reload table after delete
        } else {
            alert('Could not delete route. Please try again.');
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
