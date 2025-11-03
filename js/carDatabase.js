class CarDB {
	constructor() {
		this.dbName = "CarManagementDB";
		this.dbVersion = 1;
		this.storeName = "cars";
		this.db = null;
		this.ready = this.init();
	}

	async init() {
		carDB.restoreFromLocalStorage();

		if (!window.indexedDB) {
			console.warn("IndexedDB not supported, falling back to localStorage");
			return;
		}

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = (event) => reject(event.target.error);

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName, { keyPath: "carId" });
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
				const transaction = this.db.transaction([this.storeName], "readwrite");
				const store = transaction.objectStore(this.storeName);
				const request = store.add(car);

				request.onsuccess = () => resolve(true);
				request.onerror = () => reject(request.error);
			});
		} else {
			// Fallback to localStorage
			const cars = this.getCarsFromLocalStorage();
			if (cars.find((c) => c.carId === car.carId)) {
				throw new Error("Car ID already exists");
			}
			cars.push(car);
			localStorage.setItem("cars", JSON.stringify(cars));
			return Promise.resolve(true);
		}
	}

	async getAllCars() {
		await this.ready;

		if (this.db) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction([this.storeName], "readonly");
				const store = transaction.objectStore(this.storeName);
				const request = store.getAll();

				request.onsuccess = () => {
					const result = request.result;
					// If IndexedDB is empty, fallback to localStorage
					if (!result || result.lenght === 0) {
						resolve(this.getCarsFromLocalStorage());
					} else {
						resolve(result);
					}
				};
				request.onerror = () => reject(request.error);
			});
		} else {
			// Fallback to localStorage
			return Promise.resolve(this.getCarsFromLocalStorage());
		}
	}

	// updateCar method (replace older version)
	async updateCar(carId, updatedFields) {
		await this.ready;
		if (this.db) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction([this.storeName], "readwrite");
				const store = transaction.objectStore(this.storeName);
				const getReq = store.get(carId);
				getReq.onsuccess = () => {
					const car = getReq.result;
					if (!car) return reject(new Error("Car not found"));
					Object.assign(car, updatedFields);
					const putReq = store.put(car);
					putReq.onsuccess = () => resolve(true);
					putReq.onerror = () => reject(putReq.error);
				};
				getReq.onerror = () => reject(getReq.error);
			});
		}

		// Fallback: localStorage
		const cars = this.getCarsFromLocalStorage();
		const idx = cars.findIndex((c) => c.carId === carId);
		if (idx === -1)
			return Promise.reject(new Error("Car not found in localStorage"));
		cars[idx] = Object.assign({}, cars[idx], updatedFields);
		localStorage.setItem("cars", JSON.stringify(cars));
		return Promise.resolve(true);
	}

	// deleteCar method (replace any older version)
	async deleteCar(carId) {
		await this.ready;

		// If we have a real IndexedDB instance
		if (this.db) {
			return new Promise((resolve, reject) => {
				const transaction = this.db.transaction([this.storeName], "readwrite");
				const store = transaction.objectStore(this.storeName);
				const delReq = store.delete(carId);
				delReq.onsuccess = () => resolve(true);
				delReq.onerror = () => reject(delReq.error);
			});
		}

		// Fallback: localStorage (cars stored as array under "cars")
		const cars = this.getCarsFromLocalStorage();
		const newCars = cars.filter((c) => c.carId !== carId);
		if (newCars.length === cars.length) {
			// nothing removed => carId not found
			return Promise.reject(new Error("Car not found in localStorage"));
		}
		localStorage.setItem("cars", JSON.stringify(newCars));
		return Promise.resolve(true);
	}

	getCarsFromLocalStorage() {
		const cars = localStorage.getItem("cars");
		return cars ? JSON.parse(cars) : [];
	}
}

export const carDB = new CarDB();
