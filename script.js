document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

  // Header scroll effect
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  // Animate skill bars on scroll
  const skillBars = document.querySelectorAll(".skill-progress");

  function animateSkillBars() {
    skillBars.forEach((bar) => {
      const width = bar.getAttribute("data-width");
      if (isElementInViewport(bar)) {
        bar.style.width = width;
      }
    });
  }

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }

  // Initialize skill bars
  skillBars.forEach((bar) => {
    bar.style.width = "0";
  });

  // Animate stats counting
  const statNumbers = document.querySelectorAll(".stat-number");

  function animateStats() {
    statNumbers.forEach((number) => {
      const target = parseInt(number.getAttribute("data-count"));
      const duration = 2000; // 2 seconds
      const start = 0;
      const increment = target / (duration / 16); // 60fps

      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          clearInterval(timer);
          current = target;
        }
        number.textContent = Math.floor(current);
      }, 16);
    });
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("skills-container")) {
          animateSkillBars();
        }
        if (entry.target.classList.contains("about-stats")) {
          animateStats();
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections
  const sectionsToObserve = document.querySelectorAll(
    ".skills-container, .about-stats"
  );
  sectionsToObserve.forEach((section) => {
    observer.observe(section);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Form submission
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Here you would typically send the form data to a server
      // For demonstration, we'll just show an alert
      alert("Thank you for your message! I will get back to you soon.");
      this.reset();
    });
  }

  // Initialize animations on page load
  animateSkillBars();
  window.addEventListener("scroll", animateSkillBars);
});
