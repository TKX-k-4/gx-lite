(() => {
  const end = () => { document.body.classList.remove('on'); window.gxr.end(); };
  document.body.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    document.body.setPointerCapture(e.pointerId);
    document.body.classList.add('on');
    window.gxr.start();
  });
  document.body.addEventListener('pointerup', end);
  document.body.addEventListener('lostpointercapture', end);
})();
