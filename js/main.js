document.querySelectorAll('.menu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const nav = button.parentElement.querySelector('.nav-links');
    if (nav) {
      nav.classList.toggle('open');
    }
  });
});
