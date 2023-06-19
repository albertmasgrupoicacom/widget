import { ResultChart } from './result-chart';
import { SerieChart } from './serie-chart';
import { DataService } from './services/data.service';

export default function main({portletNamespace, contextPath, portletElementId,configuration}) {
    
    const dataService = new DataService();

    const node = document.getElementById(portletElementId);
    node.innerHTML =`
        <div>
            <button id="exportExcelButton">Excel</button>
            <button id="exportPdfButton">PDF</button>
        </div>
        <div id="graph_page" class="cis-caja-tot"></div>
    `;

    let excelButton = document.getElementById("exportExcelButton");
    if(excelButton) {excelButton.onclick = (event => graphic.exportExcel())}

    let pdfButton = document.getElementById("exportPdfButton");
    if(pdfButton) {pdfButton.onclick = (event => graphic.exportPdf())}
    
    switch (dataService.type) {
        case 'SERIE':
            graphic = new SerieChart();
            break;
        case 'PREGUNTA':
            graphic = new ResultChart();
            break;
    }

    graphic.init();
    
}