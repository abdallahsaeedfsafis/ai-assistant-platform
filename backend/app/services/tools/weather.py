import requests

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def _geocode(city: str):
    response = requests.get(GEOCODING_URL, params={"name": city, "count": 1}, timeout=10)
    response.raise_for_status()
    results = response.json().get("results")
    if not results:
        return None
    place = results[0]
    return place["latitude"], place["longitude"], place.get("name", city), place.get("country", "")


def get_weather(city: str) -> str:
    """Fetches the current weather for a given city name."""
    location = _geocode(city)
    if location is None:
        return f"Could not find a location named '{city}'."

    lat, lon, resolved_name, country = location

    response = requests.get(
        FORECAST_URL,
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,wind_speed_10m",
            "timezone": "auto",
        },
        timeout=10,
    )
    response.raise_for_status()
    current = response.json().get("current", {})

    temperature = current.get("temperature_2m")
    wind_speed = current.get("wind_speed_10m")

    return f"Current weather in {resolved_name}, {country}: {temperature}°C, wind speed {wind_speed} km/h."