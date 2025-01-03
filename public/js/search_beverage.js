document.getElementById("searchInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchbeverage();
    }
});

var currentResults = []; // Global array to store current search results

function searchbeverage() {
    const searchTerm = document.getElementById("searchInput").value.trim();

    if (searchTerm === "") {
        document.getElementById("resultsContainer").innerHTML = '';
        document.getElementById("popularSearches").style.display = "block"; // Ensure visibility
        return;
    }

    document.getElementById("popularSearches").style.display = "none"; // Hide popular searches

    var request = new XMLHttpRequest();
    request.open("GET", "/search-beverage?name=" + encodeURIComponent(searchTerm), true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        try {
            const response = JSON.parse(request.responseText); // Safeguard JSON parsing
            if (response.length === 0) {
                document.getElementById("resultsContainer").innerHTML = "<p>No beverages found!</p>";
            } else {
                displaySearchResults(response);
            }
        } catch (error) {
            document.getElementById("resultsContainer").innerHTML = "<p>Error parsing server response.</p>";
        }
    };

    request.onerror = function () {
        document.getElementById("resultsContainer").innerHTML = "<p>Error occurred. Please try again.</p>";
    };

    request.send();
}

function displaySearchResults(beverages) {
    currentResults = beverages;

    var resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = '';

    beverages.forEach(function (beverage) {
        var beverageDiv = document.createElement("div");
        beverageDiv.classList.add("beverage-item");

        beverageDiv.innerHTML = `
            <h3>${beverage.name}</h3>
            <img src="${beverage.image}" alt="${beverage.name}" class="beverage-image" />
            <p><strong>Category:</strong> ${beverage.category}</p>
            <p><strong>Description:</strong> ${beverage.description || 'No description available'}</p>
            <p><strong>Price:</strong> $${beverage.price}</p>
            <p><strong>Rating:</strong> ${beverage.rating || 'Not rated'}</p>
            <p><strong>Quantity:</strong> ${beverage.quantity}</p>
        `;

        resultsContainer.appendChild(beverageDiv);
    });
}

function sortResultsByPrice() {
    var sortOption = document.getElementById("sortDropdown").value;

    if (sortOption === "low-to-high") {
        currentResults.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-to-low") {
        currentResults.sort((a, b) => b.price - a.price);
    }

    displaySearchResults(currentResults);
}

function setSearchQuery(keyword) {
    document.getElementById("searchInput").value = keyword; // Set the keyword in the search input
    searchbeverage(); // Call the search function to display results
}

document.querySelector(".back-button").addEventListener("click", function () {
    window.history.back();
});
