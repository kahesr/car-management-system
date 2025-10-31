async function displayCars() {
    try {
        const cars = await carDB.getAllCars();
        const carList = document.getElementById('carList');
        carList.innerHTML = '';

        cars.forEach(car => {
            const carElement = document.createElement('div');
            carElement.className = 'car-item';
            carElement.innerHTML = `
                <strong>Car ID:</strong> ${car.carId}<br>
                <strong>Maximum Oil Volume:</strong> ${car.oilVolume}L
            `;
            carList.appendChild(carElement);
        });
    } catch (error) {
        console.error('Error displaying cars:', error);
    }
}

async function exportToExcel() {
    try {
        const cars = await carDB.getAllCars();
        const worksheet = XLSX.utils.json_to_sheet(cars);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cars');
        XLSX.writeFile(workbook, 'car_data.xlsx');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
}

// Load cars when the page loads
window.addEventListener('load', displayCars); 