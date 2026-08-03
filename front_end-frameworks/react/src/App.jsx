import { Camera, Moon, Sun } from "lucide-react";
import Header from './components/Header';

function App() {
  return (
    <>
     <Header />
     <main className="pt-20">
      
     </main>
     <h1 className="text-4xl text-red-500">Mon super projet React !!!</h1>
     <h2 className="text-2xl text-red-500">Avec Tailwind CSS et DaisyUI</h2>
     <Camera color="red" size={48} />
     <label className="swap swap-rotate">
  {/* this hidden checkbox controls the state */}
  <input className="theme-controller" type="checkbox" value="dark" />

  {/* Sun icon */}
<Sun className="swap-on text-red-500" />

  {/* Moon icon */}
<Moon className="swap-off text-red-500" />
</label>
    </>
  );
}

export default App;