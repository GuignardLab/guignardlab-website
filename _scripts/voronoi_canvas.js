function registerVoronoi(canvas, section) {
    const ctx = canvas.getContext('2d');

    let dpr = 1;
    function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse position in device pixels (top-left origin, matching canvas 2D).
    let mouseX = -1e9;
    let mouseY = -1e9;
    function setMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width * canvas.width;
        mouseY = (e.clientY - rect.top) / rect.height * canvas.height;
    }
    section.addEventListener('mousemove', setMousePosition);

    canvas.setAttribute("currentMouseColor", '#d899bf');

    // Seed points live in a normalized space: x in [0, aspect], y in [0, 1].
    const COUNT = 49;
    function rand(a,b){ return a + Math.random()*(b-a); }

    const pts = [];
    for(let i=0;i<COUNT;i++){
        pts.push({
            x: rand(0,1.6),
            y: rand(0,1),
            vx: rand(-1,1)*0.025,
            vy: rand(-1,1)*0.025,
        });
    }

    function step(dt){
        const aspect = window.innerWidth / window.innerHeight;
        for(const p of pts){
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if(p.x < 0){ p.x = 0; p.vx *= -1; }
            if(p.x > aspect){ p.x = aspect; p.vx *= -1; }
            if(p.y < 0){ p.y = 0; p.vy *= -1; }
            if(p.y > 1){ p.y = 1; p.vy *= -1; }

            p.vx += rand(-1,1)*0.0006;
            p.vy += rand(-1,1)*0.0006;
            p.vx *= 0.996;
            p.vy *= 0.996;
        }
    }

    const edgeCol = 'rgba(11, 13, 16, 0.5)';   // dark cell seams (was #0b0d10 mixed at 0.5)
    const coords = new Float64Array((COUNT + 1) * 2);

    let t0 = performance.now();
    let running = true;

    function render(now){
        if(!running) return;

        const dt = Math.min(32, now - t0) / 300;
        t0 = now;
        step(dt);

        const w = canvas.width, h = canvas.height;
        const aspect = w / h;

        // Map seeds (+ mouse as the last point) to device pixels.
        for(let i=0;i<COUNT;i++){
            coords[i*2]   = pts[i].x / aspect * w;
            coords[i*2+1] = (1 - pts[i].y) * h;
        }
        const mouseIdx = COUNT;
        coords[mouseIdx*2]   = mouseX;
        coords[mouseIdx*2+1] = mouseY;

        const delaunay = new d3.Delaunay(coords);
        const voronoi = delaunay.voronoi([0, 0, w, h]);

        ctx.clearRect(0, 0, w, h);

        // Radial gradient per cell reproduces the distance-from-seed shading:
        // white at the seed, dimming to 0.35 far away (matches the old shader).
        const shadeRadius = h * 1.18;
        const mouseColor = canvas.getAttribute("currentMouseColor");

        for(let i=0;i<=mouseIdx;i++){
            const cell = voronoi.cellPolygon(i);
            if(!cell) continue;

            const cx = coords[i*2], cy = coords[i*2+1];
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, shadeRadius);
            if(i === mouseIdx){
                g.addColorStop(0, mouseColor);
                g.addColorStop(1, mouseColor);
            } else {
                g.addColorStop(0, 'rgb(255, 255, 255)');
                g.addColorStop(1, 'rgb(89, 89, 89)');  // 0.35 * 255
            }

            ctx.beginPath();
            ctx.moveTo(cell[0][0], cell[0][1]);
            for(let k=1;k<cell.length;k++){
                ctx.lineTo(cell[k][0], cell[k][1]);
            }
            ctx.closePath();
            ctx.fillStyle = g;
            ctx.fill();

            ctx.lineWidth = 1.5 * dpr;
            ctx.strokeStyle = edgeCol;
            ctx.stroke();
        }

        // Subtle vignette (edges darkened ~15%), matching the old shader.
        const vig = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.75);
        vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        requestAnimationFrame(render);
    }

    // Pause the loop while the section is off-screen or the tab is hidden.
    let onScreen = true;
    function sync(){
        const shouldRun = onScreen && !document.hidden;
        if(shouldRun && !running){
            running = true;
            t0 = performance.now();
            requestAnimationFrame(render);
        } else if(!shouldRun){
            running = false;
        }
    }

    if('IntersectionObserver' in window){
        const io = new IntersectionObserver((entries) => {
            onScreen = entries[0].isIntersecting;
            sync();
        });
        io.observe(section);
    }
    document.addEventListener('visibilitychange', sync);

    requestAnimationFrame(render);
}

function loadScript(src){
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

var canvas = document.createElement('canvas');

canvas.className = "voronoi";
canvas.style = "display:block; width:-webkit-fill-available; height:-webkit-fill-available; opacity:33%; z-index:-1; position: absolute; left: 0; top: 0; filter: contrast(1.5)";
section = document.currentScript.parentElement; // for the current use of it, this will be the highlights section
section.insertBefore(canvas, section.children[0]);

// d3-delaunay@6 UMD bundles delaunator and exposes the `d3` global (d3.Delaunay).
loadScript("https://unpkg.com/d3-delaunay@6")
    .then(() => registerVoronoi(canvas, section))
    .catch(() => console.error("voronoi: failed to load d3-delaunay"));

// <a> elements aren't built yet at this point so we delay adding the EventListeners until the window is loaded
window.addEventListener('load', () => {
    for (element of document.getElementsByTagName("a")) {
        element.addEventListener("mouseenter", (e) => {canvas.setAttribute("currentMouseColor", '#5a89e0')});
        element.addEventListener("mouseleave", (e) => {canvas.setAttribute("currentMouseColor", '#d899bf')});
    }
});
