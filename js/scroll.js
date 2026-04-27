// Intersection Observer for reveal animations
const getRevealOptions = () => {
  const isMobile = window.innerWidth <= 768;
  return {
    threshold: isMobile ? 0.05 : 0.15,
    rootMargin: isMobile ? "0px 0px -20px 0px" : "0px 0px -50px 0px"
  };
};

let revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, getRevealOptions());

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => revealObserver.observe(el));
});

window.addEventListener('resize', () => {
  // Re-observe if needed, but since we unobserve on reveal, it might not be necessary
  // unless we want to reset animations. For now, we'll keep it simple.
});
