import Chart from 'chart.js/auto';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

export class Graphic {

  constructor(base_url,type,details) {
    let url = this.mountUrl(base_url,type, details);

    const element1 = document.getElementById('but_pie');
    element1.addEventListener('click', this.toPie);

    if( type === 'SERIE' ){
      this.getJSONData(url).then( graphicData => {
        this.addTable(graphicData);
        this.paint(graphicData);
      });
    } else if ( type === 'PREGUNTA' ) {
      const data = details;
      this.postJSON(url,data).then( graphicData => {
        console.log(graphicData);
        this.addTableCRUCE(graphicData);
        this.pintarCruce1(graphicData);
        
      } )
    }
  }

  toPie() {
    console.log('toPie');
    console.log(this.chart);
    // this.chart.update();
  }

  pintarCruce1(data) {
    const ctx = document.getElementById("graph_chart");
    const dataReto = this.getDataCruce1(data);
    const tipo = 'bar';
    this.paintCruce1(ctx,dataReto,tipo);
  }

  async postJSON(url,data) {

    let formBody = [];
    for (let property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    try {
      const response = await fetch(url, {
        method: "POST", // or 'PUT'
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          // "Content-Type": "application/json",
        },
        // body: JSON.stringify(data),
        body: formBody,
      });
  
      const result = await response.json();
      console.log("Success:", result);
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async getJSONData(url) {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  }

  mountUrl(base_url,type, details) {
    let url = base_url;
    if( type === 'SERIE' ){
      url = url + '/serie/' + details.id;
    } else if ( type === 'PREGUNTA' ) {
      url = url + '/resultados';
    }
    return url;
  }



  addHeaderCell(row,contenido) {
      const headerCell = document.createElement('th');
      // const contenido = data.ficha.tabla[tabla].etiqCruce1[k].etiqueta;
      const cellText = document.createTextNode(contenido);
      headerCell.appendChild(cellText);
      row.appendChild(headerCell);
  }

  addCell(row,contenido) {
    const cell = document.createElement('td');
    const cellText = document.createTextNode(contenido);
    cell.appendChild(cellText);
    row.appendChild(cell);
  }

  addTableCRUCE(data){
    const tbl = document.getElementById("graph_table");
    const tblBody = document.createElement('tbody');
    const row = document.createElement('tr');
    this.addHeaderCell(row,'');

    for (let tabla = 0; tabla < data.ficha.tabla.length; tabla++) {
      for (let k = 0; k < data.ficha.tabla[tabla].etiqCruce1.length; k++) {
        this.addHeaderCell(row,data.ficha.tabla[tabla].etiqCruce1[k].etiqueta);   
      }
      this.addHeaderCell(row,'Total');
      tblBody.appendChild(row);

      for (let i = 0; i < data.ficha.tabla[tabla].etiqVar.length; i++) {
        const row = document.createElement('tr');
        this.addCell(row,data.ficha.tabla[tabla].etiqVar[i].etiqueta);
        for (let j = 0; j < data.ficha.tabla[tabla].cruce[i].length; j++) {
          this.addCell(row,data.ficha.tabla[tabla].cruce[i][j]);
        }
        tblBody.appendChild(row);
      }
      tbl.appendChild(tblBody);
      document.body.appendChild(tbl);
    }
  }

  addTable(data){
    const tbl = document.getElementById("graph_table");
    const tblBody = document.createElement('tbody');
    const row = document.createElement('tr');
    this.addHeaderCell(row,'');

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
    tbl.appendChild(tblBody);
    document.body.appendChild(tbl);
  }

  getData(data){
    let newData = {};
    let estudios = [];
    newData.datasets = [];
    newData.titulo = data.ficha.titulo;
    
    const filas = data.ficha.filas.slice(0, -1);
    
    let newArray = [];
    let colorIndex = 0;
    filas.map (fila => {
      let color = colors[colorIndex];
      let element = { label: fila, data: [], backgroundColor: color, borderColor: color};
      newArray.push(element);
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    data.ficha.serie_temporal.map(x => {
      
      filas.map ( (fila, index) => {
        newArray[index].data.push(x.datos[index]);
      });
      estudios.push(x.fecha);
     
    })
    newData.labels = estudios;
    newData.datasets = newArray;
    console.log(newData);
    return newData;
  }

  paint(data){
    const ctx = document.getElementById("graph_chart");
    new Chart(ctx, {
      type: "line",
      data: this.getData(data),
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
  };

  getDataCruce1(data){

    console.log(data);
    let newData = {};
    let labels = [];
    newData.datasets = [];
    newData.titulo = data.ficha.pregunta.titulo;
    
    const filas = data.ficha.tabla[0].etiqCruce1;
    filas.push({etiqueta:'Total'});
    labels = data.ficha.tabla[0].etiqVar.map ( label => label.etiqueta);
    
    let datasets = [];
    let colorIndex = 0;
    filas.map (fila => {
      let color = colors[colorIndex];
      let element = { label: fila.etiqueta, data: [], backgroundColor: color, borderColor: color};
      datasets.push(element);
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    data.ficha.tabla[0].cruce.slice(0, -1).map(x => {
      
      filas.map ( (fila, index) => {
        datasets[index].data.push(x[index]);
      });
    })
    newData.labels = labels;
    newData.datasets = datasets;
    console.log(newData);
    return newData;
  }

  paintCruceEx(){
    const data = {
      labels: ["Izquierda (1-2)", "(3-4)", "(5-6)", "(7-8)", "Derecha (9-10)", "N.S.", "N.C."],
      datasets: [
        {
          label: "Hombre",
          backgroundColor: ["#aa95cd",],
          data: [83,335,401,121,20,97,139]
        },
        {
          label: "Mujer",
          backgroundColor: ["#4395cd",],
          data: [55,317,396,128,26,194,161]
        }
      ]
    };
    const ctx = document.getElementById("graph_chart");
    new Chart(ctx, {
      type: "bar",
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
  };

  paintCruce1(ctx,data,tipo){
    this.chart = new Chart(ctx, {
      type: tipo,
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
  };

}