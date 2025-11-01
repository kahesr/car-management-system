class CarDB {
    constructor() {
        this.dbName = 'CarManagementDB';
        this.dbVersion = 1;
        this.storeName = 'cars';
        this.db = null;
        this.ready = this.init();
    }

    async init() {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            return;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => reject(event.target.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'carId' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
        });
    }

    async addCar(car) {
        await this.ready;

        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.add(car);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to localStorage
            const cars = this.getCarsFromLocalStorage();
            if (cars.find(c => c.carId === car.carId)) {
                throw new Error('Car ID already exists');
            }
            cars.push(car);
            localStorage.setItem('cars', JSON.stringify(cars));
            return Promise.resolve(true);
        }
    }

    async getAllCars() {
        await this.ready;

        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    const result = request.result;
                    // If IndexedDB is empty, fallback to localStorage
                    if(!result || result.lenght === 0) {
                        resolve(this.getCarsFromLocalStorage());
                    } else {
                        resolve(result);
                    }
                }
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to localStorage
            return Promise.resolve(this.getCarsFromLocalStorage());
        }
    }

    async updateCar(carId, updatedFields) {
        await this.ready;
        if (this.db) {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(carId);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const car = request.result;
                    if (!car) return reject(new Error('Car not found'));
                    Object.assign(car, updatedFields);
                    const updateRequest = store.put(car);
                    updateRequest.onsuccess = () => resolve(true);
                    updateRequest.onerror = () => reject(updateRequest.error);
                };
                request.onerror = () => reject(request.error);
            });
        }

        // TODO: Fallback: localStorage
    }

    async deleteCar(carId) {
        await this.ready;
        if (this.db) {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            store.delete(carId);
        }

        // TODO: Fallback: localStorage

    }

    getCarsFromLocalStorage() {
        const cars = localStorage.getItem('cars');
        return cars ? JSON.parse(cars) : [];
    }
}

export const carDB = new CarDB();
