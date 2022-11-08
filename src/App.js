
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";
import data from './data.js'

function makeLink(parentElementID, childElementID) {
    return new joint.shapes.standard.Link({
        source: { id: parentElementID },
        target: { id: childElementID },
    });
}

function flattenJSON(obj) {
    let res = {}, extraKey = '';
    for (let key in obj) {
        if (typeof obj[key] !== 'object') {
            res[extraKey + key] = obj[key];
        } else {
            flattenJSON(obj[key], res, `${extraKey}${key}.`);
        };
    };
    // console.log('res', res);
    return res;
}
var width = 2000

const makeCell = (shape, text, id) => {

    return {
        id: id,
        type: shape,
        position: {
            x: width,
            y: 0
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
                text,
                fill: 'white'
            }
        }
    }
}
function zoompaper(paper) {
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
}

function addToCells(jsonData, cells, links) {

    jsonData.forEach(task => {
        // console.log( 'flattan',flattenJSON(jsonData));
        let cell = makeCell("standard.Rectangle", task.id, task.id);
        cells.push(cell);
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                // console.log("collected: ", deepDive(task.dependencies.elements, "", cells))
                task.dependencies.id = nextId();

                // width -= 250;
                // node OR
                let operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                cells.push(operCells)
                // mapCells.push({operCells, x:0 , y: 1})
                deepDive(task.dependencies.elements, operCells, cells, links);

                // operCells.position.y = 200
                // operCells.position.x = operCells.position.x + 100
                let link = makeLink(operCells.id, cell.id)
                links.push(link);
            }
        }

    });
    // console.log(jsonData)
}

const deepDive = (node, parent, cells, links) => {
    // console.log("node ", node)
    for (let key in node) {
        // width += 250;
        if (node[key].type === "LogicalOperator") {
            // width -= 250;
            // collector.push(deepDive(node[key].elements))
            // TODO: Ve hinh tron AND/OR
            // console.log("Draw ", node[key])
            node[key].id = nextId()
            let cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            cells.push(cell);
            let link = makeLink(cell.id, parent.id)
            links.push(link);
            // width -= 250;
            // TODO: noi hinh tron   voi parent
            // makeLink(parent, this)
            deepDive(node[key].elements, cell, cells, links)
            // Goi lai ham deepDive voi node = node[key].elements va parent = hinh tron
        } else if (node[key].type === "Task") {
            // width += 250;
            // console.log("task = ", node[key])
            // collector.push(node[key])
            // TODO: noi task voi parent cua no
            let link = makeLink(node[key].id, parent.id);
            links.push(link);
        }
    }
    // return collector;
}


var x = 0, y = 0;
var i = 0;
function setYforMapCells(mapCells) {
    console.log('aaaaaaaaaaaaaaa', mapCells.length)
    for (let i = 0; i < mapCells.length; i++) {
        let tem = 1;
        for (let j = i + 1; j < mapCells.length; j++) {
            
            if (mapCells[i].y == 0 && mapCells[j].x == mapCells[i].x)
            {
                console.log(" mapCells[i].y " + mapCells[i].y + " mapCells[j].x " + mapCells[j].x + " mapCells[i].x " +mapCells[i].x)
                mapCells[j].y = tem++;
            }
        }
    }
}

function addToMapCells(jsonData, mapCells) {
    jsonData.forEach(task => {
        const cell = makeCell("standard.Rectangle", task.id, task.id);
        // console.log('data cell',mapCells[0].cell.id)
        let mapCellIndex = mapCells.findIndex((mapCell => mapCell.cell.id == task.id));
        let mapCell = mapCells[mapCellIndex];
        console.log(i++, mapCellIndex);
        if (mapCell.x == 0 && mapCell.y == 0) {
            // console.log('map cell index', mapCellIndex);
            // console.log('map cell', mapCells[mapCellIndex]);
            // mapCell.x = x;
            // mapCell.y = y;
        }
        // mapCells.push(cell, x, y);
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                // task.dependencies.id = nextId();
                // node OR

                let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == task.dependencies.id));
                let mapCellOper = mapCells[mapCellIndexOper];
                // console.log('map cell index Oper', mapCellIndexOper);
                console.log(i++, mapCellIndexOper);
                if (mapCellOper.x === 0 && mapCellOper.y === 0) {
                    x = x + 1;
                    // console.log('map cell index Oper', mapCellIndexOper);
                    // console.log('map cell Oper', mapCells[mapCellIndexOper]);
                    mapCellOper.x = x;
                    // mapCellOper.y = y;

                }
                const operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                // mapCells.push({operCells, x:0 , y: 1})
                // x++;
                deepDiveMapCells(task.dependencies.elements, operCells, mapCells);
            }
        }

    });
}
const deepDiveMapCells = (node, parent, mapCells) => {
    let flag = 0;
    x++;
    for (const key in node) {
        let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == node[key].id));
        let mapCellOper = mapCells[mapCellIndexOper];
        if (node[key].type === "LogicalOperator") {
            flag = 1;
            if (mapCellOper.x === 0 && mapCellOper.y === 0) {
                mapCellOper.x = x;
                // mapCellOper.y = y;

            }
            const cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            // mapCells.push(cell);
            deepDiveMapCells(node[key].elements, cell, mapCells)
        } else if (node[key].type === "Task") {
            if (flag) {
                flag = 0;
                x--;
            }
            mapCellOper.x = x;
            // mapCellOper.y = y;
        }
        console.log(i++, mapCellIndexOper);
        // x = x + 1;
    }
}
function setPosition(cells, mapCells) {
    cells.forEach((cell, index) => {
        cell.position = { x: cell.position.x - mapCells[index].x * 350, y: cell.position.y + mapCells[index].y*250 }
        // console.log('aaaaaaaaaa', cell.setPosition )
    })
}

function App() {
    const jsonData = data;
    var namespace = joint.shapes;
    var cells = [];
    var links = [];
    const mapCells = []

    addToCells(jsonData, cells, links, mapCells)
    cells.forEach(cell => {
        mapCells.push({ cell, x: 0, y: 0 });
    })
    addToMapCells(jsonData, mapCells)
    setYforMapCells(mapCells)
    var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

    setPosition(cells, mapCells);
    graph.resetCells([...cells, ...links]);

    console.log('data', cells)
    console.log('data map', mapCells)

    useEffect(() => {

        var paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            cellViewNamespace: namespace,
        });
        zoompaper(paper);

    }, []);

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>

        </div>
    );
}

export default App;
