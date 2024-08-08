function adjustScene() {
    const iframe = document.querySelector('iframe');
    const width = window.innerWidth;

    if (width < 600) {
        iframe.src = 'MOBILE_SPLINE_EMBED_URL';  // Optional: Use a different embed for mobile
    } else {
        iframe.src = 'https://my.spline.design/miniroomartcopy-35e40890fb0383a60eb7df1a26bd9d30/';
    }
}

// Adjust scene on load and resize
window.addEventListener('resize', adjustScene);
window.addEventListener('load', adjustScene);
