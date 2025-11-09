(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(a=>{
    const href = a.getAttribute('href');
    if ((path === '' && href === 'index.html') || href === path) a.classList.add('active');
  });

  // Theme toggle
  const btn = document.getElementById('theme-toggle');
  const key = 'prefers-dark';
  const apply = (isDark)=>{ document.documentElement.dataset.theme = isDark ? 'dark' : 'light'; };
  try{
    const saved = localStorage.getItem(key);
    if(saved !== null) apply(saved === 'true');
    btn?.addEventListener('click', ()=>{
      const now = !(document.documentElement.dataset.theme === 'dark');
      apply(now);
      localStorage.setItem(key, String(now));
    });
  }catch(e){}

  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-toggle');
  const links = document.querySelector('.navlinks');
  menuBtn?.addEventListener('click', ()=> links?.classList.toggle('open'));
})();
