// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// Smooth Scrolling Function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Security and Validation Functions
function sanitizeInput(input) {
    if (!input) return '';
    // Remove potential script tags and dangerous characters
    return input.toString()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>'"&]/g, function(match) {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return map[match];
        })
        .trim();
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name) {
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
    return nameRegex.test(name);
}

function validateSubject(subject) {
    // Allow letters, numbers, spaces, basic punctuation
    const subjectRegex = /^[a-zA-Z0-9\s\.\,\!\?\-]{1,100}$/;
    return subjectRegex.test(subject);
}

function validateMessage(message) {
    // Basic message validation - no script tags, reasonable length
    const cleanMessage = sanitizeInput(message);
    return cleanMessage.length >= 10 && cleanMessage.length <= 1000;
}

function rateLimitCheck() {
    const lastSubmission = localStorage.getItem('lastFormSubmission');
    const currentTime = Date.now();
    
    if (lastSubmission && (currentTime - parseInt(lastSubmission)) < 30000) { // 30 seconds
        return false;
    }
    
    localStorage.setItem('lastFormSubmission', currentTime.toString());
    return true;
}

// Contact Form Handling with Security
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Rate limiting check
    if (!rateLimitCheck()) {
        showNotification('Please wait a moment before sending another message. This helps us prevent spam! 😊', 'error');
        return;
    }
    
    // Get and validate form data
    const formData = new FormData(this);
    const rawName = formData.get('name');
    const rawSubject = formData.get('subject');
    const rawMessage = formData.get('message');
    const rawDeadline = formData.get('deadline');
    const honeypot = formData.get('website'); // Honeypot field
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypot && honeypot.trim() !== '') {
        console.log('Bot detected via honeypot field');
        return; // Silently fail for bots
    }
    
    // Validate all inputs
    if (!validateName(rawName)) {
        showNotification('Please enter your full name using only letters (no numbers or symbols). 📝', 'error');
        return;
    }
    
    if (!validateSubject(rawSubject)) {
        showNotification('Please describe your project in simple terms (letters and numbers only). 📚', 'error');
        return;
    }
    
    if (!validateMessage(rawMessage)) {
        showNotification('Please tell us more about your project (at least 10 words, no links or promotional content). ✍️', 'error');
        return;
    }
    
    // Sanitize inputs
    const name = sanitizeInput(rawName);
    const subject = sanitizeInput(rawSubject);
    const message = sanitizeInput(rawMessage);
    const deadline = rawDeadline ? sanitizeInput(rawDeadline) : '';
    
    // Additional security check - detect potential spam/malicious content
    const suspiciousPatterns = [
        /http[s]?:\/\//i,
        /www\./i,
        /bitcoin|crypto|investment|loan|money/i,
        /click here|urgent|act now/i,
        /viagra|pharmacy|casino/i
    ];
    
    const fullText = `${name} ${subject} ${message}`.toLowerCase();
    for (let pattern of suspiciousPatterns) {
        if (pattern.test(fullText)) {
            showNotification('We focus on academic assignments only. Please remove any links or promotional content from your message. 🎓', 'error');
            return;
        }
    }
    
    // Check message length limits
    if (name.length > 50 || subject.length > 100 || message.length > 1000) {
        showNotification('Please keep your message shorter so we can review it properly. Thank you! 📏', 'error');
        return;
    }
    
    // Create WhatsApp message with encoded content
    let whatsappMessage = `Hi! I need help with an assignment.%0A%0A`;
    whatsappMessage += `Name: ${encodeURIComponent(name)}%0A`;
    whatsappMessage += `Subject: ${encodeURIComponent(subject)}%0A`;
    whatsappMessage += `Message: ${encodeURIComponent(message)}%0A`;
    
    if (deadline) {
        whatsappMessage += `Deadline: ${encodeURIComponent(deadline)}%0A`;
    }
    
    whatsappMessage += `%0APlease let me know how you can help!`;
    
    // Security check - ensure WhatsApp URL is safe
    if (whatsappMessage.length > 2000) {
        showNotification('Your message is a bit too long for WhatsApp. Please make it shorter and try again! 💬', 'error');
        return;
    }
    
    // Open WhatsApp with the message (replace with your actual WhatsApp number)
    const phoneNumber = '94720128856'; // Your actual WhatsApp number
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
    
    window.open(whatsappURL, '_blank');
    
    // Show success message
    showNotification('Perfect! WhatsApp is opening with your message. We\'ll respond soon! 🚀', 'success');
    
    // Reset form
    this.reset();
});

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.service-card, .sample-card');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});

// Typing Effect for Hero Title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on load
window.addEventListener('load', function() {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    heroTitle.style.opacity = '1';
    // Uncomment the line below if you want the typing effect
    // typeWriter(heroTitle, originalText, 50);
});

// Sample Projects Data (for future dynamic loading)
const sampleProjects = [
    {
        title: "E-Commerce Website",
        type: "IT & Coding",
        description: "Full-stack web application with user authentication, payment integration, and admin panel.",
        image: "placeholder",
        icon: "fas fa-laptop-code"
    },
    {
        title: "Market Analysis Report",
        type: "Business",
        description: "Comprehensive market research and competitive analysis for startup business plan.",
        image: "placeholder",
        icon: "fas fa-chart-line"
    },
    {
        title: "Mobile App Development",
        type: "IT & Coding",
        description: "Cross-platform mobile application with real-time features and cloud integration.",
        image: "placeholder",
        icon: "fas fa-mobile-alt"
    },
    {
        title: "Academic Research Paper",
        type: "English",
        description: "Well-researched academic paper with proper citations and formatting.",
        image: "placeholder",
        icon: "fas fa-file-alt"
    },
    {
        title: "Database Management System",
        type: "IT & Coding",
        description: "Complete database design with SQL queries, stored procedures, and user interface.",
        image: "placeholder",
        icon: "fas fa-database"
    },
    {
        title: "Business Presentation",
        type: "Documentation",
        description: "Professional PowerPoint presentation with data visualization and infographics.",
        image: "placeholder",
        icon: "fas fa-presentation"
    }
];

// Function to load more samples (for future expansion)
function loadMoreSamples() {
    const samplesGrid = document.getElementById('samples-grid');
    // This function can be expanded to load more projects dynamically
    console.log('Loading more samples...');
}

// Search functionality (for future implementation)
function searchProjects(query) {
    const filteredProjects = sampleProjects.filter(project => 
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.type.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
    );
    return filteredProjects;
}

// Back to top button functionality
function createBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #4f46e5;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
        z-index: 1000;
    `;
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
}

// Initialize back to top button
document.addEventListener('DOMContentLoaded', createBackToTopButton);

// WhatsApp floating button functionality
function createWhatsAppButton() {
    const whatsappButton = document.createElement('button');
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappButton.className = 'whatsapp-float';
    whatsappButton.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 30px;
        width: 60px;
        height: 60px;
        background: #25d366;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        box-shadow: 0 5px 20px rgba(37, 211, 102, 0.4);
        transition: all 0.3s ease;
        z-index: 1000;
        animation: whatsappPulse 2s infinite;
    `;
    
    // Add CSS animation for pulsing effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes whatsappPulse {
            0% {
                transform: scale(1);
                box-shadow: 0 5px 20px rgba(37, 211, 102, 0.4);
            }
            50% {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 5px 20px rgba(37, 211, 102, 0.4);
            }
        }
        
        .whatsapp-float:hover {
            transform: scale(1.15) !important;
            box-shadow: 0 8px 30px rgba(37, 211, 102, 0.7) !important;
            animation: none !important;
        }
    `;
    document.head.appendChild(style);
    
    whatsappButton.addEventListener('click', function() {
        // Create a pre-filled WhatsApp message
        const defaultMessage = `Hi! I'm interested in your assignment help services. Can you please tell me more about how you can help me?`;
        const phoneNumber = '94720128856';
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
        
        window.open(whatsappURL, '_blank');
        
        // Show notification
        showNotification('Opening WhatsApp! We\'ll respond quickly! 💚', 'success');
    });
    
    document.body.appendChild(whatsappButton);
}

// Initialize WhatsApp button
document.addEventListener('DOMContentLoaded', createWhatsAppButton);

// Lazy loading for images (when you add real images)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Active navigation highlighting
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize active section highlighting
document.addEventListener('DOMContentLoaded', highlightActiveSection);

// Performance monitoring (optional)
function logPerformance() {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        }, 0);
    });
}

// Initialize performance monitoring
logPerformance();

// Image Modal Functionality
function openModal(projectId) {
    const modal = document.getElementById('imageModal');
    const singleImageView = document.getElementById('singleImageView');
    const galleryView = document.getElementById('galleryView');
    
    // Find the clicked project card
    const projectCard = event.target.closest('.portfolio-card');
    if (!projectCard) return;
    
    // Check if this is a gallery project (poster and logo designs)
    if (projectId === 'gallery1') {
        // Show gallery view
        singleImageView.style.display = 'none';
        galleryView.style.display = 'block';
        
        // Set up gallery
        setupGallery(projectCard);
    } else {
        // Show single image view
        singleImageView.style.display = 'block';
        galleryView.style.display = 'none';
        
        // Set up single image
        setupSingleImage(projectCard);
    }
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function setupSingleImage(projectCard) {
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalTags = document.getElementById('modalTags');
    
    // Get project details
    const image = projectCard.querySelector('.portfolio-image img');
    const title = projectCard.querySelector('.portfolio-content h3');
    const description = projectCard.querySelector('.portfolio-content p');
    const tags = projectCard.querySelectorAll('.portfolio-tags .tag');
    
    // Update modal content
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalTitle.textContent = title.textContent;
    modalDescription.textContent = description.textContent;
    
    // Clear and add tags
    modalTags.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag.textContent;
        modalTags.appendChild(tagElement);
    });
}

function setupGallery(projectCard) {
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryDescription = document.getElementById('galleryDescription');
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryTags = document.getElementById('galleryTags');
    
    // Get project details
    const title = projectCard.querySelector('.portfolio-content h3');
    const description = projectCard.querySelector('.portfolio-content p');
    const tags = projectCard.querySelectorAll('.portfolio-tags .tag');
    
    // Set gallery info
    galleryTitle.textContent = title.textContent;
    galleryDescription.textContent = description.textContent;
    
    // Clear and add tags
    galleryTags.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag.textContent;
        galleryTags.appendChild(tagElement);
    });
    
    // Define gallery images (your actual files)
    const galleryImages = [
        {
            src: 'images/posters and logos/Poster.png',
            title: 'Event Poster',
            type: 'Poster Design'
        },
        {
            src: 'images/posters and logos/Drivebot.png',
            title: 'Graphic design',
            type: 'Poster Design'
        },
        {
            src: 'images/posters and logos/logo1.png',
            title: 'Brand Logo 1',
            type: 'Logo Design'
        },
        {
            src: 'images/posters and logos/logo2.png',
            title: 'Brand Logo 2',
            type: 'Logo Design'
        },
        {
            src: 'images/posters and logos/logo3.png',
            title: 'Brand Logo 3',
            type: 'Logo Design'
        }
    ];
    
    // Clear gallery grid
    galleryGrid.innerHTML = '';
    
    // Add images to gallery
    galleryImages.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.onclick = () => showFullscreenImage(image.src, image.title);
        
        galleryItem.innerHTML = `
            <img src="${image.src}" alt="${image.title}" loading="lazy">
            <div class="gallery-item-overlay">
                <div class="gallery-item-title">${image.title}</div>
                <div class="gallery-item-type">${image.type}</div>
            </div>
        `;
        
        galleryGrid.appendChild(galleryItem);
    });
}

function showFullscreenImage(src, title) {
    // Create fullscreen overlay if it doesn't exist
    let fullscreenOverlay = document.getElementById('fullscreenOverlay');
    if (!fullscreenOverlay) {
        fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.id = 'fullscreenOverlay';
        fullscreenOverlay.className = 'fullscreen-overlay';
        
        fullscreenOverlay.innerHTML = `
            <span class="fullscreen-close">&times;</span>
            <img class="fullscreen-image" src="" alt="">
        `;
        
        document.body.appendChild(fullscreenOverlay);
        
        // Add click events
        fullscreenOverlay.addEventListener('click', function(e) {
            if (e.target === fullscreenOverlay || e.target.className === 'fullscreen-close') {
                fullscreenOverlay.style.display = 'none';
            }
        });
    }
    
    // Show fullscreen image
    const fullscreenImage = fullscreenOverlay.querySelector('.fullscreen-image');
    fullscreenImage.src = src;
    fullscreenImage.alt = title;
    fullscreenOverlay.style.display = 'flex';
}

// Close modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Close image modal when clicking the X button
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
    
    // Close image modal when clicking outside the modal content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
});