// farmer-dashboard.js - Farmer Dashboard CRUD

// Load everything when page opens
window.addEventListener('load', function () {

    // Pehle auth check karo
    fetch('../api/auth/check_auth.php')
        .then(function (r) { return r.text(); })
        .then(function (result) {
            if (result.trim() === 'unauthorized') {
                // Not logged in - login page par bhejo
                window.location.href = '../pages/login.html';
                return;
            }
            // Logged in - data load karo
            loadCrops();
            loadOverview();
        });
});

// ── Sidebar Navigation ──
function showSection(sectionId, el) {

    // Hide all sections
    document.querySelectorAll('.section-content').forEach(function (s) {
        s.style.display = 'none';
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Update active sidebar item
    document.querySelectorAll('.sidebar-item').forEach(function (item) {
        item.classList.remove('active');
    });

    if (el) {
        el.classList.add('active');
    }

    // Reload data when switching sections
    if (sectionId === 'section-crops') {
        loadCrops();
    }

    if (sectionId === 'section-overview') {
        loadOverview();
    }

    if (sectionId === 'section-deliveries') {
    loadDeliveryRoutes();
    }
}

// ── Show Add Form ──
function showAddForm() {
    document.getElementById('crop-form-card').style.display = 'block';
    document.getElementById('form-title').textContent       = 'Add New Crop';
    document.getElementById('crop_id').value                = '';
    document.getElementById('crop_name').value              = '';
    document.getElementById('quantity').value               = '';
    document.getElementById('price').value                  = '';
    document.getElementById('location').value               = '';
    document.getElementById('status').value                 = 'available';
    document.getElementById('description').value            = '';
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Crop';
    document.getElementById('crop-form-card').scrollIntoView({ behavior: 'smooth' });
}

// ── Show Edit Form ──
function showEditForm(id, cropName, quantity, price, location, status, description) {
    document.getElementById('crop-form-card').style.display = 'block';
    document.getElementById('form-title').textContent       = 'Edit Crop';
    document.getElementById('crop_id').value                = id;
    document.getElementById('crop_name').value              = cropName;
    document.getElementById('quantity').value               = quantity;
    document.getElementById('price').value                  = price;
    document.getElementById('location').value               = location;
    document.getElementById('status').value                 = status;
    document.getElementById('description').value            = description;
    resetFormMsg();
    document.getElementById('form-btn').innerHTML = '<i class="fa-solid fa-pen"></i> Update Crop';
    document.getElementById('crop-form-card').scrollIntoView({ behavior: 'smooth' });
}

// ── Hide Form ──
function hideForm() {
    document.getElementById('crop-form-card').style.display = 'none';
}

// ── Reset Form Message ──
function resetFormMsg() {
    var msg         = document.getElementById('form-msg');
    msg.className   = 'msg-box';
    msg.textContent = '';
}

// ── Show Form Message ──
function showFormMsg(text, type) {
    var msg       = document.getElementById('form-msg');
    msg.textContent = text;
    msg.className   = type === 'success' ? 'msg-box msg-success' : 'msg-box msg-error';
}

// CREATE / UPDATE
async function handleCropSubmit(event) {
    event.preventDefault();

    var btn    = document.getElementById('form-btn');
    var cropId = document.getElementById('crop_id').value;
    var apiUrl = cropId ? '../api/crops/crop_update.php' : '../api/crops/crop_add.php';

    btn.disabled  = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    var formData = new FormData(document.getElementById('cropForm'));

    try {
        var response = await fetch(apiUrl, { method: 'POST', body: formData });
        var text     = (await response.text()).trim();

        if (text === 'success') {
            showFormMsg('Crop saved successfully!', 'success');
            loadCrops();
            loadOverview();
            setTimeout(function () { hideForm(); }, 1000);

        } else if (text === 'unauthorized') {
            showFormMsg('Session expired. Please login again.', 'error');

        } else {
            showFormMsg('Something went wrong. Please try again.', 'error');
        }

    } catch (err) {
        showFormMsg('Network error. Check connection.', 'error');
    }

    btn.disabled  = false;
    btn.innerHTML = cropId
        ? '<i class="fa-solid fa-pen"></i> Update Crop'
        : '<i class="fa-solid fa-floppy-disk"></i> Save Crop';
}

// READ - Load crops table
async function loadCrops() {
    var container       = document.getElementById('crops-container');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>';

    try {
        var response = await fetch('../api/crops/crop_read.php');
        var text     = await response.text();

        if (text.trim() === 'unauthorized') {
            container.innerHTML = '<div class="empty-state"><p>Session expired. Please login again.</p></div>';
            return;
        }

        var crops = JSON.parse(text);

        if (crops.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-wheat-awn"></i>' +
                    '<p>No crops listed yet. Add your first crop!</p>' +
                    '<button class="btn btn-primary btn-sm" onclick="showAddForm()">' +
                        '<i class="fa-solid fa-plus"></i> Add Crop' +
                    '</button>' +
                '</div>';
            return;
        }

        var html =
            '<table class="data-table">' +
                '<thead>' +
                    '<tr>' +
                        '<th>#</th>' +
                        '<th>Crop Name</th>' +
                        '<th>Quantity (kg)</th>' +
                        '<th>Price / 40kg</th>' +
                        '<th>Location</th>' +
                        '<th>Status</th>' +
                        '<th>Added On</th>' +
                        '<th>Actions</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>';

        crops.forEach(function (crop, index) {
            var badgeClass = crop.status === 'available' ? 'badge-green' : 'badge-red';
            var statusText = crop.status === 'available' ? 'Available' : 'Sold';
            var date       = new Date(crop.created_at).toLocaleDateString('en-PK');
            var desc       = crop.description ? crop.description.replace(/'/g, "\\'") : '';

            html +=
                '<tr>' +
                    '<td>' + (index + 1) + '</td>' +
                    '<td><strong>' + crop.crop_name + '</strong></td>' +
                    '<td>' + crop.quantity + ' kg</td>' +
                    '<td>Rs. ' + Number(crop.price).toLocaleString() + '</td>' +
                    '<td>' + crop.location + '</td>' +
                    '<td><span class="badge ' + badgeClass + '">' + statusText + '</span></td>' +
                    '<td>' + date + '</td>' +
                    '<td>' +
                        '<div class="table-actions">' +
                            '<button class="btn btn-sm btn-outline" ' +
                                'onclick="showEditForm(\'' + crop.id + '\',\'' + crop.crop_name + '\',\'' + crop.quantity + '\',\'' + crop.price + '\',\'' + crop.location + '\',\'' + crop.status + '\',\'' + desc + '\')">' +
                                '<i class="fa-solid fa-pen"></i> Edit' +
                            '</button>' +
                            '<button class="btn btn-sm btn-danger" ' +
                                'onclick="deleteCrop(\'' + crop.id + '\',\'' + crop.crop_name + '\')">' +
                                '<i class="fa-solid fa-trash"></i> Delete' +
                            '</button>' +
                        '</div>' +
                    '</td>' +
                '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading crops. Please refresh.</p></div>';
    }
}

// DELETE
async function deleteCrop(cropId, cropName) {
    if (!confirm('Are you sure you want to delete "' + cropName + '"?')) {
        return;
    }

    var formData = new FormData();
    formData.append('crop_id', cropId);

    try {
        var response = await fetch('../api/crops/crop_delete.php', { method: 'POST', body: formData });
        var text     = (await response.text()).trim();

        if (text === 'success') {
            loadCrops();
            loadOverview();
        } else {
            alert('Could not delete crop. Please try again.');
        }

    } catch (err) {
        alert('Network error. Please check connection.');
    }
}

// OVERVIEW - Update stats + Recent Crops card
async function loadOverview() {
    try {
        var response = await fetch('../api/crops/crop_read.php');
        var text     = await response.text();

        if (text.trim() === 'unauthorized') {
            return;
        }

        var crops     = JSON.parse(text);
        var total     = crops.length;
        var available = crops.filter(function (c) { return c.status === 'available'; }).length;

        // Update stat numbers - select by ID for accuracy
        var allStatNums = document.querySelectorAll('#section-overview .stat-num');
        if (allStatNums[0]) allStatNums[0].textContent = total;
        if (allStatNums[1]) allStatNums[1].textContent = available;

        // Update Recent Crops card body
        var recentCard = document.querySelector('#section-overview .form-row-2 .card:first-child .card-body');
        if (!recentCard) {
            return;
        }

        if (crops.length === 0) {
            recentCard.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-wheat-awn"></i>' +
                    '<p>No crops listed yet</p>' +
                    '<button class="btn btn-primary btn-sm" onclick="showSection(\'section-crops\', null); showAddForm();">Add First Crop</button>' +
                '</div>';
            return;
        }

        // Show latest 3 crops
        var recent = crops.slice(0, 3);
        var html   = '';

        recent.forEach(function (crop) {
            var badgeClass = crop.status === 'available' ? 'badge-green' : 'badge-red';
            var statusText = crop.status === 'available' ? 'Available' : 'Sold';

            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;' +
                             'padding:10px 0;border-bottom:1px solid var(--border);">' +
                    '<div>' +
                        '<strong style="font-size:0.88rem;color:var(--green-dark);">' + crop.crop_name + '</strong>' +
                        '<p style="font-size:0.78rem;color:var(--text-light);">' + crop.location + ' — ' + crop.quantity + ' kg</p>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<span style="font-size:0.82rem;font-weight:600;color:var(--green-dark);">Rs. ' + Number(crop.price).toLocaleString() + '</span>' +
                        '<span class="badge ' + badgeClass + '">' + statusText + '</span>' +
                    '</div>' +
                '</div>';
        });

        recentCard.innerHTML = html;

    } catch (err) {
        console.log('Overview load error:', err);
    }
}

// READ - Load all available delivery routes
async function loadDeliveryRoutes() {
    var container       = document.getElementById('delivery-routes-container');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading delivery routes...</p></div>';

    try {
        var response = await fetch('../api/routes/route_read_all.php');
        var text     = await response.text();

        if (text.trim() === 'unauthorized') {
            container.innerHTML = '<div class="empty-state"><p>Session expired. Please login again.</p></div>';
            return;
        }

        var routes = JSON.parse(text);

        if (routes.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-truck"></i>' +
                    '<p>No delivery routes available right now.</p>' +
                '</div>';
            return;
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:4px;">';

        routes.forEach(function (route) {
            html +=
                '<div class="card" style="margin-bottom:0;">' +
                    '<div class="card-body">' +
                        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
                            '<h4 style="font-size:0.95rem;color:var(--green-dark);">' +
                                '<i class="fa-solid fa-truck" style="margin-right:6px;"></i>' +
                                route.vehicle_type.replace(/_/g, ' ') +
                            '</h4>' +
                            '<span class="badge badge-green">' + route.status + '</span>' +
                        '</div>' +
                        '<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-user" style="color:var(--green-main);width:16px;"></i> <strong>Driver:</strong> ' + route.driver_name + '</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-location-dot" style="color:var(--green-main);width:16px;"></i> <strong>From:</strong> ' + route.pickup_area + '</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-location-dot" style="color:var(--green-main);width:16px;"></i> <strong>To:</strong> ' + route.drop_area + '</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-box" style="color:var(--green-main);width:16px;"></i> <strong>Cargo:</strong> ' + route.cargo_type + '</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-weight-hanging" style="color:var(--green-main);width:16px;"></i> <strong>Capacity:</strong> ' + route.capacity_kg + ' kg</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-tag" style="color:var(--green-main);width:16px;"></i> <strong>Price:</strong> Rs. ' + Number(route.price_per_trip).toLocaleString() + ' / trip</p>' +
                            '<p style="font-size:0.83rem;"><i class="fa-solid fa-phone" style="color:var(--green-main);width:16px;"></i> <strong>Contact:</strong> ' + route.contact + '</p>' +
                        '</div>' +
                        '<a href="tel:' + route.contact + '" class="btn btn-primary" style="width:100%;">' +
                            '<i class="fa-solid fa-phone"></i> Contact Driver' +
                        '</a>' +
                    '</div>' +
                '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading routes. Please refresh.</p></div>';
    }
}