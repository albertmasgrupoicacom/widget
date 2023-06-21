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
    this.cruce2SelectedTable = 0;
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

  getParsedData(rawData, valueMode, cruce2Index){
    const data = JSON.parse(JSON.stringify(rawData));
    console.log(data);
    let newData = {datasets: [], titulo: data.titulo, labels: [], removeColumnsToPaint: 0, removeFilesToPaint:0};
    let colorIndex = 0;
    if(data.frecuencias){
      this.show_legend = false;
      let headers = [{etiqueta: 'N. de casos'}, {etiqueta: 'Total (%)'}];
      headers.forEach((header, index) => {
        let filaData = [];
        data.frecuencias.forEach(freq => {
          if(index == 0){newData.labels.push(freq.etiqueta_abrev || freq.etiqueta)};
          filaData.push(index == 0 ? freq.n : freq.porcentaje);
        });
        newData.datasets.push({label: header.etiqueta, data: filaData, backgroundColor: colors[colorIndex] , borderColor: []});
        colorIndex++;
      })

      if(data.N){
        newData.labels.push('(N)');
        newData.datasets[0].data.push(`(${data.N})`)
      };

      if(data.haymedia){
        let mediaItems = [{id: 'media', label: 'Media'}, {id: 'desvEstandar', label: 'Desviación típica'}, {id: 'base', label: 'N', bracets: true}];
        mediaItems.forEach(item => {
          newData.labels.push(item.label);
          newData.datasets[0].data.push(item.bracets ? `(${data.media[item.id]})` : data.media[item.id])
        })
      }

    }

    if(data.etiqCruce1){
      newData.labels = data.etiqVar.map(item => item.etiqueta_abrev || item.etiqueta);
      data.etiqCruce1.forEach((etiq, index) => {
        let filaData = [];
        let array = data.etiqCruce2 ? data[valueMode][cruce2Index] : data[valueMode];
        array.forEach(value => {filaData.push(value[index])});
        newData.datasets.push({label: etiq.etiqueta_abrev || etiq.etiqueta, data: filaData, backgroundColor: colors[colorIndex] , borderColor: []});
        colorIndex++;
      })

      if(valueMode.includes('_NSNC')){
        newData.labels = newData.labels.filter(label => !['N.S.', 'N.C.'].some(row => row == label));
      }
      
      if(newData.labels.length < newData.datasets[0].data.length){
        newData.labels.push(data.etiqCruce2 ? `(N) ${data.etiqCruce2[cruce2Index].etiqueta_abrev}` : '(N)')
      };

    }

    console.log(newData);
    return newData;
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
      if(!tableData.frecuencias) {this.addSelectorOperaciones(tableData, tableIndex)};
      if(tableData.etiqCruce2){this.printTableSelector(tableData, tableIndex)};
      this.printTable(this.getParsedData(tableData, this.operacionesSelectedTable, this.cruce2SelectedTable), tableIndex, false, !tableData.frecuencias ? 'PREGUNTA':'FREQ');
  }

  
  addSelectorOperaciones(data, tableIndex) {
    const container = document.getElementById(`graph_container_${tableIndex}`);
    const selector = document.createElement('select');
    selector.setAttribute('id', `graph_selector_operaciones_${tableIndex}`)
    const array = [
      {id: 0, etiqueta:'Valores Absolutos', data: 'cruce'},
      {id: 1, etiqueta:'Mostrar % (columna)', data: 'cruceV'},
      {id: 2, etiqueta:'Mostrar % (columna - NS/NC)', data: 'cruceV_NSNC'},
      {id: 3, etiqueta:'Mostrar % (fila)', data: 'cruceH'},
      {id: 4, etiqueta:'Mostrar % (fila - NS/NC)', data: 'cruceH_NSNC'},
      {id: 5, etiqueta:'Mostrar % (total)', data: 'cruceT'},
      {id: 6, etiqueta:'Mostrar % (total - NS/NC)', data: 'cruceT_NSNC'}
    ];
    for (var i = 0; i < array.length; i++) {
      let option = document.createElement("option");
      option.value = parseInt(i);
      option.text = array[i].etiqueta;
      option.data = array[i].data;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      this.operacionesSelectedTable = selector.options[selector.options.selectedIndex].data;
      this.removeTable(tableIndex);
      this.printTable(this.getParsedData(data, this.operacionesSelectedTable, this.cruce2SelectedTable), tableIndex);
   })
   container.appendChild(selector);
  }

  printTableSelector(data, tableIndex){
    const container = document.getElementById(`graph_container_${tableIndex}`);
    let selector = document.createElement('select');
    selector.setAttribute('id', `graph_selector_${tableIndex}`)
    for (var etiqIndex = 0; etiqIndex < data.etiqCruce2.length; etiqIndex++) {
      let option = document.createElement("option");
      option.value = parseInt(etiqIndex);
      option.text = data.etiqCruce2[etiqIndex].etiqueta;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      this.cruce2SelectedTable = e.target.value;
      this.removeTable(tableIndex);
      this.printTable(this.getParsedData(data, this.operacionesSelectedTable, this.cruce2SelectedTable), tableIndex, false, 'PREGUNTA');
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
    data.datasets.forEach(dataset => {this.addHeaderCell(headerrow, dataset.label)})

    tThead.appendChild(headerrow);
    tblTable.appendChild(tThead);
    
    const tblBody = document.createElement('tbody');

    data.labels.forEach((label, index) => {
      const row = document.createElement('tr');
      this.addCell(row, label);
      data.datasets.forEach(dataset => {this.addCell(row, dataset.data[index]);})
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