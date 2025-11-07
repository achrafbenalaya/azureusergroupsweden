document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initBackToTop();
  initEventsList();
  initMobileFilterFAB();
});

// Global state for events
let allEvents = [];
let filteredEvents = [];
let currentFilter = 'all';
let currentView = 'grid';
let searchQuery = '';

function initNavigation() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");

  if (!navToggle || !navLinks) {
    return;
  }

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("is-open");
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
  });

  navLinks.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initBackToTop() {
  const backToTopButton = document.querySelector("[data-back-to-top]");

  if (!backToTopButton) {
    return;
  }

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  };

  window.addEventListener("scroll", toggleVisibility);

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

async function initEventsList() {
  const eventsContainer = document.querySelector("[data-events-list]");
  const skeletonLoader = document.querySelector("[data-skeleton-loader]");

  if (!eventsContainer) {
    return;
  }

  // Show skeleton loader
  if (skeletonLoader) {
    skeletonLoader.classList.remove('hidden');
  }

  try {
    const response = await fetch("data/events.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load events: ${response.statusText}`);
    }

    allEvents = await response.json();

    // Hide skeleton loader
    if (skeletonLoader) {
      skeletonLoader.classList.add('hidden');
    }

    if (!Array.isArray(allEvents) || allEvents.length === 0) {
      renderEmptyState(eventsContainer);
      return;
    }

    // Sort events by date
    allEvents = allEvents.sort((a, b) => {
      const aDate = new Date(`${a.date || ""} ${a.time || ""}`);
      const bDate = new Date(`${b.date || ""} ${b.time || ""}`);
      return aDate.getTime() - bDate.getTime();
    });

    filteredEvents = [...allEvents];

    // Initialize controls
    initSearchAndFilters();
    initViewToggle();
    initIntersectionObserver();
    
    // Load saved view preference
    const savedView = localStorage.getItem('eventsView');
    if (savedView) {
      currentView = savedView;
      updateViewMode(savedView);
    }

    // Initial render
    updateEventCounts();
    renderEvents();

  } catch (error) {
    console.error(error);
    if (skeletonLoader) {
      skeletonLoader.classList.add('hidden');
    }
    renderErrorState(eventsContainer);
  }
}

function initSearchAndFilters() {
  const searchInput = document.querySelector("[data-search-input]");
  const filterButtons = document.querySelectorAll("[data-filter]");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      applyFiltersAndSearch();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      currentFilter = filter;
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      applyFiltersAndSearch();
    });
  });
}

function initViewToggle() {
  const viewButtons = document.querySelectorAll("[data-view]");
  const eventsContainer = document.querySelector("[data-events-list]");

  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      currentView = view;
      
      // Save preference
      localStorage.setItem('eventsView', view);
      
      // Update active state
      viewButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      updateViewMode(view);
    });
  });
}

function updateViewMode(view) {
  const eventsContainer = document.querySelector("[data-events-list]");
  const viewButtons = document.querySelectorAll("[data-view]");
  
  if (!eventsContainer) return;

  // Remove all view classes
  eventsContainer.classList.remove('view-grid', 'view-list', 'view-timeline');
  
  // Add current view class
  eventsContainer.classList.add(`view-${view}`);
  
  // Update button states
  viewButtons.forEach(btn => {
    if (btn.getAttribute("data-view") === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  // Re-render events for view-specific layouts
  renderEvents();
}

function applyFiltersAndSearch() {
  filteredEvents = allEvents.filter(event => {
    // Filter by type
    const typeMatch = currentFilter === 'all' || 
                     (currentFilter === 'online' && event.type.toLowerCase() === 'online') ||
                     (currentFilter === 'local' && event.type.toLowerCase() === 'local');
    
    // Filter by search query
    const searchMatch = !searchQuery || 
                       event.title.toLowerCase().includes(searchQuery) ||
                       (event.description && event.description.toLowerCase().includes(searchQuery)) ||
                       (event.speaker && event.speaker.toLowerCase().includes(searchQuery)) ||
                       (event.category && event.category.toLowerCase().includes(searchQuery)) ||
                       (event.location && event.location.toLowerCase().includes(searchQuery));
    
    return typeMatch && searchMatch;
  });

  updateEventCounts();
  renderEvents();
}

function updateEventCounts() {
  const allCount = allEvents.length;
  const onlineCount = allEvents.filter(e => e.type.toLowerCase() === 'online').length;
  const localCount = allEvents.filter(e => e.type.toLowerCase() === 'local').length;

  const countElements = {
    all: document.querySelector('[data-count="all"]'),
    online: document.querySelector('[data-count="online"]'),
    local: document.querySelector('[data-count="local"]')
  };

  if (countElements.all) countElements.all.textContent = allCount;
  if (countElements.online) countElements.online.textContent = onlineCount;
  if (countElements.local) countElements.local.textContent = localCount;
}

function renderEvents() {
  const eventsContainer = document.querySelector("[data-events-list]");
  
  if (!eventsContainer) return;

  if (filteredEvents.length === 0) {
    eventsContainer.innerHTML = `
      <div class="empty-state">
        <h3>No events found</h3>
        <p>Try adjusting your search or filter to find more events.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredEvents.forEach((event, index) => {
    fragment.appendChild(createEventCard(event, index));
  });

  eventsContainer.innerHTML = "";
  eventsContainer.appendChild(fragment);
}

function createEventCard(event, index) {
  const { title, date, time, type, image, location, registrationUrl, category, status, speaker, speakerTitle, description } = event;

  const card = document.createElement("article");
  card.className = "event-card";
  card.setAttribute('data-event-index', index);

  // For timeline view, add marker
  if (currentView === 'timeline') {
    const marker = document.createElement("div");
    marker.className = "event-card__timeline-marker";
    
    const dot = document.createElement("div");
    dot.className = "event-card__timeline-dot";
    marker.appendChild(dot);
    
    card.appendChild(marker);
  }

  // Status badge
  if (status) {
    const statusBadge = document.createElement("div");
    statusBadge.className = `event-card__status event-card__status--${status}`;
    statusBadge.textContent = status === 'upcoming' ? 'Upcoming' : 'Past Event';
    card.appendChild(statusBadge);
  }

  // Media section
  if (currentView !== 'timeline') {
    const mediaWrapper = document.createElement("div");
    mediaWrapper.className = "event-card__media";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = image || "https://placehold.co/800x450?text=Azure+User+Group";
    img.alt = title ? `${title} event artwork` : "Azure User Group event artwork";
    mediaWrapper.appendChild(img);
    
    card.appendChild(mediaWrapper);
  }

  // Body section
  const body = document.createElement("div");
  body.className = "event-card__body";

  // Category
  if (category) {
    const categoryBadge = document.createElement("div");
    categoryBadge.className = "event-card__category";
    categoryBadge.textContent = category;
    body.appendChild(categoryBadge);
  }

  // Title
  const titleEl = document.createElement("h3");
  titleEl.className = "event-card__title";
  titleEl.textContent = title || "Azure User Group Event";
  body.appendChild(titleEl);

  // Speaker
  if (speaker) {
    const speakerEl = document.createElement("div");
    speakerEl.className = "event-card__speaker";
    speakerEl.innerHTML = `${speaker}${speakerTitle ? ` <span style="opacity: 0.7">• ${speakerTitle}</span>` : ''}`;
    body.appendChild(speakerEl);
  }

  // Description
  if (description) {
    const descEl = document.createElement("p");
    descEl.className = "event-card__description";
    descEl.textContent = description;
    body.appendChild(descEl);
  }

  // Meta badges
  const badgeRow = document.createElement("div");
  badgeRow.className = "event-card__meta";

  if (date) {
    const dateSpan = document.createElement("span");
    dateSpan.textContent = `📅 ${formatDate(date)}${time ? ` • ${time}` : ''}`;
    badgeRow.appendChild(dateSpan);
  }

  if (type) {
    const typeSpan = document.createElement("span");
    const normalized = String(type).toLowerCase();
    const chip = normalized === "online" ? "🌐 Online" : "📍 In-Person";
    typeSpan.textContent = chip;
    badgeRow.appendChild(typeSpan);
  }

  if (badgeRow.children.length > 0) {
    body.appendChild(badgeRow);
  }

  // Location
  if (location && String(type).toLowerCase() !== "online") {
    const locationParagraph = document.createElement("p");
    locationParagraph.className = "event-card__location";
    locationParagraph.textContent = location;
    body.appendChild(locationParagraph);
  }

  // Registration button
  if (registrationUrl && status !== 'past') {
    const cta = document.createElement("a");
    cta.href = registrationUrl;
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.className = "btn btn--primary";
    cta.textContent = "Register Now";
    body.appendChild(cta);
  }

  card.appendChild(body);

  return card;
}

function initIntersectionObserver() {
  // Observe event cards for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe cards as they're created
  setTimeout(() => {
    const cards = document.querySelectorAll('.event-card');
    cards.forEach(card => observer.observe(card));
  }, 100);
}

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>No events yet</h3>
      <p>Stay tuned! New Azure sessions, workshops, and community gatherings will appear here soon.</p>
    </div>
  `;
}

function renderErrorState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>We could not load events</h3>
      <p>Please refresh the page or check the JSON at <code>/data/events.json</code>.</p>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initMobileFilterFAB() {
  const fab = document.querySelector("[data-mobile-filter]");
  const eventControls = document.querySelector(".event-controls");

  if (!fab || !eventControls) return;

  fab.addEventListener("click", () => {
    eventControls.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Focus on search input for better UX
    const searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 500);
    }
  });
}
