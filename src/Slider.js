
const Slider = ({name, value, onChange, min, max, step}) => {
    return (
        <div className="w-1/3 mx-auto mt-4">
            <label htmlFor="default-range" className="block text-xl font-medium text-white">{name}</label>
            <input id="default-range" value={value} onChange={onChange} min={min} max={max} step={step} type="range" className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer" />
        </div>
    )
}

export default Slider