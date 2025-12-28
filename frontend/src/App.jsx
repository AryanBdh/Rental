import RouterComponent from "./RouterComponent.jsx";
import { Toaster } from "react-hot-toast";


const App = () => {
  return (
    <>
      <RouterComponent />
      {/* Toast container: required for react-hot-toast to display notifications */}
      <Toaster position="top-center" />
    </>
  );
};

export default App;
