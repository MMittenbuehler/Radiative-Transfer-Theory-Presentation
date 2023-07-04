import Slide0 from "./slides/Slide0";
import Slide1 from "./slides/Slide1";
import Slide2 from "./slides/Slide2";
import Slide3 from "./slides/Slide3";
import Slide4 from "./slides/Slide4";
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import React, {useCallback, useState} from "react";

const slides = [Slide0, Slide1, Slide2, Slide3, Slide4]

const Controller = ({onNext, onBack, slide, step}) => {
    return (
        <div className="absolute w-screen bottom-0 flex justify-between items-center p-4">
            <button onClick={onBack} className={(slide <= 0 && step <= 0) ? 'invisible' : ''}>
                <ArrowLeftIcon className="h-8 w-8 hover:text-white text-gray-400 transition duration-300" />
            </button>
            <span className={"text-white text-xl" + (slide > 0 ? '' : 'invisible')}>
                <span>Radiative Transfer Theory, Marcel Mittenbühler, Slide {slide+1}.{step+1}</span>
            </span>
            <button onClick={onNext} className={(slide >= slides.length-1 && step >= slides[slides.length-1].steps-1) ? 'invisible' : ''}>
                <ArrowRightIcon className="h-8 w-8 hover:text-white text-gray-400 transition duration-300" />
            </button>
        </div>
    )
}

const App = () => {

    const [slide, setSlide] = useState(0)
    const [step, setStep] = useState(0)

    const onBack = useCallback(() => {
        if (step === 0) {
            if (slide !== 0) {
                const nextSlide = slide-1
                setSlide(nextSlide)
                setStep(slides[nextSlide].steps-1)
            }
        } else {
            setStep(x => x-1)
        }
    }, [step, slide, setStep, setSlide])

    const onNext = useCallback(() => {
        if (slides[slide].steps <= step+1) {
            if (slide+1 < slides.length) {
                setSlide(slide+1)
                setStep(0)
            }
        } else {
            setStep(x => x+1)
        }
    }, [step, slide, setStep, setSlide])

    const handleKeydown = useCallback((e) => {
        if (e.keyCode === 37) onBack()
        if (e.keyCode === 39) onNext()
    }, [onNext, onBack])

    const SlideComponent = slides[slide]

  return (
    <div className="bg-black w-screen h-screen overflow-clip flex items-center justify-center" onKeyDown={handleKeydown} tabIndex={0}>
        <SlideComponent step={step} />
        <Controller onBack={onBack} onNext={onNext} slide={slide} step={step} />
    </div>
  );
}

export default App;
