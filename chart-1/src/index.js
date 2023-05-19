import { Graphic } from './graphic';
import * as data from './mono_var.json';
export default function main({portletNamespace, contextPath, portletElementId}) {

    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div id="graph_table"></div>
        <canvas id="graph_chart"></canvas>
    </div>
    `;

    new Graphic(data.default)
    
}