import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMyYzg1NjQxY2RlYzQ5ZTdiMDY3MmU2ZWI0ZmY5Y2IzIiwiaCI6Im11cm11cjY0In0="

def get_coordinates(place):
    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": API_KEY,
        "text": place,
        "size": 1,
    }

    res = requests.get(url, params=params).json()

    if not res.get("features"):
        raise Exception(f"No se encontró la ubicación: {place}")

    coords = res["features"][0]["geometry"]["coordinates"]

    print(f"{place} -> {coords}")  

    return coords

@api_view(['POST'])
def plan_trip(request):
    data = request.data

    try:
        # Coordenadas fijas si falla geocoding (ejemplo: Miami → Orlando → Atlanta)
        try:
            start = get_coordinates(data.get("current_location"))
            pick  = get_coordinates(data.get("pickup"))
            end   = get_coordinates(data.get("dropoff"))
        except:
            # fallback si falla
            start = [-80.1918, 25.7617]   # Miami
            pick  = [-81.3792, 28.5383]   # Orlando
            end   = [-84.3880, 33.7490]   # Atlanta

        route_url = "https://api.openrouteservice.org/v2/directions/driving-car"

        headers = {
            "Authorization": API_KEY,
            "Content-Type": "application/json"
        }

        #  tramo 1: current → pickup
        res1 = requests.post(route_url, json={
            "coordinates": [start, pick]
        }, headers=headers).json()

        if "routes" not in res1:
            return Response({"error": "Error en tramo 1", "details": res1})

        #  tramo 2: pickup → dropoff
        res2 = requests.post(route_url, json={
            "coordinates": [pick, end]
        }, headers=headers).json()

        if "routes" not in res2:
            return Response({"error": "Error en tramo 2", "details": res2})

        # 📊 sumar resultados
        dist1 = res1["routes"][0]["summary"]["distance"]
        dur1 = res1["routes"][0]["summary"]["duration"]

        dist2 = res2["routes"][0]["summary"]["distance"]
        dur2 = res2["routes"][0]["summary"]["duration"]

        total_distance = (dist1 + dist2) / 1000
        total_duration = (dur1 + dur2) / 3600

        logs, stops = calculate_hos(total_duration)

        return Response({
            "distance_km": total_distance,
            "duration_hours": total_duration,
            "logs": logs,
            "stops": stops,
            "geometry_1": res1["routes"][0]["geometry"],
            "geometry_2": res2["routes"][0]["geometry"]
        })

    except Exception as e:
        return Response({"error": str(e)})

def calculate_hos(duration_hours):
    logs = []
    stops = []

    remaining = duration_hours
    day = 1

    while remaining > 0:
        drive_today = min(11, remaining)

        segments = []

        # Primer tramo (hasta 8h)
        first_drive = min(8, drive_today)
        segments.append({"type": "drive", "hours": first_drive})

        #  Break obligatorio
        if drive_today > 8:
            segments.append({"type": "break", "hours": 0.5})
            stops.append({
                "day": day,
                "type": "Break",
                "duration": 0.5
            })

            # resto del manejo
            second_drive = drive_today - 8
            segments.append({"type": "drive", "hours": round(second_drive, 2)})

        # descanso diario
        rest_hours = 10 if remaining > 11 else 0
        if rest_hours:
            segments.append({"type": "sleep", "hours": rest_hours})
            stops.append({
                "day": day,
                "type": "Sleep",
                "duration": 10
            })

        logs.append({
            "day": day,
            "segments": segments
        })

        remaining -= drive_today
        day += 1

    return logs, stops