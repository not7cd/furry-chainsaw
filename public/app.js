'use strict'
const globe = new WorldWind.WorldWindow("globe");

globe.addLayer(new WorldWind.BMNGOneImageLayer());
globe.addLayer(new WorldWind.BMNGLandsatLayer());
var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
globe.addLayer(placemarkLayer);
var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);

placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);
let layers = [
    // Imagery layers.
    {
        layer: new WorldWind.BMNGLayer(),
        enabled: true
    },
    // Add atmosphere layer on top of base layer.
    {
        layer: new WorldWind.AtmosphereLayer(),
        enabled: true
    }
];

for (var l = 0; l < layers.length; l++) {
    layers[l].layer.enabled = layers[l].enabled;
    globe.addLayer(layers[l].layer);
}
// Create a layer to hold the polygons.
var polygonsLayer = new WorldWind.RenderableLayer();
polygonsLayer.displayName = "Polygons";
globe.addLayer(polygonsLayer);

let json = 'https://data.nasa.gov/resource/y77d-th95.geojson';
let geoDatas = [];

fetch(json)
    .then(response => response.json())
    .then(getData)

function getData(data) {
    data.features.map(item => createPin(item.geometry.coordinates))
}

function createPin(latlong) {
    let position = new WorldWind.Position(latlong[0], latlong[1], 100.0);

    let placemark = new WorldWind.Placemark(position, false, placemarkAttributes);

    placemark.label = "Metor\n" +
        "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
        "Lon " + placemark.position.longitude.toPrecision(5).toString();
    placemark.alwaysOnTop = true;

    placemarkLayer.addRenderable(placemark);
}


// // Define an outer and an inner boundary to make a polygon with a hole.
// let boundaries = [];
// boundaries[0] = []; // outer boundary
// boundaries[0].push(new WorldWind.Position(-10, 130.007, 1e5));
// boundaries[0].push(new WorldWind.Position(-99.686, 60.007, 1e5));
// boundaries[0].push(new WorldWind.Position(-102.686, 60.007, 1e5));



// // Create the polygon and assign its attributes.

// var polygon = new WorldWind.Polygon(boundaries, null);
// polygon.altitudeMode = WorldWind.ABSOLUTE;
// polygon.extrude = true; // extrude the polygon edges to the ground

// var polygonAttributes = new WorldWind.ShapeAttributes(null);
// polygonAttributes.drawInterior = true;
// polygonAttributes.drawOutline = true;
// polygonAttributes.outlineColor = WorldWind.Color.BLUE;
// polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
// polygonAttributes.drawVerticals = polygon.extrude;
// polygonAttributes.applyLighting = true;
// polygon.attributes = polygonAttributes;

// // Create and assign the polygon's highlight attributes.
// var highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
// highlightAttributes.outlineColor = WorldWind.Color.RED;
// highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
// polygon.highlightAttributes = highlightAttributes;

// // Add the polygon to the layer and the layer to the WorldWindow's layer list.
// polygonsLayer.addRenderable(polygon);