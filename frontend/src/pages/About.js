import React from 'react';
import '../pages/css/About.css';
import Team1 from '../assets/images/kai.jpg';
import Team2 from '../assets/images/onti.jpg';
import Team3 from '../assets/images/danae.jpg';
import img from '../assets/images/call-to-action.jpg';
import { useNavigate } from 'react-router-dom';
import HitmanDark from "../assets/images/HitmanDark.jpeg";


function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Introduction Section */}
      <section className="about-intro">
        <h1>Welcome to Hit Me Up</h1>
        <div className="about-intro-content">
          <div className="about-description">
            <img src={HitmanDark} alt="Intro Visual 1" className="about-img" />
            <p>
              Ever wanted to hire a hitman or shop for illegal arms online? Well, you're in the right place.
              <strong> Hit Me Up </strong> is a completely satirical service that parodies the dark web marketplace — for educational and humorous purposes only.
            </p>
            <button className="about-btn" onClick={() => navigate('/shop')}>
              View Products
            </button>
          </div>
          <div className="about-description">
            <img src={img} alt="Intro Visual 2" className="about-img" />
            <p>
              On our platform, clients gain exclusive access to a curated selection of premium weapons, tactical gear, and professional services. Whether you're looking to make a statement or remove a problem discreetly, we've built the tools and the network to make it happen—fast, clean, and untraceable.
            </p>
            <button className="about-btn" onClick={() => navigate('/shop')}>
             View Services
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
   <section className="about-how">
  <h2 className="about-how-heading">How It Works</h2>
  <ol>
    <li>Browse through our classified list of professional operatives worldwide.</li>
    <li>Review their profiles, past records, and ratings before selecting the ideal contractor.</li>
    <li>Submit the assignment with detailed requirements, location, and timeframe.</li>
    <li>Securely complete the transaction through encrypted channels and wait for confirmation.</li>
  </ol>
  <p>All operations are discreet, efficient, and leave no trace behind.</p>
</section>


  {/* Team Section */}
<section className="about-team">
  <h2>Meet the Team </h2>
  <div className="team-container">
    <div className="team-member">
      <img src={Team1} alt="Team member 1" />
      <div className="team-text">
        <h3>Kai the Killer</h3>
        <p>Handled front-end design and back-end development, connecting the visual layout with the logic behind the scenes.</p>
      </div>
    </div>
    <div className="team-member">
      <img src={Team2} alt="Team member 2" />
      <div className="team-text">
        <h3>Onti the Mastermind</h3>
        <p>Developed the interface users interact with, while also managing the systems and code that power the site behind the scenes.</p>
      </div>
    </div>
    <div className="team-member">
      <img src={Team3} alt="Team member 3" />
      <div className="team-text">
        <h3>Dan the Man</h3>
        <p>Built both the front end and back end — crafting the user interface and developing core functionality for a smooth user experience.</p>
      </div>
    </div>
  </div>
</section>

      {/* Tech Stack Section */}
      <section className="about-tech">
        <h2>What We Used </h2>
        <ul>
          <li> React – Core framework</li>
          <li> Axios – Handling fake API calls</li>
          <li> CSS Modules – For clean styling</li>
          <li> Node.js + Express (Mock Server)</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <p>© 2025 Hit Me Up – This site is a parody project made for laughs and learning.</p>
      </footer>
    </div>
  );
}

export default About;
