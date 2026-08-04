import Header from "./components/Header";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Features from "./sections/Features";

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
      </main>
    </>
  );
}

export default App;