import Chart from 'chart.js/auto';
import { buttons, colors } from './utils/utils';
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
    this.variables = this._dataService.getVariables();
    this.cruce2SelectionIndex;
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

  getParsedData(data, etiqCruce2_index){
    const cloneData = JSON.parse(JSON.stringify(data));
    let newData = {datasets: [], titulo: cloneData.titulo, removeColumnsToPaint: 0, removeFilesToPaint:0};

    let labels = [];
    let datasets = [];
    let colorIndex = 0;

    let filas;

    // LABELS
    if(cloneData.etiqCruce1 ){
      filas = cloneData.etiqCruce1;
      filas.push({etiqueta: 'Total'});
      // labels = cloneData.etiqVar.map(label => label.etiqueta);
      labels = cloneData.etiqVar;
    } else if(cloneData.frecuencias ){
      filas = [];
      this.show_legend = false;
      filas.push({etiqueta: 'Nº de casos'});
      filas.push({etiqueta: '% Total'});
      // labels = cloneData.frecuencias.map(label => label.etiqueta);
      labels = cloneData.frecuencias;

      if( cloneData.N) {
        const n_label = {categoria: '0',esMissing: false,etiqueta: '(N)',etiqueta_abrev:'(N)',n: cloneData.N, total:100};
        labels.push(n_label);
      }
    }

    // DATASETS
    if(cloneData.frecuencias ) {
      filas.forEach(fila => {
        datasets.push({label: fila.etiqueta, data: [], backgroundColor: [] , borderColor: []});
        colorIndex == 6 ? colorIndex = 0 : colorIndex++;
      });
    } else {
      filas.forEach(fila => {
        datasets.push({label: fila.etiqueta, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
        colorIndex == 6 ? colorIndex = 0 : colorIndex++;
      });
    }

    // VALUES
    if(cloneData.etiqCruce1) {
        cloneData.cruce.slice(0, -1).map(x => {
          filas.map((fila, index) => {
            if( etiqCruce2_index >= 0) {
              datasets[index].data.push(x[index][etiqCruce2_index]);
            } else {
              datasets[index].data.push(x[index]);
            } 
          });
        })
      } else {  //
      cloneData.frecuencias.map((fila, index) => {
          datasets[0].data.push(fila.n);
          datasets[0].backgroundColor.push(colors[colorIndex]);
          index == 6 ? colorIndex = 0 : colorIndex++;

          if( fila.total){
            datasets[1].data.push(fila.total);
          }else{
            const valor = this._helpers.showInDecimal((fila.n * 100)/parseFloat(cloneData.N));
            datasets[1].data.push(valor);
          }
          newData.removeColumnsToPaint = 1;
      });
      // if(data.haymedia){
      //   let vars = [{id: 'base', name: '(N)'}, {id: 'desvEstandar', name: 'Desviación típica'}, {id: 'media', name: 'Media'},{id: 'n', name: 'N'}]
      //   vars.forEach(item => labels.push(item.name));
      //   datasets[0].data.push(this._helpers.showInDecimal(data.N));
      //   datasets[0].data.push(this._helpers.showInDecimal(data.media.desvEstandar));
      //   datasets[0].data.push(this._helpers.showInDecimal(data.media.media));
      //   datasets[0].data.push(this._helpers.showInDecimal(data.media.base));
      // }
    }
    newData.labels = labels;
    newData.datasets = datasets;
    return newData;
  }

  printContainers(data){
    for (let tableIndex = 0; tableIndex < data.ficha.tabla.length; tableIndex++) {
      this.printContainer(data, tableIndex);
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
      this.printTable(this.getParsedData(tableData, tableData.etiqCruce2 ? 0 : undefined), tableIndex, false, !tableData.frecuencias ? 'PREGUNTA':'FREQ');
  }

  
  addSelectorOperaciones(data, tableIndex) {
    const container = document.getElementById(`graph_container_${tableIndex}`);
    const selector = document.createElement('select');
    selector.setAttribute('id', `graph_selector_operaciones_${tableIndex}`)
    // const array = [{id: 0, etiqueta:'Valores Absolutos'},
    //               {id: 1, etiqueta:'Mostrar % (columna)'},
    //               {id: 2, etiqueta:'Mostrar % (columna - NS/NC)'},
    //               {id: 3, etiqueta:'Mostrar % (fila)'},
    //               {id: 4, etiqueta:'Mostrar % (fila - NS/NC)'},
    //               {id: 5, etiqueta:'Mostrar % (total)'},
    //               {id: 6, etiqueta:'Mostrar % (total - NS/NC)'}];
    const array = [{id: 0, etiqueta:'Valores Absolutos', delMissing: false},
                  {id: 1, etiqueta:'Mostrar % (columna)', delMissing: false},
                  {id: 2, etiqueta:'Mostrar % (columna - NS/NC)',delMissing: true},
                  {id: 3, etiqueta:'Mostrar % (fila)',delMissing: false},
                  {id: 4, etiqueta:'Mostrar % (fila - NS/NC)',delMissing: true},
                  {id: 5, etiqueta:'Mostrar % (total)',delMissing: false},
                  {id: 6, etiqueta:'Mostrar % (total - NS/NC)',delMissing: true}];
    for (var i = 0; i < array.length; i++) {
      let option = document.createElement("option");
      option.value = parseInt(i); //array[i].categoria;
      option.text = array[i].etiqueta;
      option.delMissing = array[i].delMissing;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      const cruce2 = data.etiqCruce2 ? true : false; // ??
      const delMissing = selector.options[selector.options.selectedIndex].delMissing;
      let newData = this.calculate(data,parseInt(e.target.value),cruce2,delMissing);
      // let newData = this.calculate(data, parseInt(e.target.value), cruce2);
      this.removeTable(tableIndex);
      this.printTable(this.getParsedData(newData,this.cruce2SelectionIndex),tableIndex,delMissing, 'PREGUNTA');
      // this.printTable(this.getParsedData(newData), tableIndex);
   })
   container.appendChild(selector);
  }

  calculate(data, type_value_index, isCruce2, delMissing){
    let newdata;
    const cloneData = JSON.parse(JSON.stringify(data));
    if ( type_value_index == 0) { 
      newdata = cloneData}; // Valores absolutos
    if ( type_value_index == 1) {
      console.log('Mostrar % (columna)');
      console.log(cloneData);
      if(!isCruce2) {
        let valor = 0;
        for (let i = 0; i < cloneData.etiqVar.length; i++) {
          for (let j = 0; j < cloneData.cruce[i].length; j++) {
            valor = cloneData.cruce[i][j];
            const index_sum = cloneData.etiqVar.length; // deberia ser etiqCruce1?
            valor = (valor * 100)/parseFloat(cloneData.cruce[index_sum][j])
            cloneData.cruce[i][j] = this._helpers.showInDecimal(valor);
          }
        }
        newdata = cloneData;
      }
      else {
        // CRUCE2 -> 
        let valor = 0;
        for (let i = 0; i < cloneData.etiqVar.length; i++) {
          for (let j = 0; j < cloneData.cruce[i].length; j++) {
            valor = cloneData.cruce[i][j][this.cruce2SelectionIndex];
            const index_sum = cloneData.etiqVar.length; // deberia ser etiqCruce1?
            valor = (valor * 100)/parseFloat(cloneData.cruce[index_sum][j][this.cruce2SelectionIndex]);
            cloneData.cruce[i][j] = this._helpers.showInDecimal(valor);
          }
        }
        newdata = cloneData;

      }
    }
    if ( type_value_index == 2) {
      console.log('Mostrar % (columna - NS/NC)');
      let valor = 0;
      let positionsToRemove = []; 
      cloneData.etiqVar.map( (x,index) => {
        if (x.esMissing) { positionsToRemove.push(index); }
      });
      cloneData.cruce.splice(positionsToRemove[0],2);
      cloneData.etiqVar = cloneData.etiqVar.filter( x => !x.esMissing);
      for (let i = 0; i < cloneData.etiqVar.length; i++) {
        for (let j = 0; j < cloneData.cruce[i].length; j++) {
          valor = cloneData.cruce[i][j];
          const index_sum = cloneData.etiqVar.length;

          let totalnsnc = 0; 
          positionsToRemove.map( cell => {
            totalnsnc += data.cruce[cell][j];
          })
          valor = (valor * 100)/(parseFloat(cloneData.cruce[index_sum][j]) - parseFloat(totalnsnc));
          cloneData.cruce[i][j] = this._helpers.showInDecimal(valor);
        }
      }
      newdata = cloneData;
    }
    if ( type_value_index == 3) {
      console.log('Mostrar % (fila)');
      let valor = 0;
      for (let i = 0; i <= cloneData.etiqVar.length; i++) {
        for (let j = 0; j < cloneData.cruce[i].length-1; j++) {
          valor = cloneData.cruce[i][j];
          const index_sum = cloneData.etiqCruce1.length;
          valor = (valor * 100)/parseFloat(cloneData.cruce[i][index_sum]);
          cloneData.cruce[i][j] = this._helpers.showInDecimal(valor);
        }
      }
      newdata = cloneData;
    }
    if ( type_value_index == 4) {
      console.log('Mostrar % (fila - NS/NC)');
      let valor = 0;
      let positionsToRemove = []; 
      cloneData.etiqVar.map( (x,index) => {
        if (x.esMissing) { positionsToRemove.push(index); }
      });
      cloneData.cruce.splice(positionsToRemove[0],2);
      cloneData.etiqVar = cloneData.etiqVar.filter( x => !x.esMissing);
      for (let i = 0; i <= cloneData.etiqVar.length; i++) {
        for (let j = 0; j < cloneData.cruce[i].length-1; j++) {
          valor = cloneData.cruce[i][j];
          const index_sum = cloneData.etiqCruce1.length;
          valor = (valor * 100)/parseFloat(cloneData.cruce[i][index_sum]);
          cloneData.cruce[i][j] = this._helpers.showInDecimal(valor);
        }
      }
      newdata = cloneData;
    }
    return newdata;
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
      this.cruce2SelectionIndex = e.target.value;
      this.removeTable(tableIndex);
      this.printTable(this.getParsedData(data, parseInt(e.target.value)), tableIndex, false, 'PREGUNTA');
    })
    container.appendChild(selector);
  }

  // data , tableIndex, delMissing(boolean), tipoTabla (FREQ,PREGUNTA)
  printTable(data, tableIndex, delMissing, tipoTabla){
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
      this.addCell(row, this._helpers.getEtiqueta(label));
      data.datasets.forEach(dataset => {this.addCell(row, dataset.data[index]);})
      tblBody.appendChild(row);
    })

    tblTable.appendChild(tblBody);
    tbl.appendChild(tblTable);
    container.appendChild(tbl);
    let chartConfig = container.getAttribute('config');
    data.labels = data.labels.map(label => this._helpers.getEtiqueta(label)); 

    if( data.removeColumnsToPaint >0) {
      const value = -Math.abs(data.removeColumnsToPaint);
      // data.datasets[0].data.pop();
      // data.datasets.pop();
      // data.labels.pop();
      data.datasets[0].data = data.datasets[0].data.slice(0,value);
      data.datasets = data.datasets.slice(0,value);
      data.labels = data.labels.slice(0,value);
    }
    this.printChart(data, tableIndex, chartConfig ? JSON.parse(chartConfig) : buttons[1]);
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

  // showInDecimal(number) {
  //   return number !== Math.round(number) ? parseFloat(number.toFixed(2)) : number;
  // }

  printChart(data, tableIndex, config){
    console.log(data);
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
    buttons.forEach(config => {
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