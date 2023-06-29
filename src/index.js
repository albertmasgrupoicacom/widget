import { ResultChart } from './result-chart';
import { SerieChart } from './serie-chart';
import { DataService } from './services/data.service';

export default function main({portletNamespace, contextPath, portletElementId,configuration}) {
    
    const dataService = new DataService();

    const node = document.getElementById(portletElementId);
    // node.innerHTML =`
    // <button id="exportPdf">PDF</button>
    // <button id="exportExcel">EXCEL</button>
    // <div id="graph_page" class="cis-caja-tot"></div>
    // `;
    node.innerHTML =`
    <div id="graph_page" class="cis-caja-tot"></div>
    `;  // TODO: descomentar

    // let graphic; // TODO: comentar
    switch (dataService.type) {
        case 'SERIE':
            graphic = new SerieChart();
            graphic.init();
            break;
        case 'PREGUNTA':
            graphic = new ResultChart();
            break;
    }

    

    // document.getElementById('exportPdf').onclick = () => {
    //     graphic.exportPdf();
    // }

    // document.getElementById('exportExcel').onclick = () => {
    //     graphic.exportExcel();
    // }
    
}