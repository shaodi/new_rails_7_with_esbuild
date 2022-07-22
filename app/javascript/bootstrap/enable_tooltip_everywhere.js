// https://getbootstrap.jp/docs/5.0/components/tooltips/#example-enable-tooltips-everywhere
document.addEventListener('turbo:load', function() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

