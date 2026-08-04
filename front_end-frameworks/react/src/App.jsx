import Header from "./components/Header";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Features from "./sections/Features";
import Insights from "./sections/Insights";

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <Insights />
      </main>
    </>
  );
}

export default App;