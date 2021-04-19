import { CCommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";

import LaboratorySetDefaultLabo from "./laboratory/setDefaultLabo";
import LaboratoryAddLabo from "./laboratory/addLabo";
import LaboratoryDelLabo from "./laboratory/delLabo";
import LaboratoryInfoLabo from "./laboratory/infoLabo";
import LaboratoryAddLaboStock from "./laboratory/addLaboStock";
import LaboratoryDelLaboStock from "./laboratory/delLaboStock";
import ProductionAddProd from "./production/addProd";
import ProductionDelProd from "./production/delProd";
import ProductionInfoProd from "./production/infoProd";
import StockAddStockLoc from "./stock/addStockLoc";
import StockDelStockLoc from "./stock/delStockLoc";
import StockAddStock from "./stock/addStock";
import StockDelStock from "./stock/delStock";
import StockSetStock from "./stock/setStock";
import StockInfoStock from "./stock/infoStock";
import ServerSetDefaultChannel from "./server/setDefaultChannel";
import ServerSetUrl from "./server/setUrl";
import ServerSetPassword from "./server/setPassword";
import ServerSetReminder from "./server/setReminder";
import ServerSetRoleTag from "./server/setRoleTag";
import LocationAddLoc from "./location/addLoc";
import LocationDelLoc from "./location/delLoc";
import { serverConfig } from "server.config";

export const CommandsList: Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema | LocationSchema>> = [
    new LaboratorySetDefaultLabo("Modifier le laboratoire par défaut", "**Nom**"),
    new LaboratoryAddLabo("Ajoute un laboratoire", "**Nom**, **Drogue**, Screen URL"),
    new LaboratoryDelLabo("Supprime un laboratoire", "**Nom**, Raison"),
    new LaboratoryInfoLabo("Affiche la liste des laboratoire", "Nom"),
    new LaboratoryAddLaboStock("Ajoute un entrepôt à un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),
    new LaboratoryDelLaboStock("Supprime un entrepôt d'un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),

    new ProductionAddProd("Ajoute une production", "**Quantité**, Laboratoire, Description"),
    new ProductionDelProd("Supprime toute les productions", "Laboratoire, Raison"),
    new ProductionInfoProd("Affiche la liste des productions en cours", "Nom du laboratoire"),

    new StockAddStockLoc("Ajoute un entrepôt", "**Nom**, **Drogue**, Screen URL"),
    new StockDelStockLoc("Supprime un entrepôt", "**Nom**, Raison"),
    new StockAddStock("Ajoute de la marchandise dans un entrepôt", "**Nom**, **Quantité**, Raison"),
    new StockDelStock("Supprime de la marchandise dans un entrepôt", "**Nom**, **Quantité**, Raison"),
    new StockSetStock("Modifie la marchandise d'un entrepôt", "**Nom**, **Quantité**, Raison"),
    new StockInfoStock("Affiche la liste des entrepôts", "Nom"),

    new ServerSetDefaultChannel("Modifier le channel par défaut"),
    new ServerSetUrl("Modifier l'URL du site", "**URL**"),
    new ServerSetPassword("Modifier le mot de passe", "**Mot de passe**"),
    new ServerSetReminder("Modifier le rappel d'une production", "**Minutes**"),
    new ServerSetRoleTag("Modifier le rôle qui gère les laboratoires", "**Tag du rôle**"),

    new LocationAddLoc("Ajouter une location", "**Nom**, **Date (" + serverConfig.commands.dateFormat + ")**, Screen URL"),
    new LocationDelLoc("Supprimer une location", "**Nom**, Raison")
    // new LocationInfoLoc("Affiche la liste des locations", "Nom")
];