(function(){
  const navEl = document.getElementById('siteNav');
  if (!navEl) return;
  if (!navEl.classList.contains('solid')){
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) navEl.classList.add('scrolled');
      else navEl.classList.remove('scrolled');
    }, { passive:true });
  }
})();
