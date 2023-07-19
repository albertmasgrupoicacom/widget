export const serieButtons = [
    {type: 'line', icon: 'https://cdn-icons-png.flaticon.com/512/4301/4301717.png'},
];

// MV, MR, MD, N o blanco
export const resultButtons = [
    {type: 'bar', stacked: false, axis: 'x', icon: 'https://cdn-icons-png.flaticon.com/128/893/893201.png', showCondition:['MV','MR','MD','N']},
    {type: 'bar', stacked: false, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/3723/3723413.png', showCondition:['MV','MR','MD','N']},
    {type: 'bar', stacked: true, axis: 'x', icon: 'https://cdn-icons-png.flaticon.com/128/2272/2272055.png', showCondition:['MV','MR','MD','N']},
    {type: 'bar', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/3723/3723415.png', showCondition:['MV','MR','MD','N']},
    {type: 'pie', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/9246/9246009.png', showCondition:['N']},
    // {type: 'doughnut', stacked: true, axis: 'y', icon: 'https://cdn-icons-png.flaticon.com/128/9246/9246009.png', showCondition:['MV','N']},
]

export const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'];