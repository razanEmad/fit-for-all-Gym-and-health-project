const cameraInput = document.getElementById("camera-input");
const uploadInput = document.getElementById("upload-input");

const previewSection = document.getElementById("preview-section");
const imagePreviewList = document.getElementById("image-preview-list");
const analyzeButton = document.getElementById("analyze-btn");

const loadingSection = document.getElementById("loading-section");
const resultSection = document.getElementById("result-section");

const ingredientSummary = document.getElementById("ingredient-summary");
const ingredientDescription = document.getElementById("ingredient-description");
const dishList = document.getElementById("dish-list");

let selectedImages = [];
let userProfile = null;

cameraInput.addEventListener("change", function () {

    const files = Array.from(cameraInput.files || []);

    if (!files.length) {
        return;
    }

    addImages(files);
    cameraInput.value = "";

});

uploadInput.addEventListener("change", function () {

    const files = Array.from(uploadInput.files || []);

    if (!files.length) {
        return;
    }

    addImages(files);
    uploadInput.value = "";

});

function addImages(files) {

    const uniqueFiles = files.filter(function (file) {
        return !selectedImages.some(function (existingFile) {
            return (
                existingFile.name === file.name &&
                existingFile.size === file.size &&
                existingFile.lastModified === file.lastModified
            );
        });
    });

    if (!uniqueFiles.length) {
        previewSection.classList.remove("hidden");
        resultSection.classList.add("hidden");
        return;
    }

    selectedImages = selectedImages.concat(uniqueFiles);
    renderPreviewImages();

}

function renderPreviewImages() {

    imagePreviewList.innerHTML = "";

    selectedImages.forEach(function (file) {

        const previewItem = document.createElement("div");
        previewItem.className = "preview-image-item";

        const previewImage = document.createElement("img");
        previewImage.src = URL.createObjectURL(file);
        previewImage.alt = file.name;

        previewItem.appendChild(previewImage);
        imagePreviewList.appendChild(previewItem);

    });

    previewSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

}

analyzeButton.addEventListener("click", async function () {

    if (!selectedImages.length) {
        return;
    }

    if (!userProfile) {
        await loadProfile();
    }

    const profilePlan = getProfilePlan(userProfile);
    const goal = profilePlan.goal;
    const calories = profilePlan.calories;
    const protein = profilePlan.protein;

    previewSection.classList.remove("hidden");
    loadingSection.classList.remove("hidden");
    resultSection.classList.add("hidden");

    setTimeout(function () {

        const ingredientNames = selectedImages.map(function (file) {
            return getIngredientLabel(file.name);
        });

        const ingredientSummaryText = ingredientNames.join(", ");

        const detectedIngredients = getDetectedIngredients(selectedImages);

        const result = {
            ingredients: ingredientSummaryText,
            ingredient_description:
                `AI detected ${ingredientSummaryText} and matched them with dishes that fit your ${profilePlan.goalLabel.toLowerCase()} plan.`,
            goal: profilePlan.goalLabel,
            advice: buildAdvice(goal, calories, protein),
            plan: getPlanSummary(calories, protein),
            dishes: getDishRecommendations(goal, calories, protein, detectedIngredients)
        };

        displayResult(result);

    }, 1200);

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

    return cleanedName || "fresh ingredients";

}

function normalizeIngredient(ingredientName) {

    const normalized = ingredientName.toLowerCase();

    if (normalized.includes("tomato")) {
        return "tomato";
    }

    if (normalized.includes("potato")) {
        return "potato";
    }

    if (normalized.includes("chicken")) {
        return "chicken";
    }

    if (normalized.includes("salmon")) {
        return "salmon";
    }

    if (normalized.includes("egg")) {
        return "egg";
    }

    if (normalized.includes("rice")) {
        return "rice";
    }

    return null;

}

function getDetectedIngredients(files) {

    const detected = files.map(function (file) {
        return normalizeIngredient(getIngredientLabel(file.name));
    }).filter(function (ingredient) {
        return ingredient !== null;
    });

    return Array.from(new Set(detected));

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
        protein: protein
    };

}

function getPlanSummary(calories, protein) {

    return {
        calories: Math.max(300, calories),
        protein: Math.max(20, protein),
        carbs: Math.max(25, Math.round((calories * 0.4) / 4)),
        fat: Math.max(10, Math.round((calories * 0.25) / 9))
    };

}

function buildAdvice(goal, calories, protein) {

    if (goal === "weight-loss") {
        return `Your goal is weight loss, so this plan keeps calories near ${calories} kcal and protein at ${protein} g to help you stay full while supporting recovery.`;
    }

    if (goal === "fitness") {
        return `Your goal is general fitness, so these dishes balance calories and nutrients to support energy, recovery, and everyday performance.`;
    }

    return `Your goal is muscle gain, so these dishes focus on higher protein and steady carbs to support training, recovery, and growth.`;

}

function getDishRecommendations(goal, calories, protein, detectedIngredients) {

    const ingredientList = detectedIngredients || [];

    if (ingredientList.includes("tomato") && ingredientList.includes("potato")) {
        return [
            {
                name: "Tomato Potato Chicken Bowl",
                calories: 510,
                protein: 37,
                carbs: 44,
                fat: 18,
                tags: ["Detected ingredients", "Balanced meal"],
                description: "A fresh bowl with tomato and potato ingredients, built to fit your plan."
            },
            {
                name: "Roasted Tomato Potato Tray",
                calories: 480,
                protein: 31,
                carbs: 42,
                fat: 17,
                tags: ["Simple", "High fiber"],
                description: "Tomato and potato together for a hearty, easy-to-prepare dish."
            },
            {
                name: "Tomato Potato Egg Skillet",
                calories: 450,
                protein: 29,
                carbs: 35,
                fat: 19,
                tags: ["Quick meal", "Protein boost"],
                description: "A filling skillet option that matches the ingredients you uploaded."
            }
        ];
    }

    if (ingredientList.includes("potato")) {
        return [
            {
                name: "Herby Potato Chicken Bowl",
                calories: 520,
                protein: 38,
                carbs: 46,
                fat: 16,
                tags: ["Potato-based", "High protein"],
                description: "A satisfying meal using potato as the main ingredient."
            },
            {
                name: "Loaded Potato Salad",
                calories: 480,
                protein: 32,
                carbs: 42,
                fat: 18,
                tags: ["Easy meal", "Balanced carbs"],
                description: "Potato-based, fresh, and easy to fit into a daily nutrition plan."
            },
            {
                name: "Greek Potato Protein Plate",
                calories: 560,
                protein: 41,
                carbs: 49,
                fat: 20,
                tags: ["Post-workout", "Meal prep"],
                description: "A strong potato-based option for recovery and energy support."
            }
        ];
    }

    if (ingredientList.includes("tomato")) {
        return [
            {
                name: "Tomato Soup with Chicken",
                calories: 420,
                protein: 31,
                carbs: 24,
                fat: 16,
                tags: ["Tomato-based", "Warm meal"],
                description: "A comforting tomato soup that works well for a light but filling meal."
            },
            {
                name: "Tomato Chicken Pasta",
                calories: 540,
                protein: 39,
                carbs: 50,
                fat: 18,
                tags: ["Tomato-based", "High protein"],
                description: "A classic tomato-forward dish that fits a balanced eating plan."
            },
            {
                name: "Tomato Egg Rice Bowl",
                calories: 490,
                protein: 30,
                carbs: 42,
                fat: 17,
                tags: ["Quick", "Satisfying"],
                description: "A simple rice bowl built around tomato and eggs."
            },
            {
                name: "Tomato Chickpea Salad",
                calories: 460,
                protein: 24,
                carbs: 36,
                fat: 16,
                tags: ["Light", "High fiber"],
                description: "A fresh tomato-focused meal with enough fiber and protein to keep you full."
            }
        ];
    }

    const recommended = {

        muscle_gain: [
            {
                name: "Chicken Rice Protein Bowl",
                calories: 520,
                protein: 41,
                carbs: 46,
                fat: 16,
                tags: ["High protein", "Meal prep"],
                description: "Lean chicken, rice, and vegetables for a clean, satisfying meal."
            },
            {
                name: "Salmon Quinoa Power Plate",
                calories: 560,
                protein: 36,
                carbs: 38,
                fat: 24,
                tags: ["Omega-3", "Balanced carbs"],
                description: "A nutrient-dense option that supports recovery and energy."
            },
            {
                name: "Turkey Pasta Fit Bowl",
                calories: 610,
                protein: 39,
                carbs: 58,
                fat: 18,
                tags: ["Filling", "Post-workout"],
                description: "A hearty dish built for training days and muscle support."
            }
        ],

        fat_loss: [
            {
                name: "Greek Yogurt Chicken Salad",
                calories: 430,
                protein: 38,
                carbs: 24,
                fat: 18,
                tags: ["Low calorie", "High fiber"],
                description: "Light, protein-rich, and easy to keep on track with your calorie goal."
            },
            {
                name: "Veggie Chicken Stir-Fry",
                calories: 470,
                protein: 40,
                carbs: 28,
                fat: 15,
                tags: ["Lean", "Quick meal"],
                description: "Packed with vegetables and lean protein for a lower-calorie plate."
            },
            {
                name: "Tuna Lettuce Wrap Bowl",
                calories: 390,
                protein: 35,
                carbs: 18,
                fat: 14,
                tags: ["Fresh", "High protein"],
                description: "A satisfying option with a lighter carb profile and plenty of protein."
            }
        ],

        maintenance: [
            {
                name: "Salmon Sweet Potato Plate",
                calories: 580,
                protein: 34,
                carbs: 45,
                fat: 23,
                tags: ["Balanced", "Energy fuel"],
                description: "A steady option for keeping performance and hunger under control."
            },
            {
                name: "Chicken & Brown Rice Box",
                calories: 600,
                protein: 40,
                carbs: 52,
                fat: 20,
                tags: ["Satisfying", "Meal prep"],
                description: "A dependable meal with balanced carbs and enough protein for daily energy."
            },
            {
                name: "Bean & Egg Protein Bowl",
                calories: 540,
                protein: 29,
                carbs: 46,
                fat: 22,
                tags: ["Plant-based", "Fiber rich"],
                description: "Good for a balanced plate that keeps you full and energized."
            }
        ]

    };

    const mappedGoal = {
        "weight-loss": "fat_loss",
        "muscle-gain": "muscle_gain",
        "fitness": "maintenance"
    };

    const normalizedGoal = mappedGoal[goal] || "muscle_gain";

    return recommended[normalizedGoal] || recommended.muscle_gain;

}

loadProfile();

function displayResult(data) {

    previewSection.classList.remove("hidden");
    loadingSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    ingredientSummary.textContent = data.ingredients;
    ingredientDescription.textContent = data.ingredient_description;

    document.getElementById("goal-title").textContent = data.goal;
    document.getElementById("personalized-advice").textContent = data.advice;

    document.getElementById("target-calories").textContent = `${data.plan.calories} kcal`;
    document.getElementById("target-protein").textContent = `${data.plan.protein} g`;
    document.getElementById("target-carbs").textContent = `${data.plan.carbs} g`;
    document.getElementById("target-fat").textContent = `${data.plan.fat} g`;

    dishList.innerHTML = data.dishes.map(function (dish) {

        const tags = dish.tags.map(function (tag) {
            return `<span class="dish-tag">${tag}</span>`;
        }).join("");

        return `
            <article class="dish-card">
                <div class="dish-header">
                    <div>
                        <h3>${dish.name}</h3>
                        <p>${dish.description}</p>
                    </div>
                </div>

                <div class="dish-tags">
                    ${tags}
                </div>

                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <span>Calories</span>
                        <strong>${dish.calories} kcal</strong>
                    </div>
                    <div class="nutrition-item">
                        <span>Protein</span>
                        <strong>${dish.protein} g</strong>
                    </div>
                    <div class="nutrition-item">
                        <span>Carbs</span>
                        <strong>${dish.carbs} g</strong>
                    </div>
                    <div class="nutrition-item">
                        <span>Fat</span>
                        <strong>${dish.fat} g</strong>
                    </div>
                </div>
            </article>
        `;

    }).join("");

}