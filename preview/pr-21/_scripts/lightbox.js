/*
  open figure images in a fullscreen lightbox on click.
  only applies to figures without an explicit link.
*/

{
  const onLoad = () => {
    // for each figure image that doesn't already link somewhere
    const images = document.querySelectorAll(".figure-image:not([href]) img");
    if (!images.length) return;

    // fullscreen dialog holding the enlarged image
    const dialog = document.createElement("dialog");
    dialog.classList.add("lightbox");
    const enlarged = document.createElement("img");
    dialog.append(enlarged);
    document.body.append(dialog);

    // close on click anywhere (image or backdrop); esc works natively
    dialog.addEventListener("click", () => dialog.close());

    for (const image of images) {
      image.style.cursor = "zoom-in";
      image.addEventListener("click", () => {
        enlarged.src = image.src;
        enlarged.alt = image.alt;
        dialog.showModal();
      });
    }
  };

  // after page loads
  window.addEventListener("load", onLoad);
}
