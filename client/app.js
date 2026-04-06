const API_ORIGIN = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:5000';
const API_URL = `${API_ORIGIN}/api`;

// 1. Fetch and Display Posters on the Home Page
async function loadPosters() {
    try {
        const response = await fetch(`${API_URL}/posters`);
        const posters = await response.json();
        const grid = document.getElementById('poster-grid');
        
        grid.innerHTML = posters.map(poster => `
            <div class="bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-transform border border-gray-700 shadow-2xl">
                <img src="${poster.image_url}" alt="${poster.title}" class="w-full h-80 object-cover">
                <div class="p-4">
                    <span class="text-xs text-indigo-400 font-bold uppercase">${poster.category}</span>
                    <h3 class="text-xl font-semibold mt-1">${poster.title}</h3>
                    <div class="flex justify-between items-center mt-4">
                        <p class="text-2xl font-bold">$${poster.price}</p>
                        <button class="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-indigo-500 hover:text-white transition">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load posters:", err);
    }
}

// Run on page load
if(document.getElementById('poster-grid')) loadPosters();