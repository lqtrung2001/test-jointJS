
import React, { useState, useEffect } from "react";
import './App.css';
import * as joint from 'jointjs'
import svgPanZoom from 'svg-pan-zoom';
import nextId from "react-id-generator";
import data from './data.js'

var width = 2000;
var x = 0;

function makeLink(parentElementID, childElementID) {
    return new joint.shapes.standard.Link({
        source: { id: parentElementID },
        target: { id: childElementID },
    });
}

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

function addToCells(jsonData, cells, links, testModel) {

    jsonData.forEach(task => {
        // console.log( 'flattan',flattenJSON(jsonData));
        let cell = makeCell("standard.Rectangle", task.id, task.id);
        cells.push(cell);

        let model = makeModel(task.id, task.id +'a')
        model.addPorts(ports);
        testModel.push(model);
        // console.log('testModel: ', testModel);

        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                // console.log("collected: ", deepDive(task.dependencies.elements, "", cells))
                task.dependencies.id = nextId();

                // node OR
                let operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                cells.push(operCells)

                deepDive(task.dependencies.elements, operCells, cells, links);

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
        if (node[key].type === "LogicalOperator") {
            // collector.push(deepDive(node[key].elements))
            // TODO: Ve hinh tron AND/OR
            // console.log("Draw ", node[key])
            node[key].id = nextId()
            let cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            cells.push(cell);
            let link = makeLink(cell.id, parent.id)
            links.push(link);
            // TODO: noi hinh tron   voi parent
            deepDive(node[key].elements, cell, cells, links)
            // Goi lai ham deepDive voi node = node[key].elements va parent = hinh tron
        } else if (node[key].type === "Task") {
            // console.log("task = ", node[key])
            // TODO: noi task voi parent cua no
            let link = makeLink(node[key].id, parent.id);
            links.push(link);
        }
    }
}

function setYforMapCells(mapCells) {
    for (let i = 0; i < mapCells.length; i++) {
        let tem = 1;
        for (let j = i + 1; j < mapCells.length; j++) {

            if (mapCells[i].y == 0 && mapCells[j].x == mapCells[i].x) {
                // console.log(" mapCells[i].y " + mapCells[i].y + " mapCells[j].x " + mapCells[j].x + " mapCells[i].x " +mapCells[i].x)
                mapCells[j].y = tem++;
            }
        }
    }
}

function addToMapCells(jsonData, mapCells) {

    console.log(mapCells)
    jsonData.forEach(task => {
        if (task.dependencies) {
            if (task.dependencies.type === "LogicalOperator") {
                let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == task.dependencies.id));
                let mapCellOper = mapCells[mapCellIndexOper];
                // console.log('map cell index Oper', mapCellIndexOper);
                if (mapCellOper.x === 0 && mapCellOper.y === 0) mapCellOper.x = ++x;
                const operCells = makeCell("standard.Circle", task.dependencies.operator, task.dependencies.id)
                deepDiveMapCells(task.dependencies.elements, mapCells);
            }
        }
    });
}
const deepDiveMapCells = (node, mapCells) => {
    let flag = 0;
    x++;
    for (const key in node) {
        let mapCellIndexOper = mapCells.findIndex((mapCell => mapCell.cell.id == node[key].id));
        let mapCellOper = mapCells[mapCellIndexOper];
        if (node[key].type === "LogicalOperator") {
            flag = 1;
            if (mapCellOper.x === 0 && mapCellOper.y === 0) {
                mapCellOper.x = x;
            }
            const cell = makeCell("standard.Circle", node[key].operator, node[key].id)
            deepDiveMapCells(node[key].elements, mapCells)
        } else if (node[key].type === "Task") {
            if (flag) {
                flag = 0;
                x--;
            }
            mapCellOper.x = x;
        }
    }
}
function setPosition(cells, mapCells) {
    cells.forEach((cell, index) => {
        cell.position = { x: cell.position.x - mapCells[index].x * 350, y: cell.position.y + mapCells[index].y * 250 }
    })
}
function putCellsToMapCells(cells, mapCells) {
    cells.forEach(cell => {
        mapCells.push({ cell, x: 0, y: 0 });
    })
}

const connect = function (source, sourcePort, target, targetPort, graph) {

    let link = new joint.shapes.standard.Link({
        source: {
            id: source.id,
            port: sourcePort
        },
        target: {
            id: target.id,
            port: targetPort
        }
    });

    link.addTo(graph).reparent();
};

// Actions
// có dấu X ở cái link để xóa nó đi
function showLinkTools(linkView) {
    let tools = new joint.dia.ToolsView({
        tools: [
            new joint.linkTools.Remove({
                distance: '50%',
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 7,
                        'fill': '#f6f6f6',
                        'stroke': '#ff5148',
                        'stroke-width': 2,
                        'cursor': 'pointer'
                    }
                }, {
                    tagName: 'path',
                    selector: 'icon',
                    attributes: {
                        'd': 'M -3 -3 3 3 M -3 3 3 -3',
                        'fill': 'none',
                        'stroke': '#ff5148',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    }
                }]
            })
        ]
    });
    linkView.addTools(tools);
}
const portsIn = {
    position: {
        name: 'left'
    },
    attrs: {
        portBody: {
            magnet: 'passive',
            r: 10,
            fill: '#087047',
            stroke: '#023047'
        }
    },
    label: {
        position: {
            name: 'left',
            args: { y: 6 }
        },
        markup: [{
            tagName: 'text',
            selector: 'label',
            className: 'label-text'
        }]
    },
    markup: [{
        tagName: 'circle',
        selector: 'portBody'
    }]
};

const portsOut = {
    position: {
        name: 'right'
    },
    attrs: {
        portBody: {
            magnet: true,
            r: 10,
            fill: '#E6A502',
            stroke: '#023047'
        }
    },
    label: {
        position: {
            name: 'right',
            args: { y: 6 }
        },
        markup: [{
            tagName: 'text',
            selector: 'label',
            className: 'label-text'
        }]
    },
    markup: [{
        tagName: 'circle',
        selector: 'portBody'
    }]
};
const ellipsePortsOut = {
    position: {
        name: 'right'
    },
    attrs: {
        portBody: {
            magnet: true,
            r: 10,
            fill: '#E6A502',
            stroke:'#023047'
        }
    },
    label: {
        position: {
            name: 'right',
            args: { y: 6 }
        },
        markup: [{
            tagName: 'text',
            selector: 'label',
            className: 'label-text'
        }]
    },
    markup: [{
        tagName: 'circle',
        selector: 'portBody'
    }]
};
const ellipsePortsIn = {
    position: {
        name: 'ellipseSpread',
        args: {
            dx: 1,
            dy: 1,
            dr: 1,
            startAngle: 220,
            step: 50,
            compensateRotation: false
        }
    },
    attrs: {
        portBody: {
            magnet: true,
            r: 10,
            fill: '#023047',
            stroke: '#023047'
        }
    },
    label: {
        position: {
            name: 'left',
            args: { y: 6 }
        },
        markup: [{
            tagName: 'text',
            selector: 'label',
            className: 'label-text'
        }]
    },
    markup: [{
        tagName: 'circle',
        selector: 'portBody'
    }]
};
const portsEsclip =[
    { 
        group: 'in',
        attrs: { label: { text: 'in1' }}
    },
    { 
        group: 'in',
        attrs: { label: { text: 'in2' }}
    },
    { 
        group: 'in',
        attrs: { label: { text: 'in3' }}
    },
    {
        group: 'out',
        attrs: { label: { text: 'out1' }}
    },
    {
        group: 'out',
        attrs: { label: { text: 'out2' }}
    }
]
const makeModelEllipse = (text, id) => {
    let a = new joint.shapes.standard.Ellipse({
        id,
        position: { x: 125, y: 60 },
        size: { width: 100, height: 75 },
        attrs: {
            root: {
                magnet: false
            },
            body: {
                fill: '#8ECAE6'
            },
            label: {
                text,
                fontSize: 16
            }
        },
        ports: {
            groups: {
                'in': ellipsePortsIn,
                'out': ellipsePortsOut
            }
        }
    });
    return a;
}
const makeModel = (text, id) => {
    let a = new joint.shapes.standard.Rectangle({
        id: id,
        position: { x: 125, y: 150 },
        size: { width: 90, height: 90 },
        attrs: {
            root: {
                magnet: false
            },
            body: {
                fill: '#8ECAE6',
            },
            label: {
                text,
                fontSize: 16,
                y: -10
            }
        },
        ports: {
            groups: {
                'in': portsIn,
                'out': portsOut
            }
        }
    });
    return a;
};

const ports = [
    {
        id: 'in1',
        group: 'in',
        attrs: { label: { text: 'input' } }
    },
   
    {
        id: 'out1',
        group: 'out',
        attrs: { label: { text: 'OK' } }
    },
    {
        id: 'out2',
        group: 'out',
        attrs: { label: { text: 'Not OK' } }
    }
]

function deleteLink(paper) {
    paper.on('link:mouseenter', (linkView) => {
        showLinkTools(linkView);
    });

    paper.on('link:mouseleave', (linkView) => {
        linkView.removeTools();
    });
}


// const model2 = model.clone().translate(300, 0).attr('label/text', 'Model 2');

function App() {
    const jsonData = data;
    const namespace = joint.shapes;
    const cells = [];
    const links = [];
    const testModel = [];
    const mapCells = [];
    const graph = new joint.dia.Graph({}, { cellNamespace: namespace });


    addToCells(jsonData, cells, links, testModel);
    putCellsToMapCells(cells, mapCells);
    addToMapCells(jsonData, mapCells);
    setYforMapCells(mapCells);
    setPosition(cells, mapCells);

    // console.log('data', cells)
    // console.log('data map', mapCells)

    graph.addCells([...cells, ...links]);


    const model = makeModel('trung', 'model1')
    model.addPorts(ports);
    const model2 = makeModel('trung2', 'model2').translate(300, 0)
    model2.addPorts(ports);
    testModel.push(model);
    testModel.push(model2);
    connect(model, 'out2', model2, 'in1', graph);

    graph.addCells(testModel);
    console.log('testModel final: ', testModel);

    const esclip = makeModelEllipse("esclip", "esclip")
    esclip.addPorts(portsEsclip)
    graph.addCell(esclip)
    useEffect(() => {

        const paper = new joint.dia.Paper({
            el: document.getElementById('myholder'),
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            cellViewNamespace: namespace,
            gridSize: 2,
            model: graph,
            linkPinning: false, // Prevent link being dropped in blank paper area
            defaultLink: () => new joint.shapes.standard.Link({
                attrs: {
                    wrapper: {
                        cursor: 'default'
                    }
                }
            }),
            defaultConnectionPoint: { name: 'boundary' },
            validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                // Prevent linking from output ports to input ports within one element.
                if (cellViewS === cellViewT) return false;
                // Prevent linking to output ports.
                return magnetT && magnetT.getAttribute('port-group') === 'in';
            },
            validateMagnet: function (cellView, magnet) {
                // Note that this is the default behaviour. It is shown for reference purposes.
                // Disable linking interaction for magnets marked as passive.
                return magnet.getAttribute('magnet') !== 'passive';
            },
            // // Enable mark available for cells & magnets
            markAvailable: true
        });
        zoompaper(paper);
        deleteLink(paper)

    });

    return (
        <div id='myholder'>
            <h1>aaaaaaaaaa</h1>
        </div>
    );
}

export default App;
