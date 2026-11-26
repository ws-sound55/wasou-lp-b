(() => {
  'use strict';

  // 通常のサイトnav用disclosure。モバイルmodalと幅判定はsite-menu.jsに任せる。
  const init = () => {
    document.querySelectorAll('.wasou-service-nav .wasou-service-group').forEach(group => {
      const button = group.querySelector('.wasou-service-toggle');
      const panelId = button?.getAttribute('aria-controls');
      const panel = panelId && document.getElementById(panelId);
      const nav = group.closest('.wasou-service-nav');
      if (!button || !panel || !nav || !group.contains(panel) || group.dataset.wasouServiceReady === 'true') return;
      group.dataset.wasouServiceReady = 'true';
      let open = false;
      let resizeFrame = 0;

      const visible = () => getComputedStyle(nav).display !== 'none' && nav.getClientRects().length > 0;
      const positionPanel = () => {
        panel.style.removeProperty('--wasou-service-right');
        panel.style.removeProperty('--wasou-service-max-height');
        const viewportWidth = document.documentElement.clientWidth;
        const navRect = nav.getBoundingClientRect();
        const rect = panel.getBoundingClientRect();
        // 原則はservice group右揃え。左端がrootnavより左になる場合だけ右へ補正。
        // パネル右端がrootnavを越えないので既存scrollWidth/compact計測を壊さない。
        const left = Math.max(16, navRect.left);
        const right = Math.min(viewportWidth - 16, navRect.right);
        const maxLeft = Math.max(left, right - rect.width);
        const clampedLeft = Math.min(Math.max(rect.left, left), maxLeft);
        const shift = clampedLeft - rect.left;
        if (shift) panel.style.setProperty('--wasou-service-right', `${-shift}px`);
        panel.style.setProperty('--wasou-service-max-height', `${Math.max(48, window.innerHeight - rect.top - 16)}px`);
      };
      const setOpen = (next, restoreFocus = false) => {
        if (next && !visible()) return;
        open = next;
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'サービスの詳細メニューを閉じる' : 'サービスの詳細メニューを開く');
        group.classList.toggle('wasou-service-open', open);
        if (open) positionPanel();
        else {
          panel.style.removeProperty('--wasou-service-right');
          panel.style.removeProperty('--wasou-service-max-height');
          if (restoreFocus && visible()) button.focus({ preventScroll: true });
        }
      };
      const closeForLayout = () => {
        const focusWasInside = group.contains(document.activeElement);
        setOpen(false);
        if (!focusWasInside) return;
        const trigger = document.querySelector('.site-menu-trigger');
        if (trigger && trigger.getClientRects().length > 0 && getComputedStyle(trigger).visibility !== 'hidden') {
          trigger.focus({ preventScroll: true });
        }
      };
      const schedulePosition = () => {
        if (!open || resizeFrame) return;
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0;
          if (!open) return;
          if (!visible()) closeForLayout();
          else positionPanel();
        });
      };

      // native buttonのclickにはEnter/Spaceによるactivationも含まれる。
      // 独自keydownで二重トグルせず、開いた後もTabはHTMLの自然な順序に任せる。
      button.addEventListener('click', () => setOpen(!open, open && panel.contains(document.activeElement)));
      group.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        setOpen(false, true);
      });
      group.addEventListener('focusout', () => {
        // 同じgroup内のbutton→リンクへの移動やブラウザの標準focus処理を待つ。
        window.setTimeout(() => {
          if (open && !group.contains(document.activeElement)) setOpen(false);
        }, 0);
      });
      document.addEventListener('click', event => {
        if (!open || group.contains(event.target)) return;
        // outsideのクリック先へ既に移ったfocusは奪わない。
        // 非focusableな余白をクリックしてhidden内にfocusが残る場合だけbutton復帰。
        setOpen(false, panel.contains(document.activeElement));
      });
      panel.addEventListener('click', event => {
        const link = event.target instanceof Element && event.target.closest('a[href]');
        if (link && panel.contains(link)) setOpen(false, panel.contains(document.activeElement));
        // preventDefaultしない。通常遷移・modifier click・新規タブをそのまま維持。
      });
      window.addEventListener('resize', schedulePosition, { passive: true });
      window.addEventListener('pagehide', () => setOpen(false));
      window.addEventListener('pageshow', () => setOpen(false));
      document.fonts?.ready.then(schedulePosition);
      document.fonts?.addEventListener?.('loadingdone', schedulePosition);
      if (window.ResizeObserver) {
        const observer = new ResizeObserver(schedulePosition);
        observer.observe(nav);
      }
      // 既存幅fallback・SP切替時、隠れたPCパネルの展開状態を残さない。
      if (window.MutationObserver) {
        const observer = new MutationObserver(() => {
          if (open && !visible()) closeForLayout();
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }
      setOpen(false);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
