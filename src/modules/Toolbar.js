import Quill from 'quill';
import IconAlignLeft from 'quill/assets/icons/align-left.svg';
import IconAlignCenter from 'quill/assets/icons/align-center.svg';
import IconAlignRight from 'quill/assets/icons/align-right.svg';
import IconUndo from 'quill/assets/icons/undo.svg'
import IconRedo from 'quill/assets/icons/redo.svg'
import { BaseModule } from './BaseModule';

const Parchment = Quill.import('parchment');
const FloatStyle = new Parchment.Attributor.Style('float', 'float');
const MarginStyle = new Parchment.Attributor.Style('margin', 'margin');
const DisplayStyle = new Parchment.Attributor.Style('display', 'display');
const TransformStyle = new Parchment.Attributor.Style("transform", "transform");

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

		this.alignments = [
			{
				icon: IconAlignLeft,
				apply: () => {
					DisplayStyle.add(this.img, 'inline');
					FloatStyle.add(this.img, 'left');
					MarginStyle.add(this.img, '0 1em 1em 0');
				},
				isApplied: () => FloatStyle.value(this.img) == 'left',
			},
			{
				icon: IconAlignCenter,
				apply: () => {
					DisplayStyle.add(this.img, 'block');
					FloatStyle.remove(this.img);
					MarginStyle.add(this.img, 'auto');
				},
				isApplied: () => MarginStyle.value(this.img) == 'auto',
			},
			{
				icon: IconAlignRight,
				apply: () => {
					DisplayStyle.add(this.img, 'inline');
					FloatStyle.add(this.img, 'right');
					MarginStyle.add(this.img, '0 0 1em 1em');
				},
				isApplied: () => FloatStyle.value(this.img) == 'right',
			},
			{
				name: "rotate-left",
				icon: IconUndo,
				apply: () => {
					const rotationvalue = this._setRotation("left");
					this.img.setAttribute("_rotation", this.rotation);
					TransformStyle.add(this.img, rotationvalue);
				},
				isApplied: () => {},
			},
			{
				name: "rotate-right",
				icon: IconRedo,
				apply: () => {
					const rotationvalue = this._setRotation("right");
					this.img.setAttribute("_rotation", this.rotation);
					TransformStyle.add(this.img, rotationvalue);
				},
				isApplied: () => {},
			},
		];
	};

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
