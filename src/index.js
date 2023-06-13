import { HomeChart } from './home-chart';
import { Graphic } from './graphic';

/**
 * This is the main entry point of the portlet.
 *
 * See https://tinyurl.com/js-ext-portlet-entry-point for the most recent 
 * information on the signature of this function.
 *
 * @param  {Object} params a hash with values of interest to the portlet
 * @return {void}
 */

export default function main({portletNamespace, contextPath, portletElementId,configuration}) {

    // COMENTAR PARA LIFERAY
    const tipo = 'PREGUNTA';
    const numSerie = 16393;
    const cuestionarioSeleccionado = 17738; // 3400;
    const preguntaSeleccionada = 634460; //406338;
    const variableSeleccionada = 993194; //36501; // 993172
    const muestraSeleccionada = null; //6994;
    const variableCruce1Seleccionada = 993172; //36505;
    const variableCruce2Seleccionada = null; //993301;

    
    const node = document.getElementById(portletElementId);
    // node.innerHTML =`<div id="graph_page" class="cis-caja-tot"></div>`;
    node.innerHTML =`<div><button id="exportExcelButton">Excel</button><button id="exportPdfButton">PDF</button></div><div id="graph_page" class="cis-caja-tot"></div>`;

    // const url_basse = 'https://webserver-cis-dev.lfr.cloud/o/cis';
    const url_basse = 'http://77.227.0.28:8180/cis/apijds';
    const call = {type: tipo, details: {}};

    let graphic = new Graphic();


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

    let excel = document.getElementById('exportExcelButton').onclick = (event => {
        graphic.exportExcel();
    })

    let pdf = document.getElementById('exportPdfButton').onclick = (event => {
        graphic.exportPdf();
    })

    switch (call.type) {
        case 'SERIE':
            call.details = {'id': numSerie};
            break;
        case 'PREGUNTA':
            call.details = {
                'id_cuestionario': cuestionarioSeleccionado,
                'id_pregunta': preguntaSeleccionada,
                'id_variable': variableSeleccionada,
                'id_muestra': muestraSeleccionada,
                'id_cruce1': variableCruce1Seleccionada,
                'id_cruce2': variableCruce2Seleccionada
            }
            break;
    }

    // remove null or undefined keys
    Object.keys(call.details).forEach(key => {
        if (call.details[key] == null) {
          delete call.details[key];
        }
    });

    graphic.init(url_basse, call.type, call.details);
    
}