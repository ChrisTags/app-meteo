import { useEffect, useState } from "react";
import "./styles/app.scss";

const WEATHERAPI_KEY = "81116f9c880f4d298cb110224262104";
const WEATHERAPI_URL = "https://api.weatherapi.com/v1/current.json?aqi=no";

function App() {
  const [city, setCity] = useState("");
  const [loader, setLoader] = useState(null);
  const [weatherCity, setWeatherCity] = useState({});

  const handleSearchCity = (event) => {
    event.preventDefault();
    const cityInput = new FormData(event.target);
    setCity(cityInput.get("cityInput").trim());
  };

  async function fetchLoader(url, signal) {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) throw new Error("Erreur HTTP");
    return await response.json();
  }

  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();

    async function fetchWeather() {
      try {
        setLoader(true);
        const data = await fetchLoader(
          `${WEATHERAPI_URL}&key=${WEATHERAPI_KEY}&q=${city}`,
          controller.signal,
        );
        setWeatherCity(data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Erreur: " + error.message);
      } finally {
        setLoader(false);
      }
    }

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [city]);

  useEffect(() => {
    document.title = `Météo | ${weatherCity?.location?.name ?? "App"}`;
  }, [weatherCity]);

  return (
    <>
      <form className="formContainer" onSubmit={handleSearchCity}>
        <input
          type="text"
          name="cityInput"
          placeholder="Quel temps fait-il à... (votre ville)"
        />
        <button type="submit">Rechercher</button>
      </form>

      <div>
        {loader && (
          <div style={{ textAlign: "center" }}>
            <span className="loader"></span>
          </div>
        )}

        {city && !loader && (
          <div className="cityTitle">
            <h1>{weatherCity?.location?.name}</h1>
            <h2>{weatherCity?.location?.country}</h2>

            <div className="meteo">
              <div>
                <h2>Température (C°):</h2>
                <p className="temp">{weatherCity?.current?.temp_c}°C</p>
              </div>
              <div>
                <img
                  src={weatherCity?.current?.condition?.icon}
                  alt={weatherCity?.current?.condition?.text}
                />
              </div>
            </div>

            <iframe
              width="600"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                weatherCity?.location?.lon - 0.05
              },${weatherCity?.location?.lat - 0.05},${
                weatherCity?.location?.lon + 0.05
              },${weatherCity?.location?.lat + 0.05}&layer=mapnik&marker=${
                weatherCity?.location?.lat
              },${weatherCity?.location?.lon}`}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
