// Hi everyone 👋
// I know you’re here to learn… or maybe just copy and paste my code into your website 😆
// Either way, I hope something here inspires you!
// Can’t wait to see what you create. If you think this code is sick 🤟, mention me on X or Instagram @thehafidyusuf
// Happy coding 🙂

$(document).ready(function () {


    /* ==================== Setup & Animation ==================== */

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    


    /* ==================== The Infinite Looping Text on a Hero Section  ==================== */

    let direction = 1; // 1 = forward, -1 = backward scroll

    const roll1 = roll(".rollingText, .mobileRollingText", {duration: 20}, true),
    scroll = ScrollTrigger.create({
        onUpdate(self) {
            if (self.direction !== direction) {
                direction *= -1;
                gsap.to(roll1, {timeScale: direction, overwrite: true});
            }
        }
    });

    // helper function that clones the targets, places them next to the original, then animates the xPercent in a loop to make it appear to roll across the screen in a seamless loop.
    function roll(targets, vars, reverse) {
    vars = vars || {};
    vars.ease || (vars.ease = "none");
    const tl = gsap.timeline({
        repeat: -1,
            onReverseComplete() { 
                this.totalTime(this.rawTime() + this.duration() * 10); // otherwise when the playhead gets back to the beginning, it'd stop. So push the playhead forward 10 iterations (it could be any number)
            }
        }), 
        elements = gsap.utils.toArray(targets),
        clones = elements.map(el => {
            let clone = el.cloneNode(true);
            el.parentNode.appendChild(clone);
            return clone;
        }),
        positionClones = () => elements.forEach((el, i) => gsap.set(clones[i], {position: "absolute", overwrite: false, top: el.offsetTop, left: el.offsetLeft + (reverse ? -el.offsetWidth : el.offsetWidth)}));
        positionClones();
        elements.forEach((el, i) => tl.to([el, clones[i]], {xPercent: reverse ? 100 : -100, ...vars}, 0));
        window.addEventListener("resize", () => {
            let time = tl.totalTime(); // record the current time
            tl.totalTime(0); // rewind and clear out the timeline
            positionClones(); // reposition
            tl.totalTime(time); // jump back to the proper time
        });
        return tl;
    }



    /* ==================== Work Cards Slider ==================== */

    let $cards = $(".work-card");
    let total = $cards.length;
    let current = 0;

    function animateCards() {
        $cards.each(function (i) {
            // Circular offset
            let offset = (i - current + total) % total;
            if (offset > total / 2) offset -= total;

            // Dynamic position & scaling
            let distance = Math.abs(offset);

            // spacing gets smaller for back cards
            let xPos = offset * 130; // base spacing
            if (distance > 1) {
                xPos = offset * 120; // narrower for back cards
            }

            // scale gets smaller for back cards
            let scale = 1 - distance * 0.15; // e.g. 1, 0.85, 0.7

            // Only show cards within distance 2 (center ±2)
            let visible = distance <= 2;

            gsap.to($(this), {
                x: xPos,
                scale: visible ? scale : 0.5,   // optional smaller scale when hidden
                opacity: visible ? 1 : 0,       // hide if too far back
                zIndex: visible ? total - distance : 0,
                duration: 0.6,
                ease: "power3.out",
            });

            // Animate text inside card
            const $text = $(this).find('.work-description, .work-detail-button'); // add a wrapper for all text inside
            gsap.to($text, {
                opacity: offset === 0 ? 1 : 0,       // only front card gets visible text
                duration: 0.4,
                ease: "power2.out"
            });
        });
    }

    // Init
    animateCards();

    $(".work-button-right").on("click", function () {
        current = (current + 1) % total;
        animateCards();
    });

    $(".work-button-left").on("click", function () {
        current = (current - 1 + total) % total;
        animateCards();
    });



    /* ==================== Testimonial Cards Slider ==================== */

    let testimonialCards = $(".testimonial");
    let testimonialTotal = testimonialCards.length;
    let testimonialCurrent = 0;

    function animateTestimonials() {
        testimonialCards.each(function (i) {

            // circular offset
            let offset = (i - testimonialCurrent + testimonialTotal) % testimonialTotal;

            // hide anything not in [0,1,2]
            if (offset > 2) {
                gsap.to($(this), {
                opacity: 0,
                x: 0,
                scale: 0.8,
                zIndex: 0,
                duration: 0.6,
                ease: "power3.out"
                });
                return;
            }

            // card in view
            let xPos = offset * 80;     // spacing to the right
            let scale = 1 - offset * 0.1;

            gsap.to($(this), {
                x: xPos,
                scale: scale,
                opacity: 1,
                zIndex: 10 - offset,
                duration: 0.6,
                ease: "power3.out"
            });
        });
    }

    // init
    animateTestimonials();

    $(".testimonial-button-right").on("click", function () {
        testimonialCurrent = (testimonialCurrent + 1) % testimonialTotal;
        animateTestimonials();
    });

    $(".testimonial-button-left").on("click", function () {
        testimonialCurrent = (testimonialCurrent - 1 + testimonialTotal) % testimonialTotal;
        animateTestimonials();
    });



    /* ==================== Circle Overlap Animation ==================== */
    
    function intersectTwoEqualCircles(cx0, cy0, cx1, cy1, r) {
        const dx = cx1 - cx0, dy = cy1 - cy0;
        const d = Math.hypot(dx, dy);
        if (d === 0 || d >= 2*r) return null; // no intersection (or infinite)
        const a = d/2.0;                      // for equal radii
        const h = Math.sqrt(Math.max(0, r*r - a*a));
        const xm = cx0 + (a * dx / d);
        const ym = cy0 + (a * dy / d);
        const rx = -dy * (h / d);
        const ry = dx * (h / d);

        const p1 = { x: xm + rx, y: ym + ry };
        const p2 = { x: xm - rx, y: ym - ry };
        return [p1, p2];
    }

    /** arc sweep flag: choose arc direction for arc on circle centered at `c`
     *  from pStart -> pEnd (returns 0 or 1)
     *  We'll choose the smaller arc (large-arc-flag = 0) and pick sweep based on signed delta angle.
     */
    function arcSweepFlag(circleCenter, pStart, pEnd) {
        const a1 = Math.atan2(pStart.y - circleCenter.y, pStart.x - circleCenter.x);
        const a2 = Math.atan2(pEnd.y - circleCenter.y, pEnd.x - circleCenter.x);
        let delta = a2 - a1;
        while (delta <= -Math.PI) delta += 2*Math.PI;
        while (delta > Math.PI) delta -= 2*Math.PI;
        // if delta positive, sweep=1 (ccw), otherwise 0
        return (delta > 0) ? 1 : 0;
    }

    /** build lens path (two arcs) between circleA and circleB (equal radii).
     *  Returns an SVG path d string, or empty string if no intersection.
     */
    function lensPath(circleA, circleB, r) {
        const pts = intersectTwoEqualCircles(circleA.x, circleA.y, circleB.x, circleB.y, r);
        if (!pts) return "";
        const p1 = pts[0], p2 = pts[1];
        const sweep1 = arcSweepFlag(circleA, p1, p2);
        const sweep2 = arcSweepFlag(circleB, p2, p1);
        // Use small-arc (large-arc-flag = 0)
        return `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} ` +
            `A ${r} ${r} 0 0 ${sweep1} ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} ` +
            `A ${r} ${r} 0 0 ${sweep2} ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} Z`;
    }

    /** triple intersection (curvy triangular area). 
     *  Returns d string or empty string if triple doesn't exist.
     */
    function triplePath(c1, c2, c3, r) {
        // get intersection points (2 each), pick the one that lies closest to centroid
        const pts12 = intersectTwoEqualCircles(c1.x,c1.y,c2.x,c2.y,r);
        const pts23 = intersectTwoEqualCircles(c2.x,c2.y,c3.x,c3.y,r);
        const pts13 = intersectTwoEqualCircles(c1.x,c1.y,c3.x,c3.y,r);
        if (!pts12 || !pts23 || !pts13) return "";

        const centroid = {
            x: (c1.x + c2.x + c3.x)/3,
            y: (c1.y + c2.y + c3.y)/3
    };

    // choose the intersection point from each pair that is closest to centroid
    function choose(pts) {
            const d0 = Math.hypot(pts[0].x - centroid.x, pts[0].y - centroid.y);
            const d1 = Math.hypot(pts[1].x - centroid.x, pts[1].y - centroid.y);
            return d0 < d1 ? pts[0] : pts[1];
    }
    const p12 = choose(pts12);
    const p23 = choose(pts23);
    const p13 = choose(pts13);

    // order these three points around the centroid (clockwise)
    const arr = [
            {name:'12', p: p12},
            {name:'23', p: p23},
            {name:'13', p: p13}
    ];
    arr.sort((A,B) => {
            const aAng = Math.atan2(A.p.y - centroid.y, A.p.x - centroid.x);
            const bAng = Math.atan2(B.p.y - centroid.y, B.p.x - centroid.x);
            return aAng - bAng;
    });

    // for each segment between consecutive points pick which circle's arc contains both intersection points
    // mapping: segment between p12 and p23 -> common circle is c2, between p23 and p13 -> common circle c3, etc.
    // We'll compute common center for each pair by finding which circle's distance to both points is ~r.
    function commonCenterForTwoPoints(pa, pb) {
        const d1 = Math.abs(Math.hypot(pa.x - c1.x, pa.y - c1.y) - r) < 1e-6 &&
                Math.abs(Math.hypot(pb.x - c1.x, pb.y - c1.y) - r) < 1e-6 ? c1 : null;
        const d2 = Math.abs(Math.hypot(pa.x - c2.x, pa.y - c2.y) - r) < 1e-6 &&
                Math.abs(Math.hypot(pb.x - c2.x, pb.y - c2.y) - r) < 1e-6 ? c2 : null;
        const d3 = Math.abs(Math.hypot(pa.x - c3.x, pa.y - c3.y) - r) < 1e-6 &&
                Math.abs(Math.hypot(pb.x - c3.x, pb.y - c3.y) - r) < 1e-6 ? c3 : null;
        return d1 || d2 || d3;
    }

    // Build path by arcs: start at arr[0].p, arc on its common center to arr[1].p, arc on next center to arr[2].p, arc on next center back to arr[0].p
    const pA = arr[0].p, pB = arr[1].p, pC = arr[2].p;

    // find centers for each arc
    const centerAB = commonCenterForTwoPoints(pA,pB);
    const centerBC = commonCenterForTwoPoints(pB,pC);
    const centerCA = commonCenterForTwoPoints(pC,pA);

    if (!centerAB || !centerBC || !centerCA) return ""; // safety

    const sweepAB = arcSweepFlag(centerAB, pA, pB);
    const sweepBC = arcSweepFlag(centerBC, pB, pC);
    const sweepCA = arcSweepFlag(centerCA, pC, pA);

    // build curved triangular path
    const d =
            `M ${pA.x.toFixed(3)} ${pA.y.toFixed(3)} ` +
            `A ${r} ${r} 0 0 ${sweepAB} ${pB.x.toFixed(3)} ${pB.y.toFixed(3)} ` +
            `A ${r} ${r} 0 0 ${sweepBC} ${pC.x.toFixed(3)} ${pC.y.toFixed(3)} ` +
            `A ${r} ${r} 0 0 ${sweepCA} ${pA.x.toFixed(3)} ${pA.y.toFixed(3)} Z`;

    return d;
    }



    /* ==================== Main Three Circles Interaction ==================== */
    (function () {
        // element refs (keep these)
        const c1el = document.getElementById('c1');
        const c2el = document.getElementById('c2');
        const c3el = document.getElementById('c3');

        const pair12 = document.getElementById('pair12');
        const pair23 = document.getElementById('pair23');
        const pair13 = document.getElementById('pair13');
        const triple = document.getElementById('triple');

        // remember original radius from markup (fallback to 300)
        const originalR = parseFloat(c1el.getAttribute('r')) || 300;

        // dynamic radius: 200 on mobile, otherwise original
        function getRadius() {
        return window.innerWidth < 1000 ? 240 : originalR;
        }

        // helper to detect mobile breakpoint
        function isMobile() {
            return window.innerWidth < 1000;
        }

        // final positions (where circles should end up when overlapped)
        function getFinalPositions() {
            if (isMobile()) {
                // mobile vertical stack (tweak the numbers if your svg viewBox is different)
                return {
                    c1: { cx: 240, cy: window.innerHeight * 0.3 },
                    c2: { cx: 560, cy: window.innerHeight * 0.3 },
                    c3: { cx: 400, cy: window.innerHeight * 0.3 + 260 }
                };
            } else {
                // desktop triangle / horizontal arrangement
                return {
                    c1: { cx: 310, cy: 0 },
                    c2: { cx: 490, cy: 0 },
                    c3: { cx: 400, cy: 155 }
                };
            }
        }

        // read current circle positions (as floats)
        function readPos(el) {
            return { x: parseFloat(el.getAttribute('cx')), y: parseFloat(el.getAttribute('cy')) };
        }

        // compute/set overlay paths & opacities
        function updateOverlays() {
            // compute current radius for geometry
            const r = getRadius();
            // ensure the SVG circles actually use this radius (so visuals + geometry match)
            [c1el, c2el, c3el].forEach(el => el.setAttribute('r', r));
            // if you have stroke-only circle duplicates (e.g. #c1-stroke), update them too:
            ["#c1-stroke", "#c2-stroke", "#c3-stroke"].forEach(id => {
                const el = document.getElementById(id.replace("#",""));
                if (el) el.setAttribute('r', r - 1);
            });

            const c1 = readPos(c1el), c2 = readPos(c2el), c3 = readPos(c3el);

            const d12 = lensPath(c1, c2, r);
            const d23 = lensPath(c2, c3, r);
            const d13 = lensPath(c1, c3, r);
            const dTriple = triplePath(c1, c2, c3, r);

            pair12.setAttribute('d', d12 || '');
            pair23.setAttribute('d', d23 || '');
            pair13.setAttribute('d', d13 || '');
            triple.setAttribute('d', dTriple || '');

            gsap.to(pair12, { duration: 0.15, opacity: d12 ? 1 : 0 });
            gsap.to(pair23, { duration: 0.15, opacity: d23 ? 1 : 0 });
            gsap.to(pair13, { duration: 0.15, opacity: d13 ? 1 : 0 });
            gsap.to(triple,  { duration: 0.15, opacity: dTriple ? 1 : 0 });
        }

        // compute sensible starting positions (separated) based on final positions
        function setInitialPositions() {
            const final = getFinalPositions();

            if (isMobile()) {
                // start separated vertically (above / below) so they'll stack into place
                gsap.set(["#c1", "#c1-stroke"], { attr: { cx: 400, cy: 0 } });
                gsap.set("#c1-label", { attr: { x: 400, y: 0, "font-size": 32 } });

                gsap.set(["#c2", "#c2-stroke"], { attr: { cx: 400, cy: 550} });
                gsap.set("#c2-label", { attr: { x: 400, y: 550, "font-size": 32 } });

                gsap.set(["#c3", "#c3-stroke"], { attr: { cx: 400, cy: 1100 } });
                gsap.set("#c3-label", { attr: { x:400, y: 1100, "font-size": 32 } });

                gsap.set("#thelogo-fill, #thelogo", { attr: { "transform": "translate(366," + (window.innerHeight * 0.3 + 48) + ") scale(3)" } });
            } else {
                // desktop: start widely separated horizontally so they slide to overlap
                gsap.set(["#c1", "#c1-stroke"], { attr: { cx: 80, cy: 0 } });
                gsap.set("#c1-label", { attr: { x: 80, y: 0, "font-size": 18 } });

                gsap.set(["#c2", "#c2-stroke"], { attr: { cx: 400, cy: 0 } });
                gsap.set("#c2-label", { attr: { x: 400, y: 0, "font-size": 18 } });

                gsap.set(["#c3", "#c3-stroke"], { attr: { cx: 720, cy: 0 } });
                gsap.set("#c3-label", { attr: { x: 720, y: 0, "font-size": 18 } });

                gsap.set("#thelogo-fill, #thelogo", { attr: { "transform": "translate(383,38) scale(1.5)" } });
            }

            // refresh overlays to reflect the new initial state
            updateOverlays();
        }

        // timeline handle
        let tl = null;

        // build or rebuild timeline (safe to call on resize)
        function buildTimeline() {
            // kill old
            if (tl) {
                try { tl.scrollTrigger && tl.scrollTrigger.kill(); } catch(e) {}
                try { tl.kill(); } catch(e) {}
                tl = null;
            }

            // prepare logo stroke lengths fresh
            gsap.utils.toArray("#thelogo path").forEach(path => {
                try {
                    const length = path.getTotalLength();
                    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                } catch(e) { /* ignore if path not ready */ }
            });

            const final = getFinalPositions();

            // create timeline - animate from current (initial) state to final state
            tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-section",
                    start: "top top",
                    end: "+=2000",
                    scrub: 0.6,
                    pin: true
                },
                onUpdate: updateOverlays
            });

            // animate circles/labels to final positions (these are the primary tweens)
            tl.to("#c1, #c1-stroke", { duration: 1, attr: { cx: final.c1.cx, cy: final.c1.cy }, ease: "power2.inOut" }, 0);
            tl.to("#c1-label",         { duration: 1, attr: { x: final.c1.cx - 40, y: final.c1.cy }, ease: "power2.inOut" }, 0);

            tl.to("#c2, #c2-stroke", { duration: 1, attr: { cx: final.c2.cx, cy: final.c2.cy }, ease: "power2.inOut" }, 0);
            tl.to("#c2-label",         { duration: 1, attr: { x: final.c2.cx + 40, y: final.c2.cy }, ease: "power2.inOut" }, 0);

            tl.to("#c3, #c3-stroke", { duration: 1, attr: { cx: final.c3.cx, cy: final.c3.cy }, ease: "power2.inOut" }, 0);
            tl.to("#c3-label",         { duration: 1, attr: { x: final.c3.cx, y: final.c3.cy + 40 }, ease: "power2.inOut" }, 0);

            // logo draw (timed slightly after the circle move begins)
            tl.addLabel("logoStart", 0.9);
            tl.to("#thelogo path", { strokeDashoffset: 0, duration: 1, stagger: 0.3, ease: "power2.inOut" }, "logoStart");
            tl.to("#thelogo-fill", { opacity: 1, duration: 0.5 }, "logoStart+=1.5");

            // ensure overlays are correct immediately and on timeline updates
            updateOverlays();
            tl.eventCallback("onUpdate", updateOverlays);
        }

        // initial boot sequence after window load (ensures layout & viewport are accurate)
        window.addEventListener("load", () => {
            setInitialPositions();
            buildTimeline();
        });

        // rebuild on resize / orientation with debounce
        let to;
        window.addEventListener("resize", () => {
            clearTimeout(to);
            to = setTimeout(() => {
                // Kill ONLY this timeline’s ScrollTrigger
                if (tl && tl.scrollTrigger) {
                    tl.scrollTrigger.kill();
                }
                if (tl) {
                    tl.kill();
                    tl = null;
                }

                // Rebuild this animation with the new viewport size
                setInitialPositions();
                buildTimeline();

                // Refresh to recalc scroll distances
                if (window.ScrollTrigger) {
                    ScrollTrigger.refresh();
                }
            }, 150);
        });
    })();


    /* ==================== The Rotating Gear Behind My Portrait ==================== */

    gsap.set(".big-gear", { xPercent: -50, yPercent: -42 });
    gsap.set(".small-gear", { xPercent: -50, yPercent: -40 });

    ScrollTrigger.create({
        trigger: ".values",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate(self) {
            const progress = self.progress; // 0 (top) → 1 (bottom)

            // map scroll progress to rotation
            const smallRotation = progress * 60; // clockwise when scrolling down
            const bigRotation   = -progress * 60; // counterclockwise when scrolling down

            gsap.set(".small-gear", {
                rotation: smallRotation,
                transformOrigin: "50% 50%"
            });
            gsap.set(".big-gear", {
                rotation: bigRotation,
                transformOrigin: "50% 50%"
            });
        }
    });



    /* ==================== Smooth Scroll ==================== */

    ScrollSmoother.create({
        smooth: 2, // how long (in seconds) it takes to "catch up" to the native scroll position
        effects: true, // looks for data-speed and data-lag attributes on elements
        smoothTouch: 0.3, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });



    ScrollTrigger.create({
        trigger: ".statement",
        start: "top bottom",     // when top of .statement hits center of viewport
        end: "bottom top",    // until bottom of .statement hits center
        
        onEnter: () => gsap.to("body", { backgroundColor: "#0062FF", color: "white", duration: 0.5 }),
        onLeave: () => gsap.to("body", { backgroundColor: "white", color: "#2A2B2C", duration: 0.5 }),
        onEnterBack: () => gsap.to("body", { backgroundColor: "#0062FF", color: "white", duration: 0.5 }),
        onLeaveBack: () => gsap.to("body", { backgroundColor: "white", color: "#2A2B2C", duration: 0.5 })
    });

    ScrollTrigger.create({
        trigger: ".statement",
        start: "top bottom",     // when top of .statement hits center of viewport
        endTrigger: ".values",
        end: "bottom top",    // until bottom of .statement hits center
        onEnter: () => {
            gsap.to("nav svg .nav-logo-icon, nav svg .nav-logo-text", { attr: {fill: "white"}});
            gsap.to("nav .button, .menu-button", { backgroundColor: "white", color: "#2A2B2C"});
            gsap.to(".menu-button svg path, .button svg path", {attr: { "stroke": "#2A2B2C" }});
        },
        onLeave: () => {
            gsap.to("nav svg .nav-logo-icon", { attr: {fill: "#0062FF"}});
            gsap.to("nav svg .nav-logo-text", { attr: {fill: "#2A2B2C"}});
            gsap.to("nav .button, .menu-button", { backgroundColor: "#2A2B2C", color: "white"});
            gsap.to(".menu-button svg path, .button svg path", {attr: { "stroke": "white" }});
        },
        onEnterBack: () => {
            gsap.to("nav svg .nav-logo-icon, nav svg .nav-logo-text", { attr: {fill: "white"}});
            gsap.to("nav .button, .menu-button", { backgroundColor: "white", color: "#2A2B2C"});
            gsap.to(".menu-button svg path, .button svg path", {attr: { "stroke": "#2A2B2C" }});
        },
        onLeaveBack: () => {
            gsap.to("nav svg .nav-logo-icon", { attr: {fill: "#0062FF"}});
            gsap.to("nav svg .nav-logo-text", { attr: {fill: "#2A2B2C"}});
            gsap.to("nav .button, .menu-button", { backgroundColor: "#2A2B2C", color: "white"});
            gsap.to(".menu-button svg path, .button svg path", {attr: { "stroke": "white" }});
        }
    });



    /* ==================== Dropping Icons With Matter.js | Shoutout to Liam ==================== */

    let engine, render, runner, world;
    let started = false;

    // Function to start Matter.js
    function initPhysics() {
        if (started) return; // only run once
        started = true;

        const { Engine, Render, Runner, Bodies, Composite } = Matter;

        engine = Engine.create();
        world = engine.world;

        const container = $(".dropping-icons");
        const width = container.width();
        const height = container.height();

        // attach renderer to .dropping-icons div
        render = Render.create({
            element: container[0],
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: "transparent"
            }
        });
        Render.run(render);

        runner = Runner.create();
        Runner.run(runner, engine);

        // --- Invisible boundaries ---
        const thickness = 40; // wall/ground thickness

        const ground = Bodies.rectangle(
            width / 2,
            height + thickness / 2,
            width,
            thickness,
            { isStatic: true, render: { visible: false } }
        );

        const leftWall = Bodies.rectangle(
            -thickness / 2,
            height / 2,
            thickness,
            height,
            { isStatic: true, render: { visible: false } }
        );

        const rightWall = Bodies.rectangle(
            width + thickness / 2,
            height / 2,
            thickness,
            height,
            { isStatic: true, render: { visible: false } }
        );

        Composite.add(world, [ground, leftWall, rightWall]);

        // --- Load icons (using hidden <img> tags as sources) ---
        $(".icon").each(function (i, el) {
            const img = el.src;

            const body = Bodies.rectangle( Math.random() * width,
            -100 - i * 50,
            90, // body width
            90, // body height
            {
                restitution: 0.5,
                render: {
                sprite: {
                    texture: img,
                    xScale: 1.2, // scale image down
                    yScale: 1.2
                }
                }
            }
            );
            Composite.add(world, body);
        });
    }

    // ScrollTrigger to start when .dropping-icons hits center
    ScrollTrigger.create({
        trigger: ".dropping-icons",
        start: "top center",
        once: true,
        onEnter: initPhysics
    });



    /* ==================== Simple Shrinking Semicircle Interaction | Shoutout to Dennis Snellenberg ==================== */

    gsap.utils.toArray(".semicircle").forEach((section, i) => {
        gsap.fromTo(section,{scaleY: 1}, {
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                scrub: true
            },
            scaleY: 0,
            ease: "none"
        });
    });



    /* ==================== Each Letter Showing While User Scrolls Interaction ==================== */

    const split = new SplitText(".statement h3", { type: "chars, words" });

    gsap.set(split.chars, { opacity: 0.3 });

    gsap.to(split.chars, {
        opacity: 1,
        stagger: .1,
        ease: "none",// no easing so progress == scroll
        scrollTrigger: {
            trigger: ".statement",
            start: "top center+=10%",
            end: "+=600",// length of scroll mapping; increase to stretch the reveal
            scrub: true,// <- IMPORTANT: ties animation exactly to scroll (no inertia)
            // markers: true
        }
    });



    /* ==================== Meme, hihi ==================== */

    function toggleGif() {
        $('.tenor-gif-embed').toggleClass('gif-shows');
    }

    function bindStatementInteraction() {
        const isMobile = window.innerWidth < 1000;

        // Remove existing handlers to avoid duplicates
        $('.statement p, .you-soon').off('mouseenter mouseleave click');

        if (isMobile) {
            $('.statement p, .you-soon').on('click', function (e) {
                e.preventDefault();
                toggleGif();
            });
        } else {
            $('.statement p, .you-soon').hover(
                function () {
                    toggleGif();
                },
                function () {
                    toggleGif();
                }
            );
        }
    }

    // Initial bind
    bindStatementInteraction();

    // Rebind on resize
    $(window).on('resize', function () {
        bindStatementInteraction();
    });



    /* ==================== Footer ==================== */
    
    gsap.set(".footer-wrapper", {yPercent: -20});
    gsap.to(".footer-wrapper", {
        yPercent: 1, // negative value moves it upward slower
        ease: "none",
        scrollTrigger: {
            trigger: ".footer",
            start: "top bottom", // when footer enters viewport
            end: "bottom bottom", // until fully visible
            scrub: true // tie animation to scroll
        }
    });


    $(".menu-button, .navigation-links a").on("click", function() {
        $(".menu-button").toggleClass("menu-button-selected");
        $(".navigation").toggleClass("navigation-opened");
    });

    let menuOpen = false; // track state

    function getMargins() {
        const width = window.innerWidth;
        if (width < 1000) {
            return { open: "2%", closed: "5.1%" };
        } else if (width < 1200) {
            return { open: "16px", closed: "41px" };
        } else {
            return { open: "76px", closed: "101px" };
        }
    }

    function setInitialState() {
        const { closed } = getMargins();
        gsap.set(".navigation", {
            height: 46,
            width: 46,
            marginTop: "29px",
            marginRight: closed,
            padding: 0
        });
        gsap.set(".nav-overlay", { autoAlpha: 0 });
        gsap.set(".navigation-links a", { autoAlpha: 0, y: -20 });
        gsap.set([".navigation-contact p", ".the-link"], { autoAlpha: 0, y: -20 });
    }

    setInitialState();

    $(".menu-button, .navigation-links a").on("click", function () {
        const { open, closed } = getMargins();

        if (!menuOpen) {
            // open menu
            gsap.to(".navigation", {
                duration: .8,
                height: "calc(100vh - 68px)",
                width: "360px",
                marginTop: "32px",
                marginRight: open,
                ease: "power3.out",
                padding: 32
            });
            gsap.to(".navigation-links a", {
                autoAlpha: 1,
                y: 0,
                stagger: .1
            });
            gsap.to([".navigation-contact p", ".the-link"], {
                delay: .6,
                autoAlpha: 1,
                y: 0,
                stagger: .1
            });
            gsap.to(".nav-overlay", {
                autoAlpha: 1,
                duration: .8,
                ease: "power3.out"
            });
        } else {
            // close menu
            gsap.to(".navigation", {
                delay: .2,
                duration: 0.6,
                height: 46,
                width: 46,
                marginTop: "29px",
                marginRight: closed,
                ease: "power3.in",
                padding: 0
            });
            gsap.to(".navigation-links a", {
                autoAlpha: 0,
                y: -20,
                duration: 0.1,
                stagger: -.08
            });
            gsap.to([".navigation-contact p", ".the-link"], {
                autoAlpha: 0,
                duration: 0.1,
                y: -20,
                stagger: -.1
            });
            gsap.to(".nav-overlay", {
                delay: 1,
                autoAlpha: 0,
                duration: .2,
                ease: "power3.in"
            });
        }

        menuOpen = !menuOpen;
    });

    // Update margin dynamically on resize
    window.addEventListener("resize", () => {
        const { open, closed } = getMargins();
        const newMargin = menuOpen ? open : closed;

        gsap.to(".navigation", {
            marginRight: newMargin,
            duration: 0.3,
            ease: "power1.out"
        });
    });



    gsap.set(".detail-work", {
        opacity: 0,
        scale: .9,
        marginTop: "200px"
    });
    gsap.set(".detail-work-overlay", {
        autoAlpha: 0,
    });
    gsap.set(".close-detail-work", {
        autoAlpha: 0,
        marginTop: "100px"
    });

    $(".work-detail-button").on("click", function () {
        const target = $(this).data("target");
        if (!$(target).length) return;
        gsap.to(target, {
            duration: .8,
            opacity: 1,
            scale: 1,
            marginTop: "0px",
            zIndex: 10,
            ease: "power3.out"
        });
        gsap.to (".detail-work-overlay", {
            delay: 0,
            autoAlpha: 1,
            duration: .8,
            ease: "power1.out"
        });
        gsap.to (".close-detail-work", {
            delay: .4,
            autoAlpha: 1,
            marginTop: "0px",
            duration: .8,
            ease: "power1.out"
        })
    })

    $(".close-detail-work").on("click", function () {
        gsap.to(".detail-work", {
            duration: 0.6,
            opacity: 0,
            scale: .9,
            marginTop: "200px",
            zIndex: 0,
            ease: "power3.in"
        });
        gsap.to (".detail-work-overlay", {
            delay: 0.4,
            autoAlpha: 0,
            duration: .2,
            ease: "power1.out"
        });
        gsap.to (".close-detail-work", {
            autoAlpha: 0,
            marginTop: "100px"
        })
    })

});

gsap.registerPlugin(ScrollTrigger, SplitText);

// Select all headlines
const headlines = gsap.utils.toArray("h2, .headline p, .left-headline p");

headlines.forEach(headline => {
  // Split each headline into chars
  const split = new SplitText(headline, { type: "chars, words" });

  // Set starting state
  gsap.set(split.chars, {
    y: 8,
    autoAlpha: 0
  });

  // Create animation for each headline
  gsap.to(split.chars, {
    y: 0,
    autoAlpha: 1,
    duration: 1,
    ease: "power3.out",
    stagger: 0.02,
    scrollTrigger: {
      trigger: headline,
      start: "top 80%",
      once: true // play once when it enters the viewport
    }
  });
});

// Set starting state
gsap.set(".value", {
    scale: 1.2,
    filter: "blur(10px)",
    autoAlpha: 0
});

// Create animation for each headline
gsap.to(".value", {
    scale: 1,
    filter: "blur(0px)",
    autoAlpha: 1,
    duration: 1,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".values-container",
        start: "bottom bottom",
        once: true // play once when it enters the viewport
    }
});

// Set starting state
gsap.set(".clients-logos div", {
    scale: 1.2,
    filter: "blur(10px)",
    autoAlpha: 0
});

// Create animation for each headline
gsap.to(".clients-logos div", {
    scale: 1,
    filter: "blur(0px)",
    autoAlpha: 1,
    duration: 1,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".clients-logos",
        start: "bottom bottom",
        once: true // play once when it enters the viewport
    }
});


// Set initial states for all buttons
gsap.set(".button svg .second-arrow", { y: 24, x: -24 });
gsap.set(".button svg .first-arrow", { y: 0, x: 0 });

$(".button").hover(
  function () {
    const arrow1 = $(this).find("svg .first-arrow");
    const arrow2 = $(this).find("svg .second-arrow");

    gsap.to(arrow2, {
      background: "white",
      y: 0,
      x: 0,
      ease: "power3.out"
    });

    gsap.to(arrow1, {
      background: "white",
      y: -24,
      x: 24,
      ease: "power3.out"
    });
  },
  function () {
    const arrow1 = $(this).find("svg .first-arrow");
    const arrow2 = $(this).find("svg .second-arrow");

    gsap.to(arrow2, {
      background: "black",
      y: 24,
      x: -24,
      ease: "power3.out"
    });

    gsap.to(arrow1, {
      background: "black",
      y: 0,
      x: 0,
      ease: "power3.out"
    });
  }
);

gsap.registerPlugin(ScrollToPlugin);
$(".navigation-links a").on("click", function (e) {
    e.preventDefault();

    const target = $(this).data("scroll");

    gsap.to(window, {
        duration: 1,
        scrollTo: {
            y: target,
            offsetY: 80
        },
        ease: "power3.out"
    });

});


// =========== Preloader ========= //
// ----------------------------------
// STATE
// ----------------------------------
let shouldFinish = false;
let isFinishing = false;

// ----------------------------------
// SETUP
// ----------------------------------
const paths = gsap.utils.toArray("#thelogopreloader path");

paths.forEach(path => {
  const length = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length
  });
});

gsap.set("#thelogopreloader", {
    opacity: 1,
    x: 80
});
gsap.set("#thenamepreloader", {
    opacity: 0,
    x: 60
});

// ----------------------------------
// STROKE LOOP
// ----------------------------------
const strokeTl = gsap.timeline({
  repeat: -1,
  defaults: { ease: "none" }
});

strokeTl.to(paths, {
  strokeDashoffset: 0,
  duration: 1.2,
  stagger: 0.1,
  onComplete: () => {
    if (shouldFinish && !isFinishing) {
      isFinishing = true;
      strokeTl.pause();
      revealFinal();
    }
  }
});

strokeTl.to(paths, {
  strokeDashoffset: (i, el) => -el.getTotalLength(),
  duration: 1.2,
  stagger: 0.1
});

window.addEventListener("load", () => {
  shouldFinish = true;
});

// ----------------------------------
// FINAL REVEAL
// ----------------------------------
function revealFinal() {
  gsap.timeline()
    .to("#thelogopreloader", {
      duration: 0.6,
      x: 0,
      ease: "power2.out"
    })
    .to("#thelogopreloader path", {
      fill: "#0062FF",
      duration: 0.6,
      ease: "power2.out"
    })
    .to("#thenamepreloader", {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
    .to("#preloader", {
      y: -60,
      height: 60,
      delay: .5,
      duration: 0.6,
      ease: "power2.inOut"
    });
}




    const $modal = $(".youtube-popup");
    const $iframe = $(".youtube-popup iframe");

    const openVideo = () => {
      $iframe.attr(
        "src",
        "https://www.youtube.com/embed/IubSm7jzuE0?si=M3phOeDWv7iXuq7k"
      );

      gsap.to($modal, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.3
      });

      gsap.to($iframe, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const closeVideo = () => {
      gsap.to($modal, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.25
      });

      gsap.to($iframe, {
        scale: 0.9,
        duration: 0.25,
        onComplete: () => {
          $iframe.attr("src", "");
        }
      });
    };

    $(".video-thumbnail, .video-thumbnail-mobile").on("click", openVideo);
    $(".close-youtube").on("click", closeVideo);

    // click outside to close
    $modal.on("click", function (e) {
      if (e.target === this) closeVideo();
    });