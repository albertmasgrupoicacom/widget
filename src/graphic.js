import Chart from 'chart.js/auto';
import { buttons, exportButtons } from './utils/utils';
import { ExportUtils } from './utils/export-utils';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];
const exportUtils = new ExportUtils();

export class Graphic {


  constructor(base_url, type, details) {

    let url = type == 'SERIE' ? `${base_url}/serie/${details.id}` : `${base_url}/resultados`;

    this.getData(type, url, details).then(data => {
      this.printContainers(type, data);
    }).catch(error => {
      console.error('Error', error);
    });

  }

  async getData(type, url, params){
    let method = 'GET';
    let headers = {};
    let body = '';
    if(type == 'PREGUNTA'){
      method = 'POST';
      //headers = new Headers({'Authorization': 'Basic Y3VzdG9tZXI6eUkyc0ZxRnh0UkxKNVZOUWVYRnpmMXA4R1dNTDZZ'});
      headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'});
      Object.entries(params).forEach(([key, value], index) => {body += `${index != 0 ? '&' : ''}${encodeURIComponent(key)}=${encodeURIComponent(value)}`});
    }
    let response = await fetch(url, {method: method, headers: headers, body: body ? body : undefined});
    let result = await response.json();
    return result;
  }

  refreshData(base_url, type, details) {
    let url = type == 'SERIE' ? `${base_url}/serie/${details.id}` : `${base_url}/resultados`;
    this.removeAllContainers();
    this.getData(type, url, details).then(data => {
      if( data && data.ficha && data.ficha.tabla) {
        this.printContainers(type, data);
      }
    }).catch(error => {
      console.warn('No Data', error);
      console.error('Error', error);
    });
  }

  removeAllContainers() {
    const page = document.getElementById('graph_page');
    page.innerHTML = '';
  }

  printContainers(type, data){
    if(type == 'PREGUNTA'){
      for (let tableIndex = 0; tableIndex < data.ficha.tabla.length; tableIndex++) {
        this.printContainer(type, data, tableIndex);
      }
    }else{
      this.printContainer(type, data);
    }
  }

  printContainer(type, data, tableIndex){
    const page = document.getElementById('graph_page');
    let container = document.createElement('div');
    container.setAttribute('id', tableIndex >= 0 ? `graph_container_${tableIndex}` : 'graph_container');
    page.appendChild(container);
    if(type == 'PREGUNTA'){
      let tableData = data.ficha.tabla[tableIndex];
      if(tableData.etiqCruce2){this.printTableSelector(type, tableData, tableIndex)};
      this.printTable(type, this.getParsedData(type, tableData, tableData.etiqCruce2 ? 0 : undefined), tableIndex);
    }else{
      this.printTable(type, this.getParsedData(type, data));
      this.printHeaderSerie(type,data);
    }
  }

  printTableSelector(type, data, tableIndex){
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
      this.removeTable(tableIndex);
      this.printTable(type, this.getParsedData(type, data, parseInt(e.target.value)), tableIndex);
    })
    container.appendChild(selector);
  }

  printTable(type, data, tableIndex){
    const container = document.getElementById(tableIndex >= 0 ? `graph_container_${tableIndex}` : 'graph_container');
      const tbl = document.createElement('div');
      tbl.id = tableIndex >= 0 ? `graph_table_${tableIndex}` : 'graph_table';
      tbl.classList.add('table');
      const tblBody = document.createElement('tbody');
      
      const row = document.createElement('tr');
      this.addHeaderCell(row, '');
      data.datasets.forEach(dataset => {
        this.addHeaderCell(row, dataset.label);
      })
      tblBody.appendChild(row);

      data.labels.forEach((label, index) => {
        const row = document.createElement('tr');
        this.addCell(row, label);
        data.datasets.forEach(dataset => {this.addCell(row, dataset.data[index]);})
        tblBody.appendChild(row);
      })

      tbl.appendChild(tblBody);
      container.appendChild(tbl);
      let chartConfig = container.getAttribute('config')
      // transform data -> remove medias & others
      data.datasets.map( dataset => {
        dataset.data = dataset.data.slice(0,-Math.abs(data.numNographicFields));
      });
      data.labels = data.labels.slice(0,-Math.abs(data.numNographicFields));
      this.printChart(type, data, tableIndex, chartConfig ? JSON.parse(chartConfig) : buttons[type == 'SERIE' ? 0 : 1]);
  }

  getParsedData(type, data, etiqCruce2_index){
    console.log(data);
    const cloneData = JSON.parse(JSON.stringify(data));
    let newData = {
      numNographicFields: 0,
      datasets: [],
      titulo: (type === 'PREGUNTA') ? cloneData.titulo : cloneData.ficha.titulo
    };

    let labels = [];
    let datasets = [];
    let colorIndex = 0;

    // const filas = type == 'PREGUNTA' ? cloneData.etiqCruce1 : cloneData.ficha.filas.slice(0, -1);
    let numNographicFields = 0;
    let filas;
    if(type == 'PREGUNTA' && cloneData.etiqCruce1 ){
      filas = cloneData.etiqCruce1;
      filas.push({etiqueta: 'Total'});
      labels = cloneData.etiqVar.map(label => label.etiqueta);
    } else if( type == 'PREGUNTA' && cloneData.frecuencias ){
      filas = [];
      filas.push({etiqueta: 'Nº de casos'});
      labels = cloneData.frecuencias.map(label => label.etiqueta);
    } else {
      filas = cloneData.ficha.filas.slice(0, -1);
      labels = cloneData.ficha.serie_temporal.map(label => label.fecha);
    }

    filas.forEach(fila => {
      datasets.push({label: (type==='SERIE') ? fila : fila.etiqueta, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    if(type == 'PREGUNTA'){
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
          if(data.hayMediaVar || data.haymediaVariable){
            
            let vars = [{id: 'base', name: '(N)'}, {id: 'desvEstandar', name: 'Desviación típica'}, {id: 'media', name: 'Media'}]
            vars.forEach(item => labels.push(item.name));
            if(data.hayMediaVar){
              cloneData.mediasVariable.forEach((media, index) => {
                vars.forEach(item => datasets[index].data.push(this.showInDecimal(media[item.id])))
                numNographicFields++;
              })
            }else{
              cloneData.mediasVariable[0].forEach((media, index) => {
                vars.forEach(item => datasets[index].data.push(this.showInDecimal(media[etiqCruce2_index][item.id])))
                numNographicFields++;
              })
            }
          }
       } else {
        cloneData.frecuencias.map((fila, index) => {
            datasets[0].data.push(fila.n);
        });
        if(data.haymedia){
          let vars = [{id: 'base', name: '(N)'}, {id: 'desvEstandar', name: 'Desviación típica'}, {id: 'media', name: 'Media'},{id: 'n', name: 'N'}]
          vars.forEach(item => labels.push(item.name));
          datasets[0].data.push(this.showInDecimal(data.N));
          datasets[0].data.push(this.showInDecimal(data.media.desvEstandar));
          datasets[0].data.push(this.showInDecimal(data.media.media));
          datasets[0].data.push(this.showInDecimal(data.media.base));
          numNographicFields = 4;
        }
       }
    }else{
      cloneData.ficha.serie_temporal.map(x => {
        filas.map ( (fila, index) => {
          datasets[index].data.push(x.datos[index]);
        });
      })
    }
    newData.numNographicFields = numNographicFields;
    newData.labels = labels;
    newData.datasets = datasets;
    return newData;
  }

  showInDecimal(number) {
    return number !== Math.round(number) ? parseFloat(number.toFixed(2)) : number;
  }

  printChart(type, data, tableIndex, config){
    const table = document.getElementById(tableIndex >= 0 ? `graph_table_${tableIndex}` : 'graph_table');
    let canvas = document.createElement("canvas");
    canvas.id = tableIndex >= 0 ? `graph_chart_${tableIndex}` : 'graph_chart';
    // table.insertAdjacentElement('afterbegin', canvas)
    table.insertAdjacentElement('beforeend', canvas);
    new Chart(canvas, {
      type: config && config.type ? config.type : type === 'SERIE' ? 'line' : 'bar',
      data: data,
      options: {
        indexAxis: config && config.axis ? config.axis : 'x',
        plugins: {
          title: {
            display: true,
            text: data.titulo,
            position: 'top'
          },
          legend: {
            display: true,
            position: 'bottom',
        }
        },
        responsive: true,
        scales: {
          x: {
            stacked: config && config.stacked != undefined ? config.stacked : false,
          },
          y: {
            beginAtZero: true,
            stacked: config && config.stacked != undefined ? config.stacked : false,
          },
        },
      },
    });
    const container = document.getElementById(tableIndex >= 0 ? `graph_container_${tableIndex}` : 'graph_container');
    container.setAttribute('config', JSON.stringify(config));
    this.printChartSelectionButtons(type, data, tableIndex);
    this.printExportButtons(type, data, tableIndex)
  }

  printChartSelectionButtons(type, data, tableIndex){
    const chart = document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}` : 'graph_chart');
    let buttonsContainer = document.createElement('div');
    buttonsContainer.id = tableIndex >= 0 ? `graph_chart_${tableIndex}_buttons` : 'graph_chart_buttons';
    buttons.forEach(config => {
      let button = document.createElement('button');
      button.classList.add('graphic_btn', tableIndex >= 0 ? `graph_chart_${tableIndex}_button` : 'graph_chart_button');
      button.style.background = `url(${config.icon}) no-repeat`;
      button.onclick = () => {
        this.removeChart(tableIndex);
        this.printChart(type, data, tableIndex, config);
      }
      buttonsContainer.appendChild(button);
    });
    chart.insertAdjacentElement('afterend', buttonsContainer);
  }

  printExportButtons(type, data, tableIndex){
    const chart = document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}` : 'graph_chart');
    let buttonsContainer = document.createElement('div');
    buttonsContainer.id = tableIndex >= 0 ? `graph_chart_${tableIndex}_export_buttons` : 'graph_chart_export_buttons';
    exportButtons.forEach(config => {
      let button = document.createElement('button');
      button.classList.add('graphic_btn', tableIndex >= 0 ? `graph_chart_${tableIndex}_export_button` : 'graph_chart_export_button');
      button.style.background = `url(${config.icon}) no-repeat`;
      button.onclick = () => {
        config.type == 'pdf' ? exportUtils.exportToPDF(type, data, tableIndex) : exportUtils.exportToExcel(type, data, tableIndex);
      }
      buttonsContainer.appendChild(button);
    });
    chart.insertAdjacentElement('beforebegin', buttonsContainer);
  }

  addHeaderCell(row,contenido) {
      const headerCell = document.createElement('th');
      const cellText = document.createTextNode(contenido);
      headerCell.appendChild(cellText);
      row.appendChild(headerCell);
  }

  addCell(row,contenido) {
    const cell = document.createElement('td');
    const cellText = document.createTextNode(contenido);
    cell.appendChild(cellText);
    cell.classList.add('td');
    row.appendChild(cell);
  }

  addSelectorOperaciones(data,name,type_var,tabla_index=0) {
    const ctx = document.getElementById("graph_container");
    const selector = document.createElement('select');
    selector.id = name;
    ctx.appendChild(selector);

    const array = [{id: 0, etiqueta:'Valores Absolutos'},
                  {id: 1, etiqueta:'Mostrar % (columna)'},
                  {id: 2, etiqueta:'Mostrar % (columna - NS/NC)'},
                  {id: 3, etiqueta:'Mostrar % (fila)'},
                  {id: 4, etiqueta:'Mostrar % (fila - NS/NC)'},
                  {id: 5, etiqueta:'Mostrar % (total)'},
                  {id: 6, etiqueta:'Mostrar % (total - NS/NC)'}];
    for (var i = 0; i < array.length; i++) {
      var option = document.createElement("option");
      option.value = parseInt(i); //array[i].categoria;
      option.text = array[i].etiqueta;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      let newData = this.calculate(data,parseInt(e.target.value));
      console.log('newDAta return ->',newData);
      this.removeTable();
      // if ( type_var === 0){
        const cruce2 = data.ficha.tabla[0].etiqCruce2 ? 0 : null;
        this.printTable('PREGUNTA', newData, cruce2);
        // this.addTableCRUCE(newData,parseInt(e.target.value));
        // this.pintarCruce1(newData,parseInt(e.target.value));
      // } else {
        // this.addTableCRUCE2(newData,parseInt(e.target.value));
        // this.pintarCruce2(newData,parseInt(e.target.value));
      // }
   })
  }

  calculate(data,type_value_index,indexTabla=0){
    console.log('opcion',type_value_index);
    let newdata;
    const cloneData = JSON.parse(JSON.stringify(data));
    if ( type_value_index == 0) { 
      newdata = cloneData}; // Valores absolutos
    if ( type_value_index == 1) {
      console.log('Mostrar % (columna)');

      let valor = 0;
      for (let i = 0; i < cloneData.ficha.tabla[indexTabla].etiqVar.length; i++) {
        for (let j = 0; j < cloneData.ficha.tabla[indexTabla].cruce[i].length; j++) {
          valor = cloneData.ficha.tabla[indexTabla].cruce[i][j];
          const index_sum = cloneData.ficha.tabla[indexTabla].etiqVar.length;
          valor = (valor * 100)/parseFloat(cloneData.ficha.tabla[indexTabla].cruce[index_sum][j])
          cloneData.ficha.tabla[indexTabla].cruce[i][j] = valor;
        }
      }
      newdata = cloneData;
    }
    if ( type_value_index == 2) {
      console.log('Mostrar % (columna - NS/NC)');
      let valor = 0;
      let positionsToRemove = []; 
      cloneData.ficha.tabla[indexTabla].etiqVar.map( (x,index) => {
        if (x.esMissing) { positionsToRemove.push(index); }
      });
      cloneData.ficha.tabla[indexTabla].cruce.splice(positionsToRemove[0],2);
      cloneData.ficha.tabla[indexTabla].etiqVar = cloneData.ficha.tabla[indexTabla].etiqVar.filter( x => !x.esMissing);
      for (let i = 0; i < cloneData.ficha.tabla[indexTabla].etiqVar.length; i++) {
        for (let j = 0; j < cloneData.ficha.tabla[indexTabla].cruce[i].length; j++) {
          valor = cloneData.ficha.tabla[indexTabla].cruce[i][j];
          const index_sum = cloneData.ficha.tabla[indexTabla].etiqVar.length;

          let totalnsnc = 0; 
          positionsToRemove.map( cell => {
            totalnsnc += data.ficha.tabla[indexTabla].cruce[cell][j];
          })
          valor = (valor * 100)/(parseFloat(cloneData.ficha.tabla[indexTabla].cruce[index_sum][j]) - parseFloat(totalnsnc));
          cloneData.ficha.tabla[indexTabla].cruce[i][j] = valor;
        }
      }
      newdata = cloneData;
    }
    if ( type_value_index == 3) {
      console.log('Mostrar % (fila)');
      let valor = 0;
      for (let i = 0; i <= cloneData.ficha.tabla[indexTabla].etiqVar.length; i++) {
        for (let j = 0; j < cloneData.ficha.tabla[indexTabla].cruce[i].length-1; j++) {
          valor = cloneData.ficha.tabla[indexTabla].cruce[i][j];
          const index_sum = cloneData.ficha.tabla[indexTabla].etiqCruce1.length;
          valor = (valor * 100)/parseFloat(cloneData.ficha.tabla[indexTabla].cruce[i][index_sum]);
          cloneData.ficha.tabla[indexTabla].cruce[i][j] = valor;
        }
      }
      newdata = cloneData;
    }
    if ( type_value_index == 4) {
      console.log('Mostrar % (fila - NS/NC)');
      let valor = 0;
      let positionsToRemove = []; 
      cloneData.ficha.tabla[indexTabla].etiqVar.map( (x,index) => {
        if (x.esMissing) { positionsToRemove.push(index); }
      });
      cloneData.ficha.tabla[indexTabla].cruce.splice(positionsToRemove[0],2);
      cloneData.ficha.tabla[indexTabla].etiqVar = cloneData.ficha.tabla[indexTabla].etiqVar.filter( x => !x.esMissing);
      for (let i = 0; i <= cloneData.ficha.tabla[indexTabla].etiqVar.length; i++) {
        for (let j = 0; j < cloneData.ficha.tabla[indexTabla].cruce[i].length-1; j++) {
          valor = cloneData.ficha.tabla[indexTabla].cruce[i][j];
          const index_sum = cloneData.ficha.tabla[indexTabla].etiqCruce1.length;
          valor = (valor * 100)/parseFloat(cloneData.ficha.tabla[indexTabla].cruce[i][index_sum]);
          cloneData.ficha.tabla[indexTabla].cruce[i][j] = valor;
        }
      }
      newdata = cloneData;
    }
    return newdata;
  }

  removeTable(tableIndex) {
    document.getElementById(tableIndex >= 0 ? `graph_table_${tableIndex}` : 'graph_table').remove();
    this.removeChart(tableIndex)
  }

  removeChart(tableIndex) {
    // graph_chart_0_export_buttons
    document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}` : 'graph_chart').remove();
    document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}_buttons` : 'graph_chart_buttons').remove();
    document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}_export_buttons` : 'graph_chart_export_buttons').remove();
  }

  printHeaderSerie(type, data){
    const ctx = document.getElementById("graph_container");
    const divTitulo = document.createElement('div');
    

    // CODIGO
    const divCodigo = document.createElement('div');
    const labelCodigo = document.createTextNode('Serie:');
    const codigo = document.createTextNode(data.ficha.codigo);
    const codigoLabelDiv= document.createElement('div');
    const codigoDiv= document.createElement('div');
    codigoLabelDiv.appendChild(labelCodigo)
    codigoDiv.appendChild(codigo)
    divCodigo.appendChild(codigoLabelDiv);
    divCodigo.appendChild(codigoDiv);

    // TITULO
    const titulo = document.createTextNode(data.ficha.titulo);
    divTitulo.appendChild(titulo);

    // MUESTRA
    const divMuestra = document.createElement('div');
    const labelMuestra = document.createTextNode('Muestra:');
    const muestra = document.createTextNode(data.ficha.muestra || '-');
    const muestraLabelDiv = document.createElement('div');
    const muestraDiv = document.createElement('div');
    muestraLabelDiv.appendChild(labelMuestra);
    muestraDiv.appendChild(muestra);
    divMuestra.appendChild(muestraLabelDiv);
    divMuestra.appendChild(muestraDiv);

    // PREGUNTA
    const divPregunta = document.createElement('div');
    const labelPregunta = document.createTextNode('Pregunta:');
    // const pregunta = document.createTextNode(data.ficha.pregunta || '-');
    const preguntaLabelDiv = document.createElement('div');
    const preguntaDiv = document.createElement('div');
    preguntaLabelDiv.appendChild(labelPregunta);
    preguntaDiv.innerHTML = data.ficha.pregunta || '-';
    divPregunta.appendChild(preguntaLabelDiv);
    divPregunta.appendChild(preguntaDiv);

    // NOTAS
    const divNotas = document.createElement('div');
    const labelNotas = document.createTextNode('Notas:');
    const notas = document.createTextNode(data.ficha.notas || '-');
    const notasLabelDiv = document.createElement('div');
    const notasDiv = document.createElement('div');
    notasLabelDiv.appendChild(labelNotas);
    notasDiv.appendChild(notas);
    divNotas.appendChild(notasLabelDiv);
    divNotas.appendChild(notasDiv);

  
    ctx.insertAdjacentElement( 'afterbegin', divNotas)
    ctx.insertAdjacentElement( 'afterbegin', divPregunta)
    ctx.insertAdjacentElement( 'afterbegin', divMuestra)
    ctx.insertAdjacentElement( 'afterbegin', divTitulo)
    ctx.insertAdjacentElement( 'afterbegin', divCodigo)
  }

}