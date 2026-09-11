const coachGrid = document.getElementById("coach-grid");
const filterButtons = document.querySelectorAll(".coach-filter");
const priceFilter = document.getElementById("price-filter");

let currentGender = "All Coaches";
let currentPrice = "all";

function applyCoachFilters() {
    if (!coachGrid) {
        return;
    }

    const cards = coachGrid.querySelectorAll(".coach-card");

    cards.forEach(function (card) {
        const gender = card.dataset.gender;
        const price = Number(card.dataset.price || 0);

        let matchesGender = true;
        let matchesPrice = true;

        if (currentGender === "Female Coaches") {
            matchesGender = gender === "female";
        } else if (currentGender === "Male Coaches") {
            matchesGender = gender === "male";
        }

        if (currentPrice === "under-30") {
            matchesPrice = price < 30;
        } else if (currentPrice === "30-34") {
            matchesPrice = price >= 30 && price <= 34;
        } else if (currentPrice === "35-plus") {
            matchesPrice = price >= 35;
        }

        card.style.display = matchesGender && matchesPrice ? "flex" : "none";
    });
}

if (coachGrid) {
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            currentGender = button.textContent.trim();

            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });

            applyCoachFilters();
        });
    });

    if (priceFilter) {
        priceFilter.addEventListener("change", function () {
            currentPrice = priceFilter.value;
            applyCoachFilters();
        });
    }
}
