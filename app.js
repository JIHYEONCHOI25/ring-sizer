(function () {
  'use strict';
  var KEY = 'lc_ringsizer_pxmm';
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;

  // KS(한국 표준) 호수: 1호 = 안지름 13.0mm, 호수당 1/3mm
  function dOf(n) { return 13 + (n - 1) / 3; }
  function noOf(d) { return 1 + (d - 13) * 3; }
  // 샤밍주얼리 스토어 KS규격 표(공지 2019.12.10): 1호 44mm, 호수당 1mm (11호 54mm)
  function finger(d) { return 44 + (d - 13) * 3; }
  function us(d) { return (d - 11.63) / 0.8128; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }

  var pxmm = (window.screen.width < 700) ? 6 : 3.78;
  try { var s = parseFloat(localStorage.getItem(KEY)); if (s > 2 && s < 9) pxmm = s; } catch (e) {}
  var hasSaved = false;
  try { hasSaved = !!localStorage.getItem(KEY); } catch (e) {}
  function setPx(v) { pxmm = Math.min(9, Math.max(2, v)); root.style.setProperty('--mm', pxmm + 'px'); }
  setPx(pxmm);

  // ---------- 보정 ----------
  var mode = 'card';
  var calRange = $('calRange');
  calRange.value = pxmm;
  calRange.addEventListener('input', function () { setPx(parseFloat(calRange.value)); });
  $('calMinus').onclick = function () { calRange.value = pxmm - 0.01; setPx(+calRange.value); };
  $('calPlus').onclick = function () { calRange.value = pxmm + 0.01; setPx(+calRange.value); };
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.onclick = function () {
      mode = b.dataset.mode;
      document.querySelectorAll('.seg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('calCard').hidden = mode !== 'card';
      $('calCoin').hidden = mode !== 'coin';
      $('calHint').textContent = mode === 'card'
        ? '신용카드(85.60 × 53.98mm)를 세로로 올려 가로·세로 테두리가 딱 맞게 슬라이더를 움직여 주세요.'
        : '100원 동전(지름 24.00mm)을 올려 원 테두리와 딱 맞게 슬라이더를 움직여 주세요.';
    };
  });
  $('calDone').onclick = function () {
    try { localStorage.setItem(KEY, String(pxmm)); } catch (e) {}
    show('measure');
  };
  $('recal').onclick = function () { calRange.value = pxmm; show('calib'); };

  function show(w) {
    $('calib').hidden = w !== 'calib';
    $('measure').hidden = w !== 'measure';
    window.scrollTo(0, 0);
    if (w === 'measure') update();
  }

  // ---------- 측정 ----------
  var d = 16.5; // mm
  var mRange = $('mRange');
  var tbody = document.querySelector('#tbl tbody');
  var rows = [];
  for (var n = 1; n <= 30; n++) {
    var dd = dOf(n), tr = document.createElement('tr');
    tr.innerHTML = '<td>' + n + '호</td><td>' + f2(dd) + '</td><td>' + f1(dd * Math.PI) + '</td><td>' + f1(finger(dd)) + '</td><td>' + f1(us(dd)) + '</td><td>' + Math.round(dd * Math.PI) + '</td>';
    (function (nn) { tr.onclick = function () { setD(dOf(nn)); }; })(n);
    tbody.appendChild(tr); rows.push(tr);
  }
  function setD(v) { d = Math.min(23, Math.max(12.5, v)); mRange.value = d; update(); }

  function update() {
    root.style.setProperty('--d', d);
    var n = noOf(d), r = Math.round(n);
    var diff = Math.abs(n - r);
    $('rsNo').textContent = diff < 0.15 ? r : (Math.round(n * 10) / 10);
    $('rsD').textContent = f2(d);
    $('rsC').textContent = f1(d * Math.PI);
    $('rsF').textContent = f1(finger(d));
    $('rsUS').textContent = f1(us(d));
    $('rsEU').textContent = Math.round(d * Math.PI);
    rows.forEach(function (tr, i) { tr.classList.toggle('on', i + 1 === r && r >= 1 && r <= 30); });
    var act = rows[Math.min(30, Math.max(1, r)) - 1];
    var w = tbody.parentNode.parentNode;
    if (act && w.offsetParent) { var t = act.offsetTop - w.clientHeight / 2 + act.offsetHeight / 2; w.scrollTop = t; }
  }
  mRange.addEventListener('input', function () { setD(parseFloat(mRange.value)); });
  $('mMinus').onclick = function () { setD(d - 0.1); };
  $('mPlus').onclick = function () { setD(d + 0.1); };

  setD(d);
  show(hasSaved ? 'measure' : 'calib');
})();
