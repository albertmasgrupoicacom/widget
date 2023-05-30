import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';


const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

export class Graphic {

  constructor(graphicData){
    this.addTable(graphicData);
    this.paint(graphicData);
  }

  
    addTable(data) {
      const tbl = document.getElementById("graph_table");
      const tblBody = document.createElement('table');
      tblBody.id = "demo";
      const row = document.createElement('tr');
      const headerCell = document.createElement('th');
      const cellText = document.createTextNode('');
      headerCell.appendChild(cellText);
      row.appendChild(headerCell);
  
      for (let k = 0; k < data.ficha.serie_temporal.length; k++) {
        const headerCell = document.createElement('th'); // aquí utilizamos 'th' en lugar de 'td'
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
    this.chart = new Chart(ctx, {
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
   const base64Image = this.chart.toBase64Image();
   };



  // exportToExcel() {
  //   const workbook = new ExcelJS.Workbook();
  //   const ws1 = workbook.addWorksheet('Ficha de serie');
  //   const tbl = document.getElementById('demo');
  //   this.addTableToWorksheet(tbl, ws1);
  //   this.addImageToWorkbook(workbook).then(() => {
  //     workbook.xlsx.writeBuffer().then(buffer => {
  //       const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //       FileSaver.saveAs(blob, 'output.xlsx');
  //     });
  //   });
  // }
  
  // addTableToWorksheet(table, worksheet) {
  //   const rows = table.getElementsByTagName('tr');
  //   let headerHeight = 30; // Altura de la cabecera
  
  //   for (let i = 0; i < rows.length; i++) {
  //     const row = rows[i];
  //     const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
  //     const rowData = Array.from(cells).map(cell => cell.innerText);
  //     let rowAdded = worksheet.addRow(rowData);
  
  //     // Si es la cabecera poner en negrita
  //     if (i === 0) {
  //       rowAdded.eachCell((cell) => {
  //         cell.font = { bold: true };
  //       });
  //       rowAdded.height = headerHeight; // Ajustar la altura de la cabecera
  //     } else {
  //       rowAdded.height = headerHeight / 2; // Ajustar la altura de las otras filas
  //     }
  //     worksheet.getColumn('A').width = 40; // Ajusta el ancho al valor que quieras
  //     worksheet.getColumn('B').width = 20; 
  //     worksheet.getColumn('C').width = 20; 
  //     worksheet.getColumn('D').width = 20; 
  //     worksheet.getColumn('E').width = 20; 
  //     worksheet.getColumn('F').width = 20; 
  //   }
  // }
 
  // async addImageToWorkbook(workbook) {
  //   const base64Image = this.chart.toBase64Image();
  //   const base64Data = base64Image.split(',')[1];
  //   const blob = this.b64toBlob(base64Data, 'image/png');
  //   const buffer = await this.blobToArrayBuffer(blob);
  
  //   const imageId = workbook.addImage({
  //     buffer: buffer,
  //     extension: 'png',
  //   });
  
  //   const ws = workbook.getWorksheet('Ficha de serie');
  //   ws.addImage(imageId, {
  //     tl: { col: 0, row: 11 }, 
  //     br: { col: 6, row: 40 }, 
  //     editAs: 'absolute',
  //   });
  // }
  
  // b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  //   const byteCharacters = atob(b64Data);
  //   const byteArrays = [];
  
  //   for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     const slice = byteCharacters.slice(offset, offset + sliceSize);
  
  //     const byteNumbers = new Array(slice.length);
  //     for (let i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }
  
  //     const byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }
  
  //   const blob = new Blob(byteArrays, { type: contentType });
  //   return blob;
  // }
  
  // blobToArrayBuffer(blob) {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.addEventListener('loadend', (e) => {
  //       resolve(reader.result);
  //     });
  //     reader.addEventListener('error', reject);
  //     reader.readAsArrayBuffer(blob);
  //   });
  // }
  

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const ws1 = workbook.addWorksheet('Ficha de serie');

    // Añade el título
    const title = 'FICHA DE SERIE';
    ws1.mergeCells('A1:F1'); 
    const titleCell = ws1.getCell('A1'); 
    titleCell.value = title; 
    titleCell.font = { bold: true, size: 16 }; 
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }; 
    ws1.getRow(1).height = 40; // Ajusta la altura de la fila del título
    const tbl = document.getElementById('demo');
    this.addTableToWorksheet(tbl, ws1, 2); 
  
    this.addImageToWorkbook(workbook).then(() => {
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, 'output.xlsx');
      });
    });
  }
  
  addTableToWorksheet(table, worksheet, startRow = 1) { 
    const rows = table.getElementsByTagName('tr');
    let headerHeight = 30; // Altura de la cabecera
  
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
      const rowData = Array.from(cells).map(cell => cell.innerText);
      let rowAdded = worksheet.addRow(rowData);
      rowAdded.eachCell((cell) => {
        if (cell.row.number === startRow) {
          cell.font = { bold: true };
          rowAdded.height = headerHeight;
        } else {
          rowAdded.height = headerHeight / 2;
        }
      });
  
      worksheet.getColumn('A').width = 40;
      worksheet.getColumn('B').width = 20;
      worksheet.getColumn('C').width = 20;
      worksheet.getColumn('D').width = 20;
      worksheet.getColumn('E').width = 20;
      worksheet.getColumn('F').width = 20;
    }
  }
  
  async addImageToWorkbook(workbook) {
    const base64Image = this.chart.toBase64Image();
    const base64Data = base64Image.split(',')[1];
    const blob = this.b64toBlob(base64Data, 'image/png');
    const buffer = await this.blobToArrayBuffer(blob);
  
    const imageId = workbook.addImage({
      buffer: buffer,
      extension: 'png',
    });
  
    const ws = workbook.getWorksheet('Ficha de serie');
    ws.addImage(imageId, {
      tl: { col: 0, row: 11 }, 
      br: { col: 6, row: 40 }, 
      editAs: 'absolute',
    });
  }
  
  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      reader.readAsArrayBuffer(blob);
    });
  }
  
exportToPDF() {
  const pdf = new jsPDF('p', 'pt', 'a3'); //A3 en lugar de A4
  const tbl = document.getElementById('demo');
  const originalCanvas = document.getElementById("graph_chart");
  let inMemoryCanvas = document.createElement('canvas');
  let ctx = inMemoryCanvas.getContext('2d');
  inMemoryCanvas.width = originalCanvas.width;
  inMemoryCanvas.height = originalCanvas.height;
  ctx.fillStyle = 'rgb(255,255,255)'; 
  ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
  ctx.drawImage(originalCanvas, 0, 0);
  const base64Image = inMemoryCanvas.toDataURL("image/png");

// Título
const title = 'FICHA DE SERIE';
pdf.setFont('helvetica', 'bold'); 
pdf.setFontSize(24);
const textWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
const textOffset = (pdf.internal.pageSize.width - textWidth) / 2; 
pdf.text(title, textOffset, 50); // Título centrado y arriba
pdf.line(textOffset, 55, textWidth + textOffset, 55); // Subraya el título

  // Dibuja la tabla segundo
  const styles = { 
    fontStyle: 'normal',
    cellPadding: 1,
    fontSize: 8,
    cellHeight: 16, 
  };
  autoTable(pdf, {
    html: tbl,
    startY: 100, 
    styles: styles,
    headStyles: { 
      fontStyle: 'bold', 
      fillColor: [0, 0, 0], 
      textColor: [255, 255, 255] 
    },
    didDrawPage: (data) => {
      pdf.setFontSize(20);
    },
  });

  const rowCount = tbl.rows.length;
  const totalTableHeight = styles.cellHeight * rowCount;

  // Dibuja el gráfico
  const imagePosition = { x: 15, y: totalTableHeight + 120, width: 800, height: 400 }; 
  pdf.addImage(base64Image, 'JPEG', imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

  // Dibuja un borde en el gráfico
  pdf.rect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

  pdf.save('fichaDeSerie.pdf');
}




}

