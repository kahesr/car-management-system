import { carDB } from "./carDatabase.js";

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
                <strong>Maximum Oil Volume:</strong> ${car.oilVolume}L<br>
                <button class="btn small" data-id="${car.carId}" data-action="edit">Edit</button>
                <button class="btn small" data-id="${car.carId}" data-action="delete">Delete</button>
            `;
            carList.appendChild(carElement);
        });
    } catch (error) {
        console.error('Error displaying cars:', error);
    }
}

document.getElementById('carList').addEventListener('click', async (e) => {
    const { action, id } = e.target.dataset;
    if (!action) return;

    if (action === 'delete') {
        await carDB.deleteCar(id);
        displayCars();
    } else if (action === 'edit') {
        const newVolume = prompt('Enter new max oil volume (L):');
        if (newVolume && !isNaN(newVolume)) {
            await carDB.updateCar(id, { oilVolume: parseFloat(newVolume) });
            displayCars();
        }
    }
});

async function exportToExcel() {
    try {
        const cars = await carDB.getAllCars();

        if (cars.length === 0) {
            alert("No data to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(cars);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cars');
        XLSX.writeFile(workbook, 'car_data.xlsx');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
}

document.querySelector('.actions button:nth-child(2)').addEventListener('click', exportToExcel);

window.addEventListener('load', displayCars); // Load cars when the page loads