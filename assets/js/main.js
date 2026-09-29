document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
});

const mcta = document.getElementById('mobileCta');
const hero = document.querySelector('.approved-fv');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) mcta.classList.add('show');
      else mcta.classList.remove('show');
    });
  }, {threshold:0.02});
  io.observe(hero);
}

document.querySelectorAll('a[href="https://reserve.peraichi.com/r/b194f80c"][target="_blank"][rel="noopener"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('application').scrollIntoView({behavior:'smooth', block:'start'});
  });
});

const menuTrigger = document.querySelector('.hero-menu-trigger');
const mobileMenu = document.getElementById('mobileMenu');
const menuClose = document.querySelector('.mobile-menu-close');

function closeMobileMenu() {
  if (!menuTrigger || !mobileMenu) return;
  mobileMenu.hidden = true;
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.setAttribute('aria-label', 'メニューを開く');
}

if (menuTrigger && mobileMenu) {
  menuTrigger.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;
    mobileMenu.hidden = isOpen;
    menuTrigger.setAttribute('aria-expanded', String(!isOpen));
    menuTrigger.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
  });
  menuClose?.addEventListener('click', closeMobileMenu);
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
}
