/* busy_indicator | busy_indicator 0.10.0 | License - GNU LGPL 3 */
/*
  This library is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

  https://github.com/lego12239/busy_indicator.js
*/

function busyIndicator(cntrEl, imgEl, showCb, hideCb) {
  this.el = {};
  this.cb = { show: null, hide: null };
  this.pos = { x: 0, y: 0 };
  this.show_class = 'show';

  this._set_prm.call(this.el, 'cntr', cntrEl);
  this.el.img = imgEl;
  if (showCb !== undefined) {
    this.cb.show = showCb;
  }
  if (hideCb !== undefined) {
    this.cb.hide = hideCb;
  }

  this.cnt = 0;
}

busyIndicator.prototype._set_prm = function(n, v) {
  if ((v === undefined) || (v === null)) {
    throw (`busy_indicator: ${n} is not supplied`);
  }
  this[n] = v;
};

busyIndicator.prototype.show = function() {
	let top;
	let left;
    let imgEl;

  this.cnt++;
  if (this.cnt > 1) {
    return;
  }

  this.el.cntr.classList.add(this.show_class);

  this.align();

  if (this.cb.show !== undefined) {
    this.cb.show();
  }
};

busyIndicator.prototype.align = function() {
  if (this.el.img == null) {
    return;
  }

  this.pos = this.calc_pos();

  this.el.img.style.top = `${this.pos.y}px`;
  this.el.img.style.left = `${this.pos.x}px`;
};

busyIndicator.prototype.calc_pos = function() {
  const x = this.el.cntr.clientWidth / 2 - this.el.img.offsetWidth / 2;
  const y = this.el.cntr.clientHeight / 2 - this.el.img.offsetHeight / 2;

  return { x, y };
};

busyIndicator.prototype.hide = function() {
  if (this.cnt > 0) {
    this.cnt--;
  } else {
    return;
  }

  if (this.cnt) {
    return;
  }

  this.el.cntr.classList.remove(this.show_class);

  if (this.cb.hide !== undefined) {
    this.cb.hide();
  }
};
