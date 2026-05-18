import { SettingsPage } from "@mikoto-moocs-sharp/shared/settings";
import { getSubmitShortcutLabel } from "@mikoto-moocs-sharp/shared/ui";
import { storageManager } from "../utils/storage";

function App() {
  return (
    <SettingsPage
      storageManager={storageManager}
      submitShortcutLabel={getSubmitShortcutLabel()}
    />
  );
}

export default App;
