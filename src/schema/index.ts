import { readFileSync } from "node:fs";
import { join } from "node:path";

const typesDefFileName = join(import.meta.dirname, "typesDef.graphql");

const typesDefFile = readFileSync(typesDefFileName, "utf-8");

export default typesDefFile;
