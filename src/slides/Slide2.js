import {useLayoutEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {MathJax} from "better-react-mathjax";
import Slider from "../Slider"

const dt = 100
const v = 1
const dead_time = 1000

const AtomFree = () => {

    const canvas = useRef(null)
    const id = useRef(0)

    const [int1, setInt1] = useState(0)
    const [int2, setInt2] = useState(0)

    // Use Ref...
    const [particles_per_dt, setParticles_per_dt] = useState(1)
    const [sigma, setSigma] = useState(50)
    const simState = useRef({
        photons: [],
        t: 0,
        E1: 0,
        E2: 0,
        sigma: 50,
        particles_per_dt: 1
    })

    useLayoutEffect(() => {
        canvas.current = d3.select('svg#vis-1');
        canvas.current.selectAll('*').remove()

        const dx_1 = 0
        const dx_2 = 1400

        const l1 = 400
        const l2 = 400

        canvas.current.append('circle')
            .attr('cx', 100+(dx_1+dx_2)/2)
            .attr('cy', 250)
            .attr('r', simState.current.sigma)
            .attr('fill', 'yellow')
            .attr('class', 'sigma')

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
            if (x <= det_x && det_x < x+dx) {
                const t = (det_x-x) / dx
                const y_inter = y+t*dy
                return (-det_l/2 <= y_inter && y_inter <= det_l/2)
            }
            return false
        }

        const shouldScatter = (p) => {
            if (p.e !== 1) return false
            const x = p.x - (dx_1+dx_2)/2
            const y = p.y
            const d = Math.sqrt(x*x+y*y)

            return d <= simState.current.sigma
        }

        const interval = setInterval(() => {

            // Update particles
            simState.current.t += dt
            simState.current.photons = simState.current.photons
                .filter(p => p.active === 1)
                .map(p => {
                    if (shouldScatter(p)) {
                        // const theta = 2*Math.random()*Math.PI
                        // p.dx = v*Math.cos(theta)
                        // p.dy = v*Math.sin(theta)
                        // p.e = 0
                        p.active = 0
                    }

                    // Crosses detector1?
                    if (didIntersect(p.x, p.dx*dt, p.y, p.dy*dt, dx_1, l1, simState.current.t)) {
                        simState.current.E1 += p.e;
                    }

                    // Crosses detector2?
                    if (didIntersect(p.x, p.dx*dt, p.y, p.dy*dt, dx_2, l2, simState.current.t)) {
                        simState.current.E2 += p.e;
                    }

                    // Update
                    p = {...p}
                    p.x += dt*p.dx
                    p.y += dt*p.dy

                    if (p.x >= 2000 || p.y >= 2000 || p.x <= -400 || p.y <= -1000) {
                        p.active = 0
                    }

                    return p
                })
            // Add new particles
            for (let i = 0; i < simState.current.particles_per_dt; i++) {
                const y = l1*(Math.random()-0.5)
                const ts = i / simState.current.particles_per_dt * dt
                const dx = v
                const dy = 0

                simState.current.photons.push({
                    x: dx*ts-100,
                    y,
                    dx,
                    dy,
                    active: 1,
                    id: id.current,
                    e: 1
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
            // console.log(simState.current.E1, simState.current.E2)
            if (simState.current.t > dead_time && simState.current.t % 1000 === 0) {
                setInt1(energy_to_int(simState.current.E1, 10000, l1, simState.current.t-dead_time))
                setInt2(energy_to_int(simState.current.E2, 10000, l2, simState.current.t-dead_time))
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
                .attr('r', d => d.active === 0 ? 0 : 5)
                .attr('fill', d => d.e === 1 ? 'white' : 'red')

            p.exit()
                .remove()

            canvas.current.select('.sigma')
                .attr('r', simState.current.sigma)

            // console.log(simState.current.photons)

        }, dt)

        return () => clearInterval(interval)
    }, [])

    const round_n = (x, n) => {
        return (Math.round(x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n)
    }

    const reset = () => {
        simState.current.t = 0
        simState.current.E1 = 0
        simState.current.E2 = 0
    }

    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-7xl pb-8">
                Absorption
            </h1>
            <div className="flex-1 flex flex-col justify-between pb-32">
                <svg id="vis-1" className="mx-auto w-11/12 max-w-screen-2xl" viewBox="0 0 1600 500" />
                <div className="text-4xl">
                    <MathJax>{`\\(I_1 = ${round_n(int1, 4)}\\)`}</MathJax>
                    <MathJax>{`\\(I_2 = ${round_n(int2, 4)}\\)`}</MathJax>
                    <MathJax>{`\\( \\frac{I_2}{I_1} = ${round_n(int2/int1, 4)}\\)`}</MathJax>
                    <Slider step={10} min={0} max={200} value={sigma} onChange={(e) => {
                        setSigma(e.target.value)
                        simState.current.sigma = e.target.value
                        reset()
                    }} name={`Absorption cross section = ${sigma}`} />
                    <Slider step={1} min={0} max={10} value={particles_per_dt} onChange={(e) => {
                        setParticles_per_dt(e.target.value)
                        simState.current.particles_per_dt = e.target.value
                        reset()
                    }} name={`Particle Density = ${particles_per_dt}`} />
                </div>
            </div>
        </>
    )
}

const Finding = () => {
    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-7xl pb-8">
                Absorption: Finding
            </h1>
            <div className="flex-1 flex items-center justify-center text-6xl pb-60 flex-col">
                <div className="mb-8">
                    <MathJax>{"\\( \\frac{\\textup{d} I(s)}{\\textup{d} s} = - \\alpha(s) I(s) \\)"}</MathJax><br/>
                    <MathJax>{"\\( \\alpha(s): \\) Absorption rate"}</MathJax>
                </div>
            </div>
        </>
    )
}


const Slide = ({step}) => {

    return (
        <div className="text-center text-white h-screen w-screen flex flex-col">
            {
                step === 0 && <AtomFree />
            }
            {
                step === 1 && <Finding />
            }
        </div>
    );
}

Slide.steps = 2;

export default Slide;
