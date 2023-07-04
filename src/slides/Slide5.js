import {MathJax} from "better-react-mathjax";

const Slide = ({step}) => {

    return (
        <div className="text-center text-white h-screen w-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center text-5xl pb-32 flex-col">
                <MathJax>{"\\( \\frac{\\textup{d}I(\\tau)}{\\textup{d}\\tau} = S(\\tau) -I(\\tau) \\)"}</MathJax>
            </div>
        </div>
    );
}

Slide.steps = 1;

export default Slide;
