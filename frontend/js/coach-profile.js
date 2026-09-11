const coachProfile = {
    amina: {
        name: "Amina Rahman",
        role: "Nutrition Coach",
        gender: "female",
        tags: ["Weight Loss", "Meal Plans", "Healthy Habits"],
        rating: "4.9",
        clients: "1.2k",
        price: "$29/mo",
        avatar: "A",
        avatarClass: "blue",
        bio: "Amina helps clients build simple, realistic nutrition routines that support fat loss, better energy, and long-term consistency. She focuses on meal structure, habit tracking, and sustainable progress.",
        services: [
            { title: "Weekly meal review", text: "Get personalized guidance on your meals and portions every week." },
            { title: "Goal tracking", text: "Stay accountable with progress check-ins and routine adjustments." },
            { title: "Nutrition support", text: "Build a practical eating plan around your life and fitness goals." }
        ]
    },
    mohamed: {
        name: "Mohamed Ali",
        role: "Strength Coach",
        gender: "male",
        tags: ["Muscle Gain", "Gym Plans", "Strength"],
        rating: "4.8",
        clients: "980",
        price: "$34/mo",
        avatar: "M",
        avatarClass: "tan",
        bio: "Mohamed helps clients grow stronger with smart training progression, recovery planning, and workout consistency. His programs are ideal for people who want visible progress in the gym.",
        services: [
            { title: "Strength program", text: "Structured gym routines with progressive overload and recovery support." },
            { title: "Workout adjustments", text: "Receive modifications as your strength and performance improve." },
            { title: "Performance coaching", text: "Stay focused on results with clear weekly training goals." }
        ]
    },
    sara: {
        name: "Sara Lewis",
        role: "Fitness Coach",
        gender: "female",
        tags: ["General Fitness", "Home Workouts", "Consistency"],
        rating: "4.9",
        clients: "1.6k",
        price: "$26/mo",
        avatar: "S",
        avatarClass: "purple",
        bio: "Sara creates enjoyable and balanced fitness routines for clients who want steady progress without burnout. Her coaching works especially well for beginners and busy lifestyles.",
        services: [
            { title: "Home routine", text: "Simple, effective workouts you can do without a gym membership." },
            { title: "Lifestyle guidance", text: "Practical coaching for movement, sleep, and consistency." },
            { title: "Motivation check-ins", text: "Regular encouragement and accountability to keep momentum high." }
        ]
    },
    daniel: {
        name: "Daniel Reed",
        role: "Performance Coach",
        gender: "male",
        tags: ["Recovery", "Athletic Performance", "Mobility"],
        rating: "4.7",
        clients: "760",
        price: "$39/mo",
        avatar: "D",
        avatarClass: "green",
        bio: "Daniel specializes in performance optimization, mobility, and recovery. His coaching is designed for active clients who want to move better, recover faster, and perform at a higher level.",
        services: [
            { title: "Mobility support", text: "Improve flexibility, movement quality, and recovery between sessions." },
            { title: "Training structure", text: "Detailed weekly programming that matches your training demands." },
            { title: "Performance review", text: "Regular check-ins to improve endurance, speed, and resilience." }
        ]
    }
};

const params = new URLSearchParams(window.location.search);
const coachKey = params.get("coach");

const coach = coachProfile[coachKey] || coachProfile.amina;

const avatar = document.getElementById("coach-avatar");
const nameEl = document.getElementById("coach-name");
const roleEl = document.getElementById("coach-role");
const tagsEl = document.getElementById("coach-tags");
const ratingEl = document.getElementById("coach-rating");
const clientsEl = document.getElementById("coach-clients");
const priceEl = document.getElementById("coach-price");
const bioEl = document.getElementById("coach-bio");
const subscribeBtn = document.getElementById("subscribe-btn");

if (avatar) {
    avatar.textContent = coach.avatar;
    avatar.classList.add(coach.avatarClass);
}

if (nameEl) {
    nameEl.textContent = coach.name;
}

if (roleEl) {
    roleEl.textContent = coach.role;
}

if (tagsEl) {
    tagsEl.innerHTML = coach.tags.map(function (tag) {
        return `<span class="coach-tag">${tag}</span>`;
    }).join("");
}

if (ratingEl) {
    ratingEl.textContent = coach.rating;
}

if (clientsEl) {
    clientsEl.textContent = coach.clients;
}

if (priceEl) {
    priceEl.textContent = coach.price;
}

if (bioEl) {
    bioEl.textContent = coach.bio;
}

if (subscribeBtn) {
    subscribeBtn.addEventListener("click", function () {
        alert(`You have subscribed to ${coach.name} (${coach.role}).`);
    });
}
