# Snap Math
Extension of Snap.svg for easy construction of simple graphs. Provides constructors for axes, points, and connectors, as well as single- or multi-ringed pie charts (doughnut charts). All objects are based on Snap.svg elements and support Snap.svg features, including dragging, animation, and setting of attributes.

## Example:

    var p = Snap(500, 500);
    var a = plotAxes(p, -10, 10, -10, 10, true);
    var pt = plotPt(p, a, 5, 5);
    pt.el.attr({fill: '#bbaa55', strokeWidth: 2});
    pt.el.drag(null, null, function() {
        // dragEnd
        pt.graphSnap()
    });
    pt.animZoom();
