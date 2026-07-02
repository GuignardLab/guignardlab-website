function registerVoronoi(canvas, section) {
    let mouseX = 0;
    let mouseY = 0;
    const gl = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl', { antialias: true });
    gl.getExtension('OES_standard_derivatives');
    function resize(){
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        gl.viewport(0,0,canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vertSrc = `
    attribute vec2 aPos;
    void main(){
    gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

    const MAX_PTS = 128;

    const fragSrc = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec2 uRes;
    uniform int uCount;
    uniform vec2 uPoints[${MAX_PTS}];
    uniform vec3 uColors[${MAX_PTS}];
    uniform vec2 iMouse;

    float dist2(vec2 a, vec2 b){
    vec2 d = a-b;
    return dot(d,d);
    }

    void main(){
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = vec2(uv.x * (uRes.x/uRes.y), uv.y);

    float best = 1e9;
    float second = 1e9;
    vec3 bestCol = uColors[0];
    for(int i=0;i<${MAX_PTS};i++){
        if(i>=uCount) break;
        vec2 q = uPoints[i];
        q.x *= (uRes.x/uRes.y);
        float d = dist2(p,q);
        if(d < best){
            second = best;
            best = d;
            bestCol = uColors[i];
        } else if(d < second){
            second = d;
        }
    }
    vec2 q = iMouse;
    q.x *= (uRes.x/uRes.y);
    float d = dist2(p,q);
    if(d < best){
        second = best;
        best = d;
        bestCol = vec3(0.85, 0.6, 0.75);
    } else if(d < second){
        second = d;
    }

    vec3 col = bestCol;

    float shade = clamp(1.0 - sqrt(best)*0.55, 0.35, 1.0);
    col *= shade;

    float edgeDist = sqrt(second) - sqrt(best);
    float pixelWidth = fwidth(edgeDist);
    float edgeMask = 1.0 - smoothstep(0.0, pixelWidth*1.6, edgeDist); 

    vec3 edgeCol = vec3(0.043, 0.051, 0.063);
    col = mix(col, edgeCol, edgeMask*0.5);

    float vig = smoothstep(1.2, 0.2, length(uv-0.5)*1.3);
    col *= mix(0.85,1.0,vig);

    gl_FragColor = vec4(col, 1.0);
    }`;

    function setMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = rect.height - (e.clientY - rect.top) - 1;  // bottom is 0 in WebGL
        mouseX = mouseX/rect.width;
        mouseY = mouseY/rect.height;
    }

    section.addEventListener('mousemove', setMousePosition);
    function compile(type, src){
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
            console.error(gl.getShaderInfoLog(sh));
        }
        return sh;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1,1,
    -1,1,   1,-1,   1,1
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uCount = gl.getUniformLocation(prog, 'uCount');
    const uPoints = gl.getUniformLocation(prog, 'uPoints');
    const uColors = gl.getUniformLocation(prog, 'uColors');
    const mouseLocation = gl.getUniformLocation(prog, "iMouse");

    // Claude's awful taste in colour (keeping it as a comment as a memento of shame)
    // const palette = ['#1c1f24','#3b2f2c','#7a3b2e','#c2522f','#ff5a36','#ffb24d'];

    const palette = ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff'];
    function hexToRgb(hex){
        const n = parseInt(hex.slice(1),16);
        return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
    }

    const COUNT = 128;
    function rand(a,b){ return a + Math.random()*(b-a); }

    const pts = [];
    for(let i=0;i<COUNT;i++){
    pts.push({
        x: rand(0,1.6),
        y: rand(0,1),
        vx: rand(-1,1)*0.025,
        vy: rand(-1,1)*0.025,
        cIdx: i % palette.length
    });
    }

    let t0 = performance.now(); // gets current time!
    const pointsBuf = new Float32Array(MAX_PTS*2);
    const colorsBuf = new Float32Array(MAX_PTS*3);

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

    function render(now){
        gl.uniform2f(mouseLocation, mouseX, mouseY); 

        const dt = Math.min(32, now - t0) / 300;
        t0 = now;
        step(dt);

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1i(uCount, pts.length);

        for(let i=0;i<pts.length;i++){
            pointsBuf[i*2] = pts[i].x;
            pointsBuf[i*2+1] = pts[i].y;
            const rgb = hexToRgb(palette[pts[i].cIdx]);
            colorsBuf[i*3] = rgb[0];
            colorsBuf[i*3+1] = rgb[1];
            colorsBuf[i*3+2] = rgb[2];
        }
        gl.uniform2fv(uPoints, pointsBuf);
        gl.uniform3fv(uColors, colorsBuf);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

var canvas = document.createElement('canvas');

canvas.className = "voronoi";
canvas.style = "display:block; width:-webkit-fill-available; height:-webkit-fill-available; opacity:33%; z-index:-1; position: absolute; left: 0; top: 0; filter: contrast(1.5)";
section = document.currentScript.parentElement; // for the current use of it, this will be the highlights section
section.insertBefore(canvas, section.children[0]);
registerVoronoi(canvas, section);
