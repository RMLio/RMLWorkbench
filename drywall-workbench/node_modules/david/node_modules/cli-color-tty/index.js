var clc = require('cli-color')

function empty () { return '' }
function zero () { return 0 }

function fn () {
  return Array.prototype.join.call(arguments, ' ')
}

['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
  .forEach(function (c) {
    fn[c] = fn
    fn['bg' + c[0].toUpperCase() + c.slice(1)] = fn
    fn[c + 'Bright'] = fn
    fn['bg' + c[0].toUpperCase() + c.slice(1) + 'Bright'] = fn
  })

;['bold', 'italic', 'underline', 'blink', 'inverse', 'strike']
  .forEach(function (style) { fn[style] = fn })

fn.move = function () { return '' }

;['to', 'up', 'down', 'right', 'left', 'lines']
  .forEach(function (move) { fn.move[move] = empty })

fn.windowSize = {}

;['width', 'height']
  .forEach(function (dim) { fn.windowSize[dim] = zero })

;['xterm', 'bgXterm']
  .forEach(function (xterm) {
    fn[xterm] = function () { return fn }
  })

fn.erase = {}

;['screen', 'screenLeft', 'screenRight', 'line', 'lineLeft', 'lineRight']
  .forEach(function (erase) { fn.erase[erase] = '' })

fn.reset = ''
fn.beep = ''
fn.xtermSupported = clc.xtermSupported
fn.strip = fn
fn.art = clc.art
fn.throbber = function (write) {
  var rest = [].slice.call(arguments, 1)
  return clc.throbber.apply(clc, [function (str) { write(str.slice(1)) }].concat(rest))
}

module.exports = function (isTTY) {
  isTTY = isTTY == null ? process.stdout.isTTY : isTTY
  return isTTY ? clc : fn
}
