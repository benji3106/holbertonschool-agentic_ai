import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Features from "./sections/Features";
import Insights from "./sections/Insights";
import Contact from "./sections/Contact";


function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <Insights />
        <Contact />
        <Footer />
      </main>
    </> 
  );
}

export default App;