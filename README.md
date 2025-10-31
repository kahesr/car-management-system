# Car Management System

A lightweight desktop-ready web app for managing car data locally.  
Built with **HTML, CSS, and JavaScript**, using **IndexedDB** for offline storage.  

You can add, edit, delete, and export car data to Excel — all without needing a server.


## 🧩 Features
- Add cars with a unique ID and maximum oil volume  
- View all cars in a clean list  
- Edit or delete existing cars  
- Export data to `.xlsx` format  
- Works fully offline via IndexedDB (with localStorage fallback)


## ⚙️ Tech Stack
- HTML5, CSS3
- Vanilla JavaScript (ES Modules)
- IndexedDB API for persistent local data
- [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs) for Excel export


## 🖥️ Running the App
Just open `index.html` in any modern browser.


## 🧠 Project Structure
```
car-management/
│
├── index.html
├── add-car.html
├── styles.css
│
└── js/
    ├── carDatabase.js
    ├── index.js
    └── add-car.js
```


## 🪶 License

This project is open source and available under the [MIT License](LICENSE).



