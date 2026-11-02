/* Independent editorial gallery; existing portfolio records remain untouched. */
(() => {
  const projects = window.WECHAT_EDITORIAL || [];
  const section = document.querySelector('#wechat-editorial');
  const grid = section.querySelector('.wechat-grid');
  const dialog = document.querySelector('#wechat-reader');
  const scroll = dialog.querySelector('.wechat-scroll');
  const content = dialog.querySelector('.wechat-pages');
  const title = dialog.querySelector('#wechat-reader-title');
  const counter = dialog.querySelector('.wechat-counter');
  const previous = dialog.querySelector('[data-wechat-prev]');
  const next = dialog.querySelector('[data-wechat-next]');
  let active = 0, observer, trigger, savedOverflow;
  function image(part, alt) {
    const img = new Image();
    img.width = part.width; img.height = part.height;
    img.style.aspectRatio = `${part.width} / ${part.height}`;
    img.alt = alt; img.decoding = 'async'; img.loading = 'lazy';
    img.addEventListener('error', () => {
      const retry = document.createElement('button');
      retry.className = 'wechat-retry'; retry.textContent = '图片加载失败，点击重试';
      retry.onclick = () => { img.src = part.src; retry.remove(); };
      img.after(retry);
    });
    return img;
  }
  projects.forEach((project, index) => {
    const button = document.createElement('button');
    button.className = 'wechat-card'; button.type = 'button';
    button.setAttribute('aria-label', `阅读公众号推文：${project.title}`);
    const frame = document.createElement('span'); frame.className = 'wechat-cover';
    const cover = image({width:480,height:640}, `${project.title}封面预览`);
    cover.src = project.cover; frame.append(cover);
    const number = document.createElement('span'); number.className = 'wechat-number';
    number.textContent = `${String(index+1).padStart(2,'0')} / WECHAT EDITORIAL`;
    const name = document.createElement('span'); name.className = 'wechat-card-title'; name.textContent = project.title;
    const action = document.createElement('span'); action.className = 'wechat-action'; action.textContent = '展开阅读全文 ↗';
    button.append(frame,number,name,action);
    button.onclick = () => {
      trigger = button; savedOverflow = document.body.style.overflow;
      dialog.showModal(); document.body.style.overflow = 'hidden';
      render(index); dialog.querySelector('[data-wechat-close]').focus();
    };
    grid.append(button);
  });
  function render(index) {
    active = index; observer?.disconnect(); content.replaceChildren();
    const project = projects[index]; title.textContent = project.title;
    counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
    previous.disabled = index === 0; next.disabled = index === projects.length-1;
    scroll.scrollTop = 0;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target; img.src = img.dataset.src; observer.unobserve(img);
      });
    }, {root:scroll,rootMargin:'800px 0px'});
    project.pages.forEach((page,p) => {
      const group = document.createElement('div'); group.className = 'wechat-page';
      group.style.maxWidth = `${page.segments[0].width}px`;
      page.segments.forEach((part,s) => {
        const img = image(part, `${project.title}，第 ${p+1} 张图，第 ${s+1} 段`);
        img.dataset.src = part.src; group.append(img);
        if(p===0 && s===0) { img.loading = 'eager'; img.src = part.src; }
        else observer.observe(img);
      });
      content.append(group);
    });
    scroll.scrollTop = 0;
  }
  previous.onclick = () => { if(active>0) render(active-1); };
  next.onclick = () => { if(active<projects.length-1) render(active+1); };
  dialog.querySelector('[data-wechat-close]').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if(e.target===dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    observer?.disconnect(); content.replaceChildren();
    document.body.style.overflow = savedOverflow; trigger?.focus({preventScroll:true});
  });
})();
