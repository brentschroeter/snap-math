// Extension of Snap.svg for easy construction of simple graphs.
// Copyright (c) 2015 Brent Schroeter. All rights reserved.

function plotAxes(p, xMin, xMax, yMin, yMax, grid) {
    /* Draws a set of 2d axes on p. */
    if (typeof xMin === 'undefined') xMin = -10;
    if (typeof xMax === 'undefined') xMax = 10;
    if (typeof yMin === 'undefined') yMin = -10;
    if (typeof yMax === 'undefined') yMax = 10;
    if (typeof grid === 'undefined') grid = false;
    var d = xMax - xMin;
    var r = yMax - yMin;
    var w = p.node.offsetWidth;
    var h = p.node.offsetHeight;
    var pxCoords = function(x, y) {
        /* Converts graph coordinates to pixel coordinates. */
        return [(x - xMin) * w / d, (yMax - y) * h / r];
    }
    var o = pxCoords(0, 0);
    for (var n = xMin + 1; n < xMax; ++n) {
        var x = pxCoords(n, 0)[0];
        if (grid) p.line(x, 0, x, h).attr({stroke: '#eee', strokeWidth: 1});
        p.line(x, o[1], x, o[1] + 5).attr({stroke: '#000', strokeWidth: 1});
    }
    for (var n = yMin + 1; n < yMax; ++n) {
        var y = pxCoords(0, n)[1];
        if (grid) p.line(0, y, w, y).attr({stroke: '#eee', strokeWidth: 1});
        p.line(o[0] - 5, y, o[0], y).attr({stroke: '#000', strokeWidth: 1});
    }
    for (var n = yMin - yMin % 5 + 5; n <= yMax - 5; n += 5) {
        var y = pxCoords(0, n)[1];
        p.text(o[0] - 5 - (10 * ('' + n).length), y + 6, n).attr({fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '15px'});
    }
    for (var n = xMin - xMin % 5 + 5; n <= xMax - 5; n += 5) {
        var x = pxCoords(n, 0)[0];
        p.text(x - (5 * ('' + n).length), o[1] + 20, n).attr({fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '15px'});
    }
    var x = p.line(0, o[1], w, o[1]);
    var y = p.line(o[0], 0, o[0], h);
    Snap([x, y]).attr({stroke: '#000', strokeWidth: 2});
    var plotFunc = function(func) {
        /* Returns a path representing the plot of func(x). */
        var x = xMin;
        var pathStr = 'M';
        for (x; x <= xMax; x += d / 1000) {
            var coords = pxCoords(x, func(x));
            if (x > xMin) {
                pathStr += 'L';
            }
            pathStr += coords[0] + ',' + coords[1];
        }
        return p.path(pathStr);
    }
    var graphCoords = function(x, y) {
        /* Converts pixel coordinates to graph coordinates. */
        return [x * d / w + xMin, -y * r / h + yMax];
    };
    return {pxCoords: pxCoords, plotFunc: plotFunc, graphCoords: graphCoords};
}

function plotPt(p, axes, x, y) {
    /* Draws a circular point on p. */
    var r = 5;
    var coords = axes.pxCoords(x, y);
    var moveListeners = new Array();
    var pt = p.circle(coords[0], coords[1], 5)
        .attr({strokeWidth: 0, fill: '#33f'})
        .drag(function() {
            for (var i = 0; i < moveListeners.length; ++i) {
                moveListeners[i]();
            }
        });
    var onmove = function(f) {
        moveListeners.push(f);
    };
    var unmove = function(f) {
        for (var i = 0; i < moveListeners.length; ++i) {
            if (moveListeners[i] == c) {
                moveListeners.splice(i, 1);
                break;
            }
        }
    };
    var setR = function(newR) {
        /* Sets the default radius of the point. Use instead of el.attr({r: }), especially if you plan to call animZoom(). */
        r = newR;
        pt.attr({r: r});
    };
    var animZoom = function() {
        /* Causes a zoom in-zoom out animation of the point. */
        pt.animate({r: r * 1.25}, 150, mina.easeinout, function() {
            this.animate({r: r}, 150, mina.easeinout);
        });
    };
    var graphCoords = function() {
        /* Returns the graph coordinates of the point. */
        var b = pt.getBBox();
        return axes.graphCoords(b.cx, b.cy);
    };
    var graphSnap = function(x, y, dur, complete) {
        /* Snaps the point to the nearest integer point or to the given graph coordinates. */
        if (typeof dur === 'undefined' || dur === null) dur = 100;
        var b = pt.getBBox();
        if (typeof x === 'undefined' || x === null) x = Math.round(axes.graphCoords(b.cx, b.cy)[0]);
        if (typeof y === 'undefined' || y === null) y = Math.round(axes.graphCoords(b.cx, b.cy)[1]);
        var coords = axes.pxCoords(x, y);
        var tx = coords[0] - b.cx;
        var ty = coords[1] - b.cy;
        var initMatrix = pt.matrix.clone();
        //pt.animate({transform: pt.matrix.translate(tx, ty)}, 100);
        Snap.animate([0.0, 0.0], [tx, ty], function(t) {
            pt.transform(initMatrix.clone().translate(t[0], t[1]));
            for (var i = 0; i < moveListeners.length; ++i) {
                moveListeners[i]();
            }
        }, dur, null, complete);
    }
    return {el: pt, onmove: onmove, unmove: unmove, graphCoords: graphCoords, animZoom: animZoom, graphSnap: graphSnap, setR: setR};
}

function plotConnector(p, axes, pt1, pt2) {
    /* Draws a line designed to connect two points on p. */
    var coords1 = [0, 0];
    var coords2 = [0, 0];
    var l = p.line(coords1[0], coords1[1], coords2[0], coords2[1]);
    var draw = function(smooth) {
        /* Updates endpoints and redraws the line. */
        if (typeof pt1 !== 'undefined' && pt1 !== null) coords1 = axes.pxCoords(pt1.graphCoords()[0], pt1.graphCoords()[1]);
        if (typeof pt2 !== 'undefined' && pt2 !== null) coords2 = axes.pxCoords(pt2.graphCoords()[0], pt2.graphCoords()[1]);
        if (typeof smooth === 'boolean' && smooth) {
            l.animate({x1: coords1[0], y1: coords1[1], x2: coords2[0], y2: coords2[1]}, 100);
        } else {
            l.attr({x1: coords1[0], y1: coords1[1], x2: coords2[0], y2: coords2[1]});
        }
    };
    var setPt1 = function(pt) {
        /* Sets one endpoint. */
        var changePt = typeof pt1 !== 'undefined';
        if (changePt) {
            pt1.unmove(draw);
        }
        pt1 = pt;
        pt1.onmove(draw);
        if (typeof pt2 !== 'undefined') {
            draw(changePt);
        }
    }
    var setPt2 = function(pt) {
        /* Sets one endpoint. */
        var changePt = typeof pt2 !== 'undefined';
        if (changePt) {
            pt2.unmove(draw);
        }
        pt2 = pt;
        pt2.onmove(draw);
        if (typeof pt1 !== 'undefined') {
            draw(changePt);
        }
    }
    return {el: l, draw: draw, setPt1: setPt1, setPt2: setPt2};
}

function plotPie(p, n, pad, blankStroke) {
    /* Draws a pie chart with n rings on p. */
    if (typeof pad === 'undefined') pad = 0;
    if (typeof blankStroke === 'undefined') blankStroke = '#eee';
    var w = p.node.offsetWidth;
    var h = p.node.offsetHeight;
    var r = Math.floor(Math.min(w, h) / 2);
    var gap = 5;
    var ringW = Math.floor((r - n * gap) / (n + 1));
    var pArray = new Array(n);
    var elArray = new Array();
    for (var i = 0; i < pArray.length; ++i) {
        pArray[i] = [];
        p.circle(r, r, r - ringW / 2 - (ringW + gap) * i)
            .attr({strokeWidth: ringW, stroke: blankStroke, fill: 'transparent'});
    }
    var draw = function() {
        /* Renders the chart based on the proportions stored in pArray. */
        for (var i = 0; i < elArray.length; ++i) {
            elArray[i].remove();
        }
        elArray = new Array();
        for (var i = 0; i < pArray.length; ++i) {
            var ringR = r - ringW / 2 - (ringW + gap) * i;
            var sum = 0.25;
            for (var j = 0; j < pArray[i].length; ++j) {
                var stroke = pArray[i][j][0];
                var prop = pArray[i][j][1];
                if (prop < 1.0) {
                    var startRad = sum * 2 * Math.PI;
                    sum += prop;
                    var endRad = sum * 2 * Math.PI;
                    var startX = r + ringR * Math.cos(startRad);
                    var startY = r + ringR * Math.sin(startRad);
                    var endX = r + ringR * Math.cos(endRad);
                    var endY = r + ringR * Math.sin(endRad);
                    var largeArc = prop > 0.5 ? 1 : 0;
                    var pathStr = 'M' + startX + ',' + startY + ' A' + ringR + ',' + ringR + ' 0 ' + largeArc + ',1 ' + endX + ',' + endY;
                    elArray.push(p.path(pathStr)
                        .attr({stroke: stroke, fill: 'transparent', strokeWidth: ringW - pad * 2}));
                } else {
                    elArray.push(p.circle(r, r, ringR)
                        .attr({stroke: stroke, fill: 'transparent', strokeWidth: ringW - pad * 2}));
                }
            }
        }
    };
    var setProps = function(props, ringI, anim, callback) {
        /* Sets proportions to be displayed in a ring. Parameter props is a nested array in the format [[color, proportion], ..., [color, proportion]]. When parameter anim is set to true the values of pArray will be changed gradually over 1000 ms. */
        if (typeof ringI === 'undefined') ringI = 0;
        if (typeof anim === 'undefined') anim = true;
        if (anim) {
            if (typeof callback !== 'function') callback = null;
            var oldProps = pArray[ringI].slice(0);
            Snap.animate(0.0, 1.0, function(n) {
                var tmpProps = new Array(props.length);
                for (var i = 0; i < tmpProps.length; ++i) {
                    var oldP;
                    if (i >= oldProps.length) {
                        oldP = 0.0;
                    } else {
                        oldP = oldProps[i][1];
                    }
                    tmpProps[i] = [props[i][0], oldP + (props[i][1] - oldP) * n];
                }
                pArray[ringI] = tmpProps;
                draw();
            }, 1000, mina.easeinout, callback);
        } else {
            pArray[ringI] = props;
        }
    };
    return {setProps: setProps, draw: draw};
}