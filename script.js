// Smooth Scroll to Section
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Booking Form Event
document.querySelector('.booking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert("🎯 Slot booked successfully!");
    this.reset();
});

// Event Registration Form Submission
document.querySelector('.event-register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert("✅ You have successfully registered for the event!");
    this.reset();
});

// Continuous Event Slider
const slider = document.querySelector('.event-slide');
const slideContent = slider.innerHTML;

// Duplicate content to create infinite loop
slider.innerHTML += slideContent;

// Optional: Pause slider on hover
slider.parentElement.addEventListener('mouseenter', () => {
    slider.style.animationPlayState = 'paused';
});
slider.parentElement.addEventListener('mouseleave', () => {
    slider.style.animationPlayState = 'running';
});
