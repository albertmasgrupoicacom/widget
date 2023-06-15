import Chart from 'chart.js/auto';
import { buttons, colors } from './utils/utils';
import { SerieExport } from './utils/serie-export';
import { HttpClient } from './utils/http-client';
import { base_url } from './environments/environment.prod';

export class SerieChart {

    constructor() {
        this._http = new HttpClient();
        this._exportUtils = new SerieExport();
        this.type;
        this.data;
    }
    
    init(type, details){
        this.removeContainer();
        this._http.get( `${base_url}/serie/${details.id}`).then(data => {
            this.type = type;
            this.data = data;
            if(data && data.ficha) {this.printContainer(data)}
        }).catch(error => {
            console.error('Error', error);
        });
    }

    getParsedData(rawData){
        const data = JSON.parse(JSON.stringify(rawData));
        let result = {datasets: [], titulo: data.ficha.titulo};
        let labels = data.ficha.serie_temporal.map(label => label.fecha);
        let datasets = [];
        let colorIndex = 0;
        let filas = data.ficha.filas.slice(0, -1);

        filas.forEach(fila => {
            datasets.push({label: fila, data: [], backgroundColor: colors[colorIndex], borderColor: colors[colorIndex]});
            colorIndex == 6 ? colorIndex = 0 : colorIndex++;
        });

        data.ficha.serie_temporal.map(x => {
            filas.map ( (fila, index) => {datasets[index].data.push(x.datos[index])});
        })

        result.labels = labels;
        result.datasets = datasets;

        return result;
    }

    printContainer(data){
        const page = document.getElementById('graph_page');
        let container = document.createElement('div');
        container.id = `graph_container`;
        page.appendChild(container);
        this.printHeader(data);
    }

    printHeader(data){
        const container = document.getElementById("graph_container");
        const htmlHeader = `
            <div><h4>Serie:</h4><p>${data.ficha.codigo || '-'}</p><p>${data.ficha.titulo || '-'}</p></div>
            <div><h4>Muestra:</h4><p>${data.ficha.muestra || '-'}</p></div>
            <div><h4>Pregunta:</h4>${data.ficha.pregunta || '-'}</div>
            <div><h4>Notas:</h4><p>${data.ficha.notas || '-'}</p></div>`;
        container.insertAdjacentHTML( 'afterbegin', htmlHeader);
        this.printTable(this.getParsedData(data));
    }

    printTable(data){
        const container = document.getElementById(`graph_container`);
        const tbl = document.createElement('div');
        tbl.id = `graph_table`;
        tbl.classList.add('table', 'table-responsive', 'border-0');

        const tblTable = document.createElement('table');
        tblTable.id = `table`;
        tblTable.classList.add('cis-tabla', 'mb-5');

        const tThead = document.createElement('thead');
        const headerrow = document.createElement('tr');

        this.addHeaderCell(headerrow, '');
        data.labels.forEach(label => this.addHeaderCell(headerrow, label))

        tThead.appendChild(headerrow);
        tblTable.appendChild(tThead);
        
        const tblBody = document.createElement('tbody');

        data.datasets.forEach(dataset => {
            const row = document.createElement('tr');
            this.addCell(row, dataset.label);
            dataset.data.forEach(item => this.addCell(row, item))
            tblBody.appendChild(row);
        })

        tblTable.appendChild(tblBody);
        tbl.appendChild(tblTable);
        container.appendChild(tbl);
        let chartConfig = container.getAttribute('config')
        this.printChart(data, chartConfig ? JSON.parse(chartConfig) : buttons[0]);
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

    showInDecimal(number) {
        return number !== Math.round(number) ? parseFloat(number.toFixed(2)) : number;
    }

    printChart(data, config){
        const table = document.getElementById(`graph_table`);
        let canvas = document.createElement("canvas");
        canvas.id = `graph_chart`;
        table.insertAdjacentElement('beforeend', canvas);
        new Chart(canvas, {
        type: config && config.type ? config.type : 'line',
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
                legend: {display: true, position: 'bottom'},
            },
            responsive: true,
            scales: {
                x: {stacked: config && config.stacked != undefined ? config.stacked : false},
                y: {beginAtZero: true, stacked: config && config.stacked != undefined ? config.stacked : false},
            },
        },
        });
        const container = document.getElementById(`graph_container`);
        container.setAttribute('config', JSON.stringify(config));
        this.printChartSelectionButtons(data);
    }

    printChartSelectionButtons(data){
        const chart = document.getElementById(`graph_chart`);
        let buttonsContainer = document.createElement('div');
        buttonsContainer.id = `graph_chart_buttons`;
        buttons.forEach(config => {
        let button = document.createElement('button');
        button.classList.add('graphic_btn', `graph_chart_button`);
        button.style.background = `url(${config.icon}) no-repeat`;
        button.onclick = () => {
            this.removeChart();
            this.printChart(data, config);
        }
        buttonsContainer.appendChild(button);
        });
        buttonsContainer.classList.add('my-3'); 
        buttonsContainer.classList.add('d-flex');
        buttonsContainer.classList.add('justify-content-end');
        chart.insertAdjacentElement('afterend', buttonsContainer);
    }

    removeContainer() {
        let container = document.getElementById('graph_container');
        if(container){container.remove()}
    }

    removeTable() {
        document.getElementById(`graph_table`).remove();
    }

    removeChart() {
        document.getElementById(`graph_chart`).remove();
        document.getElementById(`graph_chart_buttons`).remove();
    }

    exportExcel(){
        if(this.data){
            this._exportUtils.exportToExcel(this.data.ficha);
        }
    }
    
    exportPdf(){
        if(this.data){
            this._exportUtils.exportToPDF(this.data.ficha);
        }
    }

}