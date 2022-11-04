
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";

function App() {
    useEffect(() => {
        function makeLink(parentElement, childElement) {
            return new joint.shapes.standard.Link({
                source: { id: parentElement.id },
                target: { id: childElement.id },
            });
        }
        var jsonExemple = '{"squadName": "Super hero squad","homeTown": "Metro City","formed": 206,"secretBase": "Super tower","active": true,"members": [{"name": "Molecule Man","age": 29,"secretIdentity": "Dan Jukes","powers": ["Radiation resistance","Turning tiny","Radiation blast"]}, {   "name": "Madame Uppercut","age": 39, "secretIdentity": "Jane Wilson", "powers": ["Million tonne punch", "Damage resistance",     "Superhuman reflexes"] },{"name": "Eternal Flame","age": 1000000,   "secretIdentity": "Unknown",      "powers": [        "Immortality",        "Heat Immunity","Inferno","Teleportation","Interdimensional travel"]} ]}'
        var jsonData = JSON.parse(jsonExemple);

        var namespace = joint.shapes;
        var cells = []
        addToCells()
        var graph = new joint.dia.Graph({}, { cellNamespace: namespace });
        graph.resetCells(cells);
        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: 1000,
            height: 800,
            gridSize: 1,
            cellViewNamespace: namespace,

        });

        function addToCells() {
            var height = 100;
            var count = Object.keys(jsonData).length
            console.log(count);
            console.log(Object.keys(jsonData)[5]);
            for (let i = 0; i < count; i++) {
                var cell = {
                    id: nextId(),
                    type: 'standard.Rectangle',
                    position: {
                        x: 100,
                        y: height
                    },
                    size: {
                        width: 200,
                        height: 100
                    },
                    attrs: {
                        body: {
                            fill: 'blue',
                        },
                        label: {
                            text: Object.keys(jsonData)[i],
                            fill: 'white'
                        }
                    }
                }
                if (cell.attrs.label.text == 'members') {
                    var height2 = height;
                    var countChild = Object.keys(jsonData.members).length
                    for (let j = 0; j < countChild; j++) {
                        var childcell = {
                            id: nextId(),
                            type: 'standard.Rectangle',
                            position: {
                                x: 400,
                                y: height2
                            },
                            size: {
                                width: 200,
                                height: 100
                            },
                            attrs: {
                                body: {
                                    fill: 'red',
                                },
                                label: {
                                    text: jsonData.members[j].name,
                                    fill: 'white'
                                }
                            }
                        }
                        height2 += 150;
                        cells.push(childcell);
                        var link = makeLink(cell, childcell);
                        cells.push(link);
                    }
                }
                height += 150;
                cells.push(cell);
            }
        }

        const panZoom = svgPanZoom(paper.svg, {

            viewportSelector: paper.layers,
            zoomEnabled: true,
            panEnabled: false,
            controlIconsEnabled: true,
            maxZoom: 2,
            minZoom: 0.1,
            onUpdatedCTM: (function () {
                let currentMatrix = paper.matrix();
                return function onUpdatedCTM(matrix) {
                    const { a, d, e, f } = matrix;
                    const { a: ca, d: cd, e: ce, f: cf } = currentMatrix;
                    const translateChanged = (e !== ce || f !== cf)
                    if (translateChanged) {
                        paper.trigger('translate', e - ce, f - cf);
                    }
                    const scaleChanged = (a !== ca || d !== cd);
                    if (scaleChanged) {
                        paper.trigger('scale', a, d, e, f);
                    }
                    currentMatrix = matrix;
                }
            })()
        });


        paper.on('blank:pointerdown', function () {
            panZoom.enablePan();
        });

        paper.on('blank:pointerup', function () {
            panZoom.disablePan();
        });
    });

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>

        </div>
    );
}

export default App;
