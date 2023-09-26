export const serieButtons = [
    {type: 'line', icon: 'https://cdn-icons-png.flaticon.com/512/4301/4301717.png'},
];

// MV, MR, MD, N o blanco
export const resultButtons = [
    {id: 'v_bar', type: 'bar', stacked: false, axis: 'x', icon: 'https://cdn-icons-png.flaticon.com/128/893/893201.png', showCondition:['MV','MR','MD','N']},
    {id: 'h_bar', type: 'bar', stacked: false, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/3723/3723413.png', showCondition:['MV','MR','MD','N']},
    {id: 'v_bar_ap', type: 'bar', stacked: true, axis: 'x', icon: 'https://cdn-icons-png.flaticon.com/128/2272/2272055.png', showCondition:['MV','MR','MD','N']},
    {id: 'h_var_ap', type: 'bar', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/3723/3723415.png', showCondition:['MV','MR','MD','N']},
    {id: 'pie', type: 'pie', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/9246/9246009.png', showCondition:['N']},
    // {type: 'doughnut', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/9246/9246009.png', showCondition:['MV','N']},
]

export const zoomButtonIcon = 'https://cdn-icons-png.flaticon.com/128/1522/1522127.png';

export const colors = ['#d92b30', '#0095ba', '#3cccb4', '#ab52b3', '#ffb259', '#ffdf3c', '#eb82eb', '#c27c30', '#a0d17d', '#f260a1'];

export const operations = [
    {etiqueta:'Valores Absolutos', data: 'cruce'},
    {etiqueta:'Mostrar % (columna)', data: 'cruceV'},
    {etiqueta:'Mostrar % (columna - NS/NC)', data: 'cruceV_NSNC'},
    {etiqueta:'Mostrar % (fila)', data: 'cruceH'},
    {etiqueta:'Mostrar % (fila - NS/NC)', data: 'cruceH_NSNC'},
    {etiqueta:'Mostrar % (total)', data: 'cruceT'},
    {etiqueta:'Mostrar % (total - NS/NC)', data: 'cruceT_NSNC'}
];