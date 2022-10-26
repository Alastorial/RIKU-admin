// фильтрация по типу объекта (дом, офис, квартира)
const filterByTypeOfObject = (projectsInfo, filters) => {
    let newProjectsInfo = [];
    // добавляем вновый массив все, что true
    if (filters.flats) {
        // console.log(...projectsInfo.filter(p => p.type === "flat"))
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.type === "flat")];
    }
    if (filters.houses) {
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.type === "house")];
    }
    if (filters.offices) {
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.type === "office")];
    }
    if (!filters.flats && !filters.houses && !filters.offices)
        return projectsInfo;
    // console.log(newProjectsInfo)
    return newProjectsInfo;
}

// фильтрация по количеству комнат объекта
const filterByNumberOfRooms = (projectsInfo, filters) => {
    let newProjectsInfo = [];
    // добавляем вновый массив все, что true
    if (filters.oneRoom) {
        // console.log(...projectsInfo.filter(p => p.type === "flat"))
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.numberOfRooms === 1)];
    }
    if (filters.twoRoom) {
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.numberOfRooms === 2)];
    }
    if (filters.threeRoom) {
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.numberOfRooms === 3)];
    }
    if (filters.fourPlusRoom) {
        newProjectsInfo = [...newProjectsInfo, ...projectsInfo.filter(p => p.numberOfRooms >= 4)];
    }
    if (!filters.oneRoom && !filters.twoRoom && !filters.threeRoom && !filters.fourPlusRoom)
        return projectsInfo;
    // console.log(newProjectsInfo)
    return newProjectsInfo;
}

// фильтрация по площади
const filterByArea = (projectsInfo, filters) => {
    let newProjectsInfo = [];
    // добавляем вновый массив все, что true

    newProjectsInfo = projectsInfo.filter(p => p.area >= filters.sMin);
    newProjectsInfo = newProjectsInfo.filter(p => p.area <= filters.sMax);

    // console.log(newProjectsInfo)
    return newProjectsInfo;
}

// сортировка по типу сортировки
const sortBySort = (projectsInfo, filters) => {
    if (filters.sortBy === "date") {
        projectsInfo = projectsInfo.sort(function(a, b) {
            const str1 = parseInt(a.date.split('.').reverse().join(''));
            const str2 = parseInt(b.date.split('.').reverse().join(''));
            // console.log(str1 + ' ' + str2)
            return str1 - str2;
        });
    } else if (filters.sortBy === "area") {
        projectsInfo = projectsInfo.sort((a, b) => a.area - b.area);
    } else if (filters.sortBy === "popular") {
        projectsInfo = projectsInfo.sort((a, b) => a.popular - b.popular);
    }

    // сортировка по возрастанию / убыванию
    if (!filters.sortToUp) {
        projectsInfo.reverse();
    }
    return projectsInfo;
}

export const useFilterProjects = (projectsInfo, filters) => {
    let newProjectsInfo = [];
    newProjectsInfo = filterByTypeOfObject(projectsInfo, filters);
    newProjectsInfo = filterByNumberOfRooms(newProjectsInfo, filters);
    newProjectsInfo = filterByArea(newProjectsInfo, filters);
    newProjectsInfo = sortBySort(newProjectsInfo, filters);


    // console.log(newProjectsInfo)
    return newProjectsInfo;
}
