import { createContentEnhancer } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../../../utils/storage";

export const ContentEnhancer = createContentEnhancer(storageManager);
