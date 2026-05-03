// buyer-dashboard.js - Buyer Dashboard

// Load everything when page opens
window.addEventListener('load', function () {
    fetch('../api/auth/check_auth.php')
        .then(function (r) { return r.text(); })
        .then(function (result) {
            if (result.trim() === 'unauthorized') {
                window.location.href = '../pages/login.html';
                return;
            }
            loadOverviewCrops();
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

    // Reload when switching sections
    if (sectionId === 'section-browse') {
        loadCrops();
    }

    if (sectionId === 'section-overview') {
        loadOverviewCrops();
    }

    if (sectionId === 'section-deliveries') {
    loadDeliveryRoutes();
    }
}

// ── Fetch all available crops from API ──
async function fetchCrops() {
    var response = await fetch('../api/crops/crop_read_all.php');
    var text     = await response.text();

    if (text.trim() === 'unauthorized') {
        return null;
    }

    return JSON.parse(text);
}

// READ - Load crops in Browse section
async function loadCrops() {
    var container       = document.getElementById('browse-crops-container');
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading available crops...</p></div>';

    try {
        var crops = await fetchCrops();

        if (crops === null) {
            container.innerHTML = '<div class="empty-state"><p>Session expired. Please login again.</p></div>';
            return;
        }

        // Apply filters
        var filterCrop     = document.getElementById('filter-crop').value;
        var filterLocation = document.getElementById('filter-location').value.toLowerCase();
        var filterSort     = document.getElementById('filter-sort').value;

        if (filterCrop) {
            crops = crops.filter(function (c) {
                return c.crop_name === filterCrop;
            });
        }

        if (filterLocation) {
            crops = crops.filter(function (c) {
                return c.location.toLowerCase().includes(filterLocation);
            });
        }

        if (filterSort === 'price_low') {
            crops.sort(function (a, b) { return a.price - b.price; });
        } else if (filterSort === 'price_high') {
            crops.sort(function (a, b) { return b.price - a.price; });
        }

        // Update available crops stat
        document.getElementById('stat-crops').textContent = crops.length;

        if (crops.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-wheat-awn"></i>' +
                    '<p>No crops available right now. Please check back later.</p>' +
                '</div>';
            return;
        }

        // Build crop cards grid
        var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;padding:4px;">';

        crops.forEach(function (crop) {
            var date = new Date(crop.created_at).toLocaleDateString('en-PK');

            html +=
                '<div class="card" style="margin-bottom:0;">' +
                    '<div class="card-body">' +
                        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
                            '<h4 style="font-size:1rem;color:var(--green-dark);">' + crop.crop_name + '</h4>' +
                            '<span class="badge badge-green">Available</span>' +
                        '</div>' +
                        '<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">' +
                            '<p style="font-size:0.83rem;">' +
                                '<i class="fa-solid fa-user" style="color:var(--green-main);width:16px;"></i> ' +
                                '<strong>Farmer:</strong> ' + crop.farmer_name +
                            '</p>' +
                            '<p style="font-size:0.83rem;">' +
                                '<i class="fa-solid fa-scale-balanced" style="color:var(--green-main);width:16px;"></i> ' +
                                '<strong>Quantity:</strong> ' + crop.quantity + ' kg' +
                            '</p>' +
                            '<p style="font-size:0.83rem;">' +
                                '<i class="fa-solid fa-tag" style="color:var(--green-main);width:16px;"></i> ' +
                                '<strong>Price:</strong> Rs. ' + Number(crop.price).toLocaleString() + ' / 40kg' +
                            '</p>' +
                            '<p style="font-size:0.83rem;">' +
                                '<i class="fa-solid fa-location-dot" style="color:var(--green-main);width:16px;"></i> ' +
                                '<strong>Location:</strong> ' + crop.location +
                            '</p>' +
                            '<p style="font-size:0.83rem;">' +
                                '<i class="fa-solid fa-calendar" style="color:var(--green-main);width:16px;"></i> ' +
                                '<strong>Listed:</strong> ' + date +
                            '</p>' +
                        '</div>' +
                        '<button class="btn btn-primary" style="width:100%;" ' +
                            'onclick="sendOffer(\'' + crop.id + '\',\'' + crop.crop_name + '\',\'' + crop.price + '\')">' +
                            '<i class="fa-solid fa-handshake"></i> Send Offer' +
                        '</button>' +
                    '</div>' +
                '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading crops. Please refresh.</p></div>';
    }
}

// READ - Load 3 latest crops for overview card
async function loadOverviewCrops() {
    var container = document.getElementById('overview-crops');

    try {
        var crops = await fetchCrops();

        if (crops === null) {
            container.innerHTML = '<div class="empty-state"><p>Session expired.</p></div>';
            return;
        }

        // Update stat
        document.getElementById('stat-crops').textContent = crops.length;

        if (crops.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-wheat-awn"></i>' +
                    '<p>No crops available yet.</p>' +
                    '<button class="btn btn-primary btn-sm" onclick="showSection(\'section-browse\', null)">Browse Crops</button>' +
                '</div>';
            return;
        }

        // Show latest 3 only
        var recent = crops.slice(0, 3);
        var html   = '';

        recent.forEach(function (crop) {
            html +=
                '<div style="display:flex;justify-content:space-between;align-items:center;' +
                             'padding:10px 0;border-bottom:1px solid var(--border);">' +
                    '<div>' +
                        '<strong style="font-size:0.88rem;color:var(--green-dark);">' + crop.crop_name + '</strong>' +
                        '<p style="font-size:0.78rem;color:var(--text-light);">' +
                            crop.farmer_name + ' — ' + crop.location +
                        '</p>' +
                    '</div>' +
                    '<span style="font-size:0.82rem;font-weight:600;color:var(--green-dark);">' +
                        'Rs. ' + Number(crop.price).toLocaleString() +
                    '</span>' +
                '</div>';
        });

        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = '<div class="empty-state"><p>Error loading.</p></div>';
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
// Send offer to farmer
function sendOffer(cropId, cropName, price) {
    alert('Offer feature coming soon!\nCrop: ' + cropName + '\nPrice: Rs. ' + Number(price).toLocaleString() + ' / 40kg');
}

