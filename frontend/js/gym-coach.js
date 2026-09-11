const cameraInput = document.getElementById("camera-input");
const uploadInput = document.getElementById("upload-input");

const previewSection = document.getElementById("preview-section");
const machinePreview = document.getElementById("machine-preview");
const analyzeButton = document.getElementById("analyze-btn");

const loadingSection = document.getElementById("loading-section");
const resultSection = document.getElementById("result-section");

const ingredientSummary = document.getElementById("ingredient-summary");
const ingredientDescription = document.getElementById("ingredient-description");
const dishList = document.getElementById("dish-list");

let selectedImage = null;
let userProfile = null;

cameraInput.addEventListener("change", function () {

    const file = cameraInput.files[0];

    if (!file) {
        return;
    }

    handleImage(file);
    cameraInput.value = "";

});

uploadInput.addEventListener("change", function () {

    const file = uploadInput.files[0];

    if (!file) {
        return;
    }

    handleImage(file);
    uploadInput.value = "";

});

function handleImage(file) {

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    machinePreview.src = imageURL;

    previewSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

}

analyzeButton.addEventListener("click", async function () {

    if (!selectedImage) {
        return;
    }

    if (!userProfile) {
        await loadProfile();
    }

    const profilePlan = getProfilePlan(userProfile);
    const meal = detectMeal(selectedImage.name);
    const analysis = analyzeMeal(meal, profilePlan);

    previewSection.classList.remove("hidden");
    loadingSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

    setTimeout(function () {

        displayResult({
            meal: meal,
            analysis: analysis,
            profilePlan: profilePlan
        });

    }, 1000);

});

async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {
        userProfile = null;
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/profile/`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("token");
            userProfile = null;
            return;
        }

        const data = await response.json();

        if (data.message === "Health profile not created yet") {
            userProfile = null;
            return;
        }

        userProfile = data;

    } catch (error) {

        console.error("Error loading profile:", error);
        userProfile = null;

    }

}

function getIngredientLabel(fileName) {

    const cleanedName = fileName
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();

    return cleanedName || "meal";

}

function detectMeal(fileName) {

    const ingredientName = getIngredientLabel(fileName).toLowerCase();

    if (ingredientName.includes("burger")) {
        return {
            key: "burger",
            label: "Burger",
            calories: 540,
            protein: 33,
            carbs: 38,
            fat: 24
        };
    }

    if (ingredientName.includes("pizza")) {
        return {
            key: "pizza",
            label: "Pizza",
            calories: 620,
            protein: 27,
            carbs: 58,
            fat: 23
        };
    }

    if (ingredientName.includes("salad")) {
        return {
            key: "salad",
            label: "Salad",
            calories: 280,
            protein: 18,
            carbs: 16,
            fat: 12
        };
    }

    if (ingredientName.includes("rice") || ingredientName.includes("bowl")) {
        return {
            key: "rice-bowl",
            label: "Rice Bowl",
            calories: 500,
            protein: 29,
            carbs: 57,
            fat: 15
        };
    }

    if (ingredientName.includes("pasta")) {
        return {
            key: "pasta",
            label: "Pasta",
            calories: 580,
            protein: 26,
            carbs: 68,
            fat: 19
        };
    }

    if (ingredientName.includes("chicken")) {
        return {
            key: "grilled-chicken",
            label: "Grilled Chicken Meal",
            calories: 420,
            protein: 42,
            carbs: 20,
            fat: 14
        };
    }

    if (ingredientName.includes("fries")) {
        return {
            key: "fries",
            label: "Fries",
            calories: 340,
            protein: 6,
            carbs: 42,
            fat: 14
        };
    }

    if (ingredientName.includes("wrap")) {
        return {
            key: "wrap",
            label: "Wrap",
            calories: 390,
            protein: 24,
            carbs: 34,
            fat: 16
        };
    }

    return {
        key: "mixed-meal",
        label: "Mixed Meal",
        calories: 430,
        protein: 24,
        carbs: 35,
        fat: 17
    };

}

function formatGoal(goal) {

    if (goal === "weight-loss") {
        return "Weight Loss";
    }

    if (goal === "fitness") {
        return "General Fitness";
    }

    return "Muscle Gain";

}

function getProfilePlan(profile) {

    const goal = profile && profile.goal ? profile.goal : "muscle-gain";
    const weight = Number(profile && profile.weight) || 70;

    let calories = 550;
    let protein = 35;

    if (goal === "weight-loss") {
        calories = Math.max(300, Math.round(weight * 25));
        protein = Math.max(25, Math.round(weight * 1.8));
    }

    if (goal === "fitness") {
        calories = Math.max(300, Math.round(weight * 30));
        protein = Math.max(25, Math.round(weight * 1.8));
    }

    if (goal === "muscle-gain") {
        calories = Math.max(300, Math.round(weight * 35));
        protein = Math.max(30, Math.round(weight * 2.2));
    }

    return {
        goal: goal,
        goalLabel: formatGoal(goal),
        calories: calories,
        protein: protein,
        carbs: Math.max(25, Math.round((calories * 0.4) / 4)),
        fat: Math.max(10, Math.round((calories * 0.25) / 9))
    };

}

function analyzeMeal(meal, profilePlan) {

    const targetCalories = profilePlan.calories;
    const targetProtein = profilePlan.protein;
    const targetCarbs = Math.max(25, Math.round((targetCalories * 0.4) / 4));

    let suitable = true;
    let status = "Suitable";
    let reason = "This meal fits your current goal and can be kept as is.";
    let portionAdvice = "Keep the current portion size, or add extra vegetables if you want more volume.";
    let replacements = ["Add a side of vegetables for extra fiber."];

    if (profilePlan.goal === "weight-loss") {

        if (meal.calories > targetCalories * 1.08) {
            suitable = false;
            status = "Needs adjustment";
            reason = "This meal is a little high for your weight-loss target.";
            portionAdvice = "Reduce the portion by about 25% and choose a lighter side.";
            replacements = [
                "Replace fries or rice with a fresh salad.",
                "Swap creamy sauces for yogurt or herbs.",
                "Choose grilled protein instead of fried protein."
            ];
        } else if (meal.protein < targetProtein * 0.7) {
            suitable = true;
            status = "Good, but add protein";
            reason = "The meal is within your calorie range, but it could use more protein.";
            portionAdvice = "Add a lean protein source such as chicken, tuna, or Greek yogurt.";
            replacements = [
                "Add grilled chicken or eggs.",
                "Replace one carb-heavy item with extra vegetables."
            ];
        }

    }

    if (profilePlan.goal === "fitness") {

        if (meal.calories > targetCalories * 1.18) {
            suitable = false;
            status = "Too heavy";
            reason = "This meal is larger than your usual fitness target.";
            portionAdvice = "Lower the portion slightly and keep the balance of carbs and protein steady.";
            replacements = [
                "Use half the starch portion.",
                "Add more vegetables and lean protein."
            ];
        } else if (meal.protein < targetProtein * 0.65) {
            suitable = true;
            status = "Good, but add protein";
            reason = "The meal fits your calories, but it would benefit from more protein.";
            portionAdvice = "Add an extra protein portion to better support exercise recovery.";
            replacements = [
                "Add chicken, eggs, or yogurt.",
                "Choose a whole-grain side instead of a refined carb."
            ];
        }

    }

    if (profilePlan.goal === "muscle-gain") {

        if (meal.calories < targetCalories * 0.85) {
            suitable = false;
            status = "Too light";
            reason = "This meal is smaller than your muscle-gain target.";
            portionAdvice = "Increase the portion slightly and add one energy-dense side.";
            replacements = [
                "Add rice, potatoes, or whole-grain bread.",
                "Increase the protein portion if the meal is too light."
            ];
        } else if (meal.protein < targetProtein * 0.8) {
            suitable = true;
            status = "Good, but boost protein";
            reason = "The meal provides enough energy, but you may want a little more protein.";
            portionAdvice = "Add a little more lean protein to make it stronger for recovery and growth.";
            replacements = [
                "Add chicken, fish, beans, or Greek yogurt.",
                "Keep starch moderate and add vegetables."
            ];
        }

    }

    const macroSummary = {
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
    };

    return {
        suitable: suitable,
        status: status,
        reason: reason,
        portionAdvice: portionAdvice,
        replacements: replacements,
        targetCalories: targetCalories,
        targetProtein: targetProtein,
        targetCarbs: targetCarbs,
        macroSummary: macroSummary
    };

}

loadProfile();

function displayResult(data) {

    previewSection.classList.remove("hidden");
    loadingSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    ingredientSummary.textContent = data.meal.label;
    ingredientDescription.textContent = `${data.meal.label} was detected from your uploaded meal photo. ${data.analysis.reason}`;

    document.getElementById("goal-title").textContent = data.profilePlan.goalLabel;
    document.getElementById("personalized-advice").textContent = data.analysis.portionAdvice;

    document.getElementById("target-calories").textContent = `${data.profilePlan.calories} kcal`;
    document.getElementById("target-protein").textContent = `${data.profilePlan.protein} g`;
    document.getElementById("target-carbs").textContent = `${data.profilePlan.carbs} g`;
    document.getElementById("target-fat").textContent = `${data.profilePlan.fat} g`;

    const replacementItems = data.analysis.replacements.map(function (item) {
        return `<li>${item}</li>`;
    }).join("");

    dishList.innerHTML = `
        <article class="dish-card">
            <div class="dish-header">
                <div>
                    <h3>${data.analysis.status}</h3>
                    <p>${data.analysis.reason}</p>
                </div>
            </div>

            <div class="nutrition-grid">
                <div class="nutrition-item">
                    <span>Calories</span>
                    <strong>${data.analysis.macroSummary.calories} kcal</strong>
                </div>
                <div class="nutrition-item">
                    <span>Protein</span>
                    <strong>${data.analysis.macroSummary.protein} g</strong>
                </div>
                <div class="nutrition-item">
                    <span>Carbs</span>
                    <strong>${data.analysis.macroSummary.carbs} g</strong>
                </div>
                <div class="nutrition-item">
                    <span>Fat</span>
                    <strong>${data.analysis.macroSummary.fat} g</strong>
                </div>
            </div>
        </article>

        <article class="dish-card">
            <div class="dish-header">
                <div>
                    <h3>Portion Advice</h3>
                    <p>${data.analysis.portionAdvice}</p>
                </div>
            </div>
        </article>

        <article class="dish-card">
            <div class="dish-header">
                <div>
                    <h3>Better replacements</h3>
                    <ul class="replacement-list">
                        ${replacementItems}
                    </ul>
                </div>
            </div>
        </article>
    `;

}
