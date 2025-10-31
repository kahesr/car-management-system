document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const carId = document.getElementById('carId').value;
    const oilVolume = parseFloat(document.getElementById('oilVolume').value);

    // Validate inputs
    if (oilVolume <= 0) {
        alert('Oil volume must be a positive number');
        return;
    }

    const car = {
        carId,
        oilVolume
    };

    try {
        await carDB.addCar(car);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error saving car: ' + error.message);
    }
}); 