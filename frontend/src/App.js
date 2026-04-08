import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import polyline from "@mapbox/polyline";
import { useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";


function App() {
  const [form, setForm] = useState({
    current_location: "",
    pickup: "",
    dropoff: "",
    cycle_used: 0
  });

  const [logs, setLogs] = useState([]);
  const [route1, setRoute1] = useState([]);
  const [route2, setRoute2] = useState([]);
  const [stops, setStops] = useState([]);

  const handleSubmit = async () => {
    const res = await axios.post("https://truck-route.onrender.com/api/plan-trip/", form);

    
    setLogs(res.data.logs);

    const decoded1 = polyline.decode(res.data.geometry_1);
    const decoded2 = polyline.decode(res.data.geometry_2);

    setRoute1(decoded1);
    setRoute2(decoded2);

    setStops(res.data.stops);
  };

  const buildELD = (log) => {
    return log.segments;
  };

  return (
    <div>
      <h1>Truck Planner</h1>

      <input placeholder="Current Location"
        onChange={(e) => setForm({...form, current_location: e.target.value})} />

      <input placeholder="Pickup"
        onChange={(e) => setForm({...form, pickup: e.target.value})} />

      <input placeholder="Dropoff"
        onChange={(e) => setForm({...form, dropoff: e.target.value})} />

      <input type="number" placeholder="Cycle Used"
        onChange={(e) => setForm({...form, cycle_used: e.target.value})} />

      <button onClick={handleSubmit}>Plan Trip</button>
      <h2>Driver Logs</h2>

        {logs.map((log, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            margin: "10px 0"
          }}>
            <p><strong>Day {log.day}</strong></p>
            <p>
            {log.segments.map((s, i) => (
              <span key={i}>
                {s.type}: {s.hours}h{" | "}
              </span>
            ))}
          </p>
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <span style={{ background: "green", padding: "5px", color: "white" }}>Driving</span>
          <span style={{ background: "orange", padding: "5px", color: "white" }}>Break</span>
          <span style={{ background: "blue", padding: "5px", color: "white" }}>Sleep</span>
        </div>

        <h2>ELD Logs (Visual)</h2>

        {logs.map((log, index) => {
          const segments = buildELD(log);

          return (
            <div key={index} style={{ marginBottom: "20px" }}>
              <p><strong>Day {log.day}</strong></p>

              <div style={{ display: "flex", height: "30px", width: "100%" }}>
                {segments.map((seg, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${(seg.hours / 24) * 100}%`,
                      backgroundColor:
                        seg.type === "drive"
                          ? "green"
                          : seg.type === "break"
                          ? "orange"
                          : seg.type === "sleep"
                          ? "blue"
                          : "gray",
                      color: "white",
                      fontSize: "10px",
                      textAlign: "center"
                    }}
                  >
                    {seg.hours}h
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <h2>Stops</h2>

        {stops.map((stop, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            padding: "8px",
            margin: "5px 0",
            borderRadius: "6px"
          }}>
            <strong>Day {stop.day}</strong> - {stop.type} ({stop.duration}h)
          </div>
        ))}

        <h2>Route Map</h2>

        <MapContainer
          center={[28.5, -81.3]}
          zoom={6}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={route1} />
          <Polyline positions={route2} />
        </MapContainer>
    </div>
  );
}

export default App;
