import Chart from 'chart.js/auto';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

export class Graphic {

  constructor(graphicData){
    this.addTable(graphicData);
    this.paint(graphicData);
  }

  addTable(data){
    const tbl = document.getElementById("graph_table");
    const tblBody = document.createElement('tbody');
    const row = document.createElement('tr');
    const headerCell = document.createElement('th');
    const cellText = document.createTextNode('');
    headerCell.appendChild(cellText);
    row.appendChild(headerCell);

    for (let k = 0; k < data.ficha.serie_temporal.length; k++) {
      const headerCell = document.createElement('th');
      const contenido = data.ficha.serie_temporal[k].fecha;
      const cellText = document.createTextNode(contenido);
      headerCell.appendChild(cellText);
      row.appendChild(headerCell);
    }
    tblBody.appendChild(row);
    for (let i = 0; i < data.ficha.filas.length; i++) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const contenido = data.ficha.filas[i];
      const cellText = document.createTextNode(contenido);
      cell.appendChild(cellText);
      row.appendChild(cell);
      for (let j = 0; j < data.ficha.serie_temporal.length; j++) {
        const cell = document.createElement('td');
        const contenido = data.ficha.serie_temporal[j].datos[i];
        const cellText = document.createTextNode(contenido);
        cell.appendChild(cellText);
        row.appendChild(cell);
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

}