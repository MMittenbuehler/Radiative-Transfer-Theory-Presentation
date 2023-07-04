import {useLayoutEffect, useRef} from "react";
import * as d3 from "d3";
import {MathJax} from "better-react-mathjax";

const dt = 100
const particles_per_dt = 1
const v = 1

const AtomFree = ({name, nSites}) => {

    const canvas = useRef(null)
    const id = useRef(0)

    // Use Ref...
    const simState = useRef({
        photons: [],
        t: 0
    })

    useLayoutEffect(() => {
        canvas.current = d3.select(`svg#${name}`);
        canvas.current.selectAll('*').remove()

        const dx_1 = 0
        const dx_2 = 1400

        const emissionRate = 0.1

        const l1 = 300
        const l2 = 300

        const sites = []
        const rSite = 10

        for (let i = 0; i < nSites; i++) {
            const x = dx_1+rSite + Math.random()*(dx_2-dx_1-2*rSite)
            const y = -l2/2 + Math.random()*(l2)
            sites.push({x, y})
        }

        canvas.current.selectAll('.sites')
            .data(sites)
            .enter()
            .append('circle')
                .attr('cx', d => d.x+100)
                .attr('cy', d => d.y+200)
                .attr('r', rSite)
                .attr('fill', 'yellow')

        canvas.current.append('rect')
            .attr('height', l1)
            .attr('width', 15)
            .attr('x', 100+dx_1)
            .attr('y', 200-l1/2)
            .attr('fill', 'white')

        canvas.current.append('rect')
            .attr('height', l2)
            .attr('width', 15)
            .attr('x', 100+dx_2)
            .attr('y', 200-l2/2)
            .attr('fill', 'white')

        const particles = canvas.current.append('g')
            .attr("transform", "translate(100, 200)")

        const shouldScatter = (p) => {

            let scatters = false
            sites.forEach(s => {
                // bounding box check: ToDo...

                // check intersection
                const a = (p.dx*dt)**2 + (p.dy*dt)**2
                const b = 2*((p.dx*dt)*(p.x-s.x)+(p.dy*dt)*(p.y-s.y))
                const c = s.x**2+s.y**2 + p.x**2+p.y**2 - 2*(s.x*p.x+s.y*p.y) - rSite
                if (b**2-4*a*c > 0) {
                    const tmp = Math.sqrt(b**2-4*a*c)
                    const u1 = (-b + tmp) / (2*a)
                    const u2 = (-b - tmp) / (2*a)

                    if (0 <= u1 && u1 <= 1) scatters = true
                    if (0 <= u2 && u2 <= 1) scatters = true
                }
            })

            return scatters
        }

        const interval = setInterval(() => {

            // Update particles
            simState.current.t += dt
            simState.current.photons = simState.current.photons
                .filter(p => p.active !== 0)
                .map(p => {
                    if (shouldScatter(p) && p.active === 1) {
                        // const theta = 2*Math.random()*Math.PI
                        // p.dx = v*Math.cos(theta)
                        // p.dy = v*Math.sin(theta)
                        // p.e = 0
                        p.active = 0
                    } else {
                        p.active = 1
                    }

                    // Update
                    p = {...p}
                    p.x += dt*p.dx
                    p.y += dt*p.dy

                    if (p.x >= 2000 || p.y >= 500 || p.x <= -100 || p.y <= -500) {
                        p.active = 0
                    }

                    return p
                })
            // Add new particles
            for (let i = 0; i < particles_per_dt; i++) {
                const y = l1*(Math.random()-0.5)
                const ts = i / particles_per_dt * dt
                const dx = v
                const dy = 0

                simState.current.photons.push({
                    x: dx*ts,
                    y,
                    dx,
                    dy,
                    active: 1,
                    id: id.current,
                    e: 1
                })
                id.current += 1
            }
            // Add new particles
            for (let i = 0; i < nSites; i++) {
                if (Math.random() <= emissionRate) {
                    const theta = Math.random()*2*Math.PI
                    const dx = v*Math.cos(theta)
                    const dy = v*Math.sin(theta)

                    simState.current.photons.push({
                        x: sites[i].x,
                        y: sites[i].y,
                        dx,
                        dy,
                        active: 2,
                        id: id.current,
                        e: 0
                    })
                    id.current += 1
                }
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
                .attr('fill', d => d.e === 1 ? 'white' : 'red')

            p.exit()
                .remove()

            // console.log(simState.current.photons)

        }, dt)

        return () => clearInterval(interval)
    }, [name, nSites])

    return (
        <svg id={name} className="mt-4 h-4/5 w-11/12 mx-auto" />
    )
}

const OpticalDepth = () => {
    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-7xl pb-8">
                Optical Depth
            </h1>
            <div className="flex-1 flex items-center justify-center text-6xl pb-60 flex-col">
                <div className="mb-8">
                    <MathJax>{"\\( \\textup{d}\\tau = \\alpha \\textup{d}s \\)"}</MathJax><br/>
                    <MathJax>{"\\( \\frac{\\textup{d}I(\\tau)}{\\textup{d}\\tau} = S(\\tau) -I(\\tau) \\)"}</MathJax><br/><br/>
                    <MathJax>{"\\( \\tau: \\) Optical depth"}</MathJax><br/>
                    <MathJax>{"\\( S = \\frac{j}{\\alpha}: \\) Source function"}</MathJax>
                </div>
            </div>
        </>
    )
}

const Fin = () => {
    return (
        <>
            <div className="flex-1 flex items-center justify-center text-6xl pb-60 flex-col">
                <MathJax>{"\\( \\frac{\\textup{d}I(\\tau)}{\\textup{d}\\tau} = S(\\tau) -I(\\tau) \\)"}</MathJax>
            </div>
        </>
    )
}

const Sim = () => {
    return (
        <>
            <h1 className="text-left pt-4 pl-8 text-7xl pb-8">
                Optical Depth: Example
            </h1>
            <div className="flex-1 flex items-center justify-center text-5xl pb-10 flex-col">
                <div className="mb-4 h-1/2 w-11/12">
                    <MathJax>{"\\( \\tau << 1 \\)"}</MathJax>
                    <AtomFree name="thin" nSites={5} />
                </div>
                <div className="h-1/2 w-11/12">
                    <MathJax>{"\\(\\tau >> 1 \\)"}</MathJax>
                    <AtomFree name="dense" nSites={200} />
                </div>
            </div>
        </>
    )
}


const Slide = ({step}) => {

    return (
        <div className="text-center text-white h-screen w-screen flex flex-col">
            {
                step === 0 && <OpticalDepth />
            }
            {
                step === 1 && <Sim />
            }
            {
                step === 2 && <Fin />
            }
        </div>
    );
}

Slide.steps = 3;

export default Slide;
