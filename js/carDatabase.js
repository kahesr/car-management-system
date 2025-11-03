class CarDB {
  constructor() {
    this.dbName = "CarManagementDB";
    this.dbVersion = 1;
    this.storeName = "cars";
    this.db = null;
    this.ready = this.init();
  }

  async init() {
	if (!window.indexedDB) {
			console.warn("IndexedDB not supported!");
			return;
		}
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject(event.target.error);
      };

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
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add(car);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCars() {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCar(carId, updatedFields) {
    await this.ready;
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

  async removeCar(carId) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(carId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }  

  // ----------- New Backup System -----------

  async syncToLocalStorage() {
    const cars = await this.getAllCars();
    localStorage.setItem("carsBackup", JSON.stringify(cars));
  }

  async restoreFromLocalStorage() {
    const cars = JSON.parse(localStorage.getItem("carsBackup") || "[]");
    for (const car of cars) {
      try {
        await this.addCar(car);
      } catch {
        // ignore duplicates
      }
    }
  }
}

export const carDB = new CarDB();

// Restore data if IndexedDB is empty
(async () => {
  await carDB.ready;
  const cars = await carDB.getAllCars();
  if (!cars.length) {
    await carDB.restoreFromLocalStorage();
  }
})();

// Backup on tab close
window.addEventListener("beforeunload", async () => {
  await carDB.syncToLocalStorage();
});
