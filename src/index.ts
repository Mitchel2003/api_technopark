import "module-alias/register"

import config from "@/utils/config";
import app from "@/app";

app.listen(config.port, () => console.log(`Server initialized on port ${config.port}`))