import { BaseModule } from './BaseModule';

import IconAlignLeft from '../assets/icons/align-left.svg';
import IconAlignCenter from '../assets/icons/align-center.svg';
import IconAlignRight from '../assets/icons/align-right.svg';
import IconUndo from '../assets/icons/undo.svg'
import IconRedo from '../assets/icons/redo.svg'

export class Toolbar extends BaseModule {
	rotation = 0;

	onCreate = () => {		
		// Setup Toolbar
		this.toolbar = document.createElement('div');
		Object.assign(this.toolbar.style, this.options.toolbarStyles);
		this.overlay.appendChild(this.toolbar);

		// Setup Buttons
		this._defineAlignments();
		this._addToolbarButtons();
		this.rotation = +this.img.getAttribute("_rotation") || 0;
	};

	// The toolbar and its children will be destroyed when the overlay is removed
	onDestroy = () => { };

	// Nothing to update on drag because we are are positioned relative to the overlay
	onUpdate = () => { };

	_defineAlignments = () => {
		this.rotationvalue = "";
		const style = this.img.style;
		this.alignments = [
			{
				icon: IconAlignLeft,
				apply: () => {
					style.setProperty("display", 'inline');
					style.setProperty("margin", '0 1em 1em 0');
					style.setProperty("float", 'left');
				},
				isApplied: () => {},
			},
			{
				icon: IconAlignCenter,
				apply: () => {
					style.setProperty("display", "block");
					style.setProperty("margin", "auto");
					style.removeProperty("float");
				},
				isApplied: () => {},
			},
			{
				icon: IconAlignRight,
				apply: () => {
					style.setProperty("display", 'inline');
					style.setProperty("margin", '0 1em 1em 0');
					style.setProperty("float", 'right');
				},				
				isApplied: () => {},
			},
			{
				name: "rotate-left",
				icon: IconUndo,
				apply: () => {
					const rotationvalue = this._setRotation("left");
					this.img.setAttribute("_rotation", this.rotation);
					this.checkForImageRotation(rotationvalue);
					style.setProperty("transform", rotationvalue);
				},
				isApplied: () => {},
			},
			{
				name: "rotate-right",
				icon: IconRedo,
				apply: () => {
					const rotationvalue = this._setRotation("right");
					this.img.setAttribute("_rotation", this.rotation);
					this.checkForImageRotation(rotationvalue);
					style.setProperty("transform", rotationvalue)
				},
				isApplied: () => {},
			},
		];
	};

	checkForImageRotation(rotationvalue) {
		const parentPElement = this.getImageParent();
		const parentPStyle = parentPElement.style;
		if (rotationvalue === 'rotate(90deg)' || rotationvalue === 'rotate(270deg)') {
			parentPStyle.setProperty("display", `flex`);
			parentPStyle.setProperty("align-items", `center`);
			parentPStyle.setProperty("height", `${this.img.width}px`);
			parentPStyle.setProperty("justify-content", "center");
		} else {
			const displayFlex = parentPStyle.getPropertyValue("display");
			const alignItemsCenter = parentPStyle.getPropertyValue("align-items");
			const parentHeight = parentPStyle.getPropertyValue("height");
			const justifyContentCenter = parentPStyle.getPropertyValue("justify-content", "center");

			if (displayFlex) {
				parentPStyle.removeProperty('display');
			}
			if (alignItemsCenter) {
				parentPStyle.removeProperty("align-items");
			}
			if (parentHeight) {
				parentPStyle.removeProperty("height");
			}
			if (justifyContentCenter) {
				parentPStyle.removeProperty("justify-content");
			}
		}
	}

	getImageParent = () => {
        let el = this.img;
        const tagName = `p`;
        while (el && el.parentNode) {
            el = el.parentNode;
            if (el.tagName && el.tagName.toLowerCase() == tagName) {
                return el;
            }
        }
        return null;
    }


	_addToolbarButtons = () => {
		const buttons = [];
		this.alignments.forEach((alignment, idx) => {
			const button = document.createElement('span');
			buttons.push(button);
			button.innerHTML = alignment.icon;
			button.addEventListener('click', () => {
				// deselect all buttons
				buttons.forEach(button => button.style.filter = '');
				if (alignment.isApplied()) {
					// If applied, unapply
					FloatStyle.remove(this.img);
					MarginStyle.remove(this.img);
					DisplayStyle.remove(this.img);
				} else {
					// otherwise, select button and apply
					this._selectButton(button);
					alignment.apply();
				}
				// image may change position; redraw drag handles
				this.requestUpdate();
			});
			Object.assign(button.style, this.options.toolbarButtonStyles);
			if (idx > 0) {
				button.style.borderLeftWidth = '0';
			}
			Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
			if (alignment.isApplied()) {
				// select button if previously applied
				this._selectButton(button);
			}
			this.toolbar.appendChild(button);
		});
	};

	_setRotation(direction) {
		const oldRotation = this.rotation;
		const increment = (direction == 'left') ? -90 : 90;
		this.rotation = (oldRotation + 360 + increment) % 360;
		return "rotate(" + this.rotation + "deg)";
	}

	_selectButton = (button) => {
		button.style.filter = 'invert(20%)';
	};

}
