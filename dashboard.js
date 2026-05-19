// Dashboard Dummy Charts using Chart.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Profit Chart
    const profitCtx = document.getElementById('profitChart');
    if (profitCtx) {
        new Chart(profitCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Profit (PKR)',
                    data: [120000, 190000, 150000, 250000, 220000, 300000],
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Water Usage Chart
    const waterCtx = document.getElementById('waterChart');
    if (waterCtx) {
        new Chart(waterCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Water Usage (Liters)',
                    data: [4500, 3200, 5100, 2800],
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Crop Distribution Chart
    const cropCtx = document.getElementById('cropChart');
    if (cropCtx) {
        new Chart(cropCtx, {
            type: 'doughnut',
            data: {
                labels: ['Wheat', 'Cotton', 'Sugarcane', 'Maize'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#f97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                cutout: '70%'
            }
        });
    }

});

// Sidebar Toggle Functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    sidebar.classList.toggle('-translate-x-full');
    // For desktop, toggle margin
    if (window.innerWidth >= 1024) {
        if (sidebar.classList.contains('-translate-x-full')) {
            mainContent.classList.remove('lg:ml-64');
        } else {
            mainContent.classList.add('lg:ml-64');
        }
    }
}
