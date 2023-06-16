import { ResultChart } from './result-chart';
import { SerieChart } from './serie-chart';
import { DataService } from './services/data.service';


export default function main({portletNamespace, contextPath, portletElementId,configuration}) {
    
    const dataService = new DataService();

    let graphic;

    const node = document.getElementById(portletElementId);
    node.innerHTML =`
        <div>
            <button id="exportExcelButton">Excel</button>
            <button id="exportPdfButton">PDF</button>
        </div>
        <div id="graph_page" class="cis-caja-tot"></div>
    `;

    // let sltVariables = document.getElementById("sltVariables");
    let sltVariables = document.getElementById("_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_A0FERJkYdUPO_sltVariables");
    if(sltVariables) {
        sltVariables.addEventListener("change", ()=> {
            console.log('change variable 2',sltVariables.value);
            console.log('details',call.details);
            call.details.id_variable = sltVariables.value;
            if( graphic ) { graphic.init(url_basse, call.type, call.details);}
        });
    }

    // let sltCruce1 = document.getElementById("sltCruce1");
    let sltCruce1 = document.getElementById("_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_A0FERJkYdUPO_sltCruce1");
    if(sltCruce1) {
        sltCruce1.addEventListener("change", ()=> {
            console.log('change cruce 1',sltCruce1.value);
            console.log('details',call.details);
            call.details.id_cruce1 = sltCruce1.value;
            if( graphic ) { graphic.init(url_basse, call.type, call.details);}
        });
    }

    // let sltCruce2 = document.getElementById("sltCruce2");
    let sltCruce2 = document.getElementById("_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_A0FERJkYdUPO_sltCruce2");
    if(sltCruce2) {
        sltCruce2.addEventListener("change", ()=> {
            console.log('change cruce 2',sltCruce2.value);
            console.log('details',call.details);
            call.details.id_cruce2 = sltCruce2.value;
            if( graphic ) { graphic.init(url_basse, call.type, call.details);}
        });
    }

    let ocultaCruce1 = document.getElementById("_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_A0FERJkYdUPO_ocultaCruce1");
    if(ocultaCruce1) {
        ocultaCruce1.addEventListener("click", ()=> {
            console.log('remove cruce 1',ocultaCruce1.value);
            console.log('details',call.details);
            call.details.id_cruce1 = ocultaCruce1.value;
            if( graphic ) { graphic.init(url_basse, call.type, call.details);}
        });
    }

    let ocultaCruce2 = document.getElementById("_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_A0FERJkYdUPO_ocultaCruce2");
    if(ocultaCruce2) {
        ocultaCruce2.addEventListener("click", ()=> {
            console.log('remove cruce 2',ocultaCruce2.value);
            console.log('details',call.details);
            call.details.id_cruce2 = ocultaCruce2.value;
            if( graphic ) { graphic.init(url_basse, call.type, call.details);}
        });
    }

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