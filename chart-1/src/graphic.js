import Chart from 'chart.js/auto';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

export class Graphic {

  constructor(base_url, type, details) {

    let url = type == 'SERIE' ? `${base_url}/serie/${details.id}` : `${base_url}/resultados`;

    this.getData(type, url, details).then(data => {
      let cruce2 = null;
      if ( type !== 'SERIE') {
        cruce2 = data.ficha.tabla[0].etiqCruce2 ? 0 : null;
        this.addSelectorOperaciones(data,'operaciones',cruce2);
        if( cruce2 !== null ) { this.addSelector(data,'variableCruce');}
      }
      this.printTable(type,data,cruce2);
      this.printChart(type, this.getParsedData(type,data,cruce2), type==='SERIE'?'line':'bar');
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
      headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'});
      Object.entries(params).forEach(([key, value], index) => {
        body += `${index != 0 ? '&' : ''}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
    }
    // {method: method, mode: 'no-cors', headers: headers, body: body ? body : undefined}
    let response = await fetch(url,{method: method, headers: headers, body: body ? body : undefined});
    let result = await response.json();
    return result;
  }

  getParsedData(type, data, etiqCruce2_index){
    let labels = [];
    let newData = {
      datasets: [],
      titulo: (type === 'PREGUNTA')? data.ficha.pregunta.titulo: data.ficha.titulo
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
      let element = { label: (type==='SERIE')?fila: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
      datasets.push(element);
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    if(type == 'PREGUNTA'){
      data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
        filas.map ((fila, index) => {
          if( etiqCruce2_index != null) {
            datasets[index].data.push(x[index][etiqCruce2_index]);
          } else {
            datasets[index].data.push(x[index]);
          } 
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

  printTable(type, data, etiqCruce2_index){
    console.log(data);
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
          if( i >= data.ficha.tabla[tabla].etiqVar.length) {
            this.addCell(row,'(N)');
          }else {
            this.addCell(row,data.ficha.tabla[tabla].etiqVar[i].etiqueta);
          }
          // this.addCell(row,data.ficha.tabla[tabla].etiqVar[i].etiqueta);
          for (let j = 0; j < data.ficha.tabla[tabla].cruce[i].length; j++) {
            if( etiqCruce2_index != null) {
              this.addCell(row, data.ficha.tabla[tabla].cruce[i][j][etiqCruce2_index]);
            } else {
              this.addCell(row, data.ficha.tabla[tabla].cruce[i][j]);
            }
          }
          
          tblBody.appendChild(row);
        }

          // MEDIA
        if(data.ficha.tabla[tabla].hayMediaVar){
          let row = document.createElement('tr');
          this.addCell(row,'Media');
          for (let k = 0; k < data.ficha.tabla[tabla].mediasVariable.length; k++) {
            this.addCell(row,data.ficha.tabla[tabla].mediasVariable[k].media.toFixed(2));
          }
          tblBody.appendChild(row);
          row = document.createElement('tr');
          this.addCell(row,'Desviación típica');
          for (let k = 0; k < data.ficha.tabla[tabla].mediasVariable.length; k++) {
            this.addCell(row,data.ficha.tabla[tabla].mediasVariable[k].desvEstandar.toFixed(2));
          }
          tblBody.appendChild(row);
          row = document.createElement('tr');
          this.addCell(row,'N');
          for (let k = 0; k < data.ficha.tabla[tabla].mediasVariable.length; k++) {
            this.addCell(row,data.ficha.tabla[tabla].mediasVariable[k].base);
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

  printChart(type, data, chartType){
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
            stacked: false,
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

  addSelector(data,name,tabla_index=0) {
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
      this.addTableCRUCE2(data,parseInt(e.target.value));
      // this.removeChart();
      this.pintarCruce2(data,parseInt(e.target.value));
   })
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
      this.removeTable();
      if ( type_var === 0){
        // this.addTableCRUCE(newData,parseInt(e.target.value));
        // this.pintarCruce1(newData,parseInt(e.target.value));
      } else {
        // this.addTableCRUCE2(newData,parseInt(e.target.value));
        // this.pintarCruce2(newData,parseInt(e.target.value));
      }
   })
  }

  calculate(data,type_value_index){
    let newdata;
    const cloneData = JSON.parse(JSON.stringify(data));
    if ( type_value_index == 0) { 
      console.log('Valores Absolutos)');
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


  // ********************************************************************************

  // getDataCruce2(data,etiqCruce2_index){
  //   console.log(data);
  //   let newData = {};
  //   let labels = [];
  //   newData.datasets = [];
  //   newData.titulo = data.ficha.pregunta.titulo;
    
  //   // const filas = data.ficha.tabla[0].etiqCruce1;
  //   const filas = JSON.parse(JSON.stringify(data.ficha.tabla[0].etiqCruce1));
  //   filas.push({etiqueta:'Total'});
  //   labels = data.ficha.tabla[0].etiqVar.map ( label => label.etiqueta);
    
  //   let datasets = [];
  //   let colorIndex = 0;
  //   filas.map (fila => {
  //     let color = colors[colorIndex];
  //     let element = { label: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
  //     datasets.push(element);
  //     colorIndex == 6 ? colorIndex = 0 : colorIndex++;
  //   })

  //   data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
      
  //     filas.map ( (fila, index) => {
  //       datasets[index].data.push(x[index][etiqCruce2_index]);
  //     });
  //   })
  //   newData.labels = labels;
  //   newData.datasets = datasets;
  //   console.log(newData);
  //   return newData;
  // }

  // paintCruce1(ctx,data,tipo){
  //   this.chart = new Chart(ctx, {
  //     type: tipo,
  //     data: data,
  //     options: {
  //       plugins: {
  //         title: {
  //           display: true,
  //           text: data.titulo,
  //           position: 'top'
  //         },
  //         legend: {
  //           display: true,
  //           position: 'bottom',
  //         }
  //       },
  //       responsive: true,
  //       scales: {
  //         x: {
  //           stacked: false,
  //         },
  //         y: {
  //           beginAtZero: true,
  //           stacked: false,
  //           type: 'linear',
  //         },
  //       },
  //     },
  //   });
  // };


  // pintarCruce1(data) {
  //   const ctx = document.getElementById("graph_chart");
  //   const dataReto = this.getDataCruce1(data);
  //   const tipo = 'bar';
  //   this.paintCruce1(ctx,dataReto,tipo);
  // }

  // pintarCruce2(data,etiqCruce2_index) {
  //   const ctx = document.getElementById("graph_chart");
  //   const dataReto = this.getDataCruce2(data,etiqCruce2_index);
  //   const tipo = 'bar';
  //   if (!this.chart) {
  //     this.paintCruce1(ctx,dataReto,tipo);
  //   }
  //   else {
  //     this.chart.data = dataReto;
  //     this.chart.update();
  //   }
  // }

  // pintarSerie(data) {
  //   const ctx = document.getElementById("graph_chart");
  //   console.log(data);
  //   const dataReto =  this.getData(data);
  //   this.paint(ctx,dataReto,'line');
  // }

  // paint(ctx,data,tipo){
  //   this.chart = new Chart(ctx, {
  //     type: tipo,
  //     data: data,
  //     options: {
  //       plugins: {
  //         title: {
  //           display: true,
  //           text: data.titulo,
  //           position: 'top'
  //         },
  //         legend: {
  //           display: true,
  //           position: 'bottom',
  //       }
  //       },
  //       responsive: true,
  //       scales: {
  //         x: {
  //           stacked: true,
  //         },
  //         y: {
  //           beginAtZero: true,
  //           stacked: false,
  //           type: 'linear',
  //         },
  //       },
  //     },
  //   });
  // };

  // getDataCruce1(data){

  //   console.log(data);
  //   let newData = {};
  //   let labels = [];
  //   newData.datasets = [];
  //   newData.titulo = data.ficha.pregunta.titulo;
    
  //   const filas = data.ficha.tabla[0].etiqCruce1;
  //   filas.push({etiqueta:'Total'});
  //   labels = data.ficha.tabla[0].etiqVar.map ( label => label.etiqueta);
    
  //   let datasets = [];
  //   let colorIndex = 0;
  //   filas.map (fila => {
  //     let color = colors[colorIndex];
  //     let element = { label: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
  //     datasets.push(element);
  //     colorIndex == 6 ? colorIndex = 0 : colorIndex++;
  //   })

  //   data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
      
  //     filas.map ( (fila, index) => {
  //       datasets[index].data.push(x[index]);
  //     });
  //   })
  //   newData.labels = labels;
  //   newData.datasets = datasets;
  //   console.log(newData);
  //   return newData;
  // }

  // getDataCruce2(data,etiqCruce2_index){
  //   console.log(data);
  //   let newData = {};
  //   let labels = [];
  //   newData.datasets = [];
  //   newData.titulo = data.ficha.pregunta.titulo;
    
  //   // const filas = data.ficha.tabla[0].etiqCruce1;
  //   const filas = JSON.parse(JSON.stringify(data.ficha.tabla[0].etiqCruce1));
  //   filas.push({etiqueta:'Total'});
  //   labels = data.ficha.tabla[0].etiqVar.map ( label => label.etiqueta);
    
  //   let datasets = [];
  //   let colorIndex = 0;
  //   filas.map (fila => {
  //     let color = colors[colorIndex];
  //     let element = { label: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
  //     datasets.push(element);
  //     colorIndex == 6 ? colorIndex = 0 : colorIndex++;
  //   })

  //   data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
      
  //     filas.map ( (fila, index) => {
  //       datasets[index].data.push(x[index][etiqCruce2_index]);
  //     });
  //   })
  //   newData.labels = labels;
  //   newData.datasets = datasets;
  //   console.log(newData);
  //   return newData;
  // }

}