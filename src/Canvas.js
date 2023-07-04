import * as d3 from 'd3';

const defaultOptions = {
    background: 'rgb(225, 225, 225)',
    borderWidth: 1,
    borderColor: 'rgb(200, 200, 200)',
};

class Canvas {
    constructor(canvasId, margin = { top: 20, left: 20 }, options = defaultOptions) {
        this.svg = d3.select(`svg#${canvasId}`);
        this.svg
            .style('background', options.background || defaultOptions.background)
            .style('border-width', options.borderWidth || defaultOptions.borderWidth)
            .style('border-color', options.borderColor || defaultOptions.borderColor)
            .style('border-style', 'solid');
    }
}

export default Canvas;