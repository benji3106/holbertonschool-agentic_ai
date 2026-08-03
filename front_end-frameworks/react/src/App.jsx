import { Camera, Moon, Sun } from "lucide-react";

function App() {
  return (
    <>
     <h1 className="text-4xl text-red-500">Mon super projet React !!!</h1>
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