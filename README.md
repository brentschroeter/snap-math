# Snap Math
Extension of Snap.svg for easy construction of simple graphs. Provides constructors for axes, points, and connectors, as well as single- or multi-ringed pie charts (doughnut charts). All objects are based on Snap.svg elements and support Snap.svg features, including dragging, animation, and setting of attributes.

## Examples

Draggable point:

    var p = Snap(500, 500);
    var a = plotAxes(p, -10, 10, -10, 10, true);
    var pt = plotPt(p, a, 5, 5);
    pt.el.attr({fill: '#bbaa55', strokeWidth: 2});
    pt.el.drag()
        .drag(null, null, function() {
        // dragEnd
        pt.graphSnap()
    });
    pt.animZoom();

Doughnut chart:

    var p = Snap(500, 500);
    var pie = plotPie(p, 2);
    pie.setProps([['#33f', 0.4], ['#c33', 0.25]], 0);
    pie.setProps([['#33f', 0.3], ['#c33', 0.3]], 1);
