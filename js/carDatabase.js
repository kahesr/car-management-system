class CarDatabase {
    constructor() {
        this.dbName = 'CarManagementDB';
        this.dbVersion = 1;
        this.storeName = 'cars';
        this.db = null;
        this.ready = this.init();
    }

    async init() {
        if (!window.indexedDB) {
            console.log('IndexedDB not supported, falling back to localStorage');
            return;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

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

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } else {
            // Fallback to localStorage
            return Promise.resolve(this.getCarsFromLocalStorage());
        }
    }

    getCarsFromLocalStorage() {
        const cars = localStorage.getItem('cars');
        return cars ? JSON.parse(cars) : [];
    }
}

const carDB = new CarDatabase(); 