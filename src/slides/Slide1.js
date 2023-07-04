import {useLayoutEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {MathJax} from "better-react-mathjax";

const dt = 100
const particles_per_dt = 10
const v = 1
const dead_time = 1000

const Simulation = () => {

    const canvas = useRef(null)
    const id = useRef(0)

    const [int1, setInt1] = useState(0)
    const [int2, setInt2] = useState(0)

    // Use Ref...
    const simState = useRef({
        photons: [],
        t: 0,
        E1: 0,
        E2: 0
    })

    useLayoutEffect(() => {
        canvas.current = d3.select('svg#vis-1');
        canvas.current.selectAll('*').remove()

        canvas.current.append('circle')
            .attr('r', 80)
            .attr('cx', 100)
            .attr('cy', 250)
            .attr('fill', 'yellow');

        const dx_1 = 400
        const dx_2 = 1400

        const l1 = 200
        const l2 = 100

        canvas.current.append('rect')
            .attr('height', l1)
            .attr('width', 15)
            .attr('x', 100+dx_1)
            .attr('y', 250-l1/2)
            .attr('fill', 'white')

        canvas.current.append('rect')
            .attr('height', l2)
            .attr('width', 15)
            .attr('x', 100+dx_2)
            .attr('y', 250-l2/2)
            .attr('fill', 'white')

        const particles = canvas.current.append('g')
            .attr("transform", "translate(100, 250)")

        const didIntersect = (x, dx, y, dy, det_x, det_l, t) => {
            if (t < dead_time) return false // let it reach steady state...
            if (x < det_x && det_x < x+dx) {
                const t = (det_x-x) / dx
                const y_inter = y+t*dy
                return (-det_l/2 <= y_inter && y_inter <= det_l/2)
            }
            return false
        }

        const interval = setInterval(() => {

            // Update particles
            simState.current.t += dt
            simState.current.photons = simState.current.photons
                .filter(p => p.active === 1)
                .map(p => {
                    // Crosses detector1?
                    if (didIntersect(p.x, p.dx*dt, p.y, p.dy*dt, dx_1, l1, simState.current.t)) {
                        simState.current.E1 += 1;
                    }

                    // Crosses detector2?
                    if (didIntersect(p.x, p.dx*dt, p.y, p.dy*dt, dx_2, l2, simState.current.t)) {
                        simState.current.E2 += 1;
                    }

                    // Update
                    p = {...p}
                    p.x += dt*p.dx
                    p.y += dt*p.dy

                    if (p.x >= 2000 || p.y >= 2000 || p.x <= -100 || p.y <= -1000) {
                        p.active = 0
                    }

                    return p
                })
            // Add new particles
            for (let i = 0; i < particles_per_dt; i++) {
                const theta = 50*(Math.random()-0.5) / 180 * 3.1415
                const ts = i / particles_per_dt * dt
                const dx = v*Math.cos(theta)
                const dy = v*Math.sin(theta)

                simState.current.photons.push({
                    x: dx*ts,
                    y: dy*ts,
                    dx,
                    dy,
                    active: 1,
                    id: id.current
                })
                id.current += 1
            }

            const energy_to_int = (E, x, l, t) => {
                return E*x / (l*t)
            }
            // console.log(
            //     energy_to_int(simState.current.E1, dx_1, l1, simState.current.t),
            //     energy_to_int(simState.current.E2, dx_2, l2, simState.current.t)
            // )
            if (simState.current.t > dead_time && simState.current.t % 1000 === 0) {
                setInt1(energy_to_int(simState.current.E1, dx_1, l1, simState.current.t-dead_time))
                setInt2(energy_to_int(simState.current.E2, dx_2, l2, simState.current.t-dead_time))
            }

            // Render
            const p = particles.selectAll('.photon')
                .data(simState.current.photons, d => d.id)
            p.enter()
                .append('circle')
                .attr('class', 'photon')
                .attr('r', 0)
                .attr('fill', 'white')
                .attr('id', d => d.id)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .merge(p)
                .transition()
                .duration(dt)
                .ease(d3.easeLinear)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', 5)

            p.exit()
                .remove()

            // console.log(simState.current.photons)

        }, dt)

        return () => clearInterval(interval)
    }, [])

    const round_n = (x, n) => {
        return (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n)
    }

    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-5xl pb-8">
                Specific Intensity: Free Propagation
            </h1>
            <div className="flex-1 flex pb-32 flex-col justify-between">
                <div className="w-1/2 mx-auto">
                    <svg id="vis-1" className="w-full" viewBox="0 0 1600 500" />
                </div>
                <div className="mt-16 text-3xl">
                    <MathJax>{"\\( I =  \\frac{E}{\\textup{d}\\Omega \\, \\textup{d} A \\, \\textup{d}t} \\)"}</MathJax>
                    <br/>
                    <MathJax dynamic>{`\\(I_1 = ${round_n(int1, 4)}\\)`}</MathJax>
                    <MathJax dynamic>{`\\(I_2 = ${round_n(int2, 4)}\\)`}</MathJax>
                </div>
            </div>
        </>
    )
}

const SpecificIntensity = () => {
    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-5xl pb-8">
                Specific Intensity
            </h1>
            <div className="flex-1 flex items-center justify-center text-3xl pb-60 flex-col">
                <div className="mb-8">
                    <MathJax>{"\\(\\epsilon_\\nu \\, \\textup{d}\\nu = I_\\nu \\, \\cos \\theta \\, \\textup{d}\\Omega \\, \\textup{d} A \\, \\textup{d}t  \\, \\textup{d}\\nu \\)"}</MathJax>
                </div>
                <div className="text-left">
                    <MathJax>{"\\(I_\\nu (\\vec{r}, \\vec{n}, t): \\) Specific intensity"}</MathJax>
                    <MathJax>{"\\( \\textup{d}\\Omega: \\) Solid angle element"}</MathJax>
                </div>
            </div>
        </>
    )
}


const Finding = () => {
    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-5xl pb-8">
                Specific Intensity: Free Propagation Finding
            </h1>
            <div className="flex-1 flex items-center justify-center text-3xl pb-60 flex-col">
                <div className="mb-8">
                    Specific intensity is conserved along a ray path
                </div>
                <div className="mb-8">
                    <MathJax>{"\\( \\frac{\\textup{d} I}{\\textup{d} s} = 0 \\)"}</MathJax>
                </div>
            </div>
        </>
    )
}


const Slide = ({step}) => {

    return (
        <div className="text-center text-white h-screen w-screen flex flex-col">
            {
                step === 0 && <SpecificIntensity />
            }
            {
                step === 1 && <Simulation />
            }
            {
                step === 2 && <Finding />
            }
        </div>
    );
}

Slide.steps = 3;

export default Slide;
