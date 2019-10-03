const checkIconSVG = `
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    width="15px" height="15px" viewBox="0 0 45.701 45.7" style="enable-background:new 0 0 45.701 45.7;" xml:space="preserve">
    <path style="fill: #444;" d="M20.687,38.332c-2.072,2.072-5.434,2.072-7.505,0L1.554,26.704c-2.072-2.071-2.072-5.433,0-7.504
        c2.071-2.072,5.433-2.072,7.505,0l6.928,6.927c0.523,0.522,1.372,0.522,1.896,0L36.642,7.368c2.071-2.072,5.433-2.072,7.505,0
        c0.995,0.995,1.554,2.345,1.554,3.752c0,1.407-0.559,2.757-1.554,3.752L20.687,38.332z"/>
`;
const template = document.createElement('template');
template.innerHTML = /* html */`
    <style>
        @keyframes reveal{
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        :host * {
            box-sizing: border-box;
        }
        .box {
            width: 40px;
            height: 40px;
            border-radius: 5px;
            position: relative;
            cursor: pointer;
            transition: background-color linear 0.2s 0s;
        }
        .box .popover {
            border-radius: 5px;
            position: absolute;
            display: none;
            margin: 0px 5px;
            animation: reveal ease-in-out 0.2s 0s;
            padding: 9px;
        }
        .box .popover.show {
            display: inline-block;
        }
        .box .popover.dark {
            background: #444;
        }
        .box .popover.dark input {
            background: #222;
            color: #efefef;
        }
        .box .popover.light {
            background: #eee;
        }
        .box .popover.light input {
            background: #ddd;
            color: #444;
        }
        .box .popover input[type="text"] {
            border-radius: 5px;
            border: none;
            padding: 6px 9px;
            outline: none;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-size: 11px;
        }
        .box .popover input[type="text"]::placeholder {
            color: #666;
        }
        .box .popover.lite .rgba-input { display: none; }
        .box .popover.lite .hex-input { display: none; }
        .box .popover.lite .swatch { display: none; }
        .box .popover .section {
            margin-bottom: 9px;
        }
        .box .popover .section:last-child {
            margin-bottom: 0px;
        }
        .box .popover .section:only-child {
            margin-bottom: 0px;
        }
        .box .popover .swatch {
            display: grid;
            grid-template-columns: repeat(5, 30px);
            grid-column-gap: 5px;
            grid-row-gap: 5px;
            overflow-y: auto;
            margin-bottom: 15px;
        }
        .box .popover .swatch .color {
            width: 30px;
            height: 30px;
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .box .popover .colors {
            display: grid;
            grid-template-columns: repeat(5, 30px);
            grid-column-gap: 5px;
            grid-row-gap: 5px;
            overflow-y: auto;
        }
        .box .popover .colors .color {
            width: 30px;
            height: 30px;
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .box .popover .hex-input {
            width: 100%;
        }
        .box .popover .hex-input input {
            width: 100%;
        }
        .box .popover .rgba-input {
            width: 100%;
            display: flex;
        }
        .box .popover .rgba-input input {
            width: 100%;
            margin-right: 5px;
            flex-grow: 1;
        }
        .box .popover .rgba-input input:last-child {
            margin-right: 0px;
        }
    </style>
    <div class="box">
        <div class="popover dark">
            <div class="section swatch"></div>
            <div class="section colors"></div>
            <div class="section hex-input">
                <input type="text" name="color" placeholder="HEX">
            </div>
            <div class="section rgba-input">
                <input type="text" name="r" placeholder="R">
                <input type="text" name="g" placeholder="G">
                <input type="text" name="b" placeholder="B">
                <input type="text" name="a" placeholder="A">
            </div>
        </div>
    </div>
`;

class CustomColorPicker extends HTMLElement {
    constructor() {
        super();
        this.setupFormAssociation();
        this.colors = this.parseColorsArrayFromAttribute() || this.generatePrimaryColors();
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.colorBox = this.shadowRoot.querySelector('.box');
        this.popover = this.colorBox.querySelector('.popover');
        this.colorsContainer = this.popover.querySelector('.colors');
        this.swatch = this.popover.querySelector('.swatch');
        this.colorInput = this.popover.querySelector('.hex-input input');
        this.rgbaInputContainer = this.popover.querySelector('.rgba-input');

        // Binding events to the main scope
        this.onPopoverClicked = this.onPopoverClicked.bind(this);
        this.onColorBoxClicked = this.onColorBoxClicked.bind(this);
        this.onColorInputClicked = this.onColorInputClicked.bind(this);
        this.onColorInputKeyUp = this.onColorInputKeyUp.bind(this);
        this.onRGBAInputClicked = this.onRGBAInputClicked.bind(this);
        this.onRGBAInputKeyUp = this.onRGBAInputKeyUp.bind(this);
    }

    connectedCallback() {
        this.setSize();
        this.attachColors();
        this.setDefaultColor();
        this.addEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    addEventListeners() {
        this.popover.addEventListener('click', this.onPopoverClicked);
        this.colorBox.addEventListener('click', this.onColorBoxClicked);
        this.colorInput.addEventListener('click', this.onColorInputClicked);
        this.colorInput.addEventListener('keyup', this.onColorInputKeyUp);
        Array.from(this.rgbaInputContainer.querySelectorAll('input'))
            .forEach(input => {
                input.addEventListener('click', this.onRGBAInputClicked);
                input.addEventListener('keyup', this.onRGBAInputKeyUp);
            });
    }

    onRGBAInputClicked(e) {
        e.stopPropagation();
    }

    onRGBAInputKeyUp(e) {
        if (e.key == 'Enter') {
            const r = parseInt(this.rgbaInputContainer.querySelector('input[name="r"]').value);
            const g = parseInt(this.rgbaInputContainer.querySelector('input[name="g"]').value);
            const b = parseInt(this.rgbaInputContainer.querySelector('input[name="b"]').value);
            const a = parseInt(this.rgbaInputContainer.querySelector('input[name="a"]').value);
            const validation = (r >= 0 && r <= 255) && (g >= 0 && g <= 255) && (b >= 0 && b <= 255) && (a >= 0 && a <= 255);
            if (!validation) {
                throw new Error(`'rgba(${r}, ${g}, ${b}, ${a})' is not a valid RGBA color.`);
            }
            const color = this.RGBAToHEX(r, g, b, a);
            this.setAttribute('value', color);
        }
    }

    onPopoverClicked(e) {
        e.stopPropagation();
    }

    onColorBoxClicked(e) {
        this.calculatePosition(e.clientX, e.clientY);
        this.togglePopover();
    }

    onColorInputClicked(e) {
        e.stopPropagation();
    }

    onColorInputKeyUp(e) {
        if (e.key == 'Enter') {
            const color = this.colorInput.value;
            if (!this.validateHEX(color)) {
                throw new Error(`'${color}' is not a HEX color.`);
            }
            this.setAttribute('value', color);
            if (this.isNewColor(color)) {
                this.colors.push(color);
                this.attachColor(color);
            }
            this.checkColor(color);
        }
    }

    parseColorsArrayFromAttribute() {
        if (!this.hasAttribute('colors') || this.getAttribute('colors').length == 0) {
            return;
        }
        const colors = this.getAttribute('colors').split(';');
        return colors;
    }

    generatePrimaryColors() {
        let colors = [];
        let i = 0;
        while(i++ < 10) {
            let r = this.getRandomInt(0, 255),
                g = this.getRandomInt(0, 255),
                b = this.getRandomInt(0, 255)
            colors.push(this.RGBAToHEX(r, g, b, 255));
        }
        return colors;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    validateHEX(color) {
        if (color.length == 9) {
            return new RegExp(/^#[0-9A-F]{8}$/i).test(color);
        } else if (color.length == 7) {
            return new RegExp(/^#[0-9A-F]{6}$/i).test(color);
        } else {
            return false;
        }
    }

    validateRGBA(color) {
        return new RegExp(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)$/).test(color);
    }

    isNewColor(color) {
        return (this.colors.find(el => el == color)) ? false : true;
    }

    isActiveColor(color) {
        return this.getAttribute('value') == color;
    }

    removeEventListeners() {
        this.removeEventListener('click');
        this.popover.removeEventListener('click', this.onPopoverClicked);
        this.colorBox.removeEventListener('click', this.onColorBoxClicked);
        this.colorInput.removeEventListener('click', this.onColorInputClicked);
        this.colorInput.removeEventListener('keyup', this.onColorInputKeyUp);
        Array.from(this.rgbaInputContainer.querySelectorAll('input'))
            .forEach(input => {
                input.removeEventListener('click', this.onRGBAInputClicked);
                input.removeEventListener('keyup', this.onRGBAInputKeyUp);
            });
    }

    static get observedAttributes() {
        return ['value', 'lite', 'theme'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case 'value':
                this.updateColor(oldVal, newVal);
                this.updateFormValue(newVal);
                this.checkValueValidity(newVal);
                break;
            case 'lite':
                this.toggleLightMode(newVal);
                break;
            case 'theme':
                this.switchTheme(oldVal, newVal);
                break;
        }
    }

    switchTheme(current, next) {
        this.popover.classList.remove(current);
        this.popover.classList.add(next);
    }

    toggleLightMode(on) {
        this.popover.classList.toggle('lite', on == 'true');
    }

    updateColor(oldColor, color) {
        if (oldColor == null) {
            return;
        }
        if (this.isNewColor(color)) {
            this.colors.push(color);
            this.attachColor(color);
        }
        this.checkColor(color);
        this.colorBox.style.backgroundColor = color;
        this.setHEXValue(color);
        this.setRGBAColor(color);
        this.updateSwatch(color);
        if (oldColor != color && oldColor) {
            this.uncheckColor(oldColor);
        }
    }

    async updateSwatch(color) {
        const numOfShades = parseInt(this.getAttribute('shades')) || 2;
        const shades = this.calculateShades(color, numOfShades);
        this.attachSwatchColors(shades);
    }

    attachSwatchColors(colors) {
        this.swatch.innerHTML = '';
        for (let color of colors) {
            const colorBox = document.createElement('div');
            colorBox.classList.add('color');
            colorBox.dataset.name = color;
            colorBox.style.backgroundColor = color;
            colorBox.onclick = e => {
                e.stopPropagation();
                if (e.altKey) {
                    this.createMix(this.getAttribute('value'), color);
                } else {
                    this.setAttribute('value', color);
                }
            }
            this.swatch.append(colorBox);
            if (this.isActiveColor(color)) {
                this.checkSwatchColor(color);
            }
        }
    }

    checkSwatchColor(color) {
        const elm = this.swatch.querySelector(`.color[data-name="${color}"]`);
        elm.innerHTML = checkIconSVG;
    }

    uncheckSwatchColor(color) {
        const elm = this.swatch.querySelector(`.color[data-name="${color}"]`);
        elm.innerHTML = '';
    }

    calculateShades(color, numOfShades) {
        const { r, g, b } = this.HEXToRGBA(color);
        numOfShades += 1;
        const shades = [
            ...this.calculateDarkShades(r, g, b, numOfShades), 
            ...this.calculateLightShades(r, g, b, numOfShades)
        ];
        return shades;
    }

    calculateDarkShades(r, g, b, numOfShades) {
        const result = [];
        let newR, newG, newB;
        for (let i = numOfShades-1; i >= 0; i--) {
            newR = Math.floor(r-(r/numOfShades)*i);
            newG = Math.floor(g-(g/numOfShades)*i);
            newB = Math.floor(b-(b/numOfShades)*i);
            result.push(this.RGBAToHEX(newR, newG, newB, 255));
        }
        return result;
    }

    calculateLightShades(r, g, b, numOfShades) {
        const deltaR = 255 - r;
        const deltaG = 255 - g;
        const deltaB = 255 - b;
        const result = [];
        let newR, newG, newB;
        for (let i = 1; i < numOfShades; i++) {
            newR = Math.floor(r+(deltaR/numOfShades)*i);
            newG = Math.floor(g+(deltaG/numOfShades)*i);
            newB = Math.floor(b+(deltaB/numOfShades)*i);
            result.push(this.RGBAToHEX(newR, newG, newB, 255));
        }
        return result;
    }

    setHEXValue(color) {
        this.colorInput.setAttribute('value', color);
    }

    setRGBAColor(color) {
        const { r, g, b, a } = this.HEXToRGBA(color);
        this.rgbaInputContainer.querySelector('input[name="r"]').value = r;
        this.rgbaInputContainer.querySelector('input[name="g"]').value = g;
        this.rgbaInputContainer.querySelector('input[name="b"]').value = b;
        this.rgbaInputContainer.querySelector('input[name="a"]').value = a;
    }

    HEXToRGBA(hex) {
        const HEXCode = hex.replace('#', '');
        let r = parseInt(HEXCode.substring(0, 2), 16);
        let g = parseInt(HEXCode.substring(2, 4), 16);
        let b = parseInt(HEXCode.substring(4, 6), 16);
        let a = parseInt(HEXCode.substring(6, 8), 16) || 255;
        return { r, g, b, a };
    } 

    RGBAToHEX(r, g, b, a) {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);
        a = a.toString(16);
        if (r.length == 1)
        r = "0" + r;
        if (g.length == 1)
        g = "0" + g;
        if (b.length == 1)
        b = "0" + b;
        if (a.length == 1)
        a = "0" + a;
        return "#" + r + g + b + a;
    }

    calculatePosition(mouseX, mouseY) {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const x = mouseX;
        const y = mouseY;
        const totalElmWidth = 220;
        const totalElmHeight = 220;
        let transformOrigin = '';
        if (winW - x >= totalElmWidth) { /* right*/
            this.popover.style.left = '100%';
            transformOrigin += 'left';
        } else { /* left */
            this.popover.style.right = '100%';
            transformOrigin += 'right';
        }
        if (winH - y >= totalElmHeight) { /* top */
            this.popover.style.top = '0px';
            transformOrigin += ' top';
        } else { /* bottom */
            this.popover.style.bottom = '0px';
            transformOrigin += ' bottom';
        }
        this.popover.style.transformOrigin = transformOrigin;
    }

    togglePopover() {
        this.popover.classList.toggle('show');
    }

    setDefaultColor() {
        let defaultColor = this.colors[0];
        if (this.hasAttribute('value') && this.getAttribute('value').length > 0) {
            defaultColor = this.getAttribute('value');
        }
        this.setAttribute('value', defaultColor);
    }

    checkColor(color) {
        const elm = this.colorsContainer.querySelector(`.color[data-name="${color}"]`);
        elm.innerHTML = checkIconSVG;
    }

    uncheckColor(color) {
        const elm = this.colorsContainer.querySelector(`.color[data-name="${color}"]`);
        elm.innerHTML = '';
    }

    attachColors() {
        for (let color of this.colors) {
            this.attachColor(color);
        }
    }

    attachColor(color) {
        const colorBox = document.createElement('div');
        colorBox.classList.add('color');
        colorBox.dataset.name = color;
        colorBox.style.backgroundColor = color;
        colorBox.onclick = e => {
            e.stopPropagation();
            if (e.altKey) {
                this.createMix(this.getAttribute('value'), color);
            } else {
                this.setAttribute('value', color);
            }
        }
        this.colorsContainer.appendChild(colorBox);
    }

    createMix(color1, color2) {
        const rgba1 = this.HEXToRGBA(color1);
        const rgba2 = this.HEXToRGBA(color2);
        let newR = Math.floor((rgba1.r + rgba2.r)/2);
        let newG = Math.floor((rgba1.g + rgba2.g)/2);
        let newB = Math.floor((rgba1.b + rgba2.b)/2);
        let newA = Math.floor((rgba1.a + rgba2.a)/2);
        const mix = this.RGBAToHEX(newR, newG, newB, newA);
        this.setAttribute('value', mix);
    }

    setSize() {
        if (this.hasAttribute('width')) {
            this.colorBox.style.width = this.getAttribute('width');
        }
        if (this.hasAttribute('height')) {
            this.colorBox.style.height = this.getAttribute('height');
        }
    }

    /* Everything under this comment is to handle form association logic */
    setupFormAssociation() {
        this._internals = this.attachInternals();
    }

    static get formAssociated() {
        return true;
    }

    get form() {
        return this._internals.form;
    }

    get value() {
        return this.getAttribute('value');
    }

    get name() {
        return this.getAttribute('name');
    }

    get validity() {
        return this._internals.validity;
    }

    get validationMessage() {
        return this._internals.validationMessage; 
    }

    get willValidate() {
        return this._internals.willValidate; 
    }

    checkValidity() { 
        return this._internals.checkValidity(); 
    }
    
    reportValidity() {
        return this._internals.reportValidity(); 
    }

    updateFormValue(value) {
        this._internals.setFormValue(value);
    }

    checkValueValidity(value) {
        if (!this.validateHEX(value)) {
            this._internals.setValidity({ customError: true }, `'${value}' is not a HEX format color`);
            throw new Error(`'${value}' is not a valid HEX color`);
        } else {
            this._internals.setValidity({});
        }
    }
}

window.customElements.define('color-picker', CustomColorPicker);