import Chart from 'chart.js/auto';
import { resultButtons, colors } from './utils/utils';
import { ResultExport } from './utils/result-export';
import { HttpClient } from './utils/http-client';
import { base_url } from './environments/environment.prod';
import { DataService } from './services/data.service';
import { Helpers } from './utils/helpers';

export class ResultChart {
  
  constructor() {
    this._dataService = new DataService();
    this._http = new HttpClient();
    this._helpers = new Helpers();
    this._exportUtils = new ResultExport();
    this.data;
    this.operacionesSelectedTable = 'cruce';
    this.cruceSelectedTable = 0;
    this.show_legend = true;
  }
  
  init(){
    this.removeAllContainers();
    this._http.post(`${base_url}/resultados`, this._dataService.getParams()).then(data => {
      this.data = data;
      if(data && data.ficha) {this.printContainers(data)};
    }).catch(error => {
      console.error('Error', error);
    });
  }

  getParsedData(rawData, rawTableData){
    const operationSelected = this.operacionesSelectedTable;
    const cruceSelected = this.cruceSelectedTable;
    const data = JSON.parse(JSON.stringify(rawData));
    const tableData = JSON.parse(JSON.stringify(rawTableData));
    console.log(data);
    console.log(tableData);
    let result = {datasets: [], titulo: tableData.titulo, labels: [], removeColumnsToPaint: 0, removeFilesToPaint:0};
    let colorIndex = 0;
    let headers = [];
    switch (tableData.tipo_resultado) {
      case 'marginales':
        if(tableData.tipo_variable == 'MV' || tableData.tipo_variable == 'MD'){
          result.labels = data.ficha.componentes.map(item => item.titulo).concat('Total');
          headers = tableData.frecuencias;
          headers.forEach(header => {
            let row = []
            result.labels.forEach((label, index) => {row.push(header.porcentaje[index])})
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex] , borderColor: []});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1
          })
        }else{
          result.labels = ['N. de casos'].concat('Total');
          headers = tableData.frecuencias;
          headers.forEach((header, index) => {
            let row = [header.n, header.porcentaje]
            result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex] , borderColor: []});
            colorIndex = colorIndex == 5 ? 0 : colorIndex +1
          })
        }
        break;
      case 'cruce1':
        result.labels = tableData.etiqCruce1.map(item => item.etiqueta_abrev || item.etiqueta).concat('Total');
        headers = tableData.etiqVar;
        headers.forEach((header, index) => {
          let row = tableData[operationSelected][index];
          result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex] , borderColor: []});
          colorIndex = colorIndex == 5 ? 0 : colorIndex +1
        })
        break;
      case 'cruce2':
        result.labels = tableData.etiqCruce1.map(item => item.etiqueta_abrev || item.etiqueta).concat('Total');
        headers = tableData.etiqVar;
        headers.forEach((header, index) => {
          let row = tableData[operationSelected][cruceSelected][index];
          result.datasets.push({label: header.etiqueta, data: row, backgroundColor: colors[colorIndex] , borderColor: []});
          colorIndex = colorIndex == 5 ? 0 : colorIndex +1
        })
        break;
    }

    if(operationSelected.includes('_NSNC')){
      result.datasets = result.datasets.filter(dataset => !['N.S.', 'N.C.'].some(row => row == dataset.label));
    }

    console.log(result);
    return result;
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
      this.printOperationsSelector(data, tableData, tableIndex);
    };
    if(tableData.tipo_resultado == 'cruce2'){
      this.printOperationsSelector(data, tableData, tableIndex);
      this.printTableSelector(data, tableData, tableIndex);
    };
    let parsedData = this.getParsedData(data, tableData);
    this.printTable(parsedData, tableIndex);
  }

  printOperationsSelector(data, tableData, tableIndex) {
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
      this.printTable(this.getParsedData(data, tableData), tableIndex)
   })
   container.appendChild(selector);
  }

  printTableSelector(data, tableData, tableIndex){
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
      this.printTable(this.getParsedData(data, tableData), tableIndex)
    })
    container.appendChild(selector);
  }

  printTable(data, tableIndex){
    const container = document.getElementById(`graph_container_${tableIndex}`);
    const tbl = document.createElement('div');
    tbl.id = `graph_table_${tableIndex}`;
    tbl.classList.add('table', 'table-responsive', 'border-0');

    const tblTable = document.createElement('table');
    tblTable.id = `table_${tableIndex}`;
    tblTable.classList.add('cis-tabla', 'mb-5');

    const tThead = document.createElement('thead');
    const headerrow = document.createElement('tr');

    this.addHeaderCell(headerrow, '');
    data.labels.forEach(label => {this.addHeaderCell(headerrow, label)})

    tThead.appendChild(headerrow);
    tblTable.appendChild(tThead);
    
    const tblBody = document.createElement('tbody');

    data.datasets.forEach(dataset => {
      const row = document.createElement('tr');
      this.addCell(row, dataset.label);
      dataset.data.forEach(item => this.addCell(row, item))
      tblBody.appendChild(row);
    })

    tblTable.appendChild(tblBody);
    tbl.appendChild(tblTable);
    container.appendChild(tbl);
    let chartConfig = container.getAttribute('config');

    if( data.removeColumnsToPaint >0) {
      const value = -Math.abs(data.removeColumnsToPaint);
      data.datasets[0].data = data.datasets[0].data.slice(0,value);
      data.datasets = data.datasets.slice(0,value);
      data.labels = data.labels.slice(0,value);
    }
    this.printChart(data, tableIndex, chartConfig ? JSON.parse(chartConfig) : resultButtons[0]);
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

  printChart(data, tableIndex, config){
    let totalColumnIndex = data.labels.findIndex(label => label == 'Total');
    if(totalColumnIndex >= 0) { 
      data.labels.splice(totalColumnIndex, 1);
      data.datasets.map(dataset => dataset.data.splice(totalColumnIndex, 1));
    }
    const table = document.getElementById(`graph_table_${tableIndex}`);
    let canvas = document.createElement("canvas");
    canvas.id = `graph_chart_${tableIndex}`;
    canvas.classList.add('graph_chart')
    table.insertAdjacentElement('beforeend', canvas);
    new Chart(canvas, {
      type: config && config.type ? config.type : 'bar',
      data: data,
      options: {
        indexAxis: config && config.axis ? config.axis : 'x',
        plugins: {
          title: {
            display: true,
            text: data.titulo,
            position: 'top',
            color: '#005767',
            font: {size: 16}
          },
          legend: {
            display: this.show_legend,
            position: 'bottom',
          },
        },
        responsive: true,
        scales: {
          x: {stacked: config && config.stacked != undefined ? config.stacked : false},
          y: {beginAtZero: true, stacked: config && config.stacked != undefined ? config.stacked : false},
        },
      },
    });
    const container = document.getElementById(`graph_container_${tableIndex}`);
    container.setAttribute('config', JSON.stringify(config));
    this.printChartSelectionButtons(data, tableIndex);
  }

  printChartSelectionButtons(data, tableIndex){
    const chart = document.getElementById(`graph_chart_${tableIndex}`);
    let buttonsContainer = document.createElement('div');
    buttonsContainer.id = `graph_chart_${tableIndex}_buttons`;
    resultButtons.forEach(config => {
      let button = document.createElement('button');
      button.classList.add('graphic_btn', `graph_chart_${tableIndex}_button`);
      button.style.background = `url(${config.icon}) no-repeat`;
      button.onclick = () => {
        this.removeChart(tableIndex);
        this.printChart(data, tableIndex, config);
      }
      buttonsContainer.appendChild(button);
    });
    buttonsContainer.classList.add('my-3', 'd-flex', 'justify-content-end'); 
    chart.insertAdjacentElement('afterend', buttonsContainer);
  }

  removeAllContainers() {
    document.getElementById('graph_page').innerHTML = '';
  }

  removeTable(tableIndex) {
    document.getElementById(`graph_table_${tableIndex}`).remove();
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

}