import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { assets } from "../data/assets";
import { cities, getawayTabs } from "../data/listings";

export default function HomePage() {
  const tabs = Object.keys(getawayTabs);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <main>
      <section className="home-hero" id="stays">
        <Header home />
        <div className="hero-search"><SearchBar /></div>
        <div className="hero-card page-shell">
          <img src={assets.hero} alt="Garden patio surrounded by lush greenery" />
          <div className="hero-copy">
            <h1>Not sure where to go? Perfect.</h1>
            <a href="#inspiration">I’m flexible</a>
          </div>
        </div>
      </section>

      <section className="home-section page-shell" id="inspiration">
        <h2>Inspiration for your next trip</h2>
        <div className="city-grid">
          {cities.map((city, index) => (
            <article className="city-card" key={city.name} style={{ background: city.color }}>
              <img src={assets.city[index]} alt={city.name} />
              <div><h3>{city.name}</h3><p>{city.distance}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section page-shell" id="experiences">
        <h2>Discover Airbnb Experiences</h2>
        <div className="experience-grid">
          <article className="experience-card">
            <img src={assets.experienceTrip} alt="Outdoor travel experience" />
            <div><h3>Things to do<br />on your trip</h3><button type="button">Experiences</button></div>
          </article>
          <article className="experience-card">
            <img src={assets.experienceHome} alt="Chef David Chang, featured in Airbnb online cooking experiences" />
            <div><h3>Things to do<br />from home</h3><button type="button">Online Experiences</button></div>
          </article>
        </div>
      </section>

      <section className="gift-section page-shell">
        <div><h2>Shop Airbnb<br />gift cards</h2><button className="dark-button" type="button">Learn more</button></div>
        <img src={assets.giftCards} alt="Airbnb gift cards" />
      </section>

      <section className="hosting-banner page-shell">
        <img src={assets.hosting} alt="Airbnb host" />
        <div><h2>Questions<br />about<br />hosting?</h2><button type="button">Ask a Superhost</button></div>
      </section>

      <section className="getaways page-shell">
        <h2>Inspiration for future getaways</h2>
        <div className="tabs" role="tablist">
          {tabs.map((tab) => (
            <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
        <div className="getaway-grid">
          {getawayTabs[activeTab].map((destination) => {
            const [city, region] = destination.split(", ");
            return <div key={destination}><strong>{city}</strong><span>{region}</span></div>;
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}
