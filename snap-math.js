// Extension of Snap.svg for easy construction of simple graphs.
// Copyright (c) 2015 Brent Schroeter. All rights reserved.

function plotAxes(p, xMin, xMax, yMin, yMax, grid) {
    /* Draws a set of 2d axes on p. */
    if (typeof xMin === 'undefined' || xMin === null) xMin = -10;
    if (typeof xMax === 'undefined' || xMax === null) xMax = 10;
    if (typeof yMin === 'undefined' || yMin === null) yMin = -10;
    if (typeof yMax === 'undefined' || yMax === null) yMax = 10;
    if (typeof grid === 'undefined' || grid === null) grid = false;
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
    var pt = p.circle(coords[0], coords[1], 5)
        .attr({strokeWidth: 0, fill: '#33f'});
    var setR = function(newR) {
        /* Sets the default radius of the point. Use instead of el.attr({r: }), especially if you plan to call animZoom(). */
        r = newR;
        pt.attr({r: r});
    };
    var animZoom = function() {
        /* Causes a zoom in-zoom out animation of the point. */
        pt.animate({r: r * 1.5}, 150, null, function() {
            this.animate({r: r}, 150);
        });
    };
    var graphCoords = function() {
        /* Returns the graph coordinates of the point. */
        var b = pt.getBBox();
        return axes.graphCoords(b.cx, b.cy);
    };
    var graphSnap = function(x, y, complete) {
        /* Snaps the point to the nearest integer point or to the given graph coordinates. */
        var b = pt.getBBox();
        if (typeof x === 'undefined' || x === null) x = Math.round(axes.graphCoords(b.cx, b.cy)[0]);
        if (typeof y === 'undefined' || y === null) y = Math.round(axes.graphCoords(b.cx, b.cy)[1]);
        var coords = axes.pxCoords(x, y);
        var tx = coords[0] - b.cx;
        var ty = coords[1] - b.cy;
        pt.animate({transform: pt.matrix.translate(tx, ty)}, 100, null, complete);
    }
    return {el: pt, graphCoords: graphCoords, animZoom: animZoom, graphSnap: graphSnap, setR: setR};
}

function plotConnector(p, axes, pt1, pt2) {
    /* Draws a line designed to connect two points on p. */
    var coords1 = [0, 0];
    var coords2 = [0, 0];
    var l = p.line(coords1[0], coords1[1], coords2[0], coords2[1]);
    var update = function() {
        /* Updates endpoints and redraws the line. */
        if (typeof pt1 !== 'undefined' && pt1 !== null) coords1 = axes.pxCoords(pt1.graphCoords()[0], pt1.graphCoords()[1]);
        if (typeof pt2 !== 'undefined' && pt2 !== null) coords2 = axes.pxCoords(pt2.graphCoords()[0], pt2.graphCoords()[1]);
        l.attr({x1: coords1[0], y1: coords1[1], x2: coords2[0], y2: coords2[1]});
    };
    var setPt1 = function(pt) {
        /* Sets one endpoint. */
        pt1 = pt;
        update();
    }
    var setPt2 = function(pt) {
        /* Sets one endpoint. */
        pt2 = pt;
        update();
    }
    update();
    return {el: l, update: update, setPt1: setPt1, setPt2: setPt2};
}