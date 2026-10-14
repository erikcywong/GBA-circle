/* ============================================================
   港澳生态园方案 · 深度分析站 — 共享脚本
   - 自动高亮当前页导航
   - ECharts 暗色主题默认值
   - 数字滚动 / 滚动入场
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. 当前页导航高亮 ---------- */
  function markActive() {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav .nav-item').forEach(function (it) {
      var link = it.querySelector('a[data-page]');
      if (link && link.getAttribute('data-page').toLowerCase() === file) {
        it.classList.add('on');
      }
    });
  }

  /* ---------- 2. ECharts 暗色默认 ---------- */
  var THEME = {
    text: '#e7e9ea',
    dim: '#a8b0b7',
    muted: '#71767b',
    border: '#232629',
    split: '#191c1e',
    panel: '#0e1113',
    accent: '#1d9bf0',
    ok: '#00ba7c',
    warn: '#ffad1f',
    danger: '#f4212e',
    purple: '#8b5cf6'
  };

  function baseOpt(extra) {
    var o = {
      backgroundColor: 'transparent',
      textStyle: { color: THEME.text, fontFamily: '-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif' },
      grid: { left: 14, right: 22, top: 38, bottom: 16, containLabel: true },
      tooltip: {
        backgroundColor: 'rgba(14,17,19,.96)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.text, fontSize: 12.5 },
        extraCssText: 'border-radius:9px;box-shadow:0 12px 32px rgba(0,0,0,.6);'
      },
      legend: { textStyle: { color: THEME.dim, fontSize: 12 }, icon: 'roundRect', itemWidth: 11, itemHeight: 11 }
    };
    return Object.assign(o, extra || {});
  }

  function axis(name) {
    return {
      axisLine: { lineStyle: { color: THEME.border } },
      axisTick: { show: false },
      axisLabel: { color: THEME.dim, fontSize: 11.5 },
      nameTextStyle: { color: THEME.muted, fontSize: 11 },
      name: name || '',
      splitLine: { lineStyle: { color: THEME.split, type: 'dashed' } }
    };
  }

  function catAxis(data, name) {
    var a = axis(name);
    a.type = 'category';
    a.data = data;
    a.boundaryGap = true;
    a.splitLine = { show: false };
    return a;
  }

  function valAxis(name) {
    var a = axis(name);
    a.type = 'value';
    return a;
  }

  /* ---------- 3. 渲染辅助 ---------- */
  function render(id, opt) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;
    var ch = echarts.init(el, null, { renderer: 'canvas' });
    ch.setOption(opt);
    window.addEventListener('resize', function () { ch.resize(); });
    return ch;
  }

  /* ---------- 4. 数字滚动入场 ---------- */
  function countUp() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.dataset.done) return;
        el.dataset.done = '1';
        var target = parseFloat(el.dataset.count);
        var dec = (el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0);
        var pre = el.dataset.pre || '';
        var suf = el.dataset.suf || '';
        var dur = 900, t0 = performance.now();
        function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          var v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = pre + v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: .35 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 5. 进度条入场 ---------- */
  function bars() {
    var nodes = document.querySelectorAll('.score-row .fill[data-w]');
    if (!nodes.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var w = el.getAttribute('data-w');
        var c = el.getAttribute('data-c') || THEME.accent;
        setTimeout(function () { el.style.width = w + '%'; }, 60);
        el.style.background = 'linear-gradient(90deg,' + c + 'cc,' + c + ')';
        io.unobserve(el);
      });
    }, { threshold: .3 });
    nodes.forEach(function (n) { n.style.width = '0%'; io.observe(n); });
  }

  /* ---------- 6. 淡入 ---------- */
  function reveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;
    nodes.forEach(function (n) {
      n.style.opacity = '0';
      n.style.transform = 'translateY(14px)';
      n.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.3,1)';
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
      });
    }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 导出 ---------- */
  window.SITE = {
    theme: THEME,
    base: baseOpt,
    catAxis: catAxis,
    valAxis: valAxis,
    axis: axis,
    render: render
  };

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    markActive();
    bars();
    countUp();
    reveal();
  });
})();
