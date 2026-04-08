# 🚛 Truck Route Planner (HOS Simulation)

## 📌 Overview

This project is a full-stack application that simulates truck route planning while applying realistic Hours of Service (HOS) rules.

Users can input trip locations and the system generates:

* Route visualization on an interactive map
* Daily driving logs
* ELD-style visual timeline
* Stops for breaks and rest periods

---

## 🛠️ Tech Stack

* **Backend:** Django + Django REST Framework
* **Frontend:** React
* **Maps & Routing:** OpenRouteService + React Leaflet

---

## ⚙️ Features

* 📍 Dynamic route calculation between locations
* 🗺️ Interactive map displaying multi-leg routes
* 🚛 HOS-based trip planning
* 🛑 Automatic break insertion after 8 hours of driving
* 😴 Daily rest period simulation (10h)
* 📋 Structured driver logs (segmented)
* 📊 Visual ELD timeline (24-hour representation)
* ⛽ Stop tracking (breaks and sleep periods)

---

## 🧠 HOS Logic (Implemented)

This project includes a simplified but realistic HOS model:

* Maximum **11 hours driving per day**
* Mandatory **30-minute break after 8 hours**
* **10-hour rest period** between driving days
* Multi-day trip segmentation
* Explicit stop generation (Break / Sleep)

---

## 📥 Inputs

* Current Location
* Pickup Location
* Dropoff Location
* Cycle Used *(included for extensibility, not fully enforced)*

---

## 📤 Outputs

* Total distance and duration
* Route visualization (map)
* Daily segmented driving logs
* ELD-style timeline visualization
* List of stops (breaks and sleep periods)

---

## 🚀 Setup Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🌍 Notes

* Supports **global locations** via geocoding
* Includes error handling for invalid routes
* Designed for clarity and extensibility

---

## 🎥 Demo

A Loom video demonstrating the system is included in the submission.

---

## 📌 Future Improvements

* Full HOS compliance (70h / 8-day cycle)
* Fuel stop simulation
* Map markers for stops
* Advanced ELD graph (grid-based)
* UI/UX improvements

---

## 👨‍💻 Author

Elias Raimundo

