import Domodule from 'domodule';
import ScrollBus from 'scroll-bus';
import { on, addClass, removeClass, prefixedTransform, hide, show } from 'domassist';
import tinybounce from 'tinybounce';

const CLASSES = {
  FIXED: 'fixed',
  TRANSITION: 'in-transition',
  SCROLLING_UP: 'scrollin-up',
  SCROLLING_DOWN: 'scrollin-down'
};

class ScrollupHeader extends Domodule {
  get defaults() {
    return {
      addPadding: true
    };
  }

  postInit() {
    this.parent = this.el.parentElement;
    this.enabled = true;
    this.scroll = 0;
    this.scrollUp = false;
    this.isFixed = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                !window.MSStream;
    this.wWidth = null; // Ensuring setup runs once

    ScrollBus.on(this.onScroll.bind(this));
    this.setup();
    const bouncedSetup = tinybounce(this.setup.bind(this), 150);
    on(window, 'resize', bouncedSetup);

    on(this.el, 'scrollup:pause', () => {
      this.enabled = false;
    });

    on(this.el, 'scrollup:resume', () => {
      this.enabled = true;
    });
  }

  setup(event) {
    const force = event && event.detail && event.detail.force;

    // Avoid resizing on mobile devices on scroll
    if (this.wWidth === window.innerWidth && !force) {
      return;
    }

    if (this.options.match) {
      this.enabled = (window.matchMedia && window.matchMedia(this.options.match).matches);

      if (!this.enabled) {
        if (this.isFixed) {
          this.setFix(false);
        }

        if (this.scrollUp) {
          this.setScrollUp(false);
        }

        this.scroll = -1;
      }
    }

    this.calcBounds();
    this.onScroll();
  }

  calcBounds() {
    let resetFix = false;

    if (this.isFixed) {
      resetFix = true;
      this.setFix(false);
    }

    setTimeout(() => {
      const cs = window.getComputedStyle(this.el);

      this.height = this.el.offsetHeight;
      this.margin = parseInt(cs.getPropertyValue('margin-bottom'), 10) || 0;
      this.start = this.el.getBoundingClientRect().top + ScrollupHeader.getScrollPosition();
      this.end = this.start + this.height;
      this.wWidth = window.innerWidth;

      if (resetFix) {
        this.setFix(true);

        if (this.scrollUp) {
          setTimeout(() => {
            this.setScrollUp(true);
          });
        }
      }
    });
  }

  onScroll() {
    const scroll = ScrollupHeader.getScrollPosition();

    if (!this.enabled || this.scroll === scroll || scroll < 0) {
      return;
    }

    const isScrollingUp = scroll < this.scroll;
    let fixed = scroll > this.end;

    if (!fixed && this.isFixed) {
      fixed = scroll > this.start;
    }

    this.scroll = scroll;

    if (fixed !== this.isFixed) {
      this.setFix(fixed);
      return;
    }

    if (isScrollingUp !== this.scrollUp) {
      this.setScrollUp(isScrollingUp);
    }
  }

  setScrollUp(isScrollingUp) {
    if (this.isFixed) {
      this.scrollUp = isScrollingUp;

      if (isScrollingUp) {
        this.el.removeAttribute('style');
        removeClass(this.el, CLASSES.SCROLLING_DOWN);
        addClass(this.el, CLASSES.SCROLLING_UP);
      } else {
        this.transformUp();
        removeClass(this.el, CLASSES.SCROLLING_UP);
        addClass(this.el, CLASSES.SCROLLING_DOWN);
      }
    }
  }

  transformUp() {
    // 5px to account for shadows
    this.el.style[prefixedTransform()] = `translate3d(0, -${this.height + 5}px, 0)`;
  }

  setFix(fixed) {
    this.isFixed = fixed;
    const method = fixed ? addClass : removeClass;
    const addPadding = this.options.addPadding !== 'false';

    if (fixed) {
      this.transformUp();

      if (addPadding) {
        this.parent.style.paddingTop = `${this.height + this.margin}px`;
      }
    } else {
      this.el.removeAttribute('style');

      removeClass(this.el, CLASSES.SCROLLING_UP);
      removeClass(this.el, CLASSES.SCROLLING_DOWN);

      if (addPadding) {
        this.parent.style.paddingTop = '';
      }
    }

    method(this.el, CLASSES.FIXED);

    setTimeout(() => {
      method(this.el, CLASSES.TRANSITION);

      if (!fixed && this.isIOS) {
        hide(this.el);

        setTimeout(() => {
          show(this.el);
        });
      }
    }, 150);
  }

  static getScrollPosition() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}

Domodule.register('ScrollupHeader', ScrollupHeader);

export default ScrollupHeader;
