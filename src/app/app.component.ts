import { Component, OnInit } from '@angular/core';

import LiferayParams from '../types/LiferayParams'

import { Chart } from 'chart.js';
// Chart.register(...registerables);

declare const Liferay: any;

@Component({
	templateUrl: 
		Liferay.ThemeDisplay.getPathContext() + '/o/widget1/app/app.component.html'
})
export class AppComponent implements OnInit {
	params: LiferayParams;
	labels: any;
	public chart: any;

	constructor() {
		this.labels = {        
			
			configuration: 'Configuration',
			
			portletNamespace: 'Portlet Namespace',
        	contextPath: 'Context Path',
			portletElementId: 'Portlet Element Id',
		}
	}

	ngOnInit(): void {
		this.createChart();
	}

	get configurationJSON() {
		return JSON.stringify(this.params.configuration, null, 2);
	}


	download() {
		console.log('download');
		const imageLink = document.createElement('a');
		const canvas = document.getElementById('MyChart') as HTMLCanvasElement;

		let inMemoryCanvas = document.createElement('canvas');
		let ctx = inMemoryCanvas.getContext('2d');
		inMemoryCanvas.width = canvas.width;
        inMemoryCanvas.height = canvas.height;
		ctx.fillStyle = 'rgb(255,255,255)'; // color background 
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(canvas, 0, 0);

		imageLink.download = 'image.png';
		imageLink.href = inMemoryCanvas.toDataURL('image/jpeg', 1.0);
		imageLink.click();
	}

	createChart(){
		this.chart = new Chart("MyChart", {
		  type: 'bar', //this denotes tha type of chart
	
		  data: {// values on X-Axis
			labels: ['2022-05-10', '2022-05-11', '2022-05-12','2022-05-13',
									 '2022-05-14', '2022-05-15', '2022-05-16','2022-05-17', ], 
			   datasets: [
			  {
				label: "Sales",
				data: [467,576, 572, 79, 92,
									 574, 573, 576],
				backgroundColor: 'blue'
			  },
			  {
				label: "Profit",
				data: [542, 542, 536, 327, 17,
										 0.00, 538, 541],
				backgroundColor: 'limegreen'
			  }  
			]
		  },
		  options: {
			aspectRatio:2.5
		  }
		  
		});
	  }
}
