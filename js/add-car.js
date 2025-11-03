import { carDB } from "./carDatabase.js";

document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const carId = document.getElementById('carId').value.trim();
    const oilVolume = parseFloat(document.getElementById('oilVolume').value);

    if (!carId) {
        alert('Car ID cannot be empty');
        return;
    }
    if (isNaN(oilVolume) || oilVolume <= 0) {
        alert('Oil volume must be a positive number');
        return;
    }
    
    const car = { carId, oilVolume };

    try {
        await carDB.addCar(car);
        await carDB.syncToLocalStorage(); // keep backup updated
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error saving car: ' + error.message);
    }
});