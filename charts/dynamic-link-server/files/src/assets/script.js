function appendLink(id, linkHref) {
  const linkParentElem = document.getElementById(id);
  if (linkParentElem.querySelector('a')) {
    return;
  }
  const link = document.createElement('a');
  link.href = `/${linkHref}`;
  link.innerText = id.replaceAll('-', ' ');
  linkParentElem.appendChild(link);
}

window.onload = () => appendLink('link-on-load', 'link-on-load-page');

function addListenerOnDraggedFile() {
  const elem = document.getElementById('drop-zone');

  // Prevent the default dragover and dragenter events
  elem.addEventListener('dragover', function (event) {
    event.preventDefault();
  });

  elem.addEventListener('dragenter', function (event) {
    event.preventDefault();
  });

  elem.addEventListener('drop', function (event) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    document.getElementById(
      'file-name'
    ).textContent = `Selected file: ${file.name}`;

    appendLink('link-on-dragged-file', 'link-from-drag-and-drop-page');
  });
}

function addLinkAfterDelay() {
  return new Promise(resolve => setTimeout(resolve, 2000)).then(() =>
    appendLink('link-after-delay', 'link-after-delay-page')
  );
}

function addListenerOnScroll() {
  const elem = document.getElementById('scrollable');
  elem.addEventListener('scroll', () =>
    appendLink('link-on-scroll', 'link-on-scroll-page')
  );
}

function addListenerOnClick() {
  const btn = document.getElementById('elem-with-onclick');
  btn.addEventListener('click', () =>
    appendLink('link-on-click', 'link-on-click-page')
  );
}

function addListenerOnHover() {
  const elem = document.getElementById('elem-with-onhover');
  elem.addEventListener('mouseover', () =>
    appendLink('link-on-hover', 'link-on-hover-page')
  );
}

function addListenerOnSubmit() {
  const form = document.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    appendLink('link-on-submit', 'link-on-submit-page');
  });
}

addListenerOnDraggedFile();
addLinkAfterDelay();
addListenerOnScroll();
addListenerOnClick();
addListenerOnHover();
addListenerOnSubmit();
