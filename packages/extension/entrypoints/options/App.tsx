import { SettingsPage } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

function App() {
  return <SettingsPage storageManager={storageManager} />;
}

export default App;
