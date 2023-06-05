import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';

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
      // if ( type_var === 0){
        this.printTable('PREGUNTA', newData, parseInt(e.target.value))
        // this.addTableCRUCE(newData,parseInt(e.target.value));
        // this.pintarCruce1(newData,parseInt(e.target.value));
      // } else {
        // this.addTableCRUCE2(newData,parseInt(e.target.value));
        // this.pintarCruce2(newData,parseInt(e.target.value));
      // }
   })
  }

  calculate(data,type_value_index,indexTabla=0){
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

  // ***** EXPORT
  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const ws1 = workbook.addWorksheet('Ficha de serie');
  
    // Título
    const title = 'FICHA DE SERIE';
    ws1.mergeCells('A4:F4');
    const titleCell = ws1.getCell('A4');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws1.getRow(4).height = 40; 
  
    // Texto
    ws1.getCell('A6').value = 'Muestra:';
    ws1.getCell('B6').value = 'Nacional Población española ambos sexos 18 y más años';
    ws1.getCell('A6').font = { bold: true };
  
    ws1.getCell('A7').value = 'Pregunta:';
    ws1.getCell('B7').value = 'El próximo mes de diciembre hará (*) años que en España, en un referéndum, se aprobó la Constitución. En general, ¿cree Ud. que los/as españoles/as conocemos bien la Constitución, la conocemos por encima, la conocemos muy poco o casi nada?:N: :N:';
    ws1.getCell('A7').font = { bold: true };
  
    ws1.getCell('A8').value = 'Notas:';
    ws1.getCell('B8').value = '(*)Tiempo transcurrido desde la fecha de aprobación de la Constitución hasta la fecha de cada punto de la serie.';
    ws1.getCell('A8').font = { bold: true };
  
    const tbl = document.getElementById('demo');
    const startRow = 14;
    const tableEndRow = this.addTableToWorksheet(tbl, ws1, startRow);
  
    this.addLogoToWorkbook(workbook).then(() => {
      this.addImageToWorkbook(workbook, tableEndRow).then(() => {
        workbook.xlsx.writeBuffer().then(buffer => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(blob, 'output.xlsx');
        });
      });
    });
  }
  
  getLogoAsBase64() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
  

     //  img.src = 'https://i.imgur.com/77syx2k.png';
     img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
    //img.src = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
  
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        let base64Image = canvas.toDataURL('image/png');
        resolve(base64Image);
      };
  
      img.onerror = error => {
        reject(error);
      };
    });
  }
  
  async addLogoToWorkbook(workbook) {
    const base64Logo = await this.getLogoAsBase64();
    const base64Data = base64Logo.split(',')[1];
    const blob = this.b64toBlob(base64Data, 'image/png');
    const buffer = await this.blobToArrayBuffer(blob);
  
    const logoId = workbook.addImage({
      buffer: buffer,
      extension: 'png',
    });
  
    const ws = workbook.getWorksheet('Ficha de serie');
    ws.addImage(logoId, {
      tl: { col: 0, row: 0 },
      br: { col: 1, row: 3 },
      editAs: 'absolute',
    });
  }
  
  addTableToWorksheet(table, worksheet, startRow = 14) {
    const rows = table.getElementsByTagName('tr');
    const headerHeight = 30; 
    const dataHeight = 20; 
  
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
      const rowData = Array.from(cells).map(cell => cell.innerText);
      const rowAdded = worksheet.addRow(rowData);
      rowAdded.eachCell((cell) => {
        if (cell.row.number === startRow) {
          cell.font = { bold: true };
          rowAdded.height = headerHeight;
        } else {
          cell.font = { bold: false };
          rowAdded.height = dataHeight;
        }
      });
  
      if (i === 0) { // Cabecera
        rowAdded.eachCell((cell) => {
          cell.font = { bold: true };
        });
      }
  
      worksheet.getColumn('A').width = 30;
      worksheet.getColumn('B').width = 20;
      worksheet.getColumn('C').width = 20;
      worksheet.getColumn('D').width = 20;
      worksheet.getColumn('E').width = 20;
      worksheet.getColumn('F').width = 20;
    }
  
    return startRow + rows.length;
  }
  
  async addImageToWorkbook(workbook, startRow) {
    
    const ws = workbook.getWorksheet('Ficha de serie');
  
    const rows = document.getElementById('demo').getElementsByTagName('tr');
    const base64Image = this.chart.toBase64Image();
    const base64Data = base64Image.split(',')[1];
    const blob = this.b64toBlob(base64Data, 'image/png');
    const buffer = await this.blobToArrayBuffer(blob);
    
    const imageId = workbook.addImage({
      buffer: buffer,
      extension: 'png',
    });
    
    const startRowChart = 18; 
    const endRowChart = startRowChart + 19;
  
    ws.addImage(imageId, {
      tl: { col: 0, row: startRowChart },
      br: { col: 6, row: endRowChart },
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
  const pdf = new jsPDF('p', 'pt', 'a3'); // A3 en lugar de A4
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

  // Logo
  const logoWidth = 100;
  const logoHeight = 100;
  const logoX = 20;
  const logoY = 70;
  //const logoUrl = 'https://i.imgur.com/77syx2k.png';
  const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
  //const logoUrl = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
  pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Título
  const title = 'FICHA DE SERIE';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  const titleWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
  const titleOffset = (pdf.internal.pageSize.width - titleWidth) / 2;
  pdf.text(title, titleOffset, logoY + logoHeight + 30); // Título centrado y debajo del logo
  

    // Texto
    const text = 'Muestra:   Nacional Población española ambos sexos 18 y más años';
    const note = 'Pregunta:  El próximo mes de diciembre hará (*) años que en España, en un referéndum, se aprobó la Constitución.';
    const question = 'Notas:  (*)Tiempo transcurrido desde la fecha de aprobación de la Constitución hasta la fecha de cada punto de la serie.';
    const textX = 50;
    const textY = logoY + logoHeight + 70;
    const textFontSize = 10;
    const textWidth = pdf.getStringUnitWidth(text) * textFontSize / pdf.internal.scaleFactor;
    const textOffset = textX;
    pdf.setFontSize(textFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Muestra:', textOffset, textY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(text.substr(9), textOffset + pdf.getStringUnitWidth('Muestra:') * textFontSize, textY);

    const noteX = textOffset;
    const noteY = textY + 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pregunta:', noteX, noteY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(note.substr(9), noteX + pdf.getStringUnitWidth('Pregunta:') * textFontSize, noteY);

    const questionX = textOffset;
    const questionY = noteY + 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notas:', questionX, questionY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(question.substr(6), questionX + pdf.getStringUnitWidth('Notas:') * textFontSize, questionY);

    // Tabla
    const styles = {
    fontStyle: 'normal',
    cellPadding: 1,
    fontSize: 8,
    cellHeight: 16,
    };
    autoTable(pdf, {
    html: tbl,
    startY: questionY + 30, 
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

    // Gráfico
    const imagePosition = { x: 15, y: questionY + totalTableHeight + 60, width: 800, height: 400 };
    pdf.addImage(base64Image, 'JPEG', imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

    // Borde gráfico
    pdf.rect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

    pdf.save('fichaDeSerie.pdf');

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