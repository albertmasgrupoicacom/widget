import Chart from 'chart.js/auto';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { buttons } from './utils/utils';
// import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
// import * as FileSaver from 'file-saver';

const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];

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

  refreshData(url, type, details) {
    console.log(type);
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
      this.printChart(type, data, tableIndex, chartConfig ? JSON.parse(chartConfig) : buttons[type == 'SERIE' ? 0 : 1]);
  }

  getParsedData(type, data, etiqCruce2_index){
    const cloneData = JSON.parse(JSON.stringify(data));
    let newData = {
      datasets: [],
      titulo: (type === 'PREGUNTA') ? cloneData.titulo : cloneData.ficha.titulo
    };

    let labels = [];
    let datasets = [];
    let colorIndex = 0;

    const filas = type == 'PREGUNTA' ? cloneData.etiqCruce1 : cloneData.ficha.filas.slice(0, -1);

    if(type == 'PREGUNTA'){
      filas.push({etiqueta: 'Total'});
      labels = cloneData.etiqVar.map(label => label.etiqueta);
    }else{
      labels = cloneData.ficha.serie_temporal.map(label => label.fecha);
    }

    filas.forEach(fila => {
      datasets.push({label: (type==='SERIE') ? fila : fila.etiqueta, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
      colorIndex == 6 ? colorIndex = 0 : colorIndex++;
    })

    if(type == 'PREGUNTA'){
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
          })
        }else{
          cloneData.mediasVariable[0].forEach((media, index) => {
            vars.forEach(item => datasets[index].data.push(this.showInDecimal(media[etiqCruce2_index][item.id])))
          })
        }
      }
    }else{
      cloneData.ficha.serie_temporal.map(x => {
        filas.map ( (fila, index) => {
          datasets[index].data.push(x.datos[index]);
        });
      })
    }
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
    table.insertAdjacentElement('beforebegin', canvas)
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
    document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}` : 'graph_chart').remove();
    document.getElementById(tableIndex >= 0 ? `graph_chart_${tableIndex}_buttons` : 'graph_chart_buttons').remove();
  }

  // ***** EXPORT
  // exportToExcel() {
  //   const workbook = new ExcelJS.Workbook();
  //   const ws1 = workbook.addWorksheet('Ficha de serie');
  
  //   // Título
  //   const title = 'FICHA DE SERIE';
  //   ws1.mergeCells('A4:F4');
  //   const titleCell = ws1.getCell('A4');
  //   titleCell.value = title;
  //   titleCell.font = { bold: true, size: 16 };
  //   titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  //   ws1.getRow(4).height = 40; 
  
  //   // Texto
  //   ws1.getCell('A6').value = 'Muestra:';
  //   ws1.getCell('B6').value = 'Nacional Población española ambos sexos 18 y más años';
  //   ws1.getCell('A6').font = { bold: true };
  
  //   ws1.getCell('A7').value = 'Pregunta:';
  //   ws1.getCell('B7').value = 'El próximo mes de diciembre hará (*) años que en España, en un referéndum, se aprobó la Constitución. En general, ¿cree Ud. que los/as españoles/as conocemos bien la Constitución, la conocemos por encima, la conocemos muy poco o casi nada?:N: :N:';
  //   ws1.getCell('A7').font = { bold: true };
  
  //   ws1.getCell('A8').value = 'Notas:';
  //   ws1.getCell('B8').value = '(*)Tiempo transcurrido desde la fecha de aprobación de la Constitución hasta la fecha de cada punto de la serie.';
  //   ws1.getCell('A8').font = { bold: true };
  
  //   const tbl = document.getElementById('demo');
  //   const startRow = 14;
  //   const tableEndRow = this.addTableToWorksheet(tbl, ws1, startRow);
  
  //   this.addLogoToWorkbook(workbook).then(() => {
  //     this.addImageToWorkbook(workbook, tableEndRow).then(() => {
  //       workbook.xlsx.writeBuffer().then(buffer => {
  //         const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //         FileSaver.saveAs(blob, 'output.xlsx');
  //       });
  //     });
  //   });
  // }
  
  // getLogoAsBase64() {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.crossOrigin = 'Anonymous';
  

  //    //  img.src = 'https://i.imgur.com/77syx2k.png';
  //    img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
  //   //img.src = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
  
  //     img.onload = () => {
  //       let canvas = document.createElement('canvas');
  //       let ctx = canvas.getContext('2d');
  //       canvas.height = img.naturalHeight;
  //       canvas.width = img.naturalWidth;
  //       ctx.drawImage(img, 0, 0);
  //       let base64Image = canvas.toDataURL('image/png');
  //       resolve(base64Image);
  //     };
  
  //     img.onerror = error => {
  //       reject(error);
  //     };
  //   });
  // }
  
  // async addLogoToWorkbook(workbook) {
  //   const base64Logo = await this.getLogoAsBase64();
  //   const base64Data = base64Logo.split(',')[1];
  //   const blob = this.b64toBlob(base64Data, 'image/png');
  //   const buffer = await this.blobToArrayBuffer(blob);
  
  //   const logoId = workbook.addImage({
  //     buffer: buffer,
  //     extension: 'png',
  //   });
  
  //   const ws = workbook.getWorksheet('Ficha de serie');
  //   ws.addImage(logoId, {
  //     tl: { col: 0, row: 0 },
  //     br: { col: 1, row: 3 },
  //     editAs: 'absolute',
  //   });
  // }
  
  // addTableToWorksheet(table, worksheet, startRow = 14) {
  //   const rows = table.getElementsByTagName('tr');
  //   const headerHeight = 30; 
  //   const dataHeight = 20; 
  
  //   for (let i = 0; i < rows.length; i++) {
  //     const row = rows[i];
  //     const cells = i === 0 ? row.getElementsByTagName('th') : row.getElementsByTagName('td');
  //     const rowData = Array.from(cells).map(cell => cell.innerText);
  //     const rowAdded = worksheet.addRow(rowData);
  //     rowAdded.eachCell((cell) => {
  //       if (cell.row.number === startRow) {
  //         cell.font = { bold: true };
  //         rowAdded.height = headerHeight;
  //       } else {
  //         cell.font = { bold: false };
  //         rowAdded.height = dataHeight;
  //       }
  //     });
  
  //     if (i === 0) { // Cabecera
  //       rowAdded.eachCell((cell) => {
  //         cell.font = { bold: true };
  //       });
  //     }
  
  //     worksheet.getColumn('A').width = 30;
  //     worksheet.getColumn('B').width = 20;
  //     worksheet.getColumn('C').width = 20;
  //     worksheet.getColumn('D').width = 20;
  //     worksheet.getColumn('E').width = 20;
  //     worksheet.getColumn('F').width = 20;
  //   }
  
  //   return startRow + rows.length;
  // }
  
  // async addImageToWorkbook(workbook, startRow) {
    
  //   const ws = workbook.getWorksheet('Ficha de serie');
  
  //   const rows = document.getElementById('demo').getElementsByTagName('tr');
  //   const base64Image = this.chart.toBase64Image();
  //   const base64Data = base64Image.split(',')[1];
  //   const blob = this.b64toBlob(base64Data, 'image/png');
  //   const buffer = await this.blobToArrayBuffer(blob);
    
  //   const imageId = workbook.addImage({
  //     buffer: buffer,
  //     extension: 'png',
  //   });
    
  //   const startRowChart = 18; 
  //   const endRowChart = startRowChart + 19;
  
  //   ws.addImage(imageId, {
  //     tl: { col: 0, row: startRowChart },
  //     br: { col: 6, row: endRowChart },
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
  

// exportToPDF() {
//   const pdf = new jsPDF('p', 'pt', 'a3'); // A3 en lugar de A4
//   const tbl = document.getElementById('demo');
//   const originalCanvas = document.getElementById("graph_chart");
//   let inMemoryCanvas = document.createElement('canvas');
//   let ctx = inMemoryCanvas.getContext('2d');
//   inMemoryCanvas.width = originalCanvas.width;
//   inMemoryCanvas.height = originalCanvas.height;
//   ctx.fillStyle = 'rgb(255,255,255)';
//   ctx.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
//   ctx.drawImage(originalCanvas, 0, 0);
//   const base64Image = inMemoryCanvas.toDataURL("image/png");

//   // Logo
//   const logoWidth = 100;
//   const logoHeight = 100;
//   const logoX = 20;
//   const logoY = 70;
//   //const logoUrl = 'https://i.imgur.com/77syx2k.png';
//   const logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logotipo_del_CIS.png';
//   //const logoUrl = 'https://webserver-cis-dev.lfr.cloud/documents/d/cis/logo-cis';
//   pdf.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

//   // Título
//   const title = 'FICHA DE SERIE';
//   pdf.setFont('helvetica', 'bold');
//   pdf.setFontSize(24);
//   const titleWidth = pdf.getStringUnitWidth(title) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
//   const titleOffset = (pdf.internal.pageSize.width - titleWidth) / 2;
//   pdf.text(title, titleOffset, logoY + logoHeight + 30); // Título centrado y debajo del logo
  

//     // Texto
//     const text = 'Muestra:   Nacional Población española ambos sexos 18 y más años';
//     const note = 'Pregunta:  El próximo mes de diciembre hará (*) años que en España, en un referéndum, se aprobó la Constitución.';
//     const question = 'Notas:  (*)Tiempo transcurrido desde la fecha de aprobación de la Constitución hasta la fecha de cada punto de la serie.';
//     const textX = 50;
//     const textY = logoY + logoHeight + 70;
//     const textFontSize = 10;
//     const textWidth = pdf.getStringUnitWidth(text) * textFontSize / pdf.internal.scaleFactor;
//     const textOffset = textX;
//     pdf.setFontSize(textFontSize);
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('Muestra:', textOffset, textY);
//     pdf.setFont('helvetica', 'normal');
//     pdf.text(text.substr(9), textOffset + pdf.getStringUnitWidth('Muestra:') * textFontSize, textY);

//     const noteX = textOffset;
//     const noteY = textY + 20;
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('Pregunta:', noteX, noteY);
//     pdf.setFont('helvetica', 'normal');
//     pdf.text(note.substr(9), noteX + pdf.getStringUnitWidth('Pregunta:') * textFontSize, noteY);

//     const questionX = textOffset;
//     const questionY = noteY + 20;
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('Notas:', questionX, questionY);
//     pdf.setFont('helvetica', 'normal');
//     pdf.text(question.substr(6), questionX + pdf.getStringUnitWidth('Notas:') * textFontSize, questionY);

//     // Tabla
//     const styles = {
//     fontStyle: 'normal',
//     cellPadding: 1,
//     fontSize: 8,
//     cellHeight: 16,
//     };
//     autoTable(pdf, {
//     html: tbl,
//     startY: questionY + 30, 
//     styles: styles,
//     headStyles: {
//         fontStyle: 'bold',
//         fillColor: [0, 0, 0],
//         textColor: [255, 255, 255]
//     },
//     didDrawPage: (data) => {
//         pdf.setFontSize(20);
//     },
//     });

//     const rowCount = tbl.rows.length;
//     const totalTableHeight = styles.cellHeight * rowCount;

//     // Gráfico
//     const imagePosition = { x: 15, y: questionY + totalTableHeight + 60, width: 800, height: 400 };
//     pdf.addImage(base64Image, 'JPEG', imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

//     // Borde gráfico
//     pdf.rect(imagePosition.x, imagePosition.y, imagePosition.width, imagePosition.height);

//     pdf.save('fichaDeSerie.pdf');

// }


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