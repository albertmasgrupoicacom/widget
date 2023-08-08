import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { resultButtons, colors, zoomButtonIcon } from './utils/utils';
import { ResultExport } from './utils/result-export';
import { HttpClient } from './utils/http-client';
import { base_url } from './environments/environment.prod';
import { DataService } from './services/data.service';
import { Helpers } from './utils/helpers';

function showPopUp(canvasId){
  console.log(canvasId);
}

export class ResultChart {
  
  constructor() {
    this._dataService = new DataService();
    this._http = new HttpClient();
    this._helpers = new Helpers();
    this._exportUtils = new ResultExport();
    this.data;
    // this.operacionesSelectedTable = 'cruce';
    this.operacionesSelectedTable;
    this.cruceSelectedTable = 0;
    this.pieSelectedDataset;
    this.legend = true;
    this.loading = false;
  }
  
  init(){
    this.removeAllContainers();
    if( !this.loading ) {
      this.loading = true;
      this._http.post(`${base_url}/resultados`, this._dataService.getParams()).then(data => {
        this.data = data;
        if( data.ficha.tabla[0].tipo_resultado == 'cruce1' || data.ficha.tabla[0].tipo_resultado == 'cruce2') {
          this.operacionesSelectedTable = 'cruce';
        }
        this.loading = false;
        if(data && data.ficha) {this.printContainers(data)};
      }).catch(error => {
        console.error('Error', error);
        this.loading = false;
      });
    }
  }

  getParsedData(rawTableData){
    const operationSelected = this.operacionesSelectedTable;
    const cruceSelected = this.cruceSelectedTable;
    const data = JSON.parse(JSON.stringify(this.data));
    const tableData = JSON.parse(JSON.stringify(rawTableData));
    let result = {datasets: [], totals: [], medias: [], titulo: tableData.titulo, labels: [], tipo_variable: tableData.tipo_variable || 'N', tipo_resultado: tableData.tipo_resultado};
    let colorIndex = 0;
    let headers = [];
    switch (tableData.tipo_resultado) {
      case 'marginales':
        if(tableData.tipo_variable == 'MV' ) {  // && !tableData.frecuencias  //|| tableData.tipo_variable == 'MD'
          result.labels = data.ficha.componentes.map(item => item.titulo);
          if( tableData.frecuencias[0].n.length > result.labels.length ) {
            //add Total
            result.labels.push('Total');
          }
          headers = tableData.frecuencias;
          headers.forEach(header => {
            let row = [...result.labels].map((label, index) => header.porcentaje[index]  );
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex]});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1;
          });
          result.totals.push({label: '(N)', data: [...result.labels].map(item => tableData.N)})
          if(tableData.haymedia && tableData.media){
            if(Array.isArray(tableData.media) ) {
              result.medias.push({label: 'Media', data: tableData.media.map( x => x.media)});
              result.medias.push({label: 'Desviación típica', data: tableData.media.map(x => x.desvEstandar)});
              result.medias.push({label: 'N', data: tableData.media.map(x => x.base)});
            } else {
              result.medias.push({label: 'Media', data: ['-', tableData.media.media]});
              result.medias.push({label: 'Desviación típica', data: ['-', tableData.media.desvEstandar]});
              result.medias.push({label: 'N', data: ['-', tableData.media.base]});
            }
          }
        }else{
          result.labels = ['N. de casos'].concat('Total');
          headers = tableData.frecuencias;
          headers.forEach(header => {
            let row = [header.n, header.porcentaje];
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex]});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1;
          })
          result.totals.push({label: '(N)', data: [tableData.N, '100%']})
          if(tableData.haymedia && tableData.media){
            result.medias.push({label: 'Media', data: ['-', tableData.media.media]});
            result.medias.push({label: 'Desviación típica', data: ['-', tableData.media.desvEstandar]});
            result.medias.push({label: 'N', data: ['-', tableData.media.base]});
          }
        }
        break;
      case 'cruce1':
        result.labels = tableData.etiqCruce1.map(item => item.etiqueta_abrev || item.etiqueta).concat('Total');
        result.labels = result.labels.filter( x => !this.checkNSNC(x));
        headers = tableData.etiqVar;
        headers.forEach((header, index) => {
          if(!this.checkNSNC(header.etiqueta)){
            let row = tableData[operationSelected][index];
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex]});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1;
          }
        })
        result.totals.push({label: '(N)', data: tableData[operationSelected][tableData[operationSelected].length-1]})
        if(tableData.hayMediaVar && tableData.mediasVariable){
          result.medias.push({label: 'Media', data: [...tableData.mediasVariable].map(item => item.media)});
          result.medias.push({label: 'Desviación típica', data: [...tableData.mediasVariable].map(item => item.desvEstandar)});
          result.medias.push({label: 'N', data: [...tableData.mediasVariable].map(item => item.base)});
        }
        break;
      case 'cruce2':
        result.labels = tableData.etiqCruce1.map(item => item.etiqueta_abrev || item.etiqueta).concat('Total');
        result.labels = result.labels.filter( x => !this.checkNSNC(x));
        headers = tableData.etiqVar;
        headers.forEach((header, index) => {
          if(!this.checkNSNC(header.etiqueta)){
            let row = tableData[operationSelected][cruceSelected][index];
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex]});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1;
          }
        })
        result.totals.push({label: `(N) ${tableData.etiqCruce2[cruceSelected].etiqueta}`, data: tableData[operationSelected][cruceSelected][tableData[operationSelected][cruceSelected].length-1]})
        if(tableData.haymediaVariable && tableData.mediasVariable){
          result.medias.push({label: 'Media', data: [...tableData.mediasVariable[cruceSelected]].map(item => item.media)});
          result.medias.push({label: 'Desviación típica', data: [...tableData.mediasVariable[cruceSelected]].map(item => item.desvEstandar)});
          result.medias.push({label: 'N', data: [...tableData.mediasVariable[cruceSelected]].map(item => item.base)});
        }
        break;
    }
    console.log(result);
    return result;
  }

  checkNSNC(label){
    if( !this.operacionesSelectedTable) return false;
    return this.operacionesSelectedTable.includes('_NSNC') ? ['N.S.', 'N.C.', 'Ninguno'].includes(label) : false;
  }

  printContainers(data){
    if(data.ficha.tabla && data.ficha.tabla.length){
      for (let tableIndex = 0; tableIndex < data.ficha.tabla.length; tableIndex++) {
        this.printContainer(data, tableIndex);
      }
    }
  }

  printContainer(data, tableIndex){
    const page = document.getElementById('graph_page');
    let container = document.createElement('div');
    container.id = `graph_container_${tableIndex}`;
    page.appendChild(container);
    let tableData = data.ficha.tabla[tableIndex];
    if(tableData.tipo_resultado == 'cruce1'){
      this.printOperationsSelector(tableData, tableIndex);
    };
    if(tableData.tipo_resultado == 'cruce2'){
      this.printOperationsSelector(tableData, tableIndex);
      this.printTableSelector(tableData, tableIndex);
    };
    this.printTable(this.getParsedData(tableData), tableIndex);
  }

  printOperationsSelector(tableData, tableIndex) {
    const container = document.getElementById(`graph_container_${tableIndex}`);
    const selector = document.createElement('select');
    selector.setAttribute('id', `graph_selector_operaciones_${tableIndex}`)
    const array = [
      {etiqueta:'Valores Absolutos', data: 'cruce'},
      {etiqueta:'Mostrar % (columna)', data: 'cruceV'},
      {etiqueta:'Mostrar % (columna - NS/NC)', data: 'cruceV_NSNC'},
      {etiqueta:'Mostrar % (fila)', data: 'cruceH'},
      {etiqueta:'Mostrar % (fila - NS/NC)', data: 'cruceH_NSNC'},
      {etiqueta:'Mostrar % (total)', data: 'cruceT'},
      {etiqueta:'Mostrar % (total - NS/NC)', data: 'cruceT_NSNC'}
    ];
    for (var i = 0; i < array.length; i++) {
      let option = document.createElement("option");
      option.value = array[i].data;
      option.text = array[i].etiqueta;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      this.operacionesSelectedTable = e.target.value;
      this.removeTable(tableIndex);
      this.printTable(this.getParsedData(tableData), tableIndex);
   })
   container.appendChild(selector);
  }

  printTableSelector(tableData, tableIndex){
    const container = document.getElementById(`graph_container_${tableIndex}`);
    let selector = document.createElement('select');
    selector.setAttribute('id', `graph_selector_${tableIndex}`)
    for (var i = 0; i < tableData.etiqCruce2.length; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = tableData.etiqCruce2[i].etiqueta;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      this.cruceSelectedTable = e.target.value;
      this.removeTable(tableIndex)
      this.printTable(this.getParsedData(tableData), tableIndex)
    })
    container.appendChild(selector);
  }

  printTable(tableData, tableIndex){
    const container = document.getElementById(`graph_container_${tableIndex}`);
    const tbl = document.createElement('div');
    tbl.id = `graph_table_${tableIndex}`;
    tbl.classList.add('table', 'table-responsive', 'border-0', tableData.labels.length > 4 ? 'table-compressed' : 'table-expanded');

    const tblTable = document.createElement('table');
    tblTable.id = `table_${tableIndex}`;
    tblTable.classList.add('cis-tabla', 'mb-5');

    const tThead = document.createElement('thead');
    const headerrow = document.createElement('tr');

    this.addHeaderCell(headerrow, '');
    tableData.labels.forEach(label => {this.addHeaderCell(headerrow, label)})

    tThead.appendChild(headerrow);
    tblTable.appendChild(tThead);
    
    const tblBody = document.createElement('tbody');

    tableData.datasets.forEach(dataset => {
      const row = document.createElement('tr');
      this.addCell(row, dataset.label);
      dataset.data.forEach(item => this.addCell(row, item))
      tblBody.appendChild(row);
    })

    tableData.totals.forEach(dataset => {
      const row = document.createElement('tr');
      row.classList.add('table_highlight_background')
      this.addCell(row, dataset.label);
      dataset.data.forEach(item => this.addCell(row, item))
      tblBody.appendChild(row);
    })

    tableData.medias.forEach((dataset, index) => {
      const row = document.createElement('tr');
      row.classList.add(index == tableData.medias.length - 1 ? 'table_highlight_background' : 'table_highlight_text')
      this.addCell(row, dataset.label);
      dataset.data.forEach(item => this.addCell(row, item))
      tblBody.appendChild(row);
    })

    tblTable.appendChild(tblBody);
    tbl.appendChild(tblTable);
    container.appendChild(tbl);
    let chartConfig = container.getAttribute('config');

    this.printChart(tableData, tableIndex, chartConfig ? JSON.parse(chartConfig) : resultButtons[0]);
  }

  addHeaderCell(row, contenido) {
    const headerCell = document.createElement('th');
    const cellText = document.createTextNode(contenido);
    headerCell.appendChild(cellText);
    row.appendChild(headerCell);
  }

  addCell(row, contenido) {
    const cell = document.createElement('td');
    const cellText = document.createTextNode(contenido);
    cell.appendChild(cellText);
    cell.classList.add('td');
    row.appendChild(cell);
  }

  printChart(tableData, tableIndex, config){
    const table = document.getElementById(`graph_table_${tableIndex}`);
    let canvas = document.createElement("canvas");
    canvas.id = `graph_chart_${tableIndex}`;
    canvas.classList.add('graph_chart')
    table.insertAdjacentElement('beforeend', canvas);
    let tableDataCopy = JSON.parse(JSON.stringify(tableData));
    new Chart(canvas, {
      plugins: [ChartDataLabels],
      type: config && config.type ? config.type : 'bar',
      data: config && config.type == 'pie' ? this.getPieData(tableDataCopy) : this.removeTotalColumn(tableDataCopy),
      options: {
        indexAxis: config && config.axis ? config.axis : 'x',
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || context.dataset.labels[context.dataIndex] || '';
                label += ': ' || '';
                label += this.operacionesSelectedTable != 'cruce' ? `${context.formattedValue || '-'}%` : context.formattedValue || '-';
                return label;
            }
            }
          },
          // legend: {
          //   labels: {
          //     padding: 10
          //   }
          // },
          datalabels: {
            labels: {
                name: config.type !== 'bar' ? {  //PIE NAME
                  anchor: 'end',
                  display: 'auto',
                  font: {size: 16},
                  color: '#000',
                  font: this.fontFunction,
                  formatter: function(value, context) {
                    let label = context.chart.data.labels[context.dataIndex];
                    return label || ''
                  }
                } : '',
                value: config.type !== 'bar' ? {  // PIE VALUE
                  borderColor: this.printLabel,
                  borderWidth: (context) => {
                    let value = context.dataset.data[context.dataIndex];
                    return value < 5 ? 0 : 1;
                  },
                  borderRadius: 3,
                  color: this.printLabel,
                  formatter: (value, context) => {
                    let visibleValue = value < 5 ? undefined : value;
                    let result = (this.operacionesSelectedTable != 'cruce' && value && visibleValue) ? `${visibleValue}%` : visibleValue ?`${visibleValue}`: '';
                    return result;
                  },
                  padding: 2
                } : {    // BAR VALUE
                  align: this.alignFunction(config.stacked),
                  anchor: this.anchorFunction(config.stacked),
                  display: 'auto',
                  font: {
                    weight: 'bold'
                  },
                  color: (context) => {
                    let backgroundColor = context.dataset.backgroundColor;
                    if( config.stacked ) { backgroundColor = this.printLabelStacked(context);}
                    return backgroundColor;
                  },
                  formatter: (value,context) => {
                    // const numBars = tableData.datasets.length * tableData.datasets[0].data.length;
                    let retorn = context.dataset.data[context.dataIndex] || '';
                    retorn += (this.operacionesSelectedTable != 'cruce' && retorn != '') ? `%` : context.formattedValue || '';
                    // return numBars < 189 ? retorn : '';
                    return retorn;
                  },
                  padding: 0
                }
            }
          },
        },
        radius: '70%',
        responsive: true,
        scales: {
          x: {stacked: config && config.stacked != undefined ? config.stacked : false},
          y: {beginAtZero: true, stacked: config && config.stacked != undefined ? config.stacked : false},
        },
      },
    });
    const container = document.getElementById(`graph_container_${tableIndex}`);
    container.setAttribute('config', JSON.stringify(config));
    this.printChartSelectionButtons(tableData, tableIndex);
  }

  getPieData(tableData){
    let dataCopy = JSON.parse(JSON.stringify(tableData));
    let datasets = JSON.parse(JSON.stringify(dataCopy.datasets))
    dataCopy.labels = datasets.map(d => d.label)
    let dataset = {labels: dataCopy.labels, data: datasets.map(dataset => dataset.data[this.pieDatasetSelected != undefined ? this.pieDatasetSelected : 1]), backgroundColor: colors}
    dataCopy.datasets = [dataset];
    return dataCopy
  }

  removeTotalColumn(tableData){
    const dataCopy = JSON.parse(JSON.stringify(tableData));
    let totalColumnIndex = dataCopy.labels.findIndex(label => label == 'Total');
    switch (tableData.tipo_resultado) {
      case 'marginales':
        if(tableData.tipo_variable == 'MV' ) {  // && !tableData.frecuencias //|| tableData.tipo_variable == 'MD'
          if(totalColumnIndex >= 0) {
            dataCopy.labels.splice(totalColumnIndex, 1);
            dataCopy.datasets.map(dataset => dataset.data.splice(totalColumnIndex,1));
          }
        }else{
          if(totalColumnIndex >= 0) {
            dataCopy.labels = ['Total'];
            dataCopy.datasets.map(dataset => dataset.data.splice(0,totalColumnIndex));
          }
        }
        break;
      case 'cruce1':
        
        if(totalColumnIndex >= 0) {
          dataCopy.labels.splice(totalColumnIndex, 1);
          dataCopy.datasets.map(dataset => dataset.data.splice(totalColumnIndex,1));
        }
        break;
      case 'cruce2':
        if(totalColumnIndex >= 0) {
          dataCopy.labels.splice(totalColumnIndex, 1);
          dataCopy.datasets.map(dataset => dataset.data.splice(totalColumnIndex,1));
        }
        break;
    }
    return dataCopy;
  }

  printChartSelectionButtons(tableData, tableIndex){
    const chart = document.getElementById(`graph_chart_${tableIndex}`);
    let buttonsContainer = document.createElement('div');
    buttonsContainer.id = `graph_chart_${tableIndex}_buttons`;

    let zoomButton = document.createElement('button');
      zoomButton.classList.add('graphic_btn', `graph_chart_${tableIndex}_button`);
      zoomButton.style.background = `url(${zoomButtonIcon}) no-repeat`;
      zoomButton.onclick = () => {
        showPopUp(`graph_chart_${tableIndex}`)
      }
      buttonsContainer.appendChild(zoomButton);

    const showButtons = resultButtons.filter(f => f.showCondition.includes(tableData.tipo_variable));
    showButtons.forEach(config => {
      let button = document.createElement('button');
      button.classList.add('graphic_btn', `graph_chart_${tableIndex}_button`);
      button.style.background = `url(${config.icon}) no-repeat`;
      button.onclick = () => {
        this.removePieDatasetSelector(tableIndex);
        if(config.type == 'pie'){
          this.pieDatasetSelected = tableData.labels.length-1;
          this.printPieDatasetSelector(tableData, tableIndex);
        }else{
          this.pieDatasetSelected = undefined;
        }
        this.removeChart(tableIndex);
        this.printChart(tableData, tableIndex, config);
      }
      buttonsContainer.appendChild(button);
    });
    buttonsContainer.classList.add('my-3', 'd-flex', 'justify-content-end'); 
    chart.insertAdjacentElement('afterend', buttonsContainer);
  }

  printPieDatasetSelector(tableData, tableIndex) {
    let table = this.data.ficha.tabla[0];
    if(table.tipo_resultado != 'marginales'){
      const container = document.getElementById(`graph_container_${tableIndex}`);
      const selector = document.createElement('select');
      selector.setAttribute('id', `graph_selector_pie_${tableIndex}`);
      let array = tableData.labels
      for (var i = 0; i < array.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = array[i];
        option.defaultSelected = this.pieDatasetSelected
        selector.appendChild(option);
      }
      selector.addEventListener("change", e => {
        let config = JSON.parse(container.getAttribute('config'));
        this.pieDatasetSelected = e.target.value;
        this.removeChart(tableIndex);
        this.printChart(this.getParsedData(this.data.ficha.tabla[0]), tableIndex, config);
     })
     const tableHTML = document.getElementById(`graph_table_${tableIndex}`);
     tableHTML.insertAdjacentElement('beforebegin', selector);
    }
  }

  removeAllContainers() {
    document.getElementById('graph_page').innerHTML = '';
    this.data = undefined;
    // this.operacionesSelectedTable = 'cruce';
    this.operacionesSelectedTable = undefined;
    this.cruceSelectedTable = 0;
    this.pieSelectedDataset = undefined;
  }

  removeTable(tableIndex) {
    document.getElementById(`graph_table_${tableIndex}`).remove();
  }

  removePieDatasetSelector(tableIndex) {
    let pieSelector = document.getElementById(`graph_selector_pie_${tableIndex}`)
    if(pieSelector){pieSelector.remove()}
  }

  removeChart(tableIndex) {
    document.getElementById(`graph_chart_${tableIndex}`).remove();
    document.getElementById(`graph_chart_${tableIndex}_buttons`).remove();
  }

  exportExcel(){
    if(this.data){this._exportUtils.exportToExcel(this.data)}
  }
  
  exportPdf(){
    if(this.data){this._exportUtils.exportToPDF(this.data)}
  }

  printLabel (data) {
    let  rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(data.dataset.backgroundColor[data.dataIndex]);
    if( rgb ) {
        const rgbR = {r: parseInt(rgb[1], 16), g: parseInt(rgb[2], 16), b: parseInt(rgb[3], 16)};
        let threshold = 140;
        let luminance = 0.299 * rgbR.r + 0.587 * rgbR.g + 0.114 * rgbR.b;
        return luminance > threshold ? 'black' : 'white';
    } else {
        return 'white';
    }
  }

  printLabelStacked (data) {
    let  rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Array.isArray(data.dataset.backgroundColor[data.dataIndex]) ? data.dataset.backgroundColor[data.dataIndex] : data.dataset.backgroundColor);
    if( rgb ) {
        const rgbR = {r: parseInt(rgb[1], 16), g: parseInt(rgb[2], 16), b: parseInt(rgb[3], 16)};
        let threshold = 140;
        let luminance = 0.299 * rgbR.r + 0.587 * rgbR.g + 0.114 * rgbR.b;
        return luminance > threshold ? 'black' : 'white';
    } else {
        return 'white';
    }
  }

  alignFunction(stacked) {
    let align = 'center';
    if( !stacked ) {align = 'end';}
    return align;
  }

  anchorFunction(stacked) {
    let anchor = 'center';
    if( !stacked ) {anchor = 'end';}
    return anchor;
  }

  fontFunction(context) {
          var w = context.chart.width;
          return {
            size: w < 512 ? 12 : 14,
            weight: 'bold',
          };
    }

}