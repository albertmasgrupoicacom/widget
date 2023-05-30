import { Graphic } from './graphic';
import * as data from './mono_var.json';


export default function main({portletNamespace, contextPath, portletElementId}) {

    const node = document.getElementById(portletElementId);
    node.innerHTML =`
    <div id="graph_container">
        <div id="graph_table"></div>
        <canvas id="graph_chart"></canvas>
        <button type="button" id="exportBtn"> Exportar a Excel </button>
        <button type="button" id="exportBtnPDF"> Exportar a PDF </button>
    </div>
    `;

    let graphic =new Graphic(data.default)

    document.getElementById('exportBtn').addEventListener('click', () => {
        graphic.exportToExcel();
      });

    document.getElementById('exportBtnPDF').addEventListener('click', () => {
        graphic.exportToPDF();
      });  
}