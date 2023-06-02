import Chart from 'chart.js/auto';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

export class Graphic {

  constructor(base_url, type, details) {

    let url = type == 'SERIE' ? `${base_url}/serie/${details.id}` : `${base_url}/resultados`;

    this.getData(type, url, details).then(data => {
      console.log('Success', data);
      this.printTable(type, this.getParsedData(data));
      this.printChart(type, this.getParsedData(data), 'bar');
    }).catch(error => {
      console.error('Error', error);
    });;

    const element1 = document.getElementById('but_pie');
    element1.addEventListener('click', this.toPie);

  }

  async getData(type, url, params){

    let method = 'GET';
    let headers = {};
    let body = '';

    if(type == 'PREGUNTA'){
      method = 'POST';
      //headers = new Headers({'Authorization': 'Basic Y3VzdG9tZXI6eUkyc0ZxRnh0UkxKNVZOUWVYRnpmMXA4R1dNTDZZ'});
      Object.entries(params).forEach(([key, value], index) => {
        body += `${index != 0 ? '&' : ''}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
    }
    return await fetch(url, {method: method, mode: 'no-cors', headers: headers, body: body ? body : undefined}).json();
  }

  getParsedData(type, data){
    let labels = [];
    let newData = {
      datasets: [],
      titulo: data.ficha.pregunta.titulo
    };
    
    const filas = type == 'PREGUNTA' ? data.ficha.tabla[0].etiqCruce1 : data.ficha.filas.slice(0, -1);
    if(type == 'PREGUNTA'){
      filas.push({etiqueta:'Total'});
      labels = data.ficha.tabla[0].etiqVar.map ( label => label.etiqueta);
    }
    
    let datasets = [];
    let colorIndex = 0;
    filas.map (fila => {
      let color = colors[colorIndex];
      let element = { label: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
      datasets.push(element);
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    if(type == 'PREGUNTA'){
      data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
        filas.map ((fila, index) => {
          datasets[index].data.push(x[index]);
        });
      })
    }else{
      data.ficha.serie_temporal.map(x => {
        filas.map ( (fila, index) => {
          datasets[index].data.push(x.datos[index]);
        });
        labels.push(x.fecha);
      })
    }

    newData.labels = labels;
    newData.datasets = datasets;
    return newData;
  }

  printTable(type, data){
    const ctx = document.getElementById("graph_container");
    const tbl = document.getElementById("graph_table");
    const tblBody = document.createElement('tbody');
    const row = document.createElement('tr');
    this.addHeaderCell(row, '');

    if(type == 'PREGUNTA'){
      for (let tabla = 0; tabla < data.ficha.tabla.length; tabla++) {
        for (let k = 0; k < data.ficha.tabla[tabla].etiqCruce1.length; k++) {
          this.addHeaderCell(row,data.ficha.tabla[tabla].etiqCruce1[k].etiqueta);   
        }
        this.addHeaderCell(row, 'Total');
        tblBody.appendChild(row);
  
        for (let i = 0; i < data.ficha.tabla[tabla].etiqVar.length; i++) {
          const row = document.createElement('tr');
          this.addCell(row,data.ficha.tabla[tabla].etiqVar[i].etiqueta);
          for (let j = 0; j < data.ficha.tabla[tabla].cruce[i].length; j++) {
            this.addCell(row, data.ficha.tabla[tabla].cruce[i][j][cruce_2]);
          }
          tblBody.appendChild(row);
        }
      }
    }else{
      for (let k = 0; k < data.ficha.serie_temporal.length; k++) {
        this.addHeaderCell(row,data.ficha.serie_temporal[k].fecha);
      }
      tblBody.appendChild(row);
      for (let i = 0; i < data.ficha.filas.length; i++) {
        const row = document.createElement('tr');
        this.addCell(row,data.ficha.filas[i]);
        for (let j = 0; j < data.ficha.serie_temporal.length; j++) {
          this.addCell(row,data.ficha.serie_temporal[j].datos[i]);
        }
        tblBody.appendChild(row);
      }
    }
    
    tbl.appendChild(tblBody);
    ctx.appendChild(tbl);
  }

  printChart(data, chartType){
    const ctx = document.getElementById("graph_chart");
    this.chart = new Chart(ctx, {
      type: chartType,
      data: data,
      options: {
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
            stacked: true,
          },
          y: {
            beginAtZero: true,
            stacked: false,
            type: 'linear',
          },
        },
      },
    });
  }

  toPie() {
    console.log('toPie');
    console.log(this.chart);
    // this.chart.update();
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

  addSelector(type, data, name, tabla_index=0) {
    const ctx = document.getElementById("graph_container");
    const selector = document.createElement('select');
    selector.id = name;
    ctx.appendChild(selector);

    const array = data.ficha.tabla[tabla_index].etiqCruce2;
    for (var i = 0; i < array.length; i++) {
      var option = document.createElement("option");
      option.value = parseInt(i); //array[i].categoria;
      option.text = array[i].etiqueta;
      selector.appendChild(option);
    }
    selector.addEventListener("change", e => {
      this.removeTable();
      this.printTable(type, data, parseInt(e.target.value));
      this.printChart(type, data, parseInt(e.target.value));
   })
  }

  addSelectorValues(type, data, name) {
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
      this.removeTable();
      this.printTable(type, newData, parseInt(e.target.value));
      this.printChart(type, newData, parseInt(e.target.value));
   })
  }

  calculate(data,type_value_index){
    let newdata;
    const cloneData = JSON.parse(JSON.stringify(data));
    if ( type_value_index == 0) { newdata = data}; // Valores absolutos
    if ( type_value_index == 1) {
      
    }
    return newdata;
  }

  removeTable() {
    const element = document.getElementById("graph_table");
    element.innerHTML = '';
  }

  removeChart() {
    const element = document.getElementById("graph_chart");
    element.innerHTML = '';
  }

}