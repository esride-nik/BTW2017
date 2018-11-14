/// <reference path="../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../node_modules/@types/dojo/dijit.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "esri/config", "esri/Map", "esri/views/SceneView", "esri/renderers/SimpleRenderer", "esri/symbols/PolygonSymbol3D", "esri/symbols/ExtrudeSymbol3DLayer", "esri/widgets/Legend", "esri/layers/FeatureLayer", "esri/PopupTemplate", "dojo/dom", "dojo/dom-class", "dijit/_WidgetBase", "dojo/_base/lang", "dojo/on", "./cameraStatus"], function (require, exports, esriConfig, EsriMap, SceneView, SimpleRenderer, PolygonSymbol3D, ExtrudeSymbol3DLayer, Legend, FeatureLayer, PopupTemplate, dom, domClass, _WidgetBase, lang, on, CameraStatus) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import * as geoJson from './geoJson.json';
    var Btw2017 = /** @class */ (function (_super) {
        __extends(Btw2017, _super);
        function Btw2017(args) {
            var _this = _super.call(this, lang.mixin({ baseClass: "jimu-Btw2017" }, args)) || this;
            _this.partycolors = {
                "afd": [0, 158, 224, 1.0],
                "cducsu": [0, 0, 0, 1.0],
                "fdp": [255, 237, 0, 1.0],
                "spd": [226, 0, 26, 1.0],
                "linke": [227, 6, 19, 1.0],
                "gruene": [31, 175, 18, 1.0]
            };
            _this.partyname = {
                "afd": "AfD",
                "cducsu": "CDU/CSU",
                "fdp": "FDP",
                "spd": "SPD",
                "linke": "Die Linke",
                "gruene": "B90/Die Grünen"
            };
            _this.partymax = {
                "afd": 36,
                "cducsu": 55,
                "fdp": 20,
                "spd": 38,
                "linke": 30,
                "gruene": 22
            };
            if (!esriConfig || !esriConfig.request || !esriConfig.request.corsEnabledServers) {
                esriConfig.request.corsEnabledServers = [];
            }
            esriConfig.request.corsEnabledServers.push("a.tile.stamen.com", "b.tile.stamen.com", "c.tile.stamen.com", "d.tile.stamen.com");
            console.log("constructor");
            _this.startup();
            return _this;
        }
        Btw2017.prototype.startup = function () {
            this.initScene();
        };
        Btw2017.prototype.addMenuFunctionality = function (btwLayer) {
            var _this = this;
            // functionality for nav anchors
            Object.keys(this.partyname).map(function (name) {
                on(dom.byId(name), "click", function () {
                    btwLayer.renderer = _this.defineRenderer(name);
                    btwLayer.popupTemplate = _this.defineInfoTemplate(name);
                    _this.activateMenuButton(name);
                });
            });
            // functionality for select options
            on(dom.byId("selectParty"), "change", function (evt) {
                console.log("selectParty", evt, evt.srcElement.selectedOptions[0].value);
                if (evt && evt.srcElement && evt.srcElement.selectedOptions && evt.srcElement.selectedOptions[0]) {
                    btwLayer.renderer = _this.defineRenderer(evt.srcElement.selectedOptions[0].value);
                    btwLayer.popupTemplate = _this.defineInfoTemplate(evt.srcElement.selectedOptions[0].value);
                }
            });
        };
        Btw2017.prototype.activateMenuButton = function (activate) {
            this.deactivateAllMenuItemsBut([activate]);
            domClass.add(dom.byId(activate), "is-active");
        };
        Btw2017.prototype.deactivateAllMenuItemsBut = function (dontDeactivate) {
            Object.keys(this.partyname).map(function (name) {
                if (dontDeactivate.indexOf(name) === -1) {
                    domClass.remove(dom.byId(name), "is-active");
                }
            });
        };
        Btw2017.prototype.initScene = function () {
            console.log("initScene");
            var btwLayer = this.createBtwLayer();
            this.addMenuFunctionality(btwLayer);
            var esrimap = this.createMap(btwLayer);
            // The clipping extent for the scene
            var btwExtent = {
                xmin: 653028.001899999,
                ymin: 5986277.1178,
                xmax: 1674447.2595,
                ymax: 7373205.4343,
                spatialReference: {
                    wkid: 102100
                }
            }; // TS definitions don't support Extent autocast in ArcGIS JS 4.5 yet
            var sceneView = this.createSceneView(esrimap, btwExtent);
            sceneView.when(function () {
                var legend = new Legend({
                    view: sceneView,
                    layerInfos: [{
                            layer: btwLayer,
                            title: "Ergebnis pro Partei"
                        }]
                });
                sceneView.ui.add(legend, "bottom-right");
                var cameraStatus = new CameraStatus({
                    sceneView: sceneView
                });
                sceneView.ui.add(cameraStatus, "bottom-left");
            });
        };
        Btw2017.prototype.defineInfoTemplate = function (party) {
            var arcadeExpressionInfos = [
                {
                    name: "gains-losses-arcade",
                    title: "Gewinne und Verluste der " + this.partyname[party] + " in diesem Wahlkreis",
                    expression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13)"
                },
                {
                    name: "gains-losses-%-arcade",
                    title: "Gewinne und Verluste der " + this.partyname[party] + " in diesem Wahlkreis (%)",
                    expression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13) / $feature.btw17_WKR_" + party + "_zweit13 *100"
                }
            ];
            var infoTemplate = new PopupTemplate({
                title: "{Wahlkreise17_Wahlkreise17_WKR_1}, {Wahlkreise17_Wahlkreise17_LAND_}",
                fieldInfos: [{
                        fieldName: "btw17_WKR_W17_zweit_vor",
                        label: "Zeitstimmen gesamt 2017",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: "btw17_WKR_W13_zweit",
                        label: "Zeitstimmen gesamt 2013",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: "btw17_WKR_" + party + "_zweit",
                        label: "Zeitstimmen der " + this.partyname[party] + " 2017",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: "btw17_WKR_" + party + "_zweit13",
                        label: "Zeitstimmen der " + this.partyname[party] + " 2013",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: "expression/gains-losses-arcade",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: "expression/gains-losses-%-arcade",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }],
                expressionInfos: arcadeExpressionInfos,
                content: [{
                        // It is also possible to set the fieldInfos outside of the content
                        // directly in the popupTemplate. If no fieldInfos is specifically set
                        // in the content, it defaults to whatever may be set within the popupTemplate.
                        type: "fields"
                    }]
            });
            return infoTemplate;
        };
        Btw2017.prototype.createBtwLayer = function () {
            var party = "cducsu";
            var btwLayer = new FeatureLayer({
                //url: "https://services.arcgis.com/OLiydejKCZTGhvWg/arcgis/rest/services/Wahlkreise_2017_amtlichesErgebnis/FeatureServer/0",
                url: "https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Wahlkreise_2017_amtlichesErgebnis/FeatureServer/0",
                renderer: this.defineRenderer(party),
                popupTemplate: this.defineInfoTemplate(party),
                outFields: ["*"],
            });
            // Define elevationInfo and set it on the layer
            var currentElevationInfo = {
                mode: "relative-to-ground",
                offset: 1500,
                featureExpressionInfo: {
                    expression: "Geometry($feature).z * 10"
                },
                unit: "meters"
            };
            btwLayer.elevationInfo = currentElevationInfo;
            return btwLayer;
        };
        Btw2017.prototype.createMap = function (btwLayer) {
            var esrimap = new EsriMap({
                basemap: "gray",
                // ground: "world-elevation",
                layers: [btwLayer]
            });
            // var tiledLayer = new WebTileLayer({
            //     urlTemplate:
            //       "http://{subDomain}.tile.stamen.com/toner/{level}/{col}/{row}.png",
            //     subDomains: ["a", "b", "c", "d"],
            //     copyright:
            //       'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ' +
            //       'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
            //       'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ' +
            //       'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            //   });
            //   esrimap.add(tiledLayer);
            return esrimap;
        };
        Btw2017.prototype.createSceneView = function (esrimap, btwExtent) {
            var sceneViewProperties = {
                container: "viewDiv",
                map: esrimap,
                // Indicates to create a local scene
                viewingMode: "local",
                // Use the exent defined in clippingArea to define the bounds of the scene
                clippingArea: btwExtent,
                extent: btwExtent,
                // Allows for navigating the camera below the surface
                constraints: {
                    collision: {
                        enabled: false
                    },
                    tilt: {
                        max: 179.99
                    }
                },
                camera: {
                    position: {
                        latitude: 39.22,
                        longitude: 10.12,
                        z: -762850.07,
                        spatialReference: { wkid: 3857 }
                    },
                    heading: 0.0,
                    tilt: 115.84
                },
                environment: {
                    atmosphere: {
                        quality: "high"
                    },
                    starsEnabled: true
                }
            };
            return new SceneView(sceneViewProperties);
        };
        Btw2017.prototype.postCreate = function () {
            console.log("postCreate");
        };
        Btw2017.prototype.defineRenderer = function (party) {
            var vvSize = {
                type: "size",
                valueExpression: "($feature.btw17_WKR_" + party + "_zweit - $feature.btw17_WKR_" + party + "_zweit13) / $feature.btw17_WKR_" + party + "_zweit13 *100",
                valueExpressionTitle: "Gewinn/Verlust",
                stops: [
                    {
                        value: -150,
                        size: -200000,
                        label: "-150%"
                    },
                    {
                        value: 150,
                        size: 200000,
                        label: "+150%"
                    }
                ]
            };
            var vvColor = {
                type: "color",
                field: "btw17_WKR_" + party + "_zweitp",
                legendOptions: {
                    title: this.partyname[party]
                },
                stops: [
                    {
                        value: 0,
                        color: [255, 255, 255, 0.6],
                        label: "0%"
                    },
                    {
                        value: this.partymax[party],
                        color: this.partycolors[party],
                        label: this.partymax[party] + "%"
                    }
                ]
            };
            var renderer = new SimpleRenderer({
                symbol: new PolygonSymbol3D({
                    symbolLayers: [new ExtrudeSymbol3DLayer()]
                }),
                visualVariables: [vvSize, vvColor]
            });
            return renderer;
        };
        return Btw2017;
    }(_WidgetBase));
    var btw2017 = new Btw2017();
});
//# sourceMappingURL=main.js.map